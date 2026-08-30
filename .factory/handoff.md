# Review 2 handoff — FAIL

**Work order:** `sandbox-capacity-probe-review-2`
**Date:** 30 August 2026
**Product code changed:** no

## Outcome

Wrote `.factory/review-2.md` after a fresh live mobile/desktop, clean-clone, claims, CLI, history, copy, route, metadata, and link review. The result is **FAIL**.

## Verified

- Cold first read clearly states job, audience, and first action.
- Live demo is one-click, isolated, resettable, same-origin, and clears on exit.
- CLI demo runs in a temp directory without runtime or network.
- All 16 exact claim commands, `npm test`, and `npm run build` passed in a clean clone.
- Live crawl found no dead links; normal routes have required metadata and the unknown route returns HTTP 404.

## Open findings

1. **BLOCKING F-1-1 (regressed):** the terminal called a real recording differs from actual `capacity-probe demo` output (`1 mount` versus `1 mounts`).
2. **MEDIUM F-2-1:** Privacy navigation and Back leave focus on `<body>` with no route announcement.
3. **MINOR F-2-2:** 404 lacks canonical and Twitter route metadata.
4. **MINOR F-2-3:** landing uses `p95` without a nearby plain definition.

See `.factory/review-2.md` for evidence, reproduction, and fixes.
