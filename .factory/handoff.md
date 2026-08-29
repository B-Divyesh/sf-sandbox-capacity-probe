# Verification handoff — FAIL

**Tested candidate:** `dd794b18882383aa2fa7209fa64bf47c4c1db2f1`

**Live URL:** https://sandbox-capacity-probe.sociobot.in/

**Date:** 2026-08-29

**Detailed report:** `.factory/verification-2.md`

## Decision

**FAIL — do not release.** The live site is the candidate: every deployed file
matched the fresh production build by SHA-256. This is not a deployment-only
failure.

Release blockers:

1. All five exact `.factory/claims.json` commands fail from a clean checkout
   after `npm ci`; Playwright times out because `vite preview` has no built
   `dist/site`. They pass only after a separate build.
2. The claims manifest omits visible core promises covering CLI isolation,
   cleanup, safety limits, reports/comparison, CLI demo behavior, paid scenario
   behavior, and license/privacy allowances.

High-severity defects:

- Production-like targets without separators (`productionwest`, `prod1`,
  `live01`, `customerproduction`) bypass the default production refusal.
- A fractional planner budget such as `50.5` generates a command that the Rust
  CLI rejects, with no visible browser error.
- Installing the public binary as `scp` can shadow OpenSSH's standard `scp`.

Medium findings: three mobile Lighthouse runs scored 85–88 against the ≥90
gate, and corrupt saved-scenario local storage causes an uncaught page error and
stops connection/service-worker initialization.

## What passed

- Cold first-read and one-click sample demo on desktop and 390 px mobile.
- `npm ci`, `npm test` (3 Vitest, 9 Rust test functions, 26 Playwright), exact
  `npm run build`, Rust format, strict Clippy, crate package, and clean consumer
  install.
- CLI demo, normal/min/max dry runs, validation errors, JSON, explain, and
  compare. No Docker/Podman daemon was available for a real sweep.
- Live artifact hash match, CSP/security headers, styled 404, same-origin demo
  request log, isolated demo storage, CSV, keyboard/focus, zero axe violations,
  reduced motion, service-worker update, and offline reload.
- Billing endpoint allowance: 30 requests succeeded; attempts 31–40 returned
  429 with `Retry-After`.
- Budgets: 8.04 kB raw JS, 11.91 kB raw CSS, no fonts, 238.9 kB DPR-2 mobile
  hero; Lighthouse LCP 2.1–2.2 s and CLS 0.

## Reproduction

```sh
npm ci
npx playwright test --grep '@claim:demo-isolated' # times out from clean clone
npm test                                          # passes because it builds first
npm run build                                     # passes
cargo fmt --manifest-path cli/Cargo.toml -- --check
cargo clippy --manifest-path cli/Cargo.toml --all-targets -- -D warnings
cargo package --manifest-path cli/Cargo.toml --allow-dirty

target/release/scp probe --target productionwest \
  --confirm productionwest --dry-run              # incorrectly exits 0
target/release/scp probe --target staging --confirm staging \
  --startup-budget-ms 50.5 --dry-run               # CLI exits 2
```

No product code was changed. Verification evidence is in ignored
`.factory/evidence/`; the committed handoff artifacts are this file and
`.factory/verification-2.md`.
