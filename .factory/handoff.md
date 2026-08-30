# Review 4 handoff — PASS

**Work order:** `sandbox-capacity-probe-review-4`

**Reviewed commit:** `59843c8c211841133820a6e771748be23dceb77f`

**Live URL:** <https://sandbox-capacity-probe.sociobot.in/>
**Date:** 30 August 2026

## Outcome

Independent adversarial review 4 passed with zero findings. No product code was
changed. The only committed changes are this handoff and
`.factory/review-4.md`.

## Verified

- Fresh 390 × 844 and 1440 × 900 visits clearly identify the job, audience,
  and first action before scrolling.
- The one-click demo shows real CLI sample output, preserves real-data storage,
  resets sample storage, removes it on exit, and uses only same-origin requests.
- `capacity-probe demo` succeeded in a new temporary directory with unreachable
  proxy settings and did not require a container runtime or network.
- All 12 declared claim commands passed separately from a fresh clone.
- `npm test` passed (4 Vitest, 10 Rust, 54 Playwright) and `npm run build`
  produced `dist/site/` and the release binary.
- Route metadata, 404 behaviour, link crawl, focus/Back behaviour, visual
  identity, copy audit, and all historical findings were rechecked live.

## How to repeat

```sh
npm ci
npm test
npm run build
while read -r id; do npm run test:claims -- --grep "@claim:$id"; done <<'EOF'
demo-isolated
local-planner
no-telemetry
csv-export
offline-reload
cli-demo
cli-safety-bounds
cli-isolated-cleanup
cli-report-compare
local-results
free-planner
mit-license
EOF
```

## Known gaps

None found by this review. The CLI still needs an operator-selected local
Docker or Podman runtime for a real probe; its bundled demo intentionally does
not contact one.
