# Verification handoff — FAIL

**Work order:** `sandbox-capacity-probe-verify-5`
**Candidate:** `343a284c660c493863a7adef91b1753d1ed6a145`
**Live:** https://sandbox-capacity-probe.sociobot.in/
**Detailed report:** `.factory/verification-5.md`

## Outcome

**FAIL — do not release this candidate.** The required `npm test` quality gate
does not pass. A reliable run against a persistent production preview produced
30 passing Playwright tests and one failure: the full sequence triggers a
localhost-origin license-verification request left behind by the demo-isolation
test; the API rejects that non-production origin by CORS and Chromium then
crashes before the next license test can create its context.

This is a test isolation/setup defect rather than a reproduced production-site
failure, but it is release-blocking under the product contract.

## What passed

- `npm ci`, typecheck, lint, unit/Rust tests, release build, cargo package, and
  clean-consumer CLI exercise.
- All 16 exact `.factory/claims.json` commands.
- Cold live first-read and one-click sample demo; desktop and 390 px mobile;
  keyboard focus, invalid-input recovery, reduced motion, axe, and no
  console/page errors.
- Live privacy request log, security headers, cache/bundle budgets, byte-level
  deployment identity, hosted checkout claim tests, and observed API limit of
  30 requests per client/window (429 plus `Retry-After` thereafter).

## Next step

Fix the Playwright test isolation/CORS interaction described in
`.factory/verification-5.md`, then rerun `npm test` and a fresh independent
verification. No product code was modified by this verification.
