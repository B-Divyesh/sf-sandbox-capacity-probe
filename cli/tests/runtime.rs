use std::process::Command;

#[test]
fn runtime_dry_run_smoke_test() {
    let Some(runtime) = std::env::var("SCP_RUNTIME_TEST").ok() else {
        return;
    };
    let binary = env!("CARGO_BIN_EXE_scp");
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
            "--dry-run",
            "--json",
        ])
        .output()
        .expect("run scp");
    assert!(output.status.success());
    assert!(String::from_utf8_lossy(&output.stdout).contains("\"dry_run\": true"));
}
