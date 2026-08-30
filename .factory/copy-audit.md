# Copy audit — 30 August 2026

This inventory covers landing prose, headings, navigation, actions, facts,
form labels, initial states, errors, terminal guidance, and every README
sentence. Counts treat a command or URL as one word. All sentences are at or
below 22 words. No text uses a banned marketing word or an unexplained map
metaphor. Terminal measurements are listed as evidence, not omitted.

## Landing page: navigation, first screen, and demo

| Type | Words | Exact copy |
| --- | ---: | --- |
| Link | 4 | Skip to main content |
| Wordmark | 3 | Sandbox Capacity Probe |
| Action | 1 | Menu |
| Nav | 1 each | Demo · Method · Planner · Privacy |
| Banner | 6 | Demo — sample data, nothing is saved |
| Action | 2 | Reset demo |
| Action | 6 | Exit demo and use your data |
| Label | 5 | Docker and Podman capacity check |
| H1 | 5 | Measure container capacity before rollout. |
| Prose | 19 | For teams running isolated agent or customer containers, measure a safe Docker or Podman scale before the real rollout. |
| Action | 5 | Try it with sample data |
| Action | 4 | Open the capacity planner |
| Prose | 11 | See the real CLI output and an isolated local planning scenario. |
| Fact | 4 | Sample data stays separate |
| Fact | 3 | Planner runs locally |
| Fact | 2 | No telemetry |
| Label | 4 | CLI sample / 01 |
| H2 | 7 | Run the CLI sample without a runtime |
| Prose | 11 | This recording comes from `capacity-probe demo` and the bundled sample report. |
| Prose | 8 | It needs no Docker, Podman, or network connection. |
| Prose | 13 | The 95th-percentile (p95) startup time is the time that 95% of starts met. |
| Action | 3 | Copy demo command |
| Action | 2 | Replay sample |
| Evidence | 2 | `capacity-probe demo` |
| Evidence | 8 | Demo — bundled sample data; no container runtime was contacted. |
| Evidence | 7 | Target/runtime: staging-west-demo / docker (demo-sample); planned workload: 12 containers × 2 ports × 1 mount. |
| Evidence | 11 | Four measured levels show p50, p95, and published port bindings. |
| Evidence | 13 | Comfortable — predicted p95 351.0 ms / 1500 ms budget, with 1149.0 ms headroom. |
| Evidence | 10 | The bundled sample stays below 70% of its startup budget. |
| Evidence | 8 | Rule evidence: bundled demonstration data; no host was inspected. |
| Evidence | 11 | Next: repeat this planned workload, then run `capacity-probe compare first.json second.json`. |
| Evidence | 7 | Sample report written to a process-specific temporary `capacity-demo.json` path. |

## Landing page: method, safe run, and planner

| Type | Words | Exact copy |
| --- | ---: | --- |
| Label | 5 | How it works / 02 |
| H2 | 7 | How the capacity probe measures a host |
| Prose | 10 | The probe turns a planned workload into host-specific evidence. |
| Prose | 9 | Every result names the runtime, context, image, workload, and limits. |
| H3 | 4 | Measure container startup time |
| Prose | 5 | Start containers at four levels. |
| Prose | 10 | Measure startup time as local port bindings and mounts increase. |
| H3 | 6 | Compare startup time with your budget |
| Prose | 6 | Calculate the p95 startup time. |
| Prose | 7 | Label the planned workload comfortable, watch, or exceeded. |
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
| Terminal | 7 | Example probe output shows the planned workload and four levels. |
| Terminal | 6 | Comfortable — predicted p95 351 ms. |
| Terminal | 6 | Next: repeat, then run `capacity-probe compare`. |
| Label | 4 | Capacity planner / 04 |
| H2 | 6 | Plan a container workload before probing |
| Prose | 11 | This local planner is a transparent planning estimate, not a benchmark. |
| Prose | 12 | Use the generated command to replace it with evidence from your runtime. |
| Labels | 14 total | Concurrent containers · Ports per container · Mounts per container · Baseline startup (ms) · p95 budget (ms) |
| Result label | 5 | Estimated p95 / model only |
| Initial result | 10 | Planning estimate: 330 milliseconds p95, comfortable, with 1170 milliseconds headroom. |
| Actions | 4 total | Copy command · Export CSV |

## Landing page: Planner Pro, states, and footer

| Type | Words | Exact copy |
| --- | ---: | --- |
| Label | 4 | Planner Pro / 05 |
| H2 | 6 | Save up to five planning scenarios |
| Prose | 11 | Planner Pro saves up to five local scenarios for side-by-side review. |
| Prose | 13 | The CLI, safety controls, JSON reports, and CSV export work without Planner Pro. |
| Price | 3 | $39 one-time purchase |
| Feature | 6 | Save five scenarios on this device |
| Feature | 5 | Compare scenarios before running probes |
| Feature | 7 | Keep only the five latest local scenarios |
| Action | 5 | Buy Planner Pro for $39 |
| Prose | 3 | Sociobot hosts checkout. |
| Prose | 10 | Read the purchase and refund terms or the privacy policy. |
| H3 | 5 | Restore a Planner Pro license |
| State | 3 | Free planner active. |
| State | 3 | No account required. |
| Label | 6 | Have a license? Paste it here |
| Prose | 12 | The token is stored only in this browser and verified with Sociobot. |
| Action | 4 | Restore Planner Pro access |
| Action | 3 | Save current scenario |
| H3 | 2 | Saved scenarios |
| Empty state | 4 | No saved scenarios yet. |
| Empty state | 8 | Adjust the planner above, then save this scenario. |
| Footer | 8 | A local tool for measuring safe container capacity. |
| Footer | 2 | No telemetry. |
| Footer | 4 | Built by Param Factory |
| Footer nav | 7 total | Demo · Method · Planner · Source · Privacy · Terms · MIT 0.1.0 |

### Dynamic states and errors

| Words | Exact copy |
| ---: | --- |
| 10 | No estimate is available until every planner value is valid. |
| 8 | Correct the planner inputs to create a command. |
| 8 | Demo reset to the bundled sample scenario. |
| 11 | Demo mode cannot restore licenses. Exit demo and use your data first. |
| 12 | Demo mode keeps sample data separate. Exit demo to restore a license. |
| 14 | A planner value must be a whole number inside its stated range. |
| 9 | Correct it to calculate or export this scenario. |
| 1 / 3 / 5 | Copied · Copy command · Select command to copy |
| 4 / 4 | Planner Pro is active on this device. · License no longer active. |
| 8 | Paste another license or purchase access. |
| 11 | Could not verify while offline. The free planner remains available. |
| 3 / 6 | Verifying license… · Online · license checks available |
| 7 | Offline · planner and docs still work |
| 9 | Route announcements repeat each route title and focused heading. |

## README inventory

| Type | Words | Exact copy |
| --- | ---: | --- |
| H1 | 3 | Sandbox Capacity Probe |
| Prose | 13 | Sandbox Capacity Probe (`capacity-probe`) helps teams plan many isolated agent or customer containers. |
| Prose | 15 | It starts a bounded set of test containers on a confirmed Docker or Podman host. |
| Prose | 8 | It measures startup time and local port bindings. |
| Prose | 5 | It writes a capacity report. |
| Prose | 12 | It does not run untrusted workloads, manage clusters, or benchmark third-party systems. |
| H2 | 1 | Install |
| Prose | 7 | Build the single binary with stable Rust. |
| Prose | 13 | The factory can publish the crate with `cargo package --manifest-path cli/Cargo.toml`. |
| Prose | 5 | Registry credentials are not included. |
| H2 | 4 | Try the bundled demo |
| Prose | 11 | Run a realistic sample without Docker, Podman, or a network connection. |
| Prose | 10 | The command writes `capacity-demo.json` in a process-specific temporary directory. |
| Prose | 10 | It prints the exact path and never measures your host. |
| Prose | 22 | Open the website demo to see the same CLI sample and an isolated planning scenario. |
| H2 | 1 | Usage |
| Prose | 9 | First inspect the plan without changing the container runtime. |
| Prose | 10 | Then run the controlled probe and keep the JSON report. |
| Prose | 12 | For scripts, send JSON to standard output and progress to standard error. |
| Prose | 9 | `--target` is a safety label, not a remote hostname. |
| Prose | 12 | The probe uses the selected runtime's active Docker context or Podman connection. |
| Prose | 7 | The confirmation must exactly match the target. |
| Prose | 8 | Targets containing `prod`, `production`, or `live` are refused. |
| Prose | 10 | Add `--allow-production` only when you intend to probe that host. |
| Prose | 15 | The limits are 64 containers, 16 published ports per container, 16 mounts, and 10 samples. |
| Prose | 11 | The CLI creates a labeled internal network and labeled sleeping containers. |
| Prose | 9 | Published ports bind only to `127.0.0.1`. |
| Prose | 6 | Mounted test data is read only. |
| Prose | 7 | Cleanup runs after success and ordinary errors. |
| Prose | 10 | Remove resources left by an interrupted run with their labels. |
| Prose | 11 | Use the same commands with `podman` when Podman is your runtime. |
| H3 | 4 | Output and exit codes |
| Prose | 10 | The report records the host, runtime, and every container start. |
| Prose | 7 | It shows p50 and p95 startup times. |
| Prose | 6 | P50 is the middle startup time. |
| Prose | 10 | P95 is the time that 95 percent of starts met. |
| Prose | 10 | The report labels the planned workload `comfortable`, `watch`, or `exceeded`. |
| Prose | 8 | It also records model details and known limits. |
| Prose | 7 | The model describes this host and runtime. |
| Prose | 6 | It is not a production guarantee. |
| Exit code | 9 | `0`: The probe completed within the requested p95 budget. |
| Exit code | 15 | `2`: The request was unsafe or invalid, the runtime was missing, or the probe failed. |
| Exit code | 10 | `3`: Measurements completed, but the planned workload exceeded its budget. |
| Prose | 11 | Run `capacity-probe explain capacity.json` to read a saved JSON report. |
| Prose | 15 | `capacity-probe compare` accepts reports with the same target, runtime, context, image, containers, ports, and mounts. |
| Prose | 14 | It exits `3` and lists each different field when the reports cannot be compared. |
| H2 | 1 | Website |
| Prose | 10 | The static documentation and local scenario planner live in `site/`. |
| Prose | 13 | `npm run build` tests both products and builds the release binary and site. |
| Prose | 6 | The site output is `dist/site/`. |
| Prose | 9 | The service worker stores the public site for offline reading. |
| Prose | 7 | Demo mode writes only `demo:sandbox-capacity-probe:scenario`. |
| Prose | 10 | **Exit demo and use your data** removes that sample key. |
| Prose | 7 | Demo mode hides purchase and license controls. |
| Prose | 15 | It does not read real planner or license keys, and it does not call billing. |
| H2 | 3 | Development and verification |
| Prose | 11 | Docker and Podman tests create containers, so they are opt in. |
| Prose | 9 | Every visitor-facing claim is listed in `.factory/claims.json`. |
| Prose | 10 | Each claim command builds its requirements from a clean checkout. |
| H2 | 3 | Privacy and licensing |
| Prose | 5 | The CLI sends no telemetry. |
| Prose | 9 | Probe results stay at the local path you choose. |
| Prose | 8 | The free website planner works without an account. |
| Prose | 11 | Its calculations and CSV export run without a Planner Pro license. |
| Prose | 5 | Planner Pro costs $39 once. |
| Prose | 9 | It saves the five latest scenarios in this browser. |
| Prose | 7 | The buy link opens a Sociobot-hosted checkout. |
| Prose | 17 | See the site's privacy and terms pages. |
| Prose | 6 | License tokens stay in browser storage. |
| Prose | 16 | Manual checks are limited to one each minute, and automatic checks occur at most once daily. |
| Prose | 7 | The source code uses the MIT License. |

The README command blocks were also checked as literal copy. They contain only
the documented install, demo, probe, cleanup, test, and claim commands. Each
command is exercised by a Rust, Playwright, build, package, or claim test.

## Terminology table

| Concept | One product term |
| --- | --- |
| Measurement action | probe |
| Requested container configuration | planned workload |
| Safe maximum | capacity envelope |
| Website estimate | planner |
| Bundled safe experience | demo / sample data |
| Runtime acknowledgement | target confirmation |
| Saved paid planner item | scenario |
| Local port pressure | published port bindings |

Visual classes and artwork retain topographic terms because they are not user
instructions. Product copy uses **planned workload** and **scenario** only.
