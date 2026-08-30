mod model;
mod runtime;

use clap::{Args, Parser, Subcommand, ValueEnum};
use model::{Report, build_model, capacity_envelope, compare_reports, summarize_levels};
use runtime::{SweepConfig, discover, plan_levels};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::ExitCode;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Parser, Debug)]
#[command(
    name = "capacity-probe",
    version,
    about = "Find the safe operating envelope for a planned Docker or Podman workload",
    long_about = "Sandbox Capacity Probe runs a bounded synthetic container sweep on an explicitly confirmed non-production runtime, then reports startup percentiles, published-port pressure, firewall rule evidence, and a capacity envelope. No telemetry; results stay local."
)]
struct Cli {
    /// Write and render the bundled sample report without contacting a container runtime
    #[arg(long, global = true)]
    demo: bool,
    #[command(subcommand)]
    command: Option<Command>,
}

#[derive(Subcommand, Debug)]
enum Command {
    /// Run the bundled sample and print where its report was written
    Demo,
    /// Run a bounded synthetic capacity sweep
    Probe(ProbeArgs),
    /// Render a saved JSON report for a human review
    Explain {
        /// Path to a JSON report created by `capacity-probe probe`
        report: PathBuf,
    },
    /// Compare an earlier prediction with a subsequent controlled run
    Compare {
        /// Earlier report containing the prediction
        predicted: PathBuf,
        /// Subsequent report for the same planned workload
        observed: PathBuf,
        /// Emit only machine-readable JSON
        #[arg(long)]
        json: bool,
    },
}

#[derive(Args, Debug)]
struct ProbeArgs {
    /// Human label for the runtime host/context (required safety acknowledgement)
    #[arg(long)]
    target: String,
    /// Must exactly match --target
    #[arg(long)]
    confirm: String,
    /// Container runtime to use
    #[arg(long, value_enum, default_value = "auto")]
    runtime: RuntimeChoice,
    /// Planned concurrent container count (hard maximum: 64)
    #[arg(long, default_value_t = 12)]
    containers: u16,
    /// Published localhost ports per container (hard maximum: 16)
    #[arg(long, default_value_t = 2)]
    ports_per_container: u16,
    /// Read-only bind mounts per container (hard maximum: 16)
    #[arg(long, default_value_t = 1)]
    mounts: u16,
    /// Full-sweep repetitions (hard maximum: 10)
    #[arg(long, default_value_t = 2)]
    samples: u16,
    /// Startup p95 budget used for the envelope
    #[arg(long, default_value_t = 1500)]
    startup_budget_ms: u64,
    /// Small trusted image used for sleeping synthetic containers
    #[arg(long, default_value = "alpine:3.20")]
    image: String,
    /// Save the JSON report to this path
    #[arg(long)]
    output: Option<PathBuf>,
    /// Emit JSON instead of the human report
    #[arg(long)]
    json: bool,
    /// Disable decorative progress; never prompts
    #[arg(long)]
    ci: bool,
    /// Validate and print the plan without contacting the runtime
    #[arg(long)]
    dry_run: bool,
    /// Explicitly permit a target/context whose name indicates production
    #[arg(long)]
    allow_production: bool,
}

#[derive(Copy, Clone, Debug, ValueEnum)]
enum RuntimeChoice {
    Auto,
    Docker,
    Podman,
}

impl RuntimeChoice {
    fn as_str(self) -> &'static str {
        match self {
            Self::Auto => "auto",
            Self::Docker => "docker",
            Self::Podman => "podman",
        }
    }
}

fn main() -> ExitCode {
    match execute(Cli::parse()) {
        Ok(code) => ExitCode::from(code),
        Err(error) => {
            eprintln!("error: {error}");
            ExitCode::from(2)
        }
    }
}

fn execute(cli: Cli) -> Result<u8, String> {
    if cli.demo {
        return demo();
    }
    match cli.command {
        Some(Command::Demo) => demo(),
        Some(Command::Probe(args)) => probe(args),
        Some(Command::Explain { report }) => {
            let report = read_report(&report)?;
            print_report(&report);
            Ok(if report.envelope.status == "exceeded" {
                3
            } else {
                0
            })
        }
        Some(Command::Compare {
            predicted,
            observed,
            json,
        }) => {
            let predicted = read_report(&predicted)?;
            let observed = read_report(&observed)?;
            let comparison = compare_reports(&predicted, &observed);
            if json {
                println!(
                    "{}",
                    serde_json::to_string_pretty(&comparison)
                        .map_err(|e| format!("serialize comparison: {e}"))?
                );
            } else {
                println!("Prediction check");
                println!("  predicted p95   {:>8.1} ms", comparison.predicted_p95_ms);
                println!("  observed p95    {:>8.1} ms", comparison.observed_p95_ms);
                println!(
                    "  absolute error   {:>7.1}%  {}",
                    comparison.absolute_error_percent,
                    if comparison.within_25_percent {
                        "PASS"
                    } else {
                        "MISS"
                    }
                );
                println!(
                    "  comparison inputs {}",
                    if comparison.shape_matches {
                        "matches"
                    } else {
                        "DIFFERS"
                    }
                );
                if !comparison.mismatched_fields.is_empty() {
                    println!(
                        "  different fields {}",
                        comparison.mismatched_fields.join(", ")
                    );
                }
            }
            Ok(
                if comparison.within_25_percent && comparison.shape_matches {
                    0
                } else {
                    3
                },
            )
        }
        None => Err(
            "choose a command such as `capacity-probe probe`, or run `capacity-probe demo` for the bundled sample".into(),
        ),
    }
}

fn demo() -> Result<u8, String> {
    let report: Report = serde_json::from_str(include_str!("../examples/demo-capacity.json"))
        .map_err(|error| format!("read bundled demo report: {error}"))?;
    let directory = std::env::temp_dir().join(format!(
        "sandbox-capacity-probe-demo-{}",
        std::process::id()
    ));
    fs::create_dir_all(&directory)
        .map_err(|error| format!("create demo directory {}: {error}", directory.display()))?;
    let output = directory.join("capacity-demo.json");
    write_report(&output, &report)?;
    println!("Demo — bundled sample data; no container runtime was contacted.");
    print_report(&report);
    println!("\nSample report written to {}", output.display());
    Ok(0)
}

fn probe(args: ProbeArgs) -> Result<u8, String> {
    validate(&args)?;
    if args.dry_run {
        let levels = plan_levels(args.containers);
        if args.json {
            println!(
                "{}",
                serde_json::json!({
                    "dry_run": true,
                    "target": args.target,
                    "runtime": args.runtime.as_str(),
                    "containers": args.containers,
                    "ports_per_container": args.ports_per_container,
                    "mounts_per_container": args.mounts,
                    "samples": args.samples,
                    "measurement_levels": levels,
                    "maximum_container_starts": u32::from(args.containers) * u32::from(args.samples),
                    "maximum_published_ports": u32::from(args.containers) * u32::from(args.ports_per_container)
                })
            );
        } else {
            println!("Dry run — no runtime changes");
            println!("  target              {}", args.target);
            println!("  runtime             {}", args.runtime.as_str());
            println!("  measurement levels  {levels:?}");
            println!(
                "  bounded work         {} starts; {} simultaneous ports",
                u32::from(args.containers) * u32::from(args.samples),
                u32::from(args.containers) * u32::from(args.ports_per_container)
            );
            println!("Re-run without --dry-run to measure this host.");
        }
        return Ok(0);
    }

    let runtime = discover(args.runtime.as_str())?;
    if is_production_like(&runtime.context) && !args.allow_production {
        return Err(format!(
            "runtime context '{}' looks like production; use a non-production context or pass --allow-production after review",
            runtime.context
        ));
    }
    if !args.ci && !args.json {
        eprintln!(
            "Surveying '{}' through {} context '{}' ({} bounded starts)…",
            args.target,
            runtime.binary,
            runtime.context,
            u32::from(args.containers) * u32::from(args.samples)
        );
    }
    let cancelled = Arc::new(AtomicBool::new(false));
    let signal_flag = Arc::clone(&cancelled);
    ctrlc::set_handler(move || signal_flag.store(true, Ordering::SeqCst))
        .map_err(|e| format!("install interrupt cleanup handler: {e}"))?;
    let sweep = runtime.run_sweep(&SweepConfig {
        containers: args.containers,
        ports: args.ports_per_container,
        mounts: args.mounts,
        samples: args.samples,
        image: &args.image,
        cancelled,
    })?;
    let levels = summarize_levels(&sweep.observations);
    let target_bindings = sweep.host.baseline_published_bindings
        + u64::from(args.containers) * u64::from(args.ports_per_container);
    let model = build_model(&levels, target_bindings);
    let envelope = capacity_envelope(model.predicted_p95_ms, args.startup_budget_ms);
    let report = Report {
        schema_version: 1,
        generated_at_unix_ms: SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis(),
        run_id: sweep.run_id,
        config: model::ProbeConfig {
            target: args.target,
            runtime: runtime.binary,
            context: runtime.context,
            containers: args.containers,
            ports_per_container: args.ports_per_container,
            mounts_per_container: args.mounts,
            samples: args.samples,
            startup_budget_ms: args.startup_budget_ms,
            image: args.image,
        },
        host: sweep.host,
        observations: sweep.observations,
        levels,
        model,
        envelope,
        caveats: vec![
            "Results apply to this runtime, host, image cache state, and background load.".into(),
            "Published bindings are the portable rule-pressure measure; a host firewall count is included only when readable.".into(),
            "Validate the prediction with a subsequent controlled run and `capacity-probe compare`.".into(),
        ],
    };
    if let Some(path) = args.output.as_deref() {
        write_report(path, &report)?;
    }
    if args.json {
        println!(
            "{}",
            serde_json::to_string_pretty(&report).map_err(|e| format!("serialize report: {e}"))?
        );
    } else {
        print_report(&report);
        if let Some(path) = args.output {
            println!("\nReport saved to {}", path.display());
        }
    }
    Ok(if report.envelope.status == "exceeded" {
        3
    } else {
        0
    })
}

fn validate(args: &ProbeArgs) -> Result<(), String> {
    if args.target.trim().is_empty() {
        return Err("--target cannot be empty".into());
    }
    if args.confirm != args.target {
        return Err("--confirm must exactly match --target".into());
    }
    if is_production_like(&args.target) && !args.allow_production {
        return Err("target looks like production; choose a staging host or explicitly pass --allow-production after review".into());
    }
    bounded("containers", args.containers, 1, 64)?;
    bounded("ports-per-container", args.ports_per_container, 0, 16)?;
    bounded("mounts", args.mounts, 0, 16)?;
    bounded("samples", args.samples, 1, 10)?;
    if !(50..=60_000).contains(&args.startup_budget_ms) {
        return Err("--startup-budget-ms must be between 50 and 60000".into());
    }
    if args.image.trim().is_empty() {
        return Err("--image cannot be empty".into());
    }
    Ok(())
}

fn bounded(name: &str, value: u16, minimum: u16, maximum: u16) -> Result<(), String> {
    if (minimum..=maximum).contains(&value) {
        Ok(())
    } else {
        Err(format!("--{name} must be between {minimum} and {maximum}"))
    }
}

fn is_production_like(value: &str) -> bool {
    let normalized = value.to_ascii_lowercase();
    if normalized.contains("production") {
        return true;
    }
    if normalized
        .split(|character: char| !character.is_ascii_alphanumeric())
        .any(|part| matches!(part, "prod" | "live"))
    {
        return true;
    }
    ["prod", "live"].iter().any(|marker| {
        normalized.strip_prefix(marker).is_some_and(|suffix| {
            suffix.is_empty() || suffix.starts_with(|character: char| character.is_ascii_digit())
        }) || normalized.strip_suffix(marker).is_some_and(|prefix| {
            prefix.is_empty()
                || prefix
                    .chars()
                    .last()
                    .is_some_and(|character| !character.is_ascii_alphabetic())
        })
    })
}

fn write_report(path: &Path, report: &Report) -> Result<(), String> {
    let json =
        serde_json::to_string_pretty(report).map_err(|e| format!("serialize report: {e}"))?;
    fs::write(path, format!("{json}\n"))
        .map_err(|e| format!("write report {}: {e}", path.display()))
}

fn read_report(path: &Path) -> Result<Report, String> {
    let bytes = fs::read(path).map_err(|e| format!("read report {}: {e}", path.display()))?;
    serde_json::from_slice(&bytes).map_err(|e| format!("parse report {}: {e}", path.display()))
}

fn print_report(report: &Report) {
    println!("Sandbox capacity envelope");
    println!(
        "  target/runtime  {} / {} ({})",
        report.config.target, report.config.runtime, report.config.context
    );
    println!(
        "  planned workload {} {} × {} {} × {} {}",
        report.config.containers,
        if report.config.containers == 1 {
            "container"
        } else {
            "containers"
        },
        report.config.ports_per_container,
        if report.config.ports_per_container == 1 {
            "port"
        } else {
            "ports"
        },
        report.config.mounts_per_container,
        if report.config.mounts_per_container == 1 {
            "mount"
        } else {
            "mounts"
        }
    );
    println!("\n  level   starts      p50      p95   published");
    for level in &report.levels {
        println!(
            "  {:>5}   {:>6}   {:>6.1}ms {:>6.1}ms   {:>9}",
            level.active_containers,
            level.starts,
            level.p50_ms,
            level.p95_ms,
            level.published_bindings
        );
    }
    println!(
        "\n  {} — predicted p95 {:.1} ms / {} ms budget ({:.1} ms headroom)",
        report.envelope.status.to_ascii_uppercase(),
        report.envelope.predicted_p95_ms,
        report.envelope.startup_budget_ms,
        report.envelope.headroom_ms
    );
    println!("  {}", report.envelope.explanation);
    println!("  Rule evidence: {}", report.host.rule_count_method);
    println!(
        "  Next: repeat this planned workload, then run `capacity-probe compare first.json second.json`."
    );
}

#[cfg(test)]
mod tests {
    use super::*;
    use clap::Parser;

    #[test]
    fn documented_dry_run_parses_and_executes() {
        let cli = Cli::try_parse_from([
            "capacity-probe",
            "probe",
            "--target",
            "dev-laptop",
            "--confirm",
            "dev-laptop",
            "--containers",
            "8",
            "--ports-per-container",
            "2",
            "--mounts",
            "1",
            "--samples",
            "2",
            "--dry-run",
        ])
        .unwrap();
        assert_eq!(execute(cli), Ok(0));
    }

    #[test]
    fn bundled_demo_parses_and_runs_without_a_runtime() {
        let cli = Cli::try_parse_from(["capacity-probe", "--demo"]).unwrap();
        assert_eq!(execute(cli), Ok(0));
    }

    #[test]
    fn refuses_mismatched_confirmation_and_production() {
        let parse = |target: &str, confirm: &str| {
            Cli::try_parse_from([
                "capacity-probe",
                "probe",
                "--target",
                target,
                "--confirm",
                confirm,
                "--dry-run",
            ])
            .unwrap()
        };
        assert!(execute(parse("staging", "other")).is_err());
        assert!(execute(parse("customer-prod", "customer-prod")).is_err());
    }

    #[test]
    fn production_detection_avoids_substring_false_positives() {
        assert!(is_production_like("us-production-1"));
        assert!(is_production_like("productionwest"));
        assert!(is_production_like("customerproduction"));
        assert!(is_production_like("prod1"));
        assert!(is_production_like("live01"));
        assert!(!is_production_like("olive-branch"));
        assert!(!is_production_like("product-test"));
    }
}
