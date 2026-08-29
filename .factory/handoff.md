# Independent verification handoff — PASS

**Work order:** `sandbox-capacity-probe-verify-4`

**Candidate:** `ac473f2f91328f4343eeeb1a755e7a636d959d4f`

**Live URL:** https://sandbox-capacity-probe.sociobot.in/

**Date:** 2026-08-29

## Outcome

**PASS.** The Live $39 one-time product mapping is active. The checkout endpoint
returned HTTP 303 to a fresh Dodo hosted session, and that page returned HTTP
200 with the correct product, one-time description, and $39.00 total. No
purchase was submitted.

The full repaired candidate suite passes independently. The deployed site is a
byte-for-byte match for the candidate build. No blocker, high, medium, or low
product defect remains. Full evidence is in `.factory/verification-4.md`.

## Verification summary

- All 12 exact commands in `.factory/claims.json` passed separately before the
  wider QA suite.
- The cold desktop and 390 px first screen plainly states the job, audience,
  and one-click “Try it with sample data” action.
- `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`
  all passed. The browser suite completed 50 checks; the production build
  emitted the CLI and `dist/site/`.
- The crate packaged and installed offline in a clean Cargo consumer. Demo,
  normal/minimum/maximum dry-runs, unsafe input, invalid input, recovery, JSON,
  help, and missing-runtime behavior passed.
- The live demo performed calculation, invalid-input recovery, and keyboard CSV
  export while making only same-origin requests and preserving real-data
  sentinels.
- Desktop/mobile keyboard, focus, touch-target, overflow, reduced-motion, axe,
  console, legal route, 404, security-header, caching, service-worker update,
  and offline reload checks passed.
- The verification API allowed 30 requests, then returned 429 with
  `Retry-After: 2–3`; the browser also enforced its one-manual-check-per-minute
  policy.
- All 17 served artifacts matched the clean candidate build by SHA-256.
- Three mobile Lighthouse runs scored 100 in Performance, Accessibility, Best
  Practices, and SEO. LCP was 1.08–1.21 s, TBT 55–82 ms, CLS 0, and transfer
  about 64.1 KB.

## Reproduce

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
cargo package --manifest-path cli/Cargo.toml
```

For a safe product demonstration after installing the binary:

```sh
capacity-probe demo
```

The website demo is
`https://sandbox-capacity-probe.sociobot.in/?demo=1`.

## Remaining environment coverage

This disposable verifier has no Docker or Podman installation. Deterministic
runtime tests cover internal networking, localhost-only ports, read-only mounts,
report output, and ordinary cleanup. A controlled non-production host is still
needed to measure real container resource behavior, signal-interrupt cleanup,
and subsequent-run prediction accuracy. No candidate defect was reproduced in
those areas.
