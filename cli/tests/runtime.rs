use std::process::Command;

#[test]
fn runtime_probe_smoke_test() {
    let Some(runtime) = std::env::var("SCP_RUNTIME_TEST").ok() else {
        return;
    };
    let binary = env!("CARGO_BIN_EXE_capacity-probe");
    let output = Command::new(binary)
        .args([
            "probe",
            "--target",
            "integration-test",
            "--confirm",
            "integration-test",
            "--runtime",
            &runtime,
            "--containers",
            "1",
            "--ports-per-container",
            "0",
            "--mounts",
            "0",
            "--samples",
            "1",
            "--json",
            "--ci",
            "--startup-budget-ms",
            "60000",
        ])
        .output()
        .expect("run capacity-probe");
    assert!(output.status.success());
    assert!(
        output.status.success(),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    assert!(String::from_utf8_lossy(&output.stdout).contains("\"schema_version\": 1"));
}
