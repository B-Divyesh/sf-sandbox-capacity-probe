# Independent verification 2 — FAIL

**Candidate:** `dd794b18882383aa2fa7209fa64bf47c4c1db2f1`

**Live URL:** https://sandbox-capacity-probe.sociobot.in/

**Verified:** 2026-08-29 from a clean checkout

**Product code changed:** no

## Release decision

**FAIL.** The deployed static artifact matches the candidate byte for byte, so
this is not a deployment-only failure. The cold first-read and one-click demo
gate now pass, and the main test/build/package paths are healthy. Release is
still blocked because every exact command in `.factory/claims.json` fails from
the clean installed clone unless a separate build prerequisite has already
created `dist/site`. The claims manifest itself does not include that step. It
also omits several promises visible on the landing page and in README.

Two additional high-severity product defects were reproduced: production-like
target names without separators bypass the CLI safety refusal, and the planner
accepts a fractional p95 budget then generates a command the CLI rejects.

## Mandatory first-read and demo gate

The live cold screen passes:

- **What:** “Measure container capacity before rollout.”
- **For whom:** teams running isolated agent or customer containers.
- **First click:** “Try it with sample data,” followed by a plain explanation
  that it opens the local planner and uses demo storage.
- A fresh click at desktop and 390 px loaded `/?demo=1#planner`, scrolled the
  planner to the top of the viewport, seeded the 24-container sample, and showed
  the persistent “Demo — sample data, nothing is saved” banner with Reset demo
  and Start for real.

## Mandatory claims gate

`.factory/claims.json` exists and contains five structurally valid entries. Per
the work order, every listed command was run before other repository checks.

### Clean-clone result

Before dependency installation, all five exact commands exited 1 because
`@playwright/test` was absent. After the required clean `npm ci`, all five still
exited 1: Playwright waited 60 seconds for `http://127.0.0.1:4173` and reported
`Timed out waiting 60000ms from config.webServer.` The configured command is
`vite preview`; it does not build the absent clean-clone `dist/site` directory.

| Claim | Exact clean-installed result |
| --- | --- |
| `demo-isolated` | FAIL — demo server timeout |
| `local-planner` | FAIL — demo server timeout |
| `no-telemetry` | FAIL — demo server timeout |
| `csv-export` | FAIL — demo server timeout |
| `offline-reload` | FAIL — demo server timeout |

After `npm run build:site` had populated `dist/site`, each same command passed
on both configured browser projects (2 tests per command). This confirms that
the assertions work but does not cure the clean-clone claim-command failure.

### Claims coverage cross-check

The five IDs each have one matching Playwright test definition. The manifest
does not list many statements a visitor can rely on, including:

- the CLI creates an internal isolated network, binds only to localhost, and
  cleans up after success and ordinary errors;
- production-like names are refused, and the stated container/port/mount/sample
  bounds are enforced;
- JSON reports, human rendering, and `scp compare` quantify whether error is
  within 25%;
- the CLI demo needs no runtime or network and writes only to a temporary path;
- Planner Pro saves and compares up to five scenarios; and
- automatic/manual license-check allowances and local-only result handling.

Some behavior has ordinary unit/e2e coverage, but the claims contract requires
each visible claim to appear in the manifest with its tagged observable test.

## Quality gates and packaging

- `npm ci`: PASS, 59 packages installed, 0 vulnerabilities.
- `npm test`: PASS — 3 Vitest tests, 9 Rust test functions, and 26 Playwright
  checks. The Rust runtime smoke test returns early unless `SCP_RUNTIME_TEST` is
  set, so this does not represent a real Docker/Podman sweep.
- `npm run build`: PASS — exact production build produced `dist/site/` and
  `target/release/scp`.
- `cargo fmt --manifest-path cli/Cargo.toml -- --check`: PASS.
- `cargo clippy --manifest-path cli/Cargo.toml --all-targets -- -D warnings`:
  PASS.
- No separate TypeScript typecheck or site lint script exists; Vite production
  transpilation passed.
- `cargo package --manifest-path cli/Cargo.toml --allow-dirty`: PASS, 11 files,
  56.5 KiB unpacked / 16.2 KiB compressed.
- Clean consumer install from `target/package/sandbox-capacity-probe-0.1.0`:
  PASS. The installed 0.1.0 binary ran `--demo`, wrote its sample report in a
  process-specific temp directory, and produced valid JSON for a normal dry run.

## CLI functional evidence

- Normal dry run: 8 containers produced levels `[2,4,6,8]`, 16 maximum starts,
  and 16 maximum published ports.
- Minimum: 1 container, 0 ports, 0 mounts, 1 sample, 50 ms budget passed.
- Maximum: 64 containers, 16 ports, 16 mounts, 10 samples, 60,000 ms budget
  passed and reported 640 starts / 1,024 ports.
- Zero/over-limit containers, ports, mounts, samples, budgets 49/60,001, empty
  image, and mismatched confirmation all exited 2 with actionable errors.
- `production-west` was refused; explicit `--allow-production` allowed the dry
  run. The bypasses listed below were not refused.
- With no Docker binary installed, a real run exited 2 and explained how to
  recover. `explain` rendered the bundled report; comparing that report with
  itself returned valid JSON, 0% error, and exit 0. Malformed input exited 2.
- No Docker or Podman daemon was available, so actual resource creation,
  measurement accuracy, interrupt cleanup, and the brief's ≤25% prediction
  success measure remain unverified on a supported host.

## Live deployment evidence

- SHA-256 matched for every deployed candidate file: all four HTML documents,
  JS/CSS chunks, service worker, images/icons, robots, and sitemap.
- Fresh desktop and 390 px mobile flows had no horizontal overflow and no
  console/page errors. Root, privacy, terms, and the designed 404 had `lang`,
  distinct titles, one h1, a main landmark, and image alt attributes.
- Axe reported zero violations on the landing page in light and dark modes and
  on privacy, terms, and 404. All measured interactive targets were at least
  44×44 CSS px. The keyboard skip link moved focus to main; its visible focus
  style was a 3 px teal outline. Demo entry, Reset demo, and CSV export worked
  from the keyboard.
- Reduced motion changed animation/transition durations to `0.01ms` and smooth
  scrolling to `auto`.
- Planner normal, minimum, maximum, blank, and out-of-range flows worked on
  desktop and mobile. Invalid integer ranges kept the last valid result and
  announced recovery through `role=alert`. CSV content matched the selected
  minimum scenario.
- Demo storage used only `demo:sandbox-capacity-probe:scenario`; a valid normal
  scenario sentinel was neither read nor changed. Reset restored the bundled
  sample. Start for real removed only the demo key.
- During the complete demo/planner/export/offline flow, every request stayed on
  `sandbox-capacity-probe.sociobot.in`. There were no third-party fonts,
  scripts, analytics, or telemetry. An explicit license restore made one
  expected request to `api.sociobot.in`; a second browser attempt in the same
  minute made no request and showed the local throttle message.
- Direct billing API probe: requests 1–30 returned 200; requests 31–40 returned
  429 with `Retry-After` (2–3 seconds observed). Thus the upstream allowance was
  30 requests for this burst, and over-limit responses met the required shape.
- Root/legal/404 responses include HSTS, `nosniff`, Referrer-Policy,
  Permissions-Policy, and a response-header CSP with `frame-ancestors 'none'`.
  The unknown route returned the styled document with HTTP 404.
- Service worker `scp-shell-v2` installed, survived a no-change update, and
  reloaded the demo planner offline on desktop and mobile.
- Initial JS is 8.04 kB raw total (3.55 kB gzip); CSS is 11.91 kB raw
  (3.58 kB gzip); no fonts load. The 390 px DPR-2 audit downloaded the 238.9
  kB hero, still below the 300 kB hero budget.
- Three Lighthouse 12.8.2 mobile runs scored Performance **87, 88, 85**;
  Accessibility/Best Practices/SEO were **100/100/100** each. LCP was 2.1–2.2
  seconds and CLS 0, but Total Blocking Time was 440–530 ms.
- `/opt/fleet/lib/verify-url.sh` passed live: HTTP 200, 835 ms load, no errors,
  valid title/lang/main, one h1, no missing alt, and no unnamed button.

## Defects

### Blocker

1. **Every exact claim command fails from the clean installed checkout.** The
   commands rely on a pre-existing `dist/site`, but neither the manifest nor
   Playwright web-server command builds it. This directly trips the work
   order's mandatory release gate. Make each manifest command self-contained
   (or have its web-server command build/serve the candidate) and prove it from
   a clean clone.
2. **The claims manifest is incomplete.** Core safety, isolation, cleanup,
   report, comparison, CLI-demo, paid-feature, and license/privacy promises are
   visible but absent from `.factory/claims.json`. Add one entry and one tagged
   observable test for each promise, or remove/narrow the copy.

### High

1. **Production-target refusal is bypassable.** `productionwest`, `prod1`,
   `live01`, and `customerproduction` each return exit 0 for a dry run without
   `--allow-production`; only token-separated forms such as `production-west`
   are caught. This contradicts the README's “containing prod, production, or
   live” promise and weakens a brief-level safety control.
2. **The planner generates a CLI-invalid command for fractional budgets.** A
   live value of `50.5` has browser `stepMismatch=true`, but no visible error is
   shown and the generated command includes `--startup-budget-ms 50.5`. The CLI
   then exits 2 because the argument is an integer. Validate integer/step
   constraints before updating the estimate or command.
3. **The public binary name collides with OpenSSH `scp`.** The package installs
   a binary literally named `scp`; on common systems `~/.cargo/bin` precedes
   `/usr/bin`, so following the README can shadow the standard secure-copy
   command. Ship a non-conflicting binary name such as `sandbox-capacity-probe`
   or `capacity-probe` (an explicit secondary alias can be considered later).

### Medium

1. **Mobile Lighthouse misses the stated ≥90 performance gate.** Three clean
   live runs scored 85–88. Core field metrics in the runs were acceptable, but
   TBT was 440–530 ms and Lighthouse estimated 148 KiB avoidable hero-image
   transfer at the tested DPR.
2. **Corrupt saved-scenario storage aborts page initialization.** Preloading
   `sb_scenarios:sandbox-capacity-probe=not-json` produced an uncaught JSON
   parse page error, left “Checking connection…” in place, and prevented service
   worker registration. Parse saved scenarios defensively and recover to an
   empty list.

### Low

1. Stable, non-content-hashed files (`topographic-envelope*.webp`,
   `social-card.webp`, and `apple-touch-icon.png`) are served with one-year
   `immutable` caching. A future deploy can leave returning clients on stale
   art. Reserve immutable caching for content-hashed filenames or revalidate
   these stable paths.

## Evidence location

Browser JSON, screenshots, Lighthouse reports, and the standard URL verifier
output are under ignored `.factory/evidence/`. The repository remains unchanged
outside this verification report and the updated handoff.
