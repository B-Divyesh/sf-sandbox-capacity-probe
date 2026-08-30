# Copy audit — 30 August 2026

This audit inventories landing prose, headings, navigation, actions, facts,
states, errors, legal links, and every README sentence. Commands and report
tables are code or data, not sentences. Every reviewed sentence is at or below
22 words. Searches found no banned marketing words or map-metaphor headings.

## Landing page

| Type | Words | Exact copy |
| --- | ---: | --- |
| Link | 4 | Skip to main content |
| Wordmark | 3 | Sandbox Capacity Probe |
| Action | 1 | Menu |
| Navigation | 1 each | Demo · Method · Planner · Privacy |
| Banner | 6 | Demo — sample data, nothing is saved |
| Action | 2 | Reset demo |
| Action | 6 | Exit demo and use your data |
| Label | 5 | Docker and Podman capacity check |
| H1 | 5 | Measure container capacity before rollout. |
| Prose | 19 | For teams running isolated agent or customer containers, measure a safe Docker or Podman scale before the real rollout. |
| Action | 5 | Try it with sample data |
| Action | 4 | Open the capacity planner |
| Prose | 11 | See the real CLI output and an isolated local planning scenario. |
| Fact | 6 | No telemetry; demo stays separate |
| Fact | 5 | Offline after the first visit |
| Fact | 5 | Free planner and CSV export |
| Label | 4 | CLI sample / 01 |
| H2 | 7 | Run the CLI sample without a runtime |
| Prose | 10 | This recording comes from `capacity-probe demo` and the bundled sample report. |
| Prose | 8 | It needs no Docker, Podman, or network connection. |
| Prose | 13 | The 95th-percentile (p95) startup time is the time that 95% of starts met. |
| Action | 3 | Copy demo command |
| Action | 2 | Replay sample |
| Evidence | 9 | Demo — bundled sample data; no container runtime was contacted. |
| Evidence | 11 | Four measured levels show p50, p95, and published port bindings. |
| Evidence | 13 | Comfortable — predicted p95 351.0 ms / 1500 ms budget, with 1149.0 ms headroom. |
| Evidence | 10 | The bundled sample stays below 70% of its startup budget. |
| Evidence | 9 | Rule evidence: bundled demonstration data; no host was inspected. |
| Evidence | 11 | Next: repeat this planned workload, then run `capacity-probe compare first.json second.json`. |
| Evidence | 7 | Sample report written to a process-specific temporary `capacity-demo.json` path. |
| Label | 5 | How it works / 02 |
| H2 | 7 | How the capacity probe measures a host |
| Prose | 9 | The probe turns a planned workload into host-specific evidence. |
| Prose | 10 | Every result names the runtime, context, image, workload, and limits. |
| H3 | 4 | Measure container startup time |
| Prose | 5 | Start containers at four levels. |
| Prose | 10 | Measure startup time as local port bindings and mounts increase. |
| H3 | 6 | Compare startup time with your budget |
| Prose | 5 | Calculate the p95 startup time. |
| Prose | 8 | Label the planned workload comfortable, watch, or exceeded. |
| H3 | 4 | Compare two probe reports |
| Prose | 5 | Repeat the planned workload later. |
| Prose | 9 | `capacity-probe compare` reports prediction error against the 25% target. |
| Label | 5 | Safe probe steps / 03 |
| H2 | 6 | How a probe contains test containers |
| Step | 5 | Name and confirm the target. |
| Prose | 7 | Production-like names are refused unless separately overridden. |
| Step | 4 | Review a dry run. |
| Prose | 12 | See the maximum starts, ports, mounts, and measurement levels without runtime access. |
| Step | 3 | Measure and compare. |
| Prose | 10 | Save JSON, repeat under controlled load, and quantify prediction accuracy. |
| Label | 4 | Capacity planner / 04 |
| H2 | 6 | Plan a container workload before probing |
| Prose | 11 | This local planner is a transparent planning estimate, not a benchmark. |
| Prose | 12 | Use the generated command to replace it with evidence from your runtime. |
| Labels | 14 total | Concurrent containers · Ports per container · Mounts per container · Baseline startup (ms) · p95 budget (ms) |
| Result | 5 | Estimated p95 / model only |
| Action | 2 | Copy command |
| Action | 2 | Export CSV |
| Footer | 8 | A local tool for measuring safe container capacity. |
| Footer | 2 | No telemetry. |
| Footer | 4 | Built by Param Factory |

### Landing states and errors

| Words | Exact copy |
| ---: | --- |
| 10 | No estimate is available until every planner value is valid. |
| 8 | Correct the planner inputs to create a command. |
| 7 | Demo reset to the bundled sample scenario. |
| 12 | `[Field]` must be a whole number between `[minimum]` and `[maximum]`. |
| 8 | Correct it to calculate or export this scenario. |
| 1 / 3 / 5 | Copied · Copy command · Select command to copy |
| 3 / 5 | Online · planner and docs work · Offline · planner and docs still work |

## README

| Words | Exact copy |
| ---: | --- |
| 13 | Sandbox Capacity Probe (`capacity-probe`) helps teams plan isolated agent or customer containers. |
| 12 | It starts bounded test containers on a confirmed Docker or Podman host. |
| 8 | It measures startup time and local port bindings. |
| 13 | It writes a capacity report to the local path you choose. |
| 7 | Build the single binary with stable Rust. |
| 13 | The factory can publish the crate with `cargo package --manifest-path cli/Cargo.toml`. |
| 5 | Registry credentials are not included. |
| 11 | Run a realistic sample without Docker, Podman, or a network connection. |
| 10 | The command writes `capacity-demo.json` in a process-specific temporary directory. |
| 10 | It prints the exact path and never measures your host. |
| 7 | Open the website demo. |
| 11 | It shows the same CLI sample and an isolated planning scenario. |
| 9 | First inspect the plan without changing the container runtime. |
| 10 | Then run the controlled probe and keep the JSON report. |
| 12 | For scripts, send JSON to standard output and progress to standard error. |
| 9 | `--target` is a safety label, not a remote hostname. |
| 12 | The probe uses the selected runtime's active Docker context or Podman connection. |
| 7 | The confirmation must exactly match the target. |
| 8 | Targets containing `prod`, `production`, or `live` are refused. |
| 10 | Add `--allow-production` only when you intend to probe that host. |
| 15 | The limits are 64 containers, 16 published ports per container, 16 mounts, and 10 samples. |
| 11 | The CLI creates a labeled internal network and labeled sleeping containers. |
| 6 | Published ports bind only to `127.0.0.1`. |
| 6 | Mounted test data is read only. |
| 7 | Cleanup runs after success and ordinary errors. |
| 10 | Remove resources left by an interrupted run with their labels. |
| 11 | Use the same commands with `podman` when Podman is your runtime. |
| 10 | The report records the host, runtime, and every container start. |
| 7 | It shows p50 and p95 startup times. |
| 6 | P50 is the middle startup time. |
| 10 | P95 is the time that 95 percent of starts met. |
| 10 | The report labels the planned workload `comfortable`, `watch`, or `exceeded`. |
| 11 | It compares a repeated workload against the 25 percent prediction target. |
| 9 | The probe completed within the requested p95 budget. |
| 15 | The request was unsafe or invalid, the runtime was missing, or the probe failed. |
| 10 | Measurements completed, but the planned workload exceeded its budget. |
| 8 | Run `capacity-probe explain capacity.json` to read a saved JSON report. |
| 15 | `capacity-probe compare` accepts reports with the same target, runtime, context, image, containers, ports, and mounts. |
| 13 | It exits `3` and lists each different field when reports cannot be compared. |
| 10 | The static documentation and local scenario planner live in `site/`. |
| 13 | `npm run build` tests both products and builds the release binary and site. |
| 5 | The site output is `dist/site/`. |
| 8 | The planner and CSV export work without an account. |
| 7 | Normal planner inputs are not saved automatically. |
| 10 | The service worker stores the public site for offline reading. |
| 6 | The CLI and website send no telemetry. |
| 5 | Demo mode writes only `demo:sandbox-capacity-probe:scenario`. |
| 10 | **Exit demo and use your data** removes that sample key. |
| 7 | Every visitor-facing claim is listed in `.factory/claims.json`. |
| 10 | Each claim command builds its requirements from a clean checkout. |
| 7 | The source code uses the MIT License. |

## Terminology

| Concept | One term |
| --- | --- |
| Measurement action | probe |
| Requested container configuration | planned workload |
| Website estimate | planner |
| Bundled sandbox data | demo / sample data |
| Runtime acknowledgement | target confirmation |
| Safe upper result | capacity envelope |
