# Repair handoff — Sandbox Capacity Probe 0.1.0

## Repair scope

Repaired the release findings in independent verification report
`ca78c48a343073d4c8257bda524713c37ca700f5` for candidate
`7e77ece9e21aad70ccfb8c57ec349a33bc28993b`, without changing the artifact
class: this remains a Rust `clap` CLI with a static Vite documentation site.

### Fixed findings

- Added `.factory/claims.json` with exactly one tagged Playwright regression
  test for each visible web claim, and `.factory/demo.md` documenting the clean
  sandbox contract.
- Added the bundled realistic report `cli/examples/demo-capacity.json`,
  `scp demo`, and `scp --demo`. Both write `capacity-demo.json` to a
  process-specific temporary directory and do not contact a container runtime
  or network service.
- Added the first-screen **Try it with sample data** route. `/?demo=1` uses
  only `demo:sandbox-capacity-probe:scenario`, shows a persistent reset/start
  real banner, and never reads normal license or saved-scenario storage.
- Rewrote the first screen to plainly state the job and audience.
- Planner numeric values now validate before recalculation or command export.
  Blank budgets, 49 ms budgets, and 60,001 ms baselines preserve the last valid
  result and announce the exact correction through an alert.
- Browser manual license verification is now limited to one request per minute
  per browser, and a `429 Retry-After` response is rendered explicitly. The
  policy is documented in Privacy and README and has a request-count regression
  test.
- Added response-header CSP, including `frame-ancestors 'none'`, plus a real
  Static Web Apps 404 rewrite/status override. Removed the inline form handler
  so the CSP produces no browser violation.
- Raised all visible interactive targets to at least 44×44 CSS px; changed the
  nested license `aside` to a non-landmark panel; added a styled 404 route.
- Added canonical, Open Graph, Twitter, and Apple touch metadata; original,
  derived product art at `1200×630` for social sharing; consistent legal
  navigation; and the required Param Factory footer text.

## Verification evidence

Completed locally on 2026-08-29 after a clean `npm ci` (0 vulnerabilities):

```sh
npm test
npm run build
cargo fmt --manifest-path cli/Cargo.toml -- --check
cargo clippy --manifest-path cli/Cargo.toml --all-targets -- -D warnings
cargo package --manifest-path cli/Cargo.toml --allow-dirty
```

- `npm test`: passed — 3 Vitest tests, 9 Rust tests (including the CLI demo
  regression; runtime smoke remains opt-in), and 26 Playwright checks on both
  Desktop Chromium and 390 px mobile.
- `npm run build`: passed — `target/release/scp` and `dist/site/` produced.
- `cargo fmt`, strict Clippy, and crate packaging verification passed. The
  package contains 11 files and is 16.2 KiB compressed. A fresh temporary
  consumer install with `cargo install --path target/package/...` succeeded;
  installed `scp --demo` wrote and rendered the sample report.
- All manifest commands passed: `@claim:demo-isolated`, `@claim:local-planner`,
  `@claim:no-telemetry`, `@claim:csv-export`, and `@claim:offline-reload`.
  Each runs in a fresh browser context against `/?demo=1`.
- Playwright axe found no violations on `/`, `/privacy/`, or `/terms/`. Tests
  cover keyboard skip/focus and range-arrow operation, target geometry, invalid
  values, license rate limiting, request privacy, service-worker offline reload
  and no-change update, CSP configuration, and the 404 asset.
- `/opt/fleet/lib/verify-url.sh` against the built local site: HTTP 200, no
  console/page errors, title/lang/one h1/main present, all images have alt, all
  buttons have names. Load was 554 ms locally.
- Lighthouse local desktop: Performance 98, Accessibility 100, Best Practices
  100, SEO 100; FCP 0.9 s, LCP 2.4 s, CLS 0. Initial JS is 7.11 kB raw / 2.90
  kB gzip and CSS is 11.91 kB raw / 3.57 kB gzip.

## External dependency note

The website is static and the documented billing verification endpoint is owned
by Sociobot. This repair enforces and tests the product’s browser-side
per-client limit, but cannot make a direct request to
`api.sociobot.in/api/v1/products/.../verify` return `429` because that service
is outside this repository and deployment class. The upstream billing API still
needs its own edge/server per-client limiter with `Retry-After` for the
verifier's direct-endpoint check. The UI already honors that response when it
is enabled.

## Known runtime limit

No Docker or Podman daemon was available in this worker. The safe opt-in smoke
test remains `SCP_RUNTIME_TEST=docker cargo test --manifest-path cli/Cargo.toml
--test runtime` (or `podman`) and should run on each supported release host.

## Deployment

Static deployment artifact: `dist/site/`. Deployment is performed from the
committed `main` branch by the factory static deployment configuration. Run
`npm run build:site` before a manual static upload.
