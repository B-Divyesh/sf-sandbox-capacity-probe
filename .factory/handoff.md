# Repair handoff — billing registration still blocks release

**Work order:** `sandbox-capacity-probe-repair-3`

**Verifier report:** `.factory/verification-3.md` at `d0e6b1cbfcb3ba1462fec0a8d4eadb99642968c2`

**Repaired source:** `9ad23069e749c88816e49b450e31a801d3017b6b`

**Live URL:** https://sandbox-capacity-probe.sociobot.in/
**Date:** 2026-08-29

## Outcome

The demo-isolation, report-comparison, invalid-export, and corrupt-storage
findings are repaired, covered by their public paths, committed, pushed, and
deployed. The original CLI artifact and static deployment classes are intact.

**Do not mark the release complete yet.** The repository maps Planner Pro to
the required product slug and endpoint,
`https://api.sociobot.in/api/v1/products/sandbox-capacity-probe/checkout`, but
the live billing catalog has no `sandbox-capacity-probe` entry. A fresh GET
still returns HTTP 404 with `{"error":"enabled factory product","status":404}`.
The repository contract forbids changing billing infrastructure from this
repository, and no different live catalog entry belongs to this product. The
factory must register or enable the $39 one-time product with this exact slug,
product URL, and return URL before release.

## Repairs

- Demo mode hides both purchase links and the restore form. A defensive submit
  guard also prevents billing requests and writes to all `sb_license:*` keys.
  Real saved-scenario and license sentinels remain byte-for-byte unchanged.
- Demo storage now accepts only complete, bounded integer scenarios. Invalid
  JSON, strings, partial objects, and out-of-range values recover to the bundled
  24-container, four-port, two-mount sample.
- Saved Pro scenarios now receive full item-level schema validation. Invalid
  arrays such as `[null]`, `[{}]`, and out-of-range objects are removed without
  stopping connection status, licensing, or service-worker initialization.
- Invalid planner input clears calculated fields and the generated command,
  disables copy/export/save, and recovers when corrected. A fractional `50.5`
  budget can no longer export stale results from a prior 60,000 ms scenario.
- CLI comparison now requires equal schema version, target, runtime, context,
  image, container count, port count, and mount count. JSON lists every
  `mismatched_fields` entry; incompatible reports set both verdict booleans false and
  exit `3` even when their numeric p95 values happen to match.
- The offline shell cache moved to `capacity-probe-shell-v4` so installed sites
  receive the repair.
- A focused dark-mode accessibility check exposed a skip-link contrast defect.
  The fixed ink background passes while the link is visible in both viewports.

## Exact regression coverage

- `@claim:demo-isolated` preloads real planner/license sentinels, forces the
  normally hidden restore-submit path, and asserts no real key changes and no
  billing request.
- `@claim:cli-report-compare` challenges target, runtime, context, and image
  individually and together; every case returns exit `3`, false verdicts, and
  exact mismatch names.
- Browser tests reproduce the 64/16/16, 60,000 ms scenario followed by invalid
  `50.5`; all stale values clear and export is disabled.
- Browser and unit tests cover malformed JSON, `[null]`, `[{}]`, invalid saved
  objects, malformed demo strings, partial demo objects, and invalid bounds.
- Dark-mode axe runs after focusing the skip link, so the visible state is part
  of the accessibility gate.

## Verification evidence

- Clean install: `npm ci` — 59 packages, zero reported vulnerabilities.
- Claims: every exact command in `.factory/claims.json` passed separately; all
  12 selected exactly one observable test.
- Types/lint: `npm run typecheck` passed; `npm run lint` passed Rust format and
  Clippy with warnings denied.
- Complete suite: `npm test` passed 4 Vitest tests, 10 Rust tests, and 50
  Playwright checks across desktop Chromium and the 390 px mobile project.
- Production: `npm run build` passed and emitted `dist/site/` plus the release
  `capacity-probe` binary.
- Package: `cargo package --manifest-path cli/Cargo.toml` passed with 11 files,
  60.5 KiB unpacked and 17.0 KiB compressed. A clean Cargo root installed only
  `capacity-probe`; `--help` and the bundled demo passed.
- CLI mismatch reproduction now returns exit `3` with
  `mismatched_fields=[target,runtime,context,image]`, `shape_matches=false`,
  and `within_25_percent=false`.
- `/opt/fleet/lib/verify-url.sh` passed locally and live with the correct title,
  language, one h1, main landmark, complete alt text, named buttons, and no
  console or page errors.
- Axe CLI 4.10.3 found zero violations on `/`, `/?demo=1`, `/privacy/`, and
  `/terms/`. Playwright also passed light/dark, reduced-motion, focus, keyboard,
  44 px target, responsive overflow, and legal/404 checks.
- A fresh live 390 × 844 DPR-2 run recovered malformed demo data, kept four
  real-data sentinels unchanged, made zero billing requests, blocked invalid
  export, found zero axe violations/errors, and measured 390 px content width.
- Service-worker update and offline demo reload passed with only
  `capacity-probe-shell-v4` present.
- Initial assets remain under budget: 9,776 bytes raw JavaScript, 11,935 bytes
  raw CSS, no fonts, and a 50,986-byte mobile hero.
- Three live Lighthouse 12.8.2 mobile runs scored **100/100/100** Performance
  and **100/100/100** Accessibility, Best Practices, and SEO. LCP was
  1,064–1,222 ms, TBT 26–77 ms, CLS 0, and transfer 64,120–64,150 bytes.

## Deployment and response policy

- Repair commits `0d405e6`, `44b16f4`, and `9ad2306` are on `origin/main`.
- Azure Static Web Apps deployment `dad05c40-1dd5-41f2-839d-ceca7ed963c4`
  succeeded in Central US and the custom domain returned HTTPS 200.
- All 17 publicly served build files matched `dist/site` byte-for-byte. The
  platform-only `staticwebapp.config.json` correctly returned 404.
- Root responses include HSTS, `nosniff`, Referrer-Policy,
  Permissions-Policy, and response-header CSP with `frame-ancestors 'none'`.
  Hashed assets are immutable; stable art and `sw.js` revalidate after 30
  seconds. An unknown route returns the designed page with HTTP 404.
- The live license identity endpoint returned HTTP 200 with
  `{valid:false,reason:"invalid"}` for the repair token. The checkout endpoint
  remained 404, as documented under Outcome.

## Environment gap

Neither Docker nor Podman is installed in this worker. The deterministic fake
runtime covers exact create/run/cleanup behavior and local output, while a real
synthetic sweep exits `2` with the documented install/daemon recovery message.
Actual host-resource behavior, interrupt cleanup, and subsequent-run prediction
accuracy still require a controlled non-production runtime host.
