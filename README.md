# Sandbox Capacity Probe

Sandbox Capacity Probe (`scp`) is a local-first CLI for teams planning many isolated agent or customer containers. It runs a bounded synthetic sweep against an explicitly confirmed Docker or Podman host, measures container startup latency, counts published port bindings, and writes a portable capacity envelope.

It does not run untrusted workloads, orchestrate a cluster, or benchmark third-party systems. It has no telemetry.

## Install

Build the single binary with stable Rust:

```sh
cargo install --path cli
scp --help
```

The factory can publish the crate with `cargo package --manifest-path cli/Cargo.toml`; registry credentials are intentionally not included.

## Usage

First inspect the plan without changing the runtime:

```sh
scp probe --target dev-laptop --confirm dev-laptop --containers 8 \
  --ports-per-container 2 --mounts 1 --samples 2 --dry-run
```

Then run the controlled probe and keep the machine-readable report:

```sh
scp probe --target staging-west --confirm staging-west --runtime auto \
  --containers 12 --ports-per-container 2 --mounts 1 --samples 3 \
  --output capacity.json
```

For scripts, send JSON to stdout and progress to stderr:

```sh
scp probe --target ci-runner --confirm ci-runner --containers 4 \
  --samples 1 --json --ci > capacity.json
```

`--target` is a human safety label, not a remote hostname. The probe uses the selected runtime’s current context (`docker context show`, `DOCKER_HOST`, or Podman connection). The confirmation must exactly match the target. Labels or runtime contexts containing `prod`, `production`, or `live` are refused unless `--allow-production` is explicitly present. Hard bounds are 64 containers, 16 published ports per container, 16 mounts, and 10 samples.

The CLI creates a labeled, internal synthetic network and labeled sleeping containers. Published ports bind only to `127.0.0.1` with runtime-assigned host ports. Cleanup runs after success and ordinary errors; interrupted runs can be removed by label:

```sh
docker rm -f $(docker ps -aq --filter label=in.sociobot.capacity-probe=true)
docker network prune --filter label=in.sociobot.capacity-probe=true
```

Podman accepts the same commands with `podman` substituted.

### Output and exit codes

The report includes host/runtime metadata, per-start observations, p50/p95, observed published-port bindings, a least-squares latency model, predicted p95 at the requested shape, and one of three envelopes: `comfortable`, `watch`, or `exceeded`. The model is evidence from this host and runtime, not a guarantee.

- `0`: probe completed and stayed within the requested p95 budget
- `2`: invalid or unsafe request, missing runtime, or probe failure
- `3`: measurements completed but the capacity envelope was exceeded

Run `scp explain capacity.json` to render a saved JSON report for a human review.

## Website

The static documentation and local scenario planner live in `site/`:

```sh
npm install
npm run dev
npm test
npm run build
```

`npm run build` compiles/tests the CLI and builds the site to `dist/site/`. The production entry point is `dist/site/index.html`.

## Development and verification

```sh
cargo fmt --manifest-path cli/Cargo.toml -- --check
cargo clippy --manifest-path cli/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path cli/Cargo.toml
npm test
npm run build
```

Docker/Podman integration tests are opt-in because they create containers: `SCP_RUNTIME_TEST=docker cargo test --manifest-path cli/Cargo.toml --test runtime`.

## Privacy and licensing

Probe results stay on your machine. The website planner uses local storage only for a purchased license and saved Pro scenarios. See the site’s `/privacy/` and `/terms/` pages. Source code is MIT licensed; the optional Planner Pro browser features are a one-time license unlock sold by Sociobot, the merchant of record.
