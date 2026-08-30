# Sandbox Capacity Probe

Sandbox Capacity Probe (`capacity-probe`) helps teams plan isolated agent or customer containers.

It starts bounded test containers on a confirmed Docker or Podman host.
It measures startup time and local port bindings.
It writes a capacity report to the local path you choose.

## Install

Build the single binary with stable Rust:

```sh
cargo install --path cli
capacity-probe --help
```

The factory can publish the crate with `cargo package --manifest-path cli/Cargo.toml`.
Registry credentials are not included.

## Try the bundled demo

Run a realistic sample without Docker, Podman, or a network connection:

```sh
capacity-probe demo
# or: capacity-probe --demo
```

The command writes `capacity-demo.json` in a process-specific temporary directory.
It prints the exact path and never measures your host.

Open the [website demo](https://sandbox-capacity-probe.sociobot.in/?demo=1#cli-demo).
It shows the same CLI sample and an isolated planning scenario.

## Usage

First inspect the plan without changing the container runtime:

```sh
capacity-probe probe --target dev-laptop --confirm dev-laptop --containers 8 \
  --ports-per-container 2 --mounts 1 --samples 2 --dry-run
```

Then run the controlled probe and keep the JSON report:

```sh
capacity-probe probe --target staging-west --confirm staging-west --runtime auto \
  --containers 12 --ports-per-container 2 --mounts 1 --samples 3 \
  --output capacity.json
```

For scripts, send JSON to standard output and progress to standard error:

```sh
capacity-probe probe --target ci-runner --confirm ci-runner --containers 4 \
  --samples 1 --json --ci > capacity.json
```

`--target` is a safety label, not a remote hostname.
The probe uses the selected runtime's active Docker context or Podman connection.
The confirmation must exactly match the target.

Targets containing `prod`, `production`, or `live` are refused.
Add `--allow-production` only when you intend to probe that host.

The limits are 64 containers, 16 published ports per container, 16 mounts, and 10 samples.

The CLI creates a labeled internal network and labeled sleeping containers.
Published ports bind only to `127.0.0.1`.
Mounted test data is read only.
Cleanup runs after success and ordinary errors.

Remove resources left by an interrupted run with their labels:

```sh
docker rm -f $(docker ps -aq --filter label=in.sociobot.capacity-probe=true)
docker network prune --filter label=in.sociobot.capacity-probe=true
```

Use the same commands with `podman` when Podman is your runtime.

### Output and exit codes

The report records the host, runtime, and every container start.
It shows p50 and p95 startup times.
P50 is the middle startup time.
P95 is the time that 95 percent of starts met.

The report labels the planned workload `comfortable`, `watch`, or `exceeded`.
It compares a repeated workload against the 25 percent prediction target.

- `0`: The probe completed within the requested p95 budget.
- `2`: The request was unsafe or invalid, the runtime was missing, or the probe failed.
- `3`: Measurements completed, but the planned workload exceeded its budget.

Run `capacity-probe explain capacity.json` to read a saved JSON report.

`capacity-probe compare` accepts reports with the same target, runtime, context, image, containers, ports, and mounts.
It exits `3` and lists each different field when reports cannot be compared.

## Website

The static documentation and local scenario planner live in `site/`:

```sh
npm ci
npm run dev
npm test
npm run build
```

`npm run build` tests both products and builds the release binary and site.
The site output is `dist/site/`.

The planner and CSV export work without an account.
Normal planner inputs are not saved automatically.
The service worker stores the public site for offline reading.
The CLI and website send no telemetry.

Demo mode writes only `demo:sandbox-capacity-probe:scenario`.
**Exit demo and use your data** removes that sample key.

## Development and verification

```sh
cargo fmt --manifest-path cli/Cargo.toml -- --check
cargo clippy --manifest-path cli/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path cli/Cargo.toml
npm test
npm run build
```

Docker and Podman tests create containers, so they are opt in:

```sh
SCP_RUNTIME_TEST=docker cargo test --manifest-path cli/Cargo.toml --test runtime
```

Every visitor-facing claim is listed in `.factory/claims.json`.
Each claim command builds its requirements from a clean checkout.

```sh
npm run test:claims -- --grep '@claim:demo-isolated'
```

## License

The source code uses the MIT License.
