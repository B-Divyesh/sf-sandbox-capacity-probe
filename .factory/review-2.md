# Adversarial first-read review 2 — FAIL

**Reviewed:** 30 August 2026  
**Live URL:** https://sandbox-capacity-probe.sociobot.in/  
**Contexts:** fresh Chromium at 390 × 844 and 1440 × 900; clean clone at `/tmp/scp-review2.dF673x`

## Verdict

**FAIL.** Cold first read, demo isolation, claim commands, CLI demo, quality gates, normal-route metadata, and link crawl pass. The product still has one blocking evidence-integrity regression, one medium route-accessibility defect, and two minor copy/metadata findings.

## Cold first read

This gate passes in both fresh contexts before scrolling.

| Question | Answer visible on the first screen |
| --- | --- |
| What does it do? | “Measure container capacity before rollout.” |
| For whom? | “For teams running isolated agent or customer containers…” |
| What should I click first? | “Try it with sample data.” |

The 390 px screen also showed “Open the capacity planner” and “See the real CLI output and an isolated local planning scenario.” There were no root-route console or page errors. The topographic paper/survey identity is distinct and conforms to `.factory/design.md`; it is not a generic SaaS template.

## Findings

### BLOCKING — F-1-1 (regressed): the web “recording” is not the real CLI output

**Exact evidence:** the demo says, “This recording comes from `capacity-probe demo` and the bundled sample report.” Its terminal says “planned workload 12 containers × 2 ports × **1 mount**.” Running the real bundled command in a new temporary directory printed “planned workload 12 containers × 2 ports × **1 mounts**.” The differing sources are `site/index.html` (`#cli-demo-output`) and `cli/src/main.rs:406`.

**Why this blocks:** the product is a CLI and its required web demo must be a self-hosted terminal recording of the real binary. A divergent hand-authored transcript is not a recording, even when the JSON fixture and selected values match. The `@claim:cli-demo` test asserts selected fields only, so it misses the false provenance. This is F-1-1 again: the promised section/command exists, but the actual evidence is half-fixed.

**Concrete fix:** generate the transcript from `capacity-probe demo` during the build, or render a committed captured stdout fixture verbatim. Compare complete normalized stdout in `@claim:cli-demo`, allowing only the process-specific temporary-path number to vary. Use one singular/plural formatter.

### MEDIUM — F-2-1: normal navigation and Back leave focus on `<body>`

**Evidence:** activating the live header “Privacy” link loads `/privacy/`, where `document.activeElement` is `BODY`; the new h1 is “Privacy” and no live route announcement exists. Browser Back returns to `/` with focus still on `BODY`.

**Why this loses a visitor:** keyboard and screen-reader users receive no reliable indication that a new page has loaded. The required route behavior is focus on the new h1 and a polite announcement.

**Concrete fix:** add `tabindex="-1"` to each route h1. In shared route code, focus it after navigation/pageshow and announce its text in one `aria-live="polite"` status element. Test header navigation and Back across `/`, `/privacy/`, and `/terms/`.

### MINOR — F-2-2: the 404 route lacks required route metadata

**Evidence:** live `/missing-review-two` returns the designed HTTP 404 and has a title, description, OG title/description/image, and favicon. It lacks a canonical link, `og:url`, `twitter:title`, `twitter:description`, and `twitter:image`; `site/404.html` has no such tags.

**Why this matters:** the metadata contract applies to every route. A shareable/noindex error route needs an explicit canonical and complete social metadata.

**Concrete fix:** add `/404.html` canonical (retain `noindex`), `og:url`, and route-specific Twitter title, description, and image. Add a browser assertion for 404 metadata.

### MINOR — F-2-3: `p95` is used on the landing before a plain definition

**Exact quotes:** “Calculate the p95 startup time.” and “Estimated p95 / model only.” The definition “P95 is the time that 95 percent of starts met.” appears only later in the README.

**Why this loses a visitor:** the planner asks a first-time visitor to act on technical shorthand without defining it at first use.

**Concrete fix:** first say “95th-percentile (p95) startup time — the time 95% of starts met.” Then use `p95` consistently in the method and planner.

## Demo, claims, CLI, history, and structure checks

- The primary action enters `/?demo=1#cli-demo` in one click. It immediately shows a realistic CLI report plus a 24-container / 4-port / 2-mount local scenario.
- The persistent banner says “Demo — sample data, nothing is saved,” has Reset and Exit controls, reset restored 24 containers and 763 ms, and exit removed `demo:sandbox-capacity-probe:scenario`.
- In a fresh live context, demo mode hid real purchase/license controls, changed no real-data sentinels, and sent only same-origin requests. No console/page error occurred.
- `cargo run --quiet --manifest-path /work/repo/cli/Cargo.toml -- demo` passed in a new temp directory without runtime/network and wrote `/tmp/sandbox-capacity-probe-demo-6756/capacity-demo.json`; F-1-1 is the transcript exception.
- `npm ci`, all 16 exact commands in `.factory/claims.json`, `npm test` (4 Vitest, 10 Rust, 62 Playwright), and `npm run build` passed from the clean clone.
- Every earlier review, polish record, handoff, and verification was read. All earlier actionable defects are fixed except the F-1-1 recording regression above.
- Root, demo, Privacy, and Terms have route-specific titles, one h1, main, descriptions, canonical URLs, OG/Twitter data, favicon, and Apple touch icon. The social image is 1200 × 630 and the touch icon 180 × 180. The 404 has the F-2-2 omissions.
- Live root has response-header CSP including `frame-ancestors 'none'`. No third-party scripts, fonts, analytics, or initial requests were observed. All crawled same-origin links, source, and checkout returned 200; mail links were explicit.
- No AI step is implied by the brief. Adding one would be decorative; the expected CLI, planner, export, and report comparison are present.

## Complete copy audit

Counts treat a command, URL, and numeric measurement as one word. Command blocks/table cells are code/data, not sentences. The static copy inventory below and the existing exhaustive dynamic-state inventory in `.factory/copy-audit.md` were checked against the live markup. No sentence exceeds 22 words. No marketing adjective, metaphor heading, inconsistent term, or non-result action was found. The jargon flag is F-2-3; the provenance claim is F-1-1.

### Landing sentences

| Words | Exact copy |
| ---: | --- |
| 19 | For teams running isolated agent or customer containers, measure a safe Docker or Podman scale before the real rollout. |
| 11 | See the real CLI output and an isolated local planning scenario. |
| 11 | This recording comes from `capacity-probe demo` and the bundled sample report. |
| 8 | It needs no Docker, Podman, or network connection. |
| 8 | Demo — bundled sample data; no container runtime was contacted. |
| 14 | COMFORTABLE — predicted p95 351.0 ms / 1500 ms budget (1149.0 ms headroom). |
| 10 | The bundled sample stays below 70% of its startup budget. |
| 8 | Rule evidence: bundled demonstration data; no host was inspected. |
| 11 | Next: repeat this planned workload, then run `capacity-probe compare first.json second.json`. |
| 5 | Sample report written to `/tmp/sandbox-capacity-probe-demo-4821/capacity-demo.json`. |
| 10 | The probe turns a planned workload into host-specific evidence. |
| 9 | Every result names the runtime, context, image, workload, and limits. |
| 5 | Start containers at four levels. |
| 10 | Measure startup time as local port bindings and mounts increase. |
| 6 | Calculate the p95 startup time. |
| 7 | Label the planned workload comfortable, watch, or exceeded. |
| 5 | Repeat the planned workload later. |
| 9 | `capacity-probe compare` reports prediction error against the 25% target. |
| 7 | Production-like names are refused unless separately overridden. |
| 12 | See the maximum starts, ports, mounts, and measurement levels without runtime access. |
| 10 | Save JSON, repeat under controlled load, and quantify prediction accuracy. |
| 6 | COMFORTABLE — predicted p95 351 ms. |
| 6 | Next: repeat, then run `capacity-probe compare`. |
| 11 | This local planner is a transparent planning estimate, not a benchmark. |
| 12 | Use the generated command to replace it with evidence from your runtime. |
| 10 | Planning estimate: 330 milliseconds p95, comfortable, with 1170 milliseconds headroom. |
| 11 | Planner Pro saves up to five local scenarios for side-by-side review. |
| 13 | The CLI, safety controls, JSON reports, and CSV export work without Planner Pro. |
| 3 | Sociobot hosts checkout. |
| 10 | Read the purchase and refund terms or the privacy policy. |
| 3 | Free planner active. |
| 3 | No account required. |
| 12 | The token is stored only in this browser and verified with Sociobot. |
| 4 | No saved scenarios yet. |
| 8 | Adjust the planner above, then save this scenario. |
| 8 | A local tool for measuring safe container capacity. |
| 2 | No telemetry. |
| 4 | Built by Param Factory |

All landing headings name their sections: “Docker and Podman capacity check” (5), “Measure container capacity before rollout.” (5), “Run the CLI sample without a runtime” (7), “How the capacity probe measures a host” (7), “Measure container startup time” (4), “Compare startup time with your budget” (6), “Compare two probe reports” (4), “How a probe contains test containers” (6), “Plan a container workload before probing” (6), “Save up to five planning scenarios” (6), “Restore a Planner Pro license” (5), and “Saved scenarios” (2).

Actions pass result naming: “Try it with sample data” (5), “Open the capacity planner” (4), “Copy demo command” (3), “Replay sample” (2), “Copy command” (2), “Export CSV” (2), “Buy Planner Pro for $39” (5), “Restore Planner Pro access” (4), “Save current scenario” (3), “Reset demo” (2), and “Exit demo and use your data” (6). `Menu` is a standard navigation disclosure, not a result action.

### README sentences

| Words | Exact copy |
| ---: | --- |
| 13 | Sandbox Capacity Probe (`capacity-probe`) helps teams plan many isolated agent or customer containers. |
| 15 | It starts a bounded set of test containers on a confirmed Docker or Podman host. |
| 8 | It measures startup time and local port bindings. |
| 5 | It writes a capacity report. |
| 12 | It does not run untrusted workloads, manage clusters, or benchmark third-party systems. |
| 7 | Build the single binary with stable Rust. |
| 13 | The factory can publish the crate with `cargo package --manifest-path cli/Cargo.toml`. |
| 5 | Registry credentials are not included. |
| 11 | Run a realistic sample without Docker, Podman, or a network connection. |
| 10 | The command writes `capacity-demo.json` in a process-specific temporary directory. |
| 10 | It prints the exact path and never measures your host. |
| 22 | Open the website demo to see the same CLI sample and an isolated planning scenario. |
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
| 9 | Published ports bind only to `127.0.0.1`. |
| 6 | Mounted test data is read only. |
| 7 | Cleanup runs after success and ordinary errors. |
| 10 | Remove resources left by an interrupted run with their labels. |
| 11 | Use the same commands with `podman` when Podman is your runtime. |
| 10 | The report records the host, runtime, and every container start. |
| 7 | It shows p50 and p95 startup times. |
| 6 | P50 is the middle startup time. |
| 10 | P95 is the time that 95 percent of starts met. |
| 10 | The report labels the planned workload `comfortable`, `watch`, or `exceeded`. |
| 8 | It also records model details and known limits. |
| 7 | The model describes this host and runtime. |
| 6 | It is not a production guarantee. |
| 9 | `0`: The probe completed within the requested p95 budget. |
| 15 | `2`: The request was unsafe or invalid, the runtime was missing, or the probe failed. |
| 10 | `3`: Measurements completed, but the planned workload exceeded its budget. |
| 11 | Run `capacity-probe explain capacity.json` to read a saved JSON report. |
| 15 | `capacity-probe compare` accepts reports with the same target, runtime, context, image, containers, ports, and mounts. |
| 14 | It exits `3` and lists each different field when the reports cannot be compared. |
| 10 | The static documentation and local scenario planner live in `site/`. |
| 13 | `npm run build` tests both products and builds the release binary and site. |
| 6 | The site output is `dist/site/`. |
| 9 | The service worker stores the public site for offline reading. |
| 7 | Demo mode writes only `demo:sandbox-capacity-probe:scenario`. |
| 10 | **Exit demo and use your data** removes that sample key. |
| 7 | Demo mode hides purchase and license controls. |
| 15 | It does not read real planner or license keys, and it does not call billing. |
| 11 | Docker and Podman tests create containers, so they are opt in. |
| 9 | Every visitor-facing claim is listed in `.factory/claims.json`. |
| 10 | Each claim command builds its requirements from a clean checkout. |
| 5 | The CLI sends no telemetry. |
| 9 | Probe results stay at the local path you choose. |
| 8 | The free website planner works without an account. |
| 11 | Its calculations and CSV export run without a Planner Pro license. |
| 5 | Planner Pro costs $39 once. |
| 9 | It saves the five latest scenarios in this browser. |
| 7 | The buy link opens a Sociobot-hosted checkout. |
| 17 | See the site's privacy and terms pages. |
| 6 | License tokens stay in browser storage. |
| 16 | Manual checks are limited to one each minute, and automatic checks occur at most once daily. |
| 7 | The source code uses the MIT License. |

README headings name their sections, and its command blocks are literal commands rather than prose claims. No README sentence exceeds 22 words or uses banned marketing language. The existing `.factory/copy-audit.md` additionally inventories dynamic landing states/errors and the terminology table; live source matched it except the F-1-1 terminal wording.

## What would make this perfect

Generate and verify the CLI transcript from the binary, focus/announce document navigation, complete 404 metadata, and define `p95` at first use. Then rerun the clean-clone claims gate, mobile/desktop demo, route-focus checks, and live metadata/link crawl.
