use crate::model::{HostEvidence, Observation};
use std::collections::BTreeSet;
use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::{Command, Output};
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

pub const PROBE_LABEL: &str = "in.sociobot.capacity-probe=true";

pub struct Runtime {
    pub binary: String,
    pub context: String,
}

pub struct SweepConfig<'a> {
    pub containers: u16,
    pub ports: u16,
    pub mounts: u16,
    pub samples: u16,
    pub image: &'a str,
    pub cancelled: Arc<AtomicBool>,
}

pub struct SweepResult {
    pub run_id: String,
    pub host: HostEvidence,
    pub observations: Vec<Observation>,
}

pub fn discover(requested: &str) -> Result<Runtime, String> {
    let candidates: &[&str] = match requested {
        "auto" => &["docker", "podman"],
        "docker" => &["docker"],
        "podman" => &["podman"],
        other => return Err(format!("unsupported runtime '{other}'")),
    };
    for binary in candidates {
        if Command::new(binary).arg("--version").output().is_ok() {
            let context = runtime_context(binary);
            return Ok(Runtime {
                binary: (*binary).to_string(),
                context,
            });
        }
    }
    Err(format!(
        "no usable {} runtime found; install Docker or Podman and verify its daemon is reachable",
        requested
    ))
}

fn runtime_context(binary: &str) -> String {
    if binary == "docker"
        && let Ok(output) = Command::new(binary).args(["context", "show"]).output()
        && output.status.success()
    {
        return String::from_utf8_lossy(&output.stdout).trim().to_string();
    }
    if let Ok(host) = env::var(if binary == "docker" {
        "DOCKER_HOST"
    } else {
        "CONTAINER_HOST"
    }) {
        return host;
    }
    "default".into()
}

pub fn plan_levels(containers: u16) -> Vec<u16> {
    let mut levels = BTreeSet::new();
    for numerator in 1..=4 {
        levels.insert((containers * numerator).div_ceil(4));
    }
    levels.into_iter().filter(|level| *level > 0).collect()
}

impl Runtime {
    pub fn run_sweep(&self, config: &SweepConfig<'_>) -> Result<SweepResult, String> {
        self.ensure_ready()?;
        let run_id = format!(
            "scp-{}-{}",
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
            std::process::id()
        );
        let network = format!("{run_id}-net");
        let temp_root = env::temp_dir().join(&run_id);
        fs::create_dir_all(&temp_root).map_err(|e| format!("create temporary mount root: {e}"))?;
        let baseline_bindings = self.count_published_bindings().unwrap_or(0);
        let (baseline_rules, rule_method) = network_rule_count();
        self.create_network(&network)?;

        let mut session = Session {
            runtime: self,
            network,
            temp_root,
            containers: Vec::new(),
        };
        let result = session.measure(config, baseline_bindings);
        let cleanup_result = session.cleanup();
        match (result, cleanup_result) {
            (Ok(observations), Ok(())) => Ok(SweepResult {
                run_id,
                host: HostEvidence {
                    baseline_published_bindings: baseline_bindings,
                    baseline_network_rule_count: baseline_rules,
                    rule_count_method: rule_method,
                },
                observations,
            }),
            (Err(error), _) => Err(error),
            (Ok(_), Err(error)) => Err(format!("probe completed but cleanup failed: {error}")),
        }
    }

    fn ensure_ready(&self) -> Result<(), String> {
        let output = run(&self.binary, &["info"])?;
        if output.status.success() {
            Ok(())
        } else {
            Err(format!(
                "{} is installed but its service is not reachable: {}",
                self.binary,
                stderr(&output)
            ))
        }
    }

    fn create_network(&self, name: &str) -> Result<(), String> {
        let output = run(
            &self.binary,
            &[
                "network",
                "create",
                "--internal",
                "--label",
                PROBE_LABEL,
                name,
            ],
        )?;
        success(output, "create isolated synthetic network")
    }

    fn count_published_bindings(&self) -> Result<u64, String> {
        let output = run(&self.binary, &["ps", "-q"])?;
        if !output.status.success() {
            return Err(format!("list running containers: {}", stderr(&output)));
        }
        let ids = String::from_utf8_lossy(&output.stdout);
        let mut count = 0;
        for id in ids.lines().filter(|line| !line.trim().is_empty()) {
            let inspect = run(
                &self.binary,
                &["inspect", "--format", "{{json .NetworkSettings.Ports}}", id],
            )?;
            if !inspect.status.success() {
                continue;
            }
            let value: serde_json::Value = match serde_json::from_slice(&inspect.stdout) {
                Ok(value) => value,
                Err(_) => continue,
            };
            if let Some(ports) = value.as_object() {
                for bindings in ports.values() {
                    count += bindings
                        .as_array()
                        .map(|items| items.len() as u64)
                        .unwrap_or(0);
                }
            }
        }
        Ok(count)
    }
}

struct Session<'a> {
    runtime: &'a Runtime,
    network: String,
    temp_root: PathBuf,
    containers: Vec<String>,
}

impl Session<'_> {
    fn measure(
        &mut self,
        config: &SweepConfig<'_>,
        baseline_bindings: u64,
    ) -> Result<Vec<Observation>, String> {
        let levels = plan_levels(config.containers);
        let mut observations = Vec::new();
        for sample in 1..=config.samples {
            let mut next_level_index = 0;
            for active in 1..=config.containers {
                if config.cancelled.load(Ordering::SeqCst) {
                    return Err("probe interrupted; synthetic resources were removed".into());
                }
                let name = format!(
                    "{}-s{}-c{}",
                    self.network.trim_end_matches("-net"),
                    sample,
                    active
                );
                let latency = self.start_container(&name, config, sample, active)?;
                self.containers.push(name);
                if levels.get(next_level_index) == Some(&active) {
                    let bindings = self
                        .runtime
                        .count_published_bindings()
                        .unwrap_or(baseline_bindings + u64::from(active * config.ports));
                    let (rules, _) = network_rule_count();
                    observations.push(Observation {
                        sample,
                        active_containers: active,
                        startup_ms: latency,
                        published_bindings: bindings,
                        host_network_rule_count: rules,
                    });
                    next_level_index += 1;
                }
            }
            self.remove_containers()?;
        }
        Ok(observations)
    }

    fn start_container(
        &self,
        name: &str,
        config: &SweepConfig<'_>,
        sample: u16,
        active: u16,
    ) -> Result<f64, String> {
        let mut args = vec![
            "run".to_string(),
            "--detach".into(),
            "--name".into(),
            name.into(),
            "--label".into(),
            PROBE_LABEL.into(),
            "--network".into(),
            self.network.clone(),
        ];
        for index in 0..config.ports {
            args.extend(["--publish".into(), format!("127.0.0.1::{}", 18080 + index)]);
        }
        for index in 0..config.mounts {
            let source = self
                .temp_root
                .join(format!("sample-{sample}-container-{active}-mount-{index}"));
            fs::create_dir_all(&source).map_err(|e| format!("create synthetic mount: {e}"))?;
            args.extend([
                "--mount".into(),
                format!(
                    "type=bind,src={},dst=/probe/mount-{index},readonly",
                    source.display()
                ),
            ]);
        }
        args.push(config.image.into());
        args.extend(["sleep".into(), "600".into()]);
        let started = Instant::now();
        let output = Command::new(&self.runtime.binary)
            .args(&args)
            .output()
            .map_err(|e| format!("start {name}: {e}"))?;
        if !output.status.success() {
            return Err(format!(
                "start synthetic container {name}: {}",
                stderr(&output)
            ));
        }
        let deadline = Instant::now() + Duration::from_secs(10);
        loop {
            let inspect = run(
                &self.runtime.binary,
                &["inspect", "--format", "{{.State.Running}}", name],
            )?;
            if inspect.status.success() && String::from_utf8_lossy(&inspect.stdout).trim() == "true"
            {
                return Ok(started.elapsed().as_secs_f64() * 1000.0);
            }
            if Instant::now() >= deadline {
                let _ = run(&self.runtime.binary, &["rm", "--force", name]);
                return Err(format!(
                    "container {name} did not become running within 10 seconds"
                ));
            }
            if config.cancelled.load(Ordering::SeqCst) {
                let _ = run(&self.runtime.binary, &["rm", "--force", name]);
                return Err("probe interrupted; synthetic resources were removed".into());
            }
            std::thread::sleep(Duration::from_millis(25));
        }
    }

    fn remove_containers(&mut self) -> Result<(), String> {
        if self.containers.is_empty() {
            return Ok(());
        }
        let mut args = vec!["rm", "--force"];
        args.extend(self.containers.iter().map(String::as_str));
        let output = run(&self.runtime.binary, &args)?;
        if output.status.success() {
            self.containers.clear();
            Ok(())
        } else {
            Err(format!("remove synthetic containers: {}", stderr(&output)))
        }
    }

    fn cleanup(&mut self) -> Result<(), String> {
        let containers = self.remove_containers();
        let network = run(
            &self.runtime.binary,
            &["network", "rm", self.network.as_str()],
        )
        .and_then(|output| success(output, "remove synthetic network"));
        let mounts = fs::remove_dir_all(&self.temp_root)
            .map_err(|e| format!("remove temporary mounts {}: {e}", self.temp_root.display()));
        containers.and(network).and(mounts)
    }
}

fn network_rule_count() -> (Option<u64>, String) {
    for (binary, args, marker) in [
        ("iptables-save", Vec::<&str>::new(), "DOCKER"),
        ("nft", vec!["list", "ruleset"], "docker"),
    ] {
        if let Ok(output) = Command::new(binary).args(args).output()
            && output.status.success()
        {
            let rules = String::from_utf8_lossy(&output.stdout);
            let count = rules
                .lines()
                .filter(|line| {
                    line.to_ascii_lowercase()
                        .contains(&marker.to_ascii_lowercase())
                })
                .count() as u64;
            return (Some(count), format!("{binary} lines containing '{marker}'"));
        }
    }
    (
        None,
        "host firewall tools unavailable; published bindings are the portable rule-pressure proxy"
            .into(),
    )
}

fn run(binary: &str, args: &[&str]) -> Result<Output, String> {
    Command::new(binary)
        .args(args)
        .output()
        .map_err(|e| format!("run {binary}: {e}"))
}

fn success(output: Output, action: &str) -> Result<(), String> {
    if output.status.success() {
        Ok(())
    } else {
        Err(format!("{action}: {}", stderr(&output)))
    }
}

fn stderr(output: &Output) -> String {
    String::from_utf8_lossy(&output.stderr).trim().to_string()
}

#[allow(dead_code)]
fn _path_exists(path: &Path) -> bool {
    path.exists()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn levels_are_quartiles_without_duplicates() {
        assert_eq!(plan_levels(1), vec![1]);
        assert_eq!(plan_levels(8), vec![2, 4, 6, 8]);
        assert_eq!(plan_levels(3), vec![1, 2, 3]);
    }
}
