# Independent verification 7 — PASS

**Work order:** `sandbox-capacity-probe-verify-7`
**Candidate:** `15ef9cb381a97e3f72d6954dbb3d3fb3d09fd746`
**Live URL:** https://sandbox-capacity-probe.sociobot.in/
**Verified:** 30 August 2026 from `/work/repo`
**Product code changed:** no

## Release decision

**PASS.** The candidate meets the researched brief and acceptance contract.
The deployed product matches the candidate build. There are no blocker,
critical, or major defects. One minor cleanup edge case is documented below.

## First-read and demo gate

The cold first screen passes at 1440 × 900 and 390 × 844:

- What it does: **“Measure container capacity before rollout.”**
- Who it is for: teams running isolated agent or customer containers on Docker
  or Podman.
- What to click first: **“Try it with sample data.”**

The action is visible without scrolling. One keyboard-activated click opened
`/?demo=1#cli-demo`, focused the CLI sample heading, loaded the 24-container
sample, and displayed **“Demo — sample data, nothing is saved”** with Reset and
Exit controls. The three first-screen facts are “Sample data stays separate,”
“Planner runs locally,” and “No telemetry.”

## Mandatory claims gate

`.factory/claims.json` exists and contains 16 unique entries. After the clean
`npm ci`, every listed command was run separately through the demo entry point.
Every command selected one uniquely tagged test and passed:

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

Result: **16/16 PASS**. Landing, legal, README, and CLI-help claims were
cross-checked against the manifest. No unlisted material product claim was
found.

## Clean install, tests, and build

- `npm ci`: PASS — 59 packages, zero audit vulnerabilities.
- `npm test`: PASS — 4 Vitest, 10 Rust, and 64 Playwright tests.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS — Rust format and Clippy with warnings denied.
- `npm run build`: PASS — release CLI plus `dist/site/`.
- `cargo package --manifest-path cli/Cargo.toml`: PASS — 11 files, 60.9 KiB
  unpacked and 17.0 KiB compressed.

## Packaged CLI and end-to-end behavior

The generated crate was installed into a fresh temporary Cargo root. The
installed `capacity-probe 0.1.0` passed:

- `--help`, `--version`, `demo`, report `explain`, and JSON `compare`;
- a normal 8-container dry run;
- the maximum 64 containers, 16 ports, 16 mounts, and 10 samples, reporting
  640 starts and 1,024 simultaneous published ports;
- identical-report comparison with 0% error and exit 0;
- mismatched confirmation, production target, zero and over-limit values,
  and missing-report paths with actionable errors and exit 2.

The full integration suite used a deterministic Docker substitute to verify
the internal labeled network, localhost-only published ports, read-only
mounts, local JSON output, and cleanup after success and container-start
failure. Neither Docker nor Podman is installed in this worker, so a real
daemon sweep was not possible.

## Live web behavior

Independent Playwright checks covered the complete demo and planner flow:

- Demo storage contained only `demo:sandbox-capacity-probe:scenario`; Reset
  restored 24 containers and Exit removed the demo key.
- Normal input (12 containers, 2 ports, 1 mount, 220 ms baseline, 1,500 ms
  budget) produced 370 ms, 24 bindings, and 1,130 ms headroom.
- Minimum input produced 3 ms and zero bindings.
- Maximum input produced 65,027 ms, 1,024 bindings, and `EXCEEDED`.
- Fractional input set `aria-invalid`, announced the valid range, cleared the
  stale estimate, disabled export, and recovered after correction.
- CSV export contained the documented header and current scenario row.
- Unknown paths returned the designed page with HTTP 404.

The exact checkout claim tests followed the Sociobot buy URL to the hosted
Dodo session and verified this product's $39 one-time offer. No purchase was
made. The product has no sign-in, so the Microsoft Entra requirement does not
apply.

## Accessibility, responsive behavior, and offline use

- `/opt/fleet/lib/verify-url.sh` passed root, demo, Privacy, and Terms: HTTP
  200, route title, `lang=en`, one h1, main landmark, complete image alt text,
  named buttons, and no console/page errors.
- Fresh Playwright Axe scans found zero violations on root, demo, Privacy,
  Terms, the 404, 390 px mobile, and dark/reduced-motion states.
- Keyboard Tab reached the skip link, wordmark, and primary demo action. Each
  showed a 3 px teal outline; Enter opened the demo and focus moved to its
  heading.
- At 390 px, document and body widths were exactly 390 px, with no horizontal
  overflow. Every visible link, button, and range control was at least 44 px.
- A 200% root text-size check retained all non-collapsed content with no
  horizontal overflow.
- Reduced motion changed the hero animation to `0.00001s` and disabled smooth
  scrolling.
- Service-worker update succeeded. Cache `capacity-probe-shell-v6` then
  reloaded the demo and planner offline.

Evidence was captured under `.factory/evidence/verification-7/` and raw logs
under `/tmp/scp-*.log` in this verification container.

## Privacy, requests, headers, and rate limiting

The full live demo, planner, reset, exit, and legal-route flow made 45 requests,
all same-origin. There were no external fonts, scripts, analytics, or telemetry
requests and no page errors. The only console error was the expected browser
resource message for the deliberately requested HTTP 404 route.

Live responses include HSTS, `X-Content-Type-Options: nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin`, a restrictive
Permissions-Policy, and a response-header CSP with `frame-ancestors 'none'`.
HTML and stable files revalidate after 30 seconds. Hashed JS/CSS use one-year
immutable caching. License verification returns `Cache-Control: no-store` and
the expected origin-specific CORS header.

Rate-limit evidence used a non-secret invalid license token. In one immediate
burst, 30 requests returned 200 and the next returned **429** with
`Retry-After: 3`. A request after cooldown returned 200. The observed allowance
was therefore 30 back-to-back verification requests in that window.

## Deployment identity and budgets

SHA-256 hashes for all 19 publicly served build artifacts matched the fresh
`dist/site/` output byte-for-byte. This includes HTML, hashed JS/CSS, images,
demo fixtures, legal pages, service worker, robots, and sitemap.
`staticwebapp.config.json` correctly returns 404 because it is deployment
configuration, not a public file; its configured headers and 404 rewrite were
observed live.

- Initial root JavaScript: 11,862 bytes raw; budget 200 KiB.
- CSS: 13,438 bytes raw; budget 50 KiB.
- Fonts: none; budget 120 KiB.
- Mobile hero: 50,986 bytes; budget 300 KiB.
- Lighthouse 13.0.1 mobile: Performance 96, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.0 s, LCP 1.3 s, TBT 180 ms, CLS 0.074, total 64 KiB.

## Defects by severity

| Severity | Count | Finding |
| --- | ---: | --- |
| Blocker | 0 | None. |
| Critical | 0 | None. |
| Major | 0 | None. |
| Minor | 1 | If runtime network creation fails, the CLI exits 2 with the correct error but leaves its empty `/tmp/capacity-probe-<time>-<pid>` directory. No network, container, mount content, or user data remains. Reproduced with a deterministic failing runtime; remove the temporary root on this early-return path and extend `@claim:cli-isolated-cleanup`. |

The minor empty-directory leak does not affect the bounded workload, runtime
safety, report integrity, privacy, or the smallest useful end-to-end job.
