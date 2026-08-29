# Review handoff — FAIL

**Work order:** `sandbox-capacity-probe-review-1`
**Reviewed commit:** `d7652f1331a388604a514a19f012e7cfa8ba16b6`
**Live URL:** https://sandbox-capacity-probe.sociobot.in/
**Date:** 2026-08-29

## What was done

Performed a fresh-context adversarial first-read review at desktop and 390 px,
checked the live demo, storage namespace, request log, routes, metadata,
checkout link, historical verification findings, and the real CLI demo command.
Cloned the repository into a clean temporary directory, ran `npm ci`, ran every
exact claim command from `.factory/claims.json`, and ran the full claims suite.
No product code was modified.

## Result

**FAIL.** Full detail is in `.factory/review-1.md`.

The blocker is that the one-click landing demo shows a local planner, not the
actual CLI sample output required for this CLI product. The report also records
unlisted payment/access claims, metaphor headings, inconsistent scenario
terminology, non-result-naming buttons, README copy violations, an incomplete
copy-audit artifact, and a mobile/header navigation issue.

## Verification that passed

- Cold hero identifies the job, audience, and first action.
- Demo uses only `demo:sandbox-capacity-probe:scenario`; reset restores the
  realistic sample; hidden purchase/license controls do not touch real data.
- Browser demo requests stayed same-origin.
- `capacity-probe demo` and `capacity-probe --demo` wrote bundled output only
  to process-specific temporary directories without contacting a runtime.
- All 12 listed claim commands passed from the clean clone; the full claims
  suite completed.
- Root/legal/404 routes and discovered links were reachable; checkout reached
  a hosted Dodo session without submitting payment.

## Next steps

Implement every F-1 finding in `.factory/review-1.md`, especially a visible
real CLI demo recording/command and a claim manifest that covers the paid-tier
and access statements. Re-run this full first-read checklist from a clean clone.
