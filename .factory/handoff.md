# Repair handoff

**Work order:** `sandbox-capacity-probe-repair-2`
**Repaired candidate:** `dd794b18882383aa2fa7209fa64bf47c4c1db2f1`
**Verifier report:** `.factory/verification-2.md`
**Date:** 2026-08-29

## Outcome

All release-blocking, high, medium, and low findings in verification report
`335399cacaabaf9ac34e19bf788189d83a05f497` are repaired. The researched brief,
CLI artifact class, static deployment class, demo isolation, and previously
passing behavior remain intact.

## Repairs

- Claim commands are self-contained. Playwright now builds `dist/site` before
  preview, and `npm run test:claims` builds the CLI before each tagged check.
  The first exact claim command passed with both `dist/` and `target/` absent.
- `.factory/claims.json` now has 12 claims and exactly one tagged observable
  test per claim. Coverage includes CLI bounds and production refusal, isolated
  resources and cleanup, reports and 25% comparison, the temporary CLI demo,
  local output, five saved Pro scenarios, and license storage/check limits.
- Production markers without separators are refused. Regression cases are
  `productionwest`, `prod1`, `live01`, and `customerproduction`; benign
  `olive-branch` and `product-test` remain accepted as labels.
- Planner baseline and budget values must be whole numbers. A fractional value
  such as `50.5` sets `aria-invalid`, announces the correction, and preserves
  the last valid estimate and command.
- The installed executable is `capacity-probe`, so the crate no longer shadows
  OpenSSH `scp`. README, demo, generated commands, help, samples, and tests use
  the collision-free name.
- Saved Pro scenarios are parsed defensively. Corrupt or non-array storage is
  removed and the page continues through connection state and service-worker
  initialization.
- Mobile loads the dedicated 50,986-byte hero through a media-specific picture
  source. Three Lighthouse mobile runs now score 100 Performance instead of
  85–88. Stable image/icon URLs no longer use one-year immutable caching.
- The service-worker cache is versioned as `capacity-probe-shell-v3`.
- A strict TypeScript check and Rust format/Clippy lint script were added.
- Paid-tier wording now matches behavior: five latest scenarios are presented
  for side-by-side review, rather than claiming a separate comparison engine.

## Verification evidence

- Clean install: `npm ci` — 59 packages, 0 vulnerabilities.
- Clean complete suite: `npm test` — 3 Vitest tests, 9 Rust tests, and 48
  Playwright checks across desktop Chromium and the 390 px mobile project.
- Every exact command in `.factory/claims.json` passed. The first ran after
  removing both build directories; all 12 commands rebuilt their prerequisites.
- Types: `npm run typecheck` — pass.
- Format/lint: `npm run lint` — Rust format and strict Clippy pass.
- Production: `npm run build` — pass; output is `dist/site/` plus
  `target/release/capacity-probe` and no release `scp` executable.
- Package: `cargo package --manifest-path cli/Cargo.toml --allow-dirty` — pass,
  11 files, 57.7 KiB unpacked / 16.5 KiB compressed.
- Consumer: installed the extracted packaged crate into a fresh Cargo root;
  only `capacity-probe` was installed, `--help` passed, and `--demo` produced a
  valid temporary JSON report.
- CLI matrix: normal levels `[2,4,6,8]`; minimum plan passed; maximum plan
  reported 640 starts and 1,024 ports; all four production bypasses, fractional
  budget, mismatched confirmation, and 65 containers exited 2. Missing Docker
  returned the documented recovery error.
- Browser/accessibility: desktop and 390 px demo, keyboard, focus, touch target,
  responsive overflow, light/dark axe, reduced motion, legal pages, and 404 all
  passed with no serious or critical axe finding or page error.
- Privacy/offline/update: demo storage remained separate, normal planner and
  CSV flows stayed same-origin, license calls used only the documented Sociobot
  endpoint, manual/day limits and `Retry-After` were exercised, and the v3
  service worker updated then reloaded the demo offline.
- Performance budgets: initial JS 8,160 bytes raw; CSS 11,906 bytes raw; no
  fonts; mobile hero 50,986 bytes. Lighthouse 12.8.2 mobile runs scored
  **100/100/100** Performance and **100/100/100** Accessibility, Best Practices,
  and SEO. LCP was 1,466–1,508 ms, TBT 0 ms, CLS 0.059, total transfer 64,824
  bytes.

## Deployment and live checks

Repair commit `36d21df` was pushed to `origin/main` and deployed with the
factory static deployment script. Azure deployment
`5a04aeff-4f7e-4062-a78d-365cb8939eb3` succeeded; the existing Central US app
and custom domain both reported ready, and HTTPS returned 200.

- SHA-256 matched for all 17 publicly served files in `dist/site`. The only
  non-public build file is `staticwebapp.config.json`, which the platform
  consumes and correctly returns as 404.
- `/opt/fleet/lib/verify-url.sh` passed live in 728 ms with the correct title,
  `lang=en`, one h1, main landmark, complete image alt text, named buttons, and
  zero console/page errors.
- Root responses include HSTS, `nosniff`, Referrer-Policy, Permissions-Policy,
  and response-header CSP with `frame-ancestors 'none'`. Hashed assets are
  immutable; stable hero assets now revalidate with a 30-second max age.
- An unknown route returned the designed 404 body with HTTP 404. The live
  billing product identity returned HTTP 200 with `{valid:false,
  reason:"invalid"}` for the repair test token.
- A fresh 390×844 DPR-2 browser loaded the 50,986-byte mobile hero, had zero
  horizontal overflow, console errors, page errors, cross-origin demo requests,
  or serious/critical axe findings. Fractional recovery, the v3 cache, service
  worker update, and offline reload all passed live.
- Three live Lighthouse mobile runs scored **100/100/100** Performance and
  **100/100/100** Accessibility, Best Practices, and SEO. LCP was 1,065–1,080
  ms, TBT 0–23 ms, CLS 0.059, and transfer was 63,546–63,609 bytes.

## Known environment gap

No Docker or Podman daemon is available in this worker. The deterministic fake
runtime exercises exact create/run/cleanup arguments, including the ordinary
error path, but a real synthetic-container sweep, interrupt cleanup, and the
brief's subsequent-run prediction accuracy still require a controlled runtime
host. No live checkout was purchased; billing behavior uses recorded/mocked
responses while the existing public verification endpoint remains external.
