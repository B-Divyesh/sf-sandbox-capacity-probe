# Adversarial first-read review 3 handoff — FAIL

**Work order:** `sandbox-capacity-probe-review-3`

**Candidate:** `d7d5e1e6f4e63e30a3bef0dcfc8e1e19833d9fa0`

**Live URL:** https://sandbox-capacity-probe.sociobot.in/

**Date:** 30 August 2026

**Product code changed:** no

## Outcome

The review fails with two blocking, one medium, and one minor finding. Full
evidence, exact copy audit, claim matrix, history reconciliation, and fixes are
in `.factory/review-3.md`.

- F-3-1 reopens F-1-2: the public checkout returns HTTP 503, so
  `planner-pro-price` and `planner-pro-checkout` fail.
- F-3-2 reopens F-1-8: desktop hides the four header links inside a closed
  `<details>` whose summary is also hidden.
- F-3-3: all three required facts do not fit within either tested first screen.
- F-3-4: a network-creation error leaves an empty process-specific directory
  under `/tmp`; the existing cleanup claim test does not cover this early exit.

## What was verified

- Fresh live first read at 390 × 844 and 1440 × 900.
- One-click demo, realistic sample, banner, Reset, real-data sentinels, and
  direct-demo request log.
- Every `.factory/claims.json` command separately from clean clone
  `/tmp/scp-review3.Sdwgws`: 14 passed, 2 failed.
- CLI demo from a new temporary directory with unreachable proxy endpoints.
- Root, demo, Privacy, Terms, designed 404, metadata, deep links, Back/focus,
  internal/external link crawl, mobile overflow, and distinct visual identity.
- Playwright Axe on live root/demo and the factory URL verifier on root, demo,
  Privacy, and Terms; no accessibility violations or browser errors were found.
- Every earlier review and polish finding against live behavior and source.
- Every landing and README sentence, heading, action, term, and claim-like
  statement.
- `npm run build` passed and produced `dist/site/`.
- `npm test` reached 60 passing checks and failed the four desktop/mobile
  repetitions of the two checkout claim tests.

## Reproduce

```sh
npm ci
npm run test:claims -- --grep '@claim:planner-pro-price'
npm run test:claims -- --grep '@claim:planner-pro-checkout'
npm test
npm run build
curl -i https://api.sociobot.in/api/v1/products/sandbox-capacity-probe/checkout
```

For F-3-4, run a fake Docker executable that succeeds for `info` and fails
`network create`, then compare `/tmp/capacity-probe-*` before and after the
probe. The reviewed run exited 2 and left one empty directory.

No deployment, billing, infrastructure, DNS, or product source was changed.
