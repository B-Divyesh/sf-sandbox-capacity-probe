# Independent verification 3 — FAIL

**Candidate:** `aa76d231c08d662d43c59ae0787f6d5a8f379dd3`

**Live URL:** https://sandbox-capacity-probe.sociobot.in/

**Verified:** 2026-08-29 from a clean checkout

**Product code changed:** no

## Release decision

**FAIL.** The live static artifact matches the candidate, the cold first-read
gate passes, and every exact claim command, repository quality gate, package
check, accessibility check, offline check, and performance budget passes.
Release is nevertheless blocked by fresh end-to-end evidence:

1. both advertised Planner Pro purchase links lead to a checkout endpoint that
   returns HTTP 404, so the paid product cannot be purchased;
2. demo mode leaves the real license form active and writes real
   `sb_license:*` keys while the persistent banner says nothing is saved; and
3. `capacity-probe compare` can return exit 0 and `shape_matches: true` for
   reports from different targets, runtimes, contexts, and images.

The first two failures also show that the tagged claim coverage is not strong
enough: the relevant tests assert a link value or one planner key, not the
promised end-to-end outcome.

## Mandatory first-read and demo gate

The cold live screen passes on desktop and at 390 × 844 px:

- **What it does:** “Measure container capacity before rollout.”
- **Who it is for:** teams running isolated agent or customer containers.
- **What to click first:** “Try it with sample data.” The adjacent sentence
  says that this opens a local planner and writes only demo storage.
- The primary action and its explanation are wholly visible in the first
  390 px mobile viewport. One keyboard-activated click opens the seeded
  24-container, four-port, two-mount scenario and shows the persistent demo
  banner.

The later demo-isolation failure is documented under Defects.

## Mandatory claims gate

`.factory/claims.json` exists with 12 structurally valid entries. After the
clean `npm ci`, every listed command was run exactly as written before broader
QA. Each selected exactly one test and passed:

| Claim | Exact command result |
| --- | --- |
| `demo-isolated` | PASS — 1 passed |
| `local-planner` | PASS — 1 passed |
| `no-telemetry` | PASS — 1 passed |
| `csv-export` | PASS — 1 passed |
| `offline-reload` | PASS — 1 passed |
| `cli-demo` | PASS — 1 passed |
| `cli-safety-bounds` | PASS — 1 passed |
| `cli-isolated-cleanup` | PASS — 1 passed |
| `cli-report-compare` | PASS — 1 passed |
| `local-results` | PASS — 1 passed |
| `planner-pro-five` | PASS — 1 passed |
| `license-policy` | PASS — 1 passed |

The tests are self-contained: the first command rebuilt the CLI and site from
the clean installed checkout. However, three tests miss material negative
paths:

- `demo-isolated` checks only that the normal saved-scenarios key is absent;
  it never uses the still-active license form.
- `planner-pro-five` checks only that the buy link has the expected URL; it
  never requests that URL.
- `cli-report-compare` compares a report only with itself; it never challenges
  target/runtime/context/image compatibility.

## Clean build, tests, and package

- `git rev-parse HEAD`: exact candidate SHA.
- `npm ci`: PASS — 59 packages, zero reported vulnerabilities.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS — Rust format and Clippy with warnings denied.
- `npm test`: PASS — 3 Vitest tests, 9 Rust tests, and 48 Playwright checks
  across desktop Chromium and the 390 px mobile project.
- `npm run build`: PASS — exact production command emitted `dist/site/` and
  `target/release/capacity-probe`.
- `cargo package --manifest-path cli/Cargo.toml`: PASS — 11 files, 57.7 KiB
  unpacked and 16.4 KiB compressed.
- Clean consumer install from the packaged crate: PASS. The only installed
  executable was `capacity-probe`; `--help`, `--demo`, and JSON dry-run output
  worked. The demo wrote valid sample JSON below a process-specific temporary
  directory.

## CLI behavior

- Normal dry run for 8 containers produced levels `[2,4,6,8]`, 16 maximum
  starts, and 16 maximum published ports.
- Exact minimum and maximum plans passed: 1/0/0/1/50 and
  64/16/16/10/60,000 respectively.
- Zero/over-limit containers, ports, mounts, samples, and budgets; a fractional
  budget; blank target/image; mismatched confirmation; and missing command all
  exited 2 with actionable errors.
- `prod1` was refused by default and accepted only with
  `--allow-production`.
- With no Docker or Podman installed, a real invocation exited 2 and explained
  the recovery action.
- An independent deterministic Docker fixture completed a two-sample,
  four-container sweep, wrote a report, used an internal labeled network,
  localhost-only dynamic port bindings, read-only mounts, and removed
  containers/network on success. A forced ordinary run error still removed the
  network.
- Malformed report input exited 2. A report compared with itself returned 0%
  error and exit 0. The incompatible-report false positive is listed below.

No Docker or Podman daemon is available in this worker. Actual runtime
resource creation, interrupt cleanup, and the brief's within-25% prediction
success measure therefore remain unverified on a supported host.

## Live deployment, browser, and privacy evidence

- SHA-256 matched byte-for-byte for all 17 public files in the production
  build. `staticwebapp.config.json` is platform configuration and is not a
  public file. This proves the live deployment matches the candidate.
- The root, privacy, terms, and designed unknown-route 404 were checked in
  desktop light and 390 px dark/reduced-motion contexts. Each had the correct
  status/title, `lang=en`, exactly one h1, a main landmark, complete image alt
  attributes, no horizontal overflow, no sub-44 px visible controls, and zero
  serious/critical axe findings.
- Valid routes logged no console or page errors. The standard
  `/opt/fleet/lib/verify-url.sh` passed in 631 ms with one h1, named buttons,
  complete alt text, and no errors. Evidence is under
  `.factory/evidence/verify3/` (ignored from Git).
- Keyboard-only checks reached all visible controls without a trap. Focus
  settled to a designed 3 px teal outline in both themes. Skip-to-main, range
  arrow adjustment, demo reset, and CSV download all worked from the keyboard.
- Reduced motion changed the hero animation to `0.01ms` and scrolling to
  `auto`. Light and dark axe scans passed.
- The valid demo/planner/export flow made only same-origin requests. No
  analytics, third-party scripts, or third-party fonts loaded. The sole
  cross-origin request in the failing demo flow was the explicit Sociobot
  license verification described below.
- Root/legal/404 responses included response-header CSP with
  `frame-ancestors 'none'`, HSTS, `nosniff`, Referrer-Policy, and
  Permissions-Policy. HTML, service worker, and stable art revalidate at 30
  seconds; hashed assets use one-year immutable caching.
- The live verification API allowed requests 1–30, then requests 31–45 returned
  429 with `Retry-After`; observed values were 2–3 seconds. The observed burst
  allowance is therefore 30 requests per client/window.
- Service worker `capacity-probe-shell-v3` installed and updated. The 390 px
  demo reloaded offline with its planner and banner, without browser errors.
- Sign-in is not required, so Entra authority checks do not apply.

## Performance

- Initial application JS is 7,944 bytes raw (main plus shared styles module),
  CSS is 11,906 bytes raw, and no font files load.
- Mobile hero: 50,986 bytes; desktop hero: 238,934 bytes.
- Three fresh Lighthouse 12.8.2 mobile runs scored Performance **96, 100,
  99**. Accessibility, Best Practices, and SEO were **100/100/100** in every
  run. LCP was 1,179–1,230 ms, TBT 25.5–221.5 ms, CLS 0, and transfer was about
  63.6 KiB. INP is unavailable for a synthetic no-interaction navigation.

## Defects

### Blocker

1. **Planner Pro cannot be purchased.** A fresh GET to the exact URL used by
   both “Get Planner Pro · $39” and “Buy Planner Pro” returned HTTP 404 with
   `{"error":"enabled factory product","status":404}`. The product advertises
   a $39 one-time purchase but has no working checkout. This remains a release
   failure even if the cause is external product registration. The tagged Pro
   test checks only the `href`, allowing the dead paid path to pass.

2. **Demo mode writes real user/license data and calls the billing API.** In a
   fresh live `?demo=1` context, entering `qa-demo-isolation-invalid` in the
   visible “Restore purchase” form wrote all of
   `sb_license:sandbox-capacity-probe`,
   `sb_license_verify_attempt:sandbox-capacity-probe`, and
   `sb_license_verdict:sandbox-capacity-probe`, and requested
   `api.sociobot.in/.../verify`. At the same time the persistent banner read
   “Demo — sample data, nothing is saved,” and the page itself said to start
   for real before restoring a license. This violates the demo sandbox and
   `.factory/demo.md` promises. The submit listener at `site/src/main.ts:201`
   remains active in demo mode; only initialization is skipped.

### High

1. **Report comparison can approve incompatible runs.** Starting with the
   bundled report, changing the observed report's target from
   `staging-west-demo` to `different-host`, runtime from Docker to Podman,
   context to `production-remote`, and image to `different/image:latest` still
   returned exit 0 with `absolute_error_percent: 0`,
   `within_25_percent: true`, and `shape_matches: true`. The implementation at
   `cli/src/model.rs:186` compares only container/port/mount counts. This
   undermines the brief's runtime-specific, controlled subsequent-run check and
   can present a false PASS for evidence that is not comparable.

### Medium

1. **CSV export accepts invalid input and combines it with a stale result.**
   After a valid maximum scenario produced 65,027 ms with a 60,000 ms budget,
   changing the budget to invalid `50.5` correctly showed an error and retained
   the last valid result. “Export CSV” nevertheless downloaded a row containing
   `budget_ms=50.5` with the old `predicted_p95_ms=65027` and old
   `headroom_ms=-5027` (which corresponds to 60,000, not 50.5). The handler at
   `site/src/main.ts:130` reads invalid inputs but combines them with stale
   `current` output. Disable export during validation errors or export the last
   fully valid scenario.

2. **Structurally corrupt saved scenario arrays can abort initialization.**
   Preloading `sb_scenarios:sandbox-capacity-probe` with `[null]` caused the
   uncaught page error `Cannot read properties of null (reading 'containers')`,
   left the connection state at “Checking connection…”, and prevented later
   initialization. `[{}]` rendered an “undefined” scenario. The storage reader
   at `site/src/main.ts:237` checks only `Array.isArray`, not item shape.

### Low

1. **Structurally corrupt demo storage does not recover to the sample.** A
   valid-JSON string in the demo scenario key loaded range defaults 33/8/8,
   blank numeric inputs, and an error instead of the bundled 24/4/2 scenario;
   it then rewrote the key with zero budgets. Reset demo recovers, but initial
   demo storage should be schema-checked just like malformed JSON.

## Evidence and next steps

The standard URL-verifier screenshots and JSON are in ignored
`.factory/evidence/verify3/`; Lighthouse JSON and ad hoc browser/CLI fixtures
were kept in `/tmp`. Before reverification:

1. enable/register the live Sociobot checkout product and add an observable
   endpoint test;
2. hide/disable all real-data and license actions in demo mode, and expand the
   demo-isolation claim test to exercise every interactive control;
3. reject or clearly fail comparison across target/runtime/context/image (and
   add a negative tagged test);
4. block export/save while inputs are invalid and validate persisted object
   schemas; and
5. run one controlled Docker or Podman prediction/subsequent-run pair on a
   supported non-production host.
