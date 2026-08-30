# Independent verification 6 — PASS

**Candidate:** `8e8483c10b6a216133ad4fdadd1819781991b881`

**Live URL:** https://sandbox-capacity-probe.sociobot.in/

**Verified:** 30 August 2026 from `/work/repo`

**Product code changed:** no

## Release decision

**PASS.** The candidate satisfies the researched brief and work-order
acceptance contract. The live deployment matches the fresh production build.
No blocker, critical, major, or minor product defect was reproduced.

## First read and demo gate

The cold first screen passes. It says **“Measure container capacity before
rollout.”** It names teams running isolated agent or customer containers and
explains that the tool measures a safe Docker or Podman scale. The primary
action is **“Try it with sample data”**. One click opens
`/?demo=1#cli-demo`, focuses the CLI sample, loads a realistic 24-container
scenario, and displays the persistent **“Demo — sample data, nothing is
saved”** banner with Reset and Exit controls.

The required answers and primary action are visible without scrolling at both
1366 × 900 and 390 × 844. The first screen therefore answers what the product
does, who it is for, and what to click first.

## Mandatory claim gate

`.factory/claims.json` exists, is valid, and contains 16 unique claims. After
the clean `npm ci`, every listed command was run separately and selected one
tagged test. All passed:

- `demo-isolated`
- `local-planner`
- `no-telemetry`
- `csv-export`
- `offline-reload`
- `cli-demo`
- `cli-safety-bounds`
- `cli-isolated-cleanup`
- `cli-report-compare`
- `local-results`
- `planner-pro-five`
- `planner-pro-price`
- `planner-pro-checkout`
- `planner-pro-no-account`
- `planner-pro-free-features`
- `license-policy`

Result: **16/16 PASS**. Landing, legal, CLI help, and README claims were
cross-checked against this inventory; no unlisted visitor-facing claim was
found.

## Clean install, tests, and production build

- `npm ci`: PASS — 59 packages installed, zero audit vulnerabilities.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS — Rust format and Clippy with warnings denied.
- `npm test`: PASS — 4 Vitest tests, 10 Rust tests, and 62 Playwright checks
  across desktop Chromium and the 390 px mobile project.
- `npm run build`: PASS — unit tests reran, the optimized Rust binary built,
  and the exact Vite production build produced `dist/site/`.
- `cargo package --manifest-path cli/Cargo.toml`: PASS — 11 files, 60.5 KiB
  unpacked and 16.9 KiB compressed.

## CLI and useful end-to-end behavior

The packaged crate was extracted and installed into a fresh temporary Cargo
root. The installed `capacity-probe 0.1.0` command passed:

- helpful `--help` and `--version` output;
- both `demo` and `--demo`, writing the bundled report to a process-specific
  temporary directory without contacting a runtime;
- normal JSON dry run for 8 containers, 2 ports, 1 mount, and 2 samples;
- maximum dry run for 64 containers, 16 ports, 16 mounts, and 10 samples,
  reporting 640 maximum starts and 1,024 simultaneous published ports;
- `explain` and an identical-report `compare`, with 0% error and exit 0;
- mismatched confirmation, production target, each over-limit input, zero
  containers, an empty report, and a missing command, each with actionable
  text and exit 2.

The deterministic runtime integration tests also verified JSON output, local
result writing, an internal labeled network, localhost-only port publication,
read-only mounts, and cleanup after success and ordinary failure. This worker
had no Docker or Podman executable, so an actual container sweep was not
possible; see Known limitation.

## Live product behavior

Fresh live-browser checks covered normal, boundary, invalid, and recovery
paths:

- Normal planner: 12 containers produced 330 ms, `comfortable`, 24 bindings,
  and 1,170 ms remaining.
- Minimum values: 1 container, 0 ports, 0 mounts, 1 ms baseline, and 50 ms
  budget produced 3 ms and remained usable.
- Maximum values: 64 containers, 16 ports, 16 mounts, and 60,000 ms inputs
  produced 65,027 ms, `exceeded`, and 1,024 bindings.
- A representative middle case produced `watch` with 350 ms remaining.
- Blank and fractional values set `aria-invalid`, announced the exact valid
  range, cleared stale results, disabled export, and recovered after valid
  input.
- CSV export contained the documented header and the current scenario row.

During the complete demo flow, Playwright observed 18 requests, all
same-origin. Browser storage contained only
`demo:sandbox-capacity-probe:scenario`; Reset restored the bundled values and
Exit removed the demo key. No console error or page error occurred.

The $39 one-time offer is visible. Its exact buy URL returned HTTP 200 after a
redirect to `checkout.dodopayments.com/session/...`; the claim tests verified
the hosted page names Sandbox Capacity Probe, $39/39.00, and one-time payment.
No purchase was made.

## Accessibility, mobile, keyboard, and offline

- `/opt/fleet/lib/verify-url.sh` passed `/`, `/?demo=1`, `/privacy/`, and
  `/terms/`: HTTP 200, route-specific title, `lang=en`, one h1, main landmark,
  complete image alternatives, named controls, and no console/page errors.
- Fresh Axe runs found zero violations, including zero serious/critical, on
  desktop light, desktop dark with reduced motion, 390 px demo, Privacy,
  Terms, and the designed 404.
- Keyboard-only checks reached and operated the skip link, primary demo
  action, mobile menu, and range input. Focus uses a visible 3 px teal outline
  with a 3 px offset. The skip link moves focus to `<main>`.
- Every visible link, button, summary, and range input measured at least
  44 × 44 CSS px. The 390 px page had `scrollWidth === clientWidth === 390`.
- Reduced motion changed the 700 ms hero entrance to `0.00001s`.
- The service worker installed, updated, activated, and controlled the page
  using cache `capacity-probe-shell-v5`. A fresh mobile context then went
  offline and reloaded the demo with its banner, 763 ms sample result, and
  **“Offline · planner and docs still work”** state intact. No errors occurred.
- All 14 distinct site links returned 200 or were explicit `mailto:` links;
  every same-origin fragment target existed. An unknown path returned the
  designed page with HTTP 404.

## Privacy, headers, and server allowance

The cold page and complete demo made no third-party requests. There are no
third-party fonts, scripts, analytics, or telemetry requests. Demo data and
normal data use separate local-storage namespaces.

Live responses include HSTS, `X-Content-Type-Options: nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin`, a restrictive
Permissions-Policy, and a response-header CSP. The CSP includes
`frame-ancestors 'none'`, limits scripts/styles/images/fonts to the site, and
allows connections only to the site and `https://api.sociobot.in`. HTML and
stable files revalidate after 30 seconds; hashed assets use one-year immutable
caching.

The Sociobot verification endpoint was called 45 times from one client with a
non-secret invalid token. Requests 1–30 returned 200. Requests 31–45 returned
429 with `Retry-After: 4`. The observed allowance is therefore **30 requests
per client/window**. After cooldown, a real browser-origin invalid-license
request returned 200 with
`Access-Control-Allow-Origin: https://sandbox-capacity-probe.sociobot.in`,
stripped the token from the URL, stored the invalid verdict locally, and
showed the recovery message without errors.

The product has no sign-in, so the Microsoft Entra authority requirement does
not apply.

## Deployment identity, caching, and budgets

A SHA-256 comparison matched all 18 publicly served files from fresh
`dist/site/` to the live domain byte-for-byte. This includes HTML, hashed
CSS/JS, legal pages, images, demo data, service worker, robots, and sitemap.
`staticwebapp.config.json` is deployment configuration and is not a public
artifact. The unknown-path body also matched `dist/site/404.html` exactly.

- Initial JavaScript: 10,556 bytes raw; budget 200 KiB.
- CSS: 13,207 bytes raw; budget 50 KiB.
- Webfonts: none.
- Mobile hero: 50,986 bytes; budget 300 KiB.
- Desktop hero: 238,934 bytes.

Live Lighthouse 12.8.2 mobile result:

- Performance 99
- Accessibility 100
- Best Practices 100
- SEO 100
- FCP 926 ms
- LCP 1,214 ms
- Total blocking time 134.5 ms
- CLS 0
- Transfer 65,005 bytes

## Defects by severity

| Severity | Count | Findings |
| --- | ---: | --- |
| Blocker | 0 | None |
| Critical | 0 | None |
| Major | 0 | None |
| Minor | 0 | None |

## Known limitation

No Docker or Podman daemon is installed in this verifier container. Runtime
command construction, isolation, measurement-report generation, and cleanup
were therefore verified through the deterministic fake-runtime integration
tests. The first real measurement must still run on an operator-controlled,
non-production host, which the product explicitly documents.
