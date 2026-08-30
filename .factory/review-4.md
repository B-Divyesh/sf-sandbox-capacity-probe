# Adversarial first-read review 4 — PASS

**Reviewed:** 30 August 2026  
**Live URL:** <https://sandbox-capacity-probe.sociobot.in/>  
**Source reviewed:** clean clone of `59843c8c211841133820a6e771748be23dceb77f` at `/tmp/scp-review4.EGviCQ`  
**Contexts:** fresh Chromium at 390 × 844 and 1440 × 900

## Verdict

**PASS.** There are zero findings. The first screen states the job, audience,
and first action; the one-click sample demonstrates the actual CLI output in a
separate browser-storage namespace; every declared claim command passes from a
clean clone; and no historical issue regressed.

## Cold first read

Before scrolling, I recorded the following in fresh mobile and desktop
contexts:

| Question | Answer from the first screen |
| --- | --- |
| What does it do? | It measures Docker or Podman container capacity before rollout. |
| Who is it for? | Teams running isolated agent or customer containers. |
| What should I click first? | **Try it with sample data** to see the real CLI output and isolated planner sample. |

This gate passes at both sizes. At 390 px, the headline, audience sentence,
primary action, result explanation, and all three facts are in the 844 px
viewport. There is no horizontal overflow (`scrollWidth === 390`). The 1440 px
view also contains all first-screen facts. The topographic survey treatment is
distinct from a generic SaaS template and follows the documented visual thesis.

## Copy audit

Word counts treat commands, URLs, and measurements as one word. Terminal
tables are data, not sentences. No sentence exceeds 22 words. No jargon is
left undefined at first use: the landing page defines p95 before using it in
the planner. No banned marketing adjective, information-free metaphor heading,
inconsistent product term, or non-result product button was found.

### Landing page sentences

| Words | Exact sentence or copy unit |
| ---: | --- |
| 19 | For teams running isolated agent or customer containers, measure a safe Docker or Podman scale before the real rollout. |
| 11 | See the real CLI output and an isolated local planning scenario. |
| 6 | No telemetry; demo stays separate. |
| 5 | Offline after the first visit. |
| 5 | Free planner and CSV export. |
| 10 | This recording comes from `capacity-probe demo` and the bundled sample report. |
| 8 | It needs no Docker, Podman, or network connection. |
| 13 | The 95th-percentile (p95) startup time is the time that 95% of starts met. |
| 8 | Demo — bundled sample data; no container runtime was contacted. |
| 13 | COMFORTABLE — predicted p95 351.0 ms / 1500 ms budget (1149.0 ms headroom). |
| 10 | The bundled sample stays below 70% of its startup budget. |
| 9 | Rule evidence: bundled demonstration data; no host was inspected. |
| 11 | Next: repeat this planned workload, then run `capacity-probe compare first.json second.json`. |
| 7 | Sample report written to a process-specific temporary `capacity-demo.json` path. |
| 9 | The probe turns a planned workload into host-specific evidence. |
| 10 | Every result names the runtime, context, image, workload, and limits. |
| 5 | Start containers at four levels. |
| 10 | Measure startup time as local port bindings and mounts increase. |
| 5 | Calculate the p95 startup time. |
| 8 | Label the planned workload comfortable, watch, or exceeded. |
| 5 | Repeat the planned workload later. |
| 9 | `capacity-probe compare` reports prediction error against the 25% target. |
| 7 | Production-like names are refused unless separately overridden. |
| 12 | See the maximum starts, ports, mounts, and measurement levels without runtime access. |
| 10 | Save JSON, repeat under controlled load, and quantify prediction accuracy. |
| 11 | This local planner is a transparent planning estimate, not a benchmark. |
| 12 | Use the generated command to replace it with evidence from your runtime. |
| 10 | No estimate is available until every planner value is valid. |
| 8 | Correct the planner inputs to create a command. |
| 7 | Demo reset to the bundled sample scenario. |
| 12 | `[Field]` must be a whole number between `[minimum]` and `[maximum]`. |
| 8 | Correct it to calculate or export this scenario. |
| 5 | Offline — planner and docs still work. |
| 8 | A local tool for measuring safe container capacity. |
| 2 | No telemetry. |
| 4 | Built by Param Factory. |

Headings are task names: “Run the CLI sample without a runtime,” “How the
capacity probe measures a host,” “How a probe contains test containers,” and
“Plan a container workload before probing.” Actions name results: “Try it with
sample data,” “Open the capacity planner,” “Copy demo command,” “Copy command,”
“Export CSV,” “Reset demo,” and “Exit demo and use your data.” `Menu` is a
standard navigation disclosure.

### README sentences

| Words | Exact sentence or copy unit |
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

The terminology remains consistent: **probe** is the measurement action,
**planned workload** is the configuration, **planner** is the local estimate,
and **demo/sample data** is the bundled sandbox.

## Demo and sandbox behaviour

The first landing action enters `/?demo=1#cli-demo` in one click. It focuses
“Run the CLI sample without a runtime” and immediately displays the full,
realistic `capacity-probe demo` report: a 12-container workload, four measured
levels, p50/p95, port bindings, a budget verdict, and a temporary report path.
The persistent banner reads “Demo — sample data, nothing is saved” and offers
both Reset and Exit controls.

In a fresh context, I first wrote a normal-storage sentinel,
`sandbox-capacity-probe:scenario = REAL-SENTINEL`. Demo used only
`demo:sandbox-capacity-probe:scenario`; Reset restored the bundled 24-container
scenario; Exit removed only the `demo:` key and retained the sentinel. The
complete browser request log for the demo flow contained only the product
origin. The separately compiled `capacity-probe demo` command ran from a new
temporary directory with `HTTP_PROXY` and `HTTPS_PROXY` pointed at an
unreachable local address; it exited 0, contacted no runtime, and wrote its
report to its own process-specific `/tmp/sandbox-capacity-probe-demo-*/` path.

## Claims and verification

All 12 exact commands in `.factory/claims.json` passed separately from the
clean clone after `npm ci`:

`demo-isolated`, `local-planner`, `no-telemetry`, `csv-export`,
`offline-reload`, `cli-demo`, `cli-safety-bounds`, `cli-isolated-cleanup`,
`cli-report-compare`, `local-results`, `free-planner`, and `mit-license`.

The live landing and README claims map to these entries: demo isolation,
planner-locality, no telemetry, export, offline reload, the CLI transcript and
sample, safety bounds, cleanup containment, report comparison, local results,
account-free planner, and MIT licensing. No unlisted visitor-facing claim was
found.

`npm test` passed in the same clone (4 Vitest tests, 10 Rust tests, and 54
Playwright tests). `npm run build` then passed, producing `dist/site/` and the
release binary. The built entry JavaScript is 6.11 kB raw plus a 2.63 kB shared
route module (both well below the static-product budget).

## Historical finding reconciliation

I read every earlier `review-*.md`, `polish-*.md`, and the previous handoff,
then rechecked each historical finding against live behaviour and current
source/tests.

| Earlier finding | Current result |
| --- | --- |
| F-1-1 | Fixed: the first click displays a self-hosted transcript that exactly matches the bundled CLI demo, apart from its process path. |
| F-1-2 / F-3-1 | Fixed: paid checkout and its unavailable claims were removed; the remaining free-planner claim passes. |
| F-1-3 | Fixed: section headings name their tasks. |
| F-1-4 | Fixed: current copy consistently uses planned workload and planner. |
| F-1-5 | Fixed: all product actions name their results. |
| F-1-6 | Fixed: README sentences are capped at 22 words and define p50/p95. |
| F-1-7 | Fixed: the current copy audit inventories the landing and README. |
| F-1-8 / F-3-2 | Fixed: four desktop header links are visible, in viewport, and keyboard reachable; mobile Menu exposes the same links. |
| F-2-1 | Fixed: Privacy navigation focuses its h1 and announces the route; Back focuses and announces the home h1. |
| F-2-2 | Fixed: the HTTP 404 has route-specific canonical, OG, Twitter, title, description, and a way home. |
| F-2-3 | Fixed: the landing defines p95 before first substantive use. |
| F-3-3 | Fixed: all three facts fit in the 390 px and desktop first screens. |
| F-3-4 | Fixed: the cleanup claim test covers early runtime-network failure and passed. |

## Structure, links, privacy, and leverage

Root, demo, Privacy, Terms, and the designed 404 were checked for `lang`, one
`h1`, a `<main>`, route-specific title, description, canonical, OG/Twitter
metadata, favicon, Apple icon, consistent header/footer, and Privacy/Terms
links. The title pattern is correct on every route. Root, demo, Privacy, Terms,
all anchors, and the public source link returned 200; the unknown route returned
the designed 404. Normal routes produced no console or page errors.

The live CSP is self-only for scripts, styles, images, fonts, and connections,
with `frame-ancestors 'none'` in a response header. The request-log result
confirms the privacy/no-telemetry claims for the browser demo. No AI feature is
missing: the brief calls for deterministic local container measurements,
bounded execution, report comparison, and export, all of which are present;
an AI step would be decorative rather than useful.

## What would make this perfect

This review found no remaining product work. Keep the transcript comparison,
fresh-clone claim suite, same-origin demo request audit, and mobile first-screen
check in each release so the current standard does not regress.
