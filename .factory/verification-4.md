# Independent verification 4 — PASS

**Candidate:** `ac473f2f91328f4343eeeb1a755e7a636d959d4f`

**Live URL:** https://sandbox-capacity-probe.sociobot.in/

**Verified:** 2026-08-29 from a clean checkout

**Product code changed:** no

## Release decision

**PASS.** The previously external billing blocker is resolved. A fresh request
to the advertised Live checkout endpoint returned HTTP 303 to a new Dodo hosted
session. The hosted page returned HTTP 200 and showed **Sandbox Capacity Probe**
as a **$39.00 one-time unlock**. No purchase was submitted.

Every mandatory claim command, repository gate, packaged-CLI check, live
desktop/mobile check, accessibility scan, privacy check, offline check,
rate-limit check, deployment-integrity comparison, and performance budget
passed. No release-blocking, high, medium, or low product defect was found.

## Mandatory first-read and demo gate

The cold live screen passes at desktop and 390 × 844 px:

- **What it does:** “Measure container capacity before rollout.”
- **Who it is for:** teams running isolated agent or customer containers.
- **What to do first:** “Try it with sample data.” The adjacent sentence says
  the sample opens a local planner and writes only demo storage.
- At 390 px the primary action is wholly visible at 629–676 px in the first
  844 px viewport. One click opens `/?demo=1#planner`, seeds the realistic
  24-container/four-port/two-mount scenario, and displays the persistent
  “Demo — sample data, nothing is saved” banner with Reset and Start for real.

## Mandatory claims gate

`.factory/claims.json` exists with 12 structurally valid entries. After the
clean `npm ci`, every listed command was run exactly as written before the
wider acceptance suite. Each selected one observable test and passed:

| Claim | Result |
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

The live landing page, legal pages, demo guide, CLI help, and README were
cross-checked against the manifest. The operational checkout dependency was
also checked directly as described below. No unsupported visitor-facing claim
was found.

## Checkout and license service

- `GET https://api.sociobot.in/api/v1/products/sandbox-capacity-probe/checkout`
  returned **303** with a new
  `https://checkout.dodopayments.com/session/...` location.
- Following that location returned **200**, title `Sociobot | Checkout`, the
  correct product, **$39.00**, and “One-time unlock”.
- A live invalid return token was stored under
  `sb_license:sandbox-capacity-probe`, removed from the address bar, and sent
  once to the documented verification endpoint. The endpoint returned the
  invalid verdict and the page remained on the free planner.
- A second manual attempt in the same browser minute made no request and showed
  the local throttle message.
- In an independent API burst, requests 1–30 returned 200. Request 31 and all
  remaining requests through 45 returned **429** with `Retry-After` values of
  2–3 seconds. The observed server allowance is **30 requests per client/window**.
- Sign-in is not required, so the Entra authority requirement does not apply.

## Clean build, tests, and package

- `git rev-parse HEAD` matched the requested candidate exactly.
- `npm ci`: PASS — 59 packages and zero reported vulnerabilities.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS — Rust formatting and Clippy with warnings denied.
- `npm test`: PASS — 4 Vitest tests, 10 Rust tests, and 50 Playwright checks
  across desktop Chromium and the mobile project.
- `npm run build`: PASS — repeated unit/Rust tests, built the optimized
  `capacity-probe` binary, and produced `dist/site/`.
- `cargo package --manifest-path cli/Cargo.toml --allow-dirty`: PASS — 11 files,
  60.5 KiB unpacked and 17.0 KiB compressed.
- The packaged crate was installed offline into a new temporary Cargo root.
  Its public `capacity-probe --help`, demo, dry-run, and error paths worked.

The clean consumer's demo completed with unreachable proxy endpoints and wrote
a valid report beneath a process-specific temporary directory. A normal
8-container dry-run returned levels `[2,4,6,8]`; the exact maximum
64-container/16-port/16-mount/10-sample plan reported 640 starts and 1,024
published ports. The exact minimum plan also passed.

Zero and over-limit values for containers, ports, mounts, samples, and budget;
a fractional budget; empty target/image; missing command; mismatched
confirmation; and production-like names all exited 2 with corrective messages.
An explicit production override worked only when supplied. A valid command
worked immediately after the failures. With no runtime installed, a real probe
exited 2 and clearly instructed the operator to install Docker or Podman and
check its daemon.

## Live product, privacy, and accessibility

- A fresh live demo calculation changed 32 containers × four ports to 128
  bindings and a 957 ms prediction. Blank budget input cleared stale results,
  set `aria-invalid`, disabled export, and recovered after entering 1,500.
  Keyboard-triggered CSV export contained the expected header and scenario row.
- The entire demo flow made only same-origin requests. Four real-data/license
  sentinel keys remained byte-for-byte unchanged; only the documented
  `demo:sandbox-capacity-probe:scenario` key changed. No analytics, third-party
  font, script, billing request, cookie, or telemetry request appeared.
- `/`, `/?demo=1`, `/privacy/`, and `/terms/` produced no console or page errors.
  Axe found zero violations on the demo, 390 px dark/reduced-motion landing,
  privacy page, and terms page—therefore zero serious/critical findings.
- The standard `/opt/fleet/lib/verify-url.sh` passed in 935 ms with the expected
  title, `lang=en`, one h1, main landmark, complete alt text, named buttons, and
  no errors.
- Keyboard-only traversal reached every visible control without a trap. Skip
  to main, range arrows, demo reset, and CSV export worked. Focus used a visible
  3 px teal outline with 3 px offset. All visible controls measured at least
  44 px in each dimension.
- At 390 px there was no horizontal overflow. The lighter 50,986-byte mobile
  hero loaded. Reduced motion changed the hero animation to `0.00001s` and
  document scrolling to `auto`.
- The service worker installed/updated `capacity-probe-shell-v4`; it was the
  only cache, and the demo planner/banner reloaded offline with the correct
  offline status.
- Root responses include response-header CSP with `frame-ancestors 'none'`,
  HSTS, `nosniff`, Referrer-Policy, and Permissions-Policy. The designed unknown
  route returns HTTP 404. Every internal/external web link returned its expected
  status; mail links were recognized separately.

## Deployment identity, caching, and performance

All 17 publicly served build files matched the fresh `dist/site` output
byte-for-byte by SHA-256. `staticwebapp.config.json` correctly remained a
platform-only 404. The live deployment therefore matches candidate
`ac473f2f91328f4343eeeb1a755e7a636d959d4f`.

- Initial JavaScript: 9,776 bytes raw / 3,912 bytes gzip total.
- CSS: 11,935 bytes raw / 3,579 bytes gzip.
- Fonts: none. Mobile hero: 50,986 bytes. Desktop hero: 238,934 bytes.
- Hashed assets use one-year immutable caching. HTML, service worker, and stable
  public images revalidate after 30 seconds.
- Three fresh Lighthouse 12.8.2 mobile runs scored **100/100/100** Performance
  and **100/100/100** Accessibility, Best Practices, and SEO. LCP was
  1,080–1,212 ms, TBT 55–82 ms, CLS 0, and transfer 64,120–64,213 bytes.

## Defects by severity

- **Blocker:** none.
- **High:** none.
- **Medium:** none.
- **Low:** none.

## Environment-only validation gap

This disposable verifier does not include Docker or Podman. The deterministic
runtime fixture verifies exact internal-network creation, localhost-only port
publishing, read-only mounts, report persistence, and cleanup after success and
ordinary failure. Actual host resource creation, signal-interrupt cleanup, and
the brief's subsequent-run prediction accuracy still require a controlled
non-production runtime host. This is an environment coverage gap, not a
reproduced candidate defect.
