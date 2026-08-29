# Adversarial first-read review 1 — FAIL

**Reviewed:** 2026-08-29  
**Live URL:** https://sandbox-capacity-probe.sociobot.in/  
**Viewport checks:** fresh Chromium contexts at 390 × 844 and 1440 × 900

## Verdict

**FAIL.** The cold hero is clear, the local planner demo is genuinely isolated,
and all listed claim tests pass from a clean clone. The product still fails the
CLI demo contract: its one-click web demo is a planner estimate, not the CLI's
bundled sample run, and the landing page has no self-hosted terminal recording
of the real `capacity-probe demo` output. There are also unlisted payment,
refund, account, and free-tier claims, plus avoidable abstract copy and
terminology drift.

## Cold first read

Before scrolling, in both fresh contexts, I understood:

| Question | What the first screen says |
| --- | --- |
| What does it do? | “Measure container capacity before rollout.” |
| Who is it for? | “For teams running isolated agent or customer containers…” |
| What should I click first? | “Try it with sample data”; the following line says it opens a local planner and uses demo storage. |

This gate **passes**. At 390 px the headline, audience sentence, sample-data
button, and its result explanation are all visible without scrolling. No
console or page error was observed. The visual identity is distinct and fits
the documented topographic-operations direction; it is not a generic SaaS
template.

## Findings

### BLOCKING — F-1-1: The one-click demo does not demonstrate the CLI product

**Location / exact evidence:** the primary landing action is “Try it with
sample data.” It opens `/?demo=1#planner`, which immediately shows a useful
24-container local planning estimate (“763 ms”), not a `capacity-probe demo`
run. The only terminal on the landing page shows a manually composed
`capacity-probe probe … --output capacity.json` example. It is neither a
recording nor the documented demo command. `capacity-probe demo` and
`capacity-probe --demo` do work in a temporary directory and print a bundled
sample report, but neither command is shown on the landing page.

**Why this fails:** this is a CLI product. The required CLI demo is a
self-hosted terminal recording of the real binary doing its main job on shipped
sample input, plus the matching `demo` command. A calculator is a helpful
companion, but it cannot establish that the CLI is tryable or that its output
matches the product's main job.

**Concrete fix:** keep the isolated planner, but add a visible “Run the CLI
sample” section directly after the hero. Show a self-hosted recording of the
real `capacity-probe demo` command and its actual bundled output, including the
temporary output path. Add a copyable `capacity-probe demo` command and state
that it needs no runtime or network. The sample action should lead to this
evidence or show it alongside the planner. Add an end-to-end claim test that
the recording/source command corresponds to the shipped sample JSON.

### HIGH — F-1-2: Price, merchant, refund, account, and free-tier promises are unlisted claims

**Location / exact quotes:**

- “$39 one-time purchase” — landing paid-tier section.
- “Sociobot/Dodo is the merchant of record.” — landing paid-tier section.
- “Refunds are handled there and revoke the license automatically.” — landing
  paid-tier section.
- “Free planner active. No account required.” — landing license panel.
- “The complete CLI, safety behavior, JSON reports, and CSV export remain
  free.” — landing paid-tier section.
- “Source code is MIT licensed; the optional Planner Pro browser features are
  a one-time license unlock sold by Sociobot, the merchant of record.” —
  `README.md:118`.

None has a corresponding entry in `.factory/claims.json`. The existing
`planner-pro-five` test only checks static price/link text and a mocked license
verdict; it does not prove a $39 one-time checkout, merchant/refund behavior,
account-free use, or which features remain free.

**Why this fails:** payment terms and access restrictions are decisions a
visitor can rely on. Static text and a link assertion are not an observable
test of those promises.

**Concrete fix:** either remove/narrow each promise or add discrete claims and
observable tests. At minimum add `planner-pro-price`, `planner-pro-checkout`,
`planner-pro-no-account`, and `planner-pro-free-features`. The checkout test
may request the documented checkout URL without submitting payment and assert
the hosted page identifies the product, $39.00, and a one-time charge. Do not
claim refund/revocation automation unless a safe sandbox test can observe it.

### HIGH — F-1-3: The landing uses metaphor headings that do not name their sections

**Location / exact quotes and required rewrites:**

| Quote | Why it fails first-read copy | Concrete rewrite |
| --- | --- | --- |
| “A capacity claim you can reproduce.” | Does not name the method section. | “How the capacity probe measures a host” |
| “Observe the slope” | “Slope” hides the container-start measurement. | “Measure container startup time” |
| “Mark the contour” | “Contour” hides the budget comparison. | “Compare startup time with your budget” |
| “Walk it again” | Does not name the comparison action. | “Compare two probe reports” |
| “Explicit, isolated, cleaned up.” | Adjective list, not a section name. | “How a probe keeps test containers contained” |
| “Map the shape. Measure the host.” | “Map” and “shape” are unexplained visual metaphors. | “Plan a container workload before probing” |
| “Keep several routes on the same map.” | Does not say this is the paid saved-scenarios section. | “Save up to five planning scenarios” |
| “License station” | A visitor does not know this is license restoration. | “Restore a Planner Pro license” |

**Why this fails:** these headings violate the required plain-words rule that
a heading names its section and that no mood/metaphor wording carries product
meaning. The map artwork can remain; the reading task should not require
learning map vocabulary.

### HIGH — F-1-4: One product concept has several competing names

**Location / exact evidence:** the paid feature calls the saved item a
“scenario” (“Planner Pro saves up to five local scenarios”), “planning
contour” (“Save five planning contours”), “fleet shape” (“Compare fleet
shapes”), “route” (“Keep several routes”), and “contour” again on the save
button. The core workload is likewise called a “shape,” “scale,” and “route.”

**Why this fails:** the existing terminology table says the paid item is a
“scenario,” but the live page uses four alternatives. A hurried visitor cannot
tell whether the saved thing, its configuration, and its comparison are the
same object.

**Concrete fix:** use **scenario** everywhere for the planner input/saved
item: “Save five scenarios on this device,” “Compare scenarios before running
probes,” “Save current scenario,” and “Saved scenarios.” Use **planned
workload** (or one chosen equivalent) everywhere for containers/ports/mounts.

### HIGH — F-1-5: Several buttons do not state their result in plain words

**Location / exact quotes and required rewrites:**

| Quote | Concrete rewrite |
| --- | --- |
| “Map a scenario” | “Open the capacity planner” |
| “Get Planner Pro · $39” | “Buy Planner Pro for $39” |
| “Start for real” | “Exit demo and use your data” |
| “Restore purchase” | “Restore Planner Pro access” |
| “Save current contour” | “Save current scenario” |

The primary “Try it with sample data,” “Export CSV,” “Copy command,” and
“Reset demo” actions are result-naming and pass this check.

### MEDIUM — F-1-6: README copy exceeds the 22-word cap and keeps unexplained jargon

**Location / exact quotes:**

| Location | Words | Quote | Concrete rewrite |
| --- | ---: | --- | --- |
| `README.md:3` | 28 | “It runs a bounded synthetic sweep against an explicitly confirmed Docker or Podman host, measures container startup latency, counts published port bindings, and writes a portable capacity envelope.” | “It starts a bounded set of test containers on a confirmed Docker or Podman host. It measures startup time and local port bindings. It writes a capacity report.” |
| `README.md:55` | 23 | “Production markers such as `prod`, `production`, or `live` are refused even when joined to digits or other words unless `--allow-production` is explicitly present.” | “Targets containing prod, production, or live are refused. Add `--allow-production` only when you intend to probe that host.” |
| `README.md:68` | 32 | “The report includes host/runtime metadata, per-start observations, p50/p95, observed published-port bindings, a least-squares latency model, predicted p95 at the requested shape, and one of three envelopes: `comfortable`, `watch`, or `exceeded`.” | Split into short sentences and define p95 once: “The report records the host, runtime, and every container start. It shows p50 and p95 startup times. It labels the plan comfortable, watch, or exceeded.” |
| `README.md:90` | 24 | “Demo mode hides purchase and license controls, does not read or write real planner or license keys, and does not call the billing service.” | “Demo mode hides purchase and license controls. It reads and writes only demo data. It does not call billing.” |
| `README.md:118` | 23 | “Source code is MIT licensed; the optional Planner Pro browser features are a one-time license unlock sold by Sociobot, the merchant of record.” | “The source code uses the MIT license. Planner Pro is a $39 one-time browser license sold by Sociobot.” |

Also replace or define technical shorthand at its first use: “synthetic sweep,”
“published port binding,” “p50/p95,” “least-squares,” “runtime context,” and
“merchant of record.” The intended audience can handle precise terms; they
should not need to decode them before knowing what to do.

### MEDIUM — F-1-7: The copy-audit proof is incomplete and contradicts the requested audit scope

**Location / exact evidence:** `.factory/copy-audit.md` says “Code samples,
labels, navigation, values, and legal links are excluded from the sentence
count.” It contains no README inventory. This leaves unreviewed the actual
visible buttons, paid-tier terms, license language, footer statement, and all
README sentences.

**Why this fails:** this review found the unlisted claims and button wording in
the excluded material. The audit cannot demonstrate compliance while excluding
the content that users see and act on.

**Concrete fix:** replace the file with a complete inventory of landing and
README prose, headings, and actions; give every sentence a word count; flag
each jargon/metaphor/term/button issue; and retain the terminology table after
the copy is made consistent.

### MINOR — F-1-8: The header exceeds the navigation limit and mobile prioritizes purchase over navigation

**Location / exact evidence:** the desktop header has five nav links after the
wordmark: Demo, Method, Planner, Privacy, and “Get Planner Pro · $39.” At
390 px, the ordinary nav links collapse while the price CTA remains beside the
wordmark.

**Why this matters:** the site skeleton calls for at most four nav links and a
consistent header. On a phone, Privacy and the product sections are no longer
available in the header, while a purchase action is.

**Concrete fix:** keep four product/legal links in an accessible mobile menu
and move the purchase CTA into the paid-tier section or make it a fifth,
clearly separate utility action that does not replace navigation.

## Complete copy audit

Counts treat command/code values as one token where they appear in prose.
Terminal commands and measurement tables are code/data rather than sentences;
the terminal's one instruction is included below. All cold landing sentences
are at or below 22 words. The flags are F-1-3 through F-1-5 and F-1-2 where
the text makes an unlisted promise.

### Landing page

| Location | Words | Copy |
| --- | ---: | --- |
| Header | 3 | Sandbox Capacity Probe |
| Header | 1 | Demo |
| Header | 1 | Method |
| Header | 1 | Planner |
| Header | 1 | Privacy |
| Header | 4 | Get Planner Pro · $39 |
| Demo banner | 6 | Demo — sample data, nothing is saved |
| Demo banner | 2 | Reset demo |
| Demo banner | 3 | Start for real |
| Hero label | 4 | PREFLIGHT SURVEY / DOCKER + PODMAN |
| Hero h1 | 5 | Measure container capacity before rollout. |
| Hero | 19 | For teams running isolated agent or customer containers, measure a safe Docker or Podman scale before the real rollout. |
| Hero action | 5 | Try it with sample data |
| Hero action | 3 | Map a scenario |
| Hero | 11 | The sample opens a local planner and writes only demo storage. |
| Hero fact | 4 | Sample data stays separate |
| Hero fact | 3 | Planner runs locally |
| Hero fact | 2 | No telemetry |
| Method label | 3 | FIELD EVIDENCE / 01 |
| Method h2 | 6 | A capacity claim you can reproduce. |
| Method | 15 | The probe turns a sandbox shape into host-specific evidence instead of a generic container limit. |
| Method | 11 | Every result names the runtime, context, image, load shape, and caveats. |
| Method h3 | 3 | Observe the slope |
| Method | 13 | Start containers at quartile levels, measuring time-to-running while published bindings and mounts accumulate. |
| Method h3 | 3 | Mark the contour |
| Method | 16 | Fit a conservative p95 trend and compare it with your startup budget: comfortable, watch, or exceeded. |
| Method h3 | 3 | Walk it again |
| Method | 5 | Repeat the same shape later. |
| Method | 12 | `capacity-probe compare` reports prediction error and whether it meets the 25% target. |
| Terminal | 6 | Next: repeat, then run `capacity-probe compare`. |
| Runbook label | 2 | RUNBOOK / 02 |
| Runbook h2 | 4 | Explicit, isolated, cleaned up. |
| Step | 5 | Name and confirm the target. |
| Step | 7 | Production-like names are refused unless separately overridden. |
| Step | 4 | Review a dry run. |
| Step | 12 | See the maximum starts, ports, mounts, and measurement levels without runtime access. |
| Step | 3 | Measure and compare. |
| Step | 10 | Save JSON, repeat under controlled load, and quantify prediction accuracy. |
| Planner label | 3 | ROUTE SKETCH / 03 |
| Planner h2 | 6 | Map the shape. Measure the host. |
| Planner | 11 | This local planner is a transparent planning estimate, not a benchmark. |
| Planner | 12 | Use the generated command to replace it with evidence from your runtime. |
| Planner label | 4 | ESTIMATED P95 / MODEL ONLY |
| Planner live summary | 10 | Planning estimate: 330 milliseconds p95, comfortable, with 1170 milliseconds headroom. |
| Planner action | 2 | Copy command |
| Planner action | 2 | Export CSV |
| Paid label | 3 | OPERATOR PACK / 04 |
| Paid h2 | 7 | Keep several routes on the same map. |
| Paid | 11 | Planner Pro saves up to five local scenarios for side-by-side review. |
| Paid | 12 | The complete CLI, safety behavior, JSON reports, and CSV export remain free. |
| Paid | 3 | $39 one-time purchase |
| Paid feature | 7 | Save five planning contours on this device |
| Paid feature | 6 | Compare fleet shapes before running probes |
| Paid feature | 7 | Keep only the five latest local scenarios |
| Paid action | 3 | Buy Planner Pro |
| Paid | 7 | Sociobot/Dodo is the merchant of record. |
| Paid | 9 | Refunds are handled there and revoke the license automatically. |
| Paid | 4 | See privacy and terms. |
| License h3 | 2 | License station |
| License | 3 | Free planner active. |
| License | 3 | No account required. |
| License help | 12 | The token is stored only in this browser and verified with Sociobot. |
| License action | 2 | Restore purchase |
| License action | 3 | Save current contour |
| Saved h3 | 2 | Saved contours |
| Saved empty state | 4 | No saved scenarios yet. |
| Saved empty state | 8 | Adjust the map above, then save a contour. |
| Footer | 8 | A local tool for measuring safe container capacity. |
| Footer | 2 | No telemetry. |
| Footer | 4 | Built by Param Factory |

### README

| Line | Words | Sentence or copy unit |
| --- | ---: | --- |
| 3 | 17 | Sandbox Capacity Probe (`capacity-probe`) is a local-first CLI for teams planning many isolated agent or customer containers. |
| 3 | 28 | It runs a bounded synthetic sweep against an explicitly confirmed Docker or Podman host, measures container startup latency, counts published port bindings, and writes a portable capacity envelope. |
| 5 | 13 | It does not run untrusted workloads, orchestrate a cluster, or benchmark third-party systems. |
| 5 | 4 | It has no telemetry. |
| 9 | 7 | Build the single binary with stable Rust: |
| 16 | 14 | The factory can publish the crate with `cargo package`; registry credentials are intentionally not included. |
| 20 | 11 | Run a realistic sample without Docker, Podman, or a network connection: |
| 27 | 14 | The command writes `capacity-demo.json` in a process-specific temporary directory and prints the exact path. |
| 27 | 5 | It never measures your host. |
| 27 | 12 | Use the website demo at `/?demo=1` for the same safe first look. |
| 33 | 8 | First inspect the plan without changing the runtime: |
| 40 | 10 | Then run the controlled probe and keep the machine-readable report: |
| 48 | 10 | For scripts, send JSON to stdout and progress to stderr: |
| 55 | 10 | `--target` is a human safety label, not a remote hostname. |
| 55 | 14 | The probe uses the selected runtime’s current context (`docker context show`, `DOCKER_HOST`, or Podman connection). |
| 55 | 7 | The confirmation must exactly match the target. |
| 55 | 23 | Production markers such as `prod`, `production`, or `live` are refused even when joined to digits or other words unless `--allow-production` is explicitly present. |
| 55 | 15 | Hard bounds are 64 containers, 16 published ports per container, 16 mounts, and 10 samples. |
| 57 | 12 | The CLI creates a labeled, internal synthetic network and labeled sleeping containers. |
| 57 | 10 | Published ports bind only to `127.0.0.1` with runtime-assigned host ports. |
| 57 | 14 | Cleanup runs after success and ordinary errors; interrupted runs can be removed by label: |
| 64 | 8 | Podman accepts the same commands with `podman` substituted. |
| 68 | 32 | The report includes host/runtime metadata, per-start observations, p50/p95, observed published-port bindings, a least-squares latency model, predicted p95 at the requested shape, and one of three envelopes: `comfortable`, `watch`, or `exceeded`. |
| 68 | 12 | The model is evidence from this host and runtime, not a guarantee. |
| 70 | 10 | `0`: probe completed and stayed within the requested p95 budget |
| 71 | 10 | `2`: invalid or unsafe request, missing runtime, or probe failure |
| 72 | 9 | `3`: measurements completed but the capacity envelope was exceeded |
| 74 | 12 | Run `capacity-probe explain capacity.json` to render a saved JSON report for a human review. |
| 74 | 16 | `capacity-probe compare` accepts only reports from the same target, runtime, context, image, and container/port/mount shape. |
| 74 | 14 | It exits `3` and lists every different field when the reports are not comparable. |
| 81 | 10 | The static documentation and local scenario planner live in `site/`: |
| 90 | 11 | `npm run build` compiles/tests the CLI and builds the site to `dist/site/`. |
| 90 | 6 | The production entry point is `dist/site/index.html`. |
| 90 | 20 | The deployed static-site configuration sends a restrictive Content Security Policy, serves a styled 404 page, and caches the offline shell. |
| 90 | 16 | The demo mode stores only `demo:sandbox-capacity-probe:scenario` in local storage; **Start for real** removes that sample key. |
| 90 | 24 | Demo mode hides purchase and license controls, does not read or write real planner or license keys, and does not call the billing service. |
| 107 | 11 | Docker/Podman integration tests are opt-in because they create containers: `SCP_RUNTIME_TEST=docker cargo test`. |
| 109 | 8 | Every visitor-facing product claim is listed in `.factory/claims.json`. |
| 109 | 11 | Each listed command builds its prerequisites from a clean installed checkout: |
| 118 | 6 | Probe results stay on your machine. |
| 118 | 17 | The website planner uses local storage only for demo data, a purchased license, and saved Pro scenarios. |
| 118 | 19 | Manual license verification is limited to one attempt per browser minute; automatic checks occur at most once per day. |
| 118 | 8 | See the site’s `/privacy/` and `/terms/` pages. |
| 118 | 23 | Source code is MIT licensed; the optional Planner Pro browser features are a one-time license unlock sold by Sociobot, the merchant of record. |

## Demo, privacy, claims, and CLI verification

- **Web demo:** `/?demo=1#planner` loaded the 24-container / 4-port / 2-mount
  sample directly. The visible banner was “Demo — sample data, nothing is
  saved.” Reset restored the sample after a change. Purchase controls and the
  license form were hidden.
- **Isolation:** fresh-context storage contained only
  `demo:sandbox-capacity-probe:scenario`. Real `sb_license:*`, verdict,
  attempt, and saved-scenario sentinels were not read or changed in the
  existing claim test. The request log contained only the site origin's HTML,
  JS, CSS, mark, and hero image; no billing or third-party request occurred.
- **CLI demo:** `capacity-probe demo` and `capacity-probe --demo` each passed
  in a temp directory. They printed “no container runtime was contacted,” a
  realistic 12-container report, and a process-specific
  `capacity-demo.json` path.
- **Claims:** after `git clone --no-local /work/repo`, `npm ci`, each exact
  command listed in `.factory/claims.json` passed: `demo-isolated`,
  `local-planner`, `no-telemetry`, `csv-export`, `offline-reload`, `cli-demo`,
  `cli-safety-bounds`, `cli-isolated-cleanup`, `cli-report-compare`,
  `local-results`, `planner-pro-five`, and `license-policy`. The full
  `npm run test:claims` suite also completed against that clone.

## History confirmation

Every actionable finding in the earlier verification records was checked
against both the live deployment and current code:

| Earlier record | Confirmed status |
| --- | --- |
| `verification.md` | Claims manifest/test tags, one-click isolated web sample, cold hero clarity, planner integer validation, browser throttling, security headers, touch targets, axe semantics, real 404, metadata, and skeleton were confirmed fixed. |
| `verification-2.md` | Claim commands are now self-building from a clean checkout; production-marker matching, non-conflicting `capacity-probe` binary, integer planner validation, corrupt storage recovery, reported mobile performance, cache handling, and prior coverage gaps were confirmed repaired or superseded by current tests. |
| `verification-3.md` | The checkout now resolves to a Dodo hosted session; demo hides purchase/license controls and leaves real keys alone; incompatible reports exit 3; CSV invalid input and corrupt planner/demo storage recovery are covered in current source/tests. |
| `verification-4.md` | Its PASS-only findings list has no individual defect to repeat. The new F-1-1 through F-1-8 findings are first-read/copy-contract issues not identified there. |

## Structure and crawl

- Root, demo, Privacy, Terms, designed 404, and an unknown URL were checked.
  Root/privacy/terms returned 200; unknown URL returned the styled 404 with
  HTTP 404.
- Root title is “Sandbox Capacity Probe — Measure container capacity.” Browser
  demo title becomes “Demo — Sandbox Capacity Probe.” Legal titles follow the
  required route pattern. The live routes have lang, a single h1, description,
  canonical where applicable, social card, favicon, and consistent footer.
- All discovered internal links and the GitHub source returned successfully.
  Checkout followed to a 200 hosted Dodo session; no purchase was submitted.
- The visual system is product-specific and the first-screen layout works at
  390 px. F-1-8 is the remaining header-structure issue.

## Missed leverage

No artificial AI feature is warranted: the brief is a deterministic local CLI
measurement task, and an AI explanation would not improve its core result.
The obvious missing leverage is F-1-1: surface the real bundled CLI sample
where a visitor can see and run it.

## What would make this perfect

Show the actual CLI demo on the landing page, prove every purchase/access
statement or remove it, and replace the map-language labels with short names
for the measurement, planning, and saved-scenarios sections. Then rerun the
complete copy audit including README, buttons, paid terms, and all claims.
