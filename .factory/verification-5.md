# Independent verification 5 — FAIL

**Candidate:** `343a284c660c493863a7adef91b1753d1ed6a145`
**Live URL:** https://sandbox-capacity-probe.sociobot.in/
**Verified:** 2026-08-29, from `/work/repo` after `npm ci`
**Product code changed:** no

## Release decision

**FAIL.** The public deployment matches this candidate and its functional,
privacy, accessibility, CLI, demo, bundle, and API-rate-limit checks pass.
However, the required repository quality gate `npm test` does not pass. A
candidate cannot be accepted while its documented test command is red.

## Release-blocking defect

| Severity | Finding | Fresh evidence |
| --- | --- | --- |
| Blocker | `npm test` fails in the browser suite. | A run against a persistent production preview completed **30 passed, 1 failed** in 55.5 s. Test `site/tests/site.spec.ts:305`, “a returned license is stored, stripped from the URL, and verified”, fails with `browser.newContext: Target page, context or browser has been closed`; Chromium reports `SEGV_MAPERR`. The same run shows the causal earlier real request: a demo test exits to real mode while retaining `real-license-sentinel`; the app then fetches `https://api.sociobot.in/.../verify?license=real-license-sentinel` from `http://127.0.0.1:4173`, which is rejected by CORS. The API correctly allows the deployed `https://sandbox-capacity-probe.sociobot.in` origin, so this is a test/local-origin setup failure, but it still fails the required test command. A normal direct `npm test` also failed; when its preview process was tied to the verifier harness it produced additional subsequent `ERR_CONNECTION_REFUSED` noise, so the persistent-preview run is the reliable reproduction. |

No other product defect was reproduced.

## Mandatory claims gate — PASS

`.factory/claims.json` exists and has 16 entries. Before broader testing, each
listed command was run exactly as declared against the demo entry point after a
clean `npm ci`; each selected one test and passed:

`demo-isolated`, `local-planner`, `no-telemetry`, `csv-export`,
`offline-reload`, `cli-demo`, `cli-safety-bounds`, `cli-isolated-cleanup`,
`cli-report-compare`, `local-results`, `planner-pro-five`,
`planner-pro-price`, `planner-pro-checkout`, `planner-pro-no-account`,
`planner-pro-free-features`, and `license-policy` — **16/16 PASS**.

## First read, live behavior, privacy, and accessibility — PASS

- Cold live first screen answers all required questions in plain words:
  “Measure container capacity before rollout”; it names teams with isolated
  agent/customer containers; and the first action is **Try it with sample
  data**. One click opens `/?demo=1#cli-demo`, displays the persistent
  “Demo — sample data, nothing is saved” banner, the real CLI recording, and
  Reset/Exit controls.
- Fresh Playwright desktop and 390 px contexts showed no console/page errors.
  The whole demo flow made only same-origin requests. Blank budget input
  announced the validation error, cleared stale values, disabled CSV export,
  and recovered after `1500`.
- Axe found zero violations, including zero serious/critical, on dark reduced-
  motion desktop and 390 px mobile demo pages. The skip link receives keyboard
  focus; mobile `scrollWidth` was exactly 390; reduced motion sets the hero
  animation duration to `1e-05s`.
- `/opt/fleet/lib/verify-url.sh` passed on `/`, `/?demo=1`, `/privacy/`, and
  `/terms/`: HTTP 200, title, `lang=en`, one h1, main landmark, complete image
  alt text, named controls, and no errors.
- Live root headers include a response-header CSP with `frame-ancestors 'none'`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy`, HSTS, and Permissions-
  Policy. The unknown-path response is the designed 404 with HTTP 404.

## API allowance — PASS

The product has no sign-in. The documented Sociobot license-verification API
was exercised directly from one client with a non-secret invalid token:
requests **1–30 returned 200**; requests **31–45 returned 429** with
`Retry-After: 2` or `3`. The observed allowance is therefore **30 requests per
client/window**. A live invalid-return-token browser check received a 200
invalid verdict with `Access-Control-Allow-Origin:
https://sandbox-capacity-probe.sociobot.in` and showed the expected inactive-
license message.

## Local build, package, and deployment identity

- `npm ci`: PASS — 59 packages, zero vulnerabilities.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS — Rust format and Clippy with warnings denied.
- Unit/integration portion of `npm test`: PASS — 4 Vitest and 10 Rust tests.
- `npm run build`: PASS — release CLI and `dist/site/` generated.
- `cargo package --manifest-path cli/Cargo.toml --allow-dirty`: PASS — 11 files,
  60.5 KiB unpacked / 16.9 KiB compressed.
- The packaged crate installed in a fresh temporary Cargo root. `--help`,
  `demo`, the maximum dry-run (64 containers, 16 ports, 16 mounts, 10 samples),
  production refusal (exit 2), and mismatched-confirmation refusal (exit 2)
  all worked.
- SHA-256 comparison matched every publicly served build artifact (HTML,
  CSS/JS, images, legal pages, service worker, demo data, sitemap, and robots)
  to fresh `dist/site/`. `staticwebapp.config.json` is platform configuration,
  not a served asset. Thus the live deployment matches the requested commit.
- Initial JS is 10,556 bytes raw (three chunks); CSS is 13,207 bytes raw;
  there are no webfonts. The mobile hero is 50,986 bytes and desktop hero
  238,934 bytes. Hashed assets use one-year immutable cache headers.

## Required repair and retest

Repair the full Playwright sequence without weakening real-origin license
verification: make the sentinel cleanup/isolation test avoid a real localhost
license fetch, or route that endpoint in the test. Then run `npm test` from a
clean install and rerun the full acceptance suite.
