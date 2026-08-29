use std::process::Command;

#[test]
fn claim_cli_demo_writes_a_bundled_sample_without_a_runtime() {
    let output = Command::new(env!("CARGO_BIN_EXE_scp"))
        .arg("--demo")
        .output()
        .expect("run bundled demo");

    assert!(
        output.status.success(),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("bundled sample data"));
    assert!(stdout.contains("Sample report written to "));
}
