# Adversarial first-read review 3 — FAIL

**Reviewed:** 30 August 2026

**Live URL:** https://sandbox-capacity-probe.sociobot.in/

**Candidate:** `d7d5e1e6f4e63e30a3bef0dcfc8e1e19833d9fa0`

**Contexts:** fresh Chromium at 390 × 844 and 1440 × 900; clean clone at `/tmp/scp-review3.Sdwgws`

## Verdict

**FAIL.** Two declared purchase claims fail because the public checkout returns
HTTP 503. The desktop header also regresses the earlier four-link-navigation
repair: it displays only the wordmark. Two smaller gaps remain in the first
screen and CLI error cleanup. A pass requires zero findings and every claim
test passing, so the otherwise clear first read and working demo do not change
the verdict.

## Cold first read

I opened the live root without stored state at each viewport and recorded this
before scrolling:

| Question | My answer from the first screen |
| --- | --- |
| What does it do? | It measures how many Docker or Podman containers a host can start within a p95 startup budget before rollout. |
| For whom? | Teams preparing to run many isolated agent or customer containers. |
| What should I click first? | **Try it with sample data**; the nearby text says it opens real CLI output and an isolated local planning scenario. |

This mandatory comprehension gate passes. At 390 px, the headline, audience,
both actions, and result sentence are visible without scrolling. At 1440 px,
the primary action is visible at the bottom of the viewport. The topographic
survey-map identity is product-specific and matches `.factory/design.md`; it
does not resemble a generic SaaS hero.

## Findings

### BLOCKING — F-3-1 (reopens F-1-2): both purchase claims fail and the buy link is dead

**Exact quote/location:** the landing page says “$39 one-time purchase,” offers
“Buy Planner Pro for $39,” and says “Sociobot hosts checkout.” The README says
“Planner Pro costs $39 once” and “The buy link opens a Sociobot-hosted
checkout.” All point to
`https://api.sociobot.in/api/v1/products/sandbox-capacity-probe/checkout`.

**Evidence:** the live link crawl and a separate `curl` request both received
HTTP 503. From the clean clone, the exact listed tests
`@claim:planner-pro-price` and `@claim:planner-pro-checkout` each failed at
`expect(response.ok()).toBe(true)`. The full `npm test` run failed the same two
tests in both desktop and mobile projects: 60 passed, 4 failed.

**Why a visitor is misled:** the site presents a purchasable $39 product, but
the only purchase action cannot open checkout. Price and checkout were the
substance of historical F-1-2; adding tests did not keep the repaired claim
working.

**Concrete fix:** restore the Sociobot product checkout so the URL redirects
to a successful Dodo session naming Sandbox Capacity Probe, `$39.00`, and a
one-time charge. If checkout cannot be kept available, remove the price,
purchase action, hosted-checkout sentence, and corresponding claims until it
can. Re-run both exact claim tests from a clean clone and crawl the public buy
link.

### BLOCKING — F-3-2 (reopens F-1-8): the four-link header is invisible on desktop

**Exact location:** the live 1366 px and 1440 px headers show only the “Sandbox
Capacity Probe” wordmark. `site/index.html` puts Demo, Method, Planner, and
Privacy inside a closed `<details class="nav-menu">`. At desktop widths,
`site/src/styles.css` sets `.nav-menu summary { display: none; }`, so the only
control that can open the closed disclosure is hidden. The link boxes start at
or beyond the right viewport edge; Privacy is entirely absent.

**Why a visitor is lost:** desktop visitors cannot use the required consistent
header to reach the demo, method, planner, or privacy page. The footer links do
not repair the missing first-screen navigation. Historical F-1-8 required a
four-link header on desktop and mobile, so this is a half-fixed earlier
finding and is blocking under the review instructions.

**Concrete fix:** use a normal visible four-link nav at desktop widths and a
button-controlled disclosure only below the mobile breakpoint. Do not depend
on hidden content inside a closed `<details>`. Add desktop and mobile tests
that assert all four header links are visible, in the viewport, and keyboard
reachable.

### MEDIUM — F-3-3: the required three facts do not fit on the first screen

**Exact location:** the hero facts are “Sample data stays separate,” “Planner
runs locally,” and “No telemetry.” In a fresh 390 × 844 context, the first fact
starts at y=816.7 and the other two start at y=842.9, leaving only about two
pixels of those latter line boxes inside the viewport. At 1440 × 900, the primary
action ends at y=873.4, the result sentence continues past y=900, and all three
facts are below the fold. The set also omits the product's tested offline and
price facts.

**Why this matters:** the core job, audience, and action remain clear, but the
mandatory first-screen privacy/offline/price fact area is not actually on the
first screen, and two of those categories are not stated there.

**Concrete fix:** use three short lines such as “No telemetry; demo data stays
separate,” “Works offline after the first visit,” and “Free planner; Pro costs
$39 once.” Reduce the hero heading size or spacing so the complete action
explanation and all three facts fit within 390 × 844 and 1440 × 900. Add
bounding-box assertions that each fact's bottom edge is no lower than
`window.innerHeight`.

### MINOR — F-3-4: an ordinary network-creation error leaves a temporary directory

**Exact quote/location:** README: “Cleanup runs after success and ordinary
errors.” `.factory/claims.json` claim `cli-isolated-cleanup`: “The CLI … cleans
up after success or an ordinary error.”

**Evidence:** with a deterministic fake Docker executable that succeeds for
`info` and fails `network create`, the CLI exited 2 and left
`/tmp/capacity-probe-1788058490-4666`. The directory was empty. Source creates
`temp_root` before `self.create_network(&network)?`; a network-creation error
returns before `Session::cleanup`. The declared claim test passes because it
only tests a later container-run failure. The latest handoff already records
this gap, and this review reproduced it independently.

**Why this matters:** no container or user data remains, so impact is small,
but “cleanup runs after ordinary errors” is broader than the tested and
observed behavior.

**Concrete fix:** create the cleanup guard before network creation or remove
`temp_root` on every early return. Extend `@claim:cli-isolated-cleanup` with a
network-create failure and assert no matching process directory remains.

## One-click demo and privacy

The demo gate passes.

- One click on **Try it with sample data** opens
  `/?demo=1#cli-demo`, focuses “Run the CLI sample without a runtime,” and
  immediately shows the real bundled CLI transcript.
- The same screen has a realistic 24-container, 4-port, 2-mount planner sample
  with a 763 ms estimate.
- The persistent banner says “Demo — sample data, nothing is saved” and offers
  **Reset demo** and **Exit demo and use your data**.
- After changing containers to 31, Reset restored 24 containers and 763 ms.
- A direct live demo with real-key sentinels sent six same-origin requests and
  zero cross-origin requests. It preserved both real sentinels and wrote only
  `demo:sandbox-capacity-probe:scenario`.
- The CLI demo ran from a new temporary working directory with unreachable
  proxy endpoints, exited 0 without Docker or Podman, and wrote the bundled
  report to `/tmp/sandbox-capacity-probe-demo-4699/capacity-demo.json`.

## Claim results

I ran every exact `.factory/claims.json` command separately after `npm ci` in
the clean clone. Fourteen passed and two failed.

| Claim id | Result | Observable evidence |
| --- | --- | --- |
| `demo-isolated` | PASS | Demo namespace, reset, real sentinels, and hidden billing controls verified. |
| `local-planner` | PASS | Scenario changed locally with no cross-origin request. |
| `no-telemetry` | PASS | Browser flow stayed same-origin; CLI demo worked with unreachable proxies. |
| `csv-export` | PASS | Download contained the expected header and sample row. |
| `offline-reload` | PASS | A separate context reloaded the demo offline from service-worker cache v6. |
| `cli-demo` | PASS | Complete normalized stdout, live recording fixture, and both JSON reports matched. |
| `cli-safety-bounds` | PASS | Production markers and documented maximum/over-limit plans behaved as stated. |
| `cli-isolated-cleanup` | PASS, incomplete | Listed success and container-run-error checks passed; F-3-4 identifies the uncovered earlier error. |
| `cli-report-compare` | PASS | Reports, identity checks, and the 25% comparison verdict passed. |
| `local-results` | PASS | The requested local output path contained a valid report. |
| `planner-pro-five` | PASS | Only the latest five local scenarios remained. |
| `planner-pro-price` | **FAIL** | Checkout request returned HTTP 503. |
| `planner-pro-checkout` | **FAIL** | Checkout request returned HTTP 503 instead of a hosted Dodo session. |
| `planner-pro-no-account` | PASS | Planner worked without an account or billing request. |
| `planner-pro-free-features` | PASS | CSV, CLI safety, and JSON paths worked without a license. |
| `license-policy` | PASS | Local storage and manual/automatic verification throttles passed. |

No additional visitor-facing claim-like sentence on the landing page or in the
README lacks a corresponding manifest claim. F-3-4 is an incomplete assertion
within an existing claim, not an absent entry.

## Copy audit

Counts treat a command, URL, or numeric path as one word. No sentence exceeds
22 words. No banned marketing adjective, metaphor heading, inconsistent
product term, or non-result-naming product action remains. Claim failures are
flagged below even where the sentence itself is plain.

### Landing page sentences and evidence lines

| Words | Exact copy | Flag |
| ---: | --- | --- |
| 19 | For teams running isolated agent or customer containers, measure a safe Docker or Podman scale before the real rollout. | — |
| 11 | See the real CLI output and an isolated local planning scenario. | — |
| 10 | This recording comes from `capacity-probe demo` and the bundled sample report. | — |
| 8 | It needs no Docker, Podman, or network connection. | — |
| 13 | The 95th-percentile (p95) startup time is the time that 95% of starts met. | — |
| 9 | Demo — bundled sample data; no container runtime was contacted. | — |
| 11 | COMFORTABLE — predicted p95 351.0 ms / 1500 ms budget (1149.0 ms headroom) | — |
| 10 | The bundled sample stays below 70% of its startup budget. | — |
| 9 | Rule evidence: bundled demonstration data; no host was inspected | — |
| 8 | Next: repeat this planned workload, then run `capacity-probe compare first.json second.json`. | — |
| 5 | Sample report written to `/tmp/sandbox-capacity-probe-demo-4821/capacity-demo.json` | — |
| 9 | The probe turns a planned workload into host-specific evidence. | — |
| 10 | Every result names the runtime, context, image, workload, and limits. | — |
| 5 | Start containers at four levels. | — |
| 10 | Measure startup time as local port bindings and mounts increase. | — |
| 5 | Calculate the p95 startup time. | — |
| 8 | Label the planned workload comfortable, watch, or exceeded. | — |
| 5 | Repeat the planned workload later. | — |
| 8 | `capacity-probe compare` reports prediction error against the 25% target. | — |
| 7 | Production-like names are refused unless separately overridden. | — |
| 12 | See the maximum starts, ports, mounts, and measurement levels without runtime access. | — |
| 10 | Save JSON, repeat under controlled load, and quantify prediction accuracy. | — |
| 4 | COMFORTABLE — predicted p95 351ms | — |
| 6 | Next: repeat, then run capacity-probe compare. | — |
| 11 | This local planner is a transparent planning estimate, not a benchmark. | — |
| 12 | Use the generated command to replace it with evidence from your runtime. | — |
| 10 | Planning estimate: 330 milliseconds p95, comfortable, with 1170 milliseconds headroom. | — |
| 11 | Planner Pro saves up to five local scenarios for side-by-side review. | — |
| 13 | The CLI, safety controls, JSON reports, and CSV export work without Planner Pro. | — |
| 3 | Sociobot hosts checkout. | F-3-1 |
| 10 | Read the purchase and refund terms or the privacy policy. | — |
| 3 | Free planner active. | — |
| 3 | No account required. | — |
| 12 | The token is stored only in this browser and verified with Sociobot. | — |
| 4 | No saved scenarios yet. | — |
| 8 | Adjust the planner above, then save this scenario. | — |
| 8 | A local tool for measuring safe container capacity. | — |
| 2 | No telemetry. | — |
| 4 | Built by Param Factory | — |

### Landing headings, labels, facts, and actions

| Type | Words | Exact copy | Flag |
| --- | ---: | --- | --- |
| Link | 4 | Skip to main content | — |
| Wordmark | 3 | Sandbox Capacity Probe | — |
| Disclosure | 1 | Menu | F-3-2: hidden on desktop |
| Navigation | 1 each | Demo · Method · Planner · Privacy | F-3-2: invisible on desktop |
| Banner | 6 | Demo — sample data, nothing is saved | — |
| Action | 2 | Reset demo | — |
| Action | 6 | Exit demo and use your data | — |
| Label | 5 | Docker and Podman capacity check | — |
| H1 | 5 | Measure container capacity before rollout. | — |
| Action | 5 | Try it with sample data | — |
| Action | 4 | Open the capacity planner | — |
| Fact | 4 | Sample data stays separate | F-3-3: below fold |
| Fact | 3 | Planner runs locally | F-3-3: below fold |
| Fact | 2 | No telemetry | F-3-3: below fold |
| Label | 4 | CLI sample / 01 | — |
| H2 | 7 | Run the CLI sample without a runtime | — |
| Action | 3 | Copy demo command | — |
| Action | 2 | Replay sample | — |
| Label | 5 | How it works / 02 | — |
| H2 | 7 | How the capacity probe measures a host | — |
| H3 | 4 | Measure container startup time | — |
| H3 | 6 | Compare startup time with your budget | — |
| H3 | 4 | Compare two probe reports | — |
| Label | 5 | Safe probe steps / 03 | — |
| H2 | 6 | How a probe contains test containers | — |
| Step | 5 | Name and confirm the target. | — |
| Step | 4 | Review a dry run. | — |
| Step | 3 | Measure and compare. | — |
| Label | 4 | Capacity planner / 04 | — |
| H2 | 6 | Plan a container workload before probing | — |
| Labels | 14 total | Concurrent containers · Ports per container · Mounts per container · Baseline startup (ms) · p95 budget (ms) | — |
| Result label | 5 | Estimated p95 / model only | — |
| Actions | 4 total | Copy command · Export CSV | — |
| Label | 4 | Planner Pro / 05 | — |
| H2 | 6 | Save up to five planning scenarios | — |
| Price | 3 | $39 one-time purchase | F-3-1 |
| Feature | 6 | Save five scenarios on this device | — |
| Feature | 5 | Compare scenarios before running probes | — |
| Feature | 7 | Keep only the five latest local scenarios | — |
| Action | 5 | Buy Planner Pro for $39 | F-3-1 |
| H3 | 5 | Restore a Planner Pro license | — |
| Label | 6 | Have a license? Paste it here | — |
| Action | 4 | Restore Planner Pro access | — |
| Action | 3 | Save current scenario | — |
| H3 | 2 | Saved scenarios | — |

### Landing dynamic-state sentences and messages

| Words | Exact copy or rendered template | Flag |
| ---: | --- | --- |
| 10 | No estimate is available until every planner value is valid. | — |
| 8 | Correct the planner inputs to create a command. | — |
| 7 | Demo reset to the bundled sample scenario. | — |
| 5 | Demo mode cannot restore licenses. | — |
| 7 | Exit demo and use your data first. | — |
| 6 | Demo mode keeps sample data separate. | — |
| 6 | Exit demo to restore a license. | — |
| 12 | `[Field]` must be a whole number inside its stated minimum and maximum. | — |
| 8 | Correct it to calculate or export this scenario. | — |
| 5 | Select the command to copy. | — |
| 7 | Planner Pro is active on this device. | — |
| 4 | License no longer active. | — |
| 6 | Paste another license or purchase access. | — |
| 5 | Could not verify while offline. | — |
| 5 | The free planner remains available. | — |
| 7 | Too many verification attempts from this browser. | — |
| 5 | Try again in `[seconds]` seconds. | — |
| 5 | License verification is rate limited. | — |
| 5 | Try again after `[seconds]` seconds. | — |
| 9 | Planner Pro is active from the last verified license. | — |
| 3 | Verification is offline. | — |

The remaining dynamic copy units are status/action fragments: “Copied” (1),
“Copied demo command” (3), “Verifying license…” (2), “Online · license checks
available” (4), and “Offline · planner and docs still work” (6). None carries
an additional claim or needs a rewrite.

### README sentences

| Words | Exact copy | Flag |
| ---: | --- | --- |
| 13 | Sandbox Capacity Probe (`capacity-probe`) helps teams plan many isolated agent or customer containers. | — |
| 15 | It starts a bounded set of test containers on a confirmed Docker or Podman host. | — |
| 8 | It measures startup time and local port bindings. | — |
| 5 | It writes a capacity report. | — |
| 12 | It does not run untrusted workloads, manage clusters, or benchmark third-party systems. | — |
| 7 | Build the single binary with stable Rust. | — |
| 8 | The factory can publish the crate with `cargo package --manifest-path cli/Cargo.toml`. | — |
| 5 | Registry credentials are not included. | — |
| 11 | Run a realistic sample without Docker, Podman, or a network connection. | — |
| 9 | The command writes `capacity-demo.json` in a process-specific temporary directory. | — |
| 10 | It prints the exact path and never measures your host. | — |
| 15 | Open the website demo to see the same CLI sample and an isolated planning scenario. | — |
| 9 | First inspect the plan without changing the container runtime. | — |
| 10 | Then run the controlled probe and keep the JSON report. | — |
| 12 | For scripts, send JSON to standard output and progress to standard error. | — |
| 9 | `--target` is a safety label, not a remote hostname. | — |
| 12 | The probe uses the selected runtime's active Docker context or Podman connection. | — |
| 7 | The confirmation must exactly match the target. | — |
| 8 | Targets containing `prod`, `production`, or `live` are refused. | — |
| 10 | Add `--allow-production` only when you intend to probe that host. | — |
| 15 | The limits are 64 containers, 16 published ports per container, 16 mounts, and 10 samples. | — |
| 11 | The CLI creates a labeled internal network and labeled sleeping containers. | — |
| 6 | Published ports bind only to `127.0.0.1`. | — |
| 6 | Mounted test data is read only. | — |
| 7 | Cleanup runs after success and ordinary errors. | F-3-4 |
| 10 | Remove resources left by an interrupted run with their labels. | — |
| 11 | Use the same commands with `podman` when Podman is your runtime. | — |
| 10 | The report records the host, runtime, and every container start. | — |
| 7 | It shows p50 and p95 startup times. | — |
| 6 | P50 is the middle startup time. | — |
| 10 | P95 is the time that 95 percent of starts met. | — |
| 10 | The report labels the planned workload `comfortable`, `watch`, or `exceeded`. | — |
| 8 | It also records model details and known limits. | — |
| 7 | The model describes this host and runtime. | — |
| 6 | It is not a production guarantee. | — |
| 9 | `0`: The probe completed within the requested p95 budget. | — |
| 15 | `2`: The request was unsafe or invalid, the runtime was missing, or the probe failed. | — |
| 10 | `3`: Measurements completed, but the planned workload exceeded its budget. | — |
| 8 | Run `capacity-probe explain capacity.json` to read a saved JSON report. | — |
| 14 | `capacity-probe compare` accepts reports with the same target, runtime, context, image, containers, ports, and mounts. | — |
| 14 | It exits `3` and lists each different field when the reports cannot be compared. | — |
| 10 | The static documentation and local scenario planner live in `site/`. | — |
| 11 | `npm run build` tests both products and builds the release binary and site. | — |
| 5 | The site output is `dist/site/`. | — |
| 10 | The service worker stores the public site for offline reading. | — |
| 5 | Demo mode writes only `demo:sandbox-capacity-probe:scenario`. | — |
| 10 | **Exit demo and use your data** removes that sample key. | — |
| 7 | Demo mode hides purchase and license controls. | — |
| 15 | It does not read real planner or license keys, and it does not call billing. | — |
| 11 | Docker and Podman tests create containers, so they are opt in. | — |
| 7 | Every visitor-facing claim is listed in `.factory/claims.json`. | — |
| 10 | Each claim command builds its requirements from a clean checkout. | — |
| 5 | The CLI sends no telemetry. | — |
| 9 | Probe results stay at the local path you choose. | — |
| 8 | The free website planner works without an account. | — |
| 11 | Its calculations and CSV export run without a Planner Pro license. | — |
| 5 | Planner Pro costs $39 once. | F-3-1 |
| 9 | It saves the five latest scenarios in this browser. | — |
| 7 | The buy link opens a Sociobot-hosted checkout. | F-3-1 |
| 7 | See the site's privacy and terms pages. | — |
| 6 | License tokens stay in browser storage. | — |
| 16 | Manual checks are limited to one each minute, and automatic checks occur at most once daily. | — |
| 7 | The source code uses the MIT License. | — |

README headings also pass out-of-context reading: “Sandbox Capacity Probe”
(3), “Install” (1), “Try the bundled demo” (4), “Usage” (1), “Output and exit
codes” (4), “Website” (1), “Development and verification” (3), and “Privacy
and licensing” (3). Its command blocks are literal commands, not prose
sentences.

Terminology is consistent: **probe** is the measurement action, **planned
workload** is the requested container configuration, **capacity envelope** is
the safe maximum, **planner** is the website estimate, **demo/sample data** is
the bundled sandbox, **target confirmation** is the runtime acknowledgement,
and **scenario** is the saved planner item.

## History reconciliation

I read `.factory/review-1.md`, `.factory/review-2.md`,
`.factory/polish-1.md`, `.factory/polish-2.md`, and the incoming
`.factory/handoff.md`, then checked each earlier finding in live behavior and
source.

| Earlier id | Result in round 3 | Evidence |
| --- | --- | --- |
| F-1-1 | Fixed | Live one-click demo shows the CLI transcript; `@claim:cli-demo` compares complete normalized stdout and passed. |
| F-1-2 | **Regressed; see F-3-1** | Price and checkout claims are listed, but both public checkout tests now fail with HTTP 503. |
| F-1-3 | Fixed | All section headings name their task; no reviewed metaphor heading remains. |
| F-1-4 | Fixed | Planned workloads and saved scenarios use one term each in live copy and source. |
| F-1-5 | Fixed | Product actions name results. |
| F-1-6 | Fixed | Every README sentence is at or below 22 words and the first p50/p95 use is defined. |
| F-1-7 | Fixed | The copy audit inventories landing, dynamic, terminal, and README copy. |
| F-1-8 | **Half-fixed; see F-3-2** | Mobile has the four-link menu, but desktop has no visible/openable header navigation. |
| F-2-1 | Fixed | Privacy navigation focuses its h1 and announces the route; Back focuses the home h1 and announces it. |
| F-2-2 | Fixed | The designed HTTP 404 has canonical, OG, Twitter, favicon, Privacy, and Terms metadata/links. |
| F-2-3 | Fixed | The landing defines 95th-percentile (p95) before terminal and planner use. |

The incoming handoff's known empty-directory cleanup gap was reproduced and is
now recorded as F-3-4 rather than treated as accepted debt.

## Structure, accessibility, links, and build

- Root, demo, Privacy, Terms, and 404 each have one h1, one main landmark,
  `lang="en"`, route-appropriate title, description, canonical, OG/Twitter
  metadata, favicon, and a footer with Privacy and Terms.
- An unknown route returned the designed page with HTTP 404. Deep links,
  browser Back, route focus, and polite announcements passed.
- The header exception is F-3-2. The link crawl returned 200 for every other
  internal route and the source repository; checkout alone returned 503.
- Playwright Axe reported zero violations on cold root and demo. The factory
  URL verifier found no console errors, missing language/title/main/alt text,
  or unlabeled buttons on root, demo, Privacy, and Terms.
- At 390 px the page has no horizontal overflow and controls meet 44 px target
  checks. Reduced-motion and dark-mode coverage passed in the declared suite.
- `npm run build` passed and produced `dist/site/`; built JavaScript is 9.78 kB
  plus 2.08 kB route code before gzip.
- `npm test` failed only the two checkout tests, repeated across both projects:
  60 passed and 4 failed.

## Missed leverage

No AI feature is justified by the brief. Host measurements, bounds, report
comparison, and deterministic planning need observable runtime data, not a
model-generated answer. The useful adjacent capabilities are already present:
CSV export, JSON reports, offline reading, and report comparison. No import,
sync, or Sociobot-gateway AI step is an obvious missing part of this job.

## What would make this perfect

Restore and verify the public $39 checkout, replace the desktop disclosure with
a genuinely visible four-link header, fit all three facts into both first
screens, and clean the temporary mount root when network creation fails. Then
run all 16 claim commands independently, the complete desktop/mobile suite,
the live link crawl, direct-demo request logging, and the earlier-finding
reconciliation again. A perfect result has no deferred cleanup note, no dead
purchase path, and no hidden navigation.
