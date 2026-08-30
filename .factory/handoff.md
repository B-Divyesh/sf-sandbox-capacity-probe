# Independent verification 7 handoff — PASS

**Work order:** `sandbox-capacity-probe-verify-7`
**Candidate:** `15ef9cb381a97e3f72d6954dbb3d3fb3d09fd746`
**Live URL:** https://sandbox-capacity-probe.sociobot.in/
**Date:** 30 August 2026
**Product code changed:** no

## Outcome

**PASS.** Fresh clean-build, packaged-CLI, and deployed-product evidence meets
the acceptance contract. The live deployment is byte-identical to the
candidate's public build artifacts. There are no blocker, critical, or major
defects. One non-blocking minor cleanup edge case remains.

Full evidence and severity details are in `.factory/verification-7.md`.

## Verification summary

- First read passed at desktop and 390 px: job, audience, first action, and the
  one-click sample demo are visible in plain words.
- All 16 exact `.factory/claims.json` commands passed separately after
  `npm ci`.
- `npm test` passed 4 Vitest, 10 Rust, and 64 Playwright tests.
- `npm run typecheck`, `npm run lint`, `npm run build`, and clean
  `cargo package` passed.
- The packaged crate installed into a fresh Cargo root and passed demo, normal
  and maximum dry runs, report comparison, safety limits, and error exits.
- Live desktop/mobile keyboard, invalid-input recovery, CSV, demo isolation,
  dark/reduced-motion, 200% text, service-worker update, and offline reload
  checks passed.
- Axe found zero violations. The supplied URL verifier passed root, demo,
  Privacy, and Terms without browser errors.
- Complete demo traffic stayed same-origin. Live security and caching headers
  matched policy.
- License verification allowed 30 immediate requests, then returned 429 with
  `Retry-After: 3`; it recovered after cooldown.
- All 19 public deployment artifacts matched the fresh build by SHA-256.
- Lighthouse mobile: 96 Performance, 100 Accessibility, 100 Best Practices,
  100 SEO; LCP 1.3 s, TBT 180 ms, CLS 0.074, 64 KiB transferred.

## Known gap / next step

Minor: when runtime network creation fails, `capacity-probe` leaves an empty
process-specific directory under `/tmp`. No container, network, mount content,
or user data remains. A future patch should remove that directory on the
early-return path and add this case to `@claim:cli-isolated-cleanup`.

No Docker or Podman daemon exists in this verifier environment. Runtime
behavior was exercised with the repository's deterministic fake-runtime
integration tests; the first real probe remains an operator-controlled
non-production-host check.

## Reproduce

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
cargo package --manifest-path cli/Cargo.toml
```

No deployment, registry publication, infrastructure, DNS, billing, or product
code was changed.
