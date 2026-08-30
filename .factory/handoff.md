# Polish round 3 handoff — PASS

**Work order:** `sandbox-capacity-probe-polish-3`

**Base reviewed:** `479b7c820b367f791f1b6671bfcd173d283ebdc0`

**Repair commits:** `6d5ff5b fix: close cumulative review findings`; `08ce750 fix: version offline shell cache`

**Deployed commit:** `08ce750`

**Deployment:** `23acc9d7-e4cc-46d6-b340-56d9d8134597`

**Live URL:** https://sandbox-capacity-probe.sociobot.in/

**Demo URL:** https://sandbox-capacity-probe.sociobot.in/?demo=1#cli-demo
**Date:** 30 August 2026

## Outcome

All cumulative findings from reviews 1–3 are closed. The published product is
a free, accountless local planner and bounded Rust CLI. The unavailable public
checkout was removed rather than leaving a broken purchase promise. There are
no price, purchase, license, merchant, refund, or checkout claims remaining.

The final deployment has visible desktop navigation, a responsive mobile menu,
three first-screen facts at 390 × 844 and 1440 × 900, an isolated one-click
demo with reset and exit, and cleanup for an early runtime-network error.
`sw.js` serves `capacity-probe-shell-v7`, so the final shell is the one cached
for offline reload.

## Verification evidence

### Fresh clean clone

From `/tmp/scp-polish3-final.OEZ5qW`, cloned from the final repository state:

| Check | Result |
| --- | --- |
| `npm ci` | passed |
| `npm run typecheck` | passed |
| `npm run lint` | passed (`cargo fmt --check`, Clippy with `-D warnings`) |
| Every one of the 12 commands in `.factory/claims.json`, each run separately | passed |
| `npm test` | passed: 4 unit tests, 10 Rust tests, and 54 Playwright checks |
| `npm run build` | passed and produced `dist/site/` |
| `cargo package --manifest-path cli/Cargo.toml` | passed: 11 files, 60.5 KiB unpacked, 16.7 KiB package |

The separately run claim IDs were `demo-isolated`, `local-planner`,
`no-telemetry`, `csv-export`, `offline-reload`, `cli-demo`, `cli-safety-bounds`,
`cli-isolated-cleanup`, `cli-report-compare`, `local-results`, `free-planner`,
and `mit-license`.

### Local and live quality checks

| Check | Result |
| --- | --- |
| `/opt/fleet/lib/verify-url.sh` local preview | passed for root, demo, Privacy, and Terms; zero console errors |
| Playwright Axe live audit | 0 violations on desktop root, mobile root, demo, Privacy, Terms, and 404 |
| `/opt/fleet/lib/verify-url.sh` live | root 579 ms, demo 935 ms, Privacy 572 ms, Terms 567 ms; title, `lang`, one `h1`, `main`, alt text, button labels, and console all passed |
| Live 404 | `https://sandbox-capacity-probe.sociobot.in/does-not-exist` returned HTTP 404, correct title and one `h1`; Axe 0 violations |
| Live mobile audit | 390 px `scrollWidth === 390`; all facts and opened menu links were within the 844 px first screen |
| Live desktop audit | all four header links and all three facts were visible within 1440 × 900 |
| Live demo audit | one click enters `?demo=1#cli-demo`; sentinels remain untouched, Reset restores 24 containers, Exit deletes the demo key, and every observed request is same-origin |
| Live offline audit | separate browser context loaded demo, then reloaded offline from `capacity-probe-shell-v7` |
| Live headers | CSP is self-only with `frame-ancestors 'none'`; `X-Content-Type-Options: nosniff` and strict referrer policy are present |
| Local Lighthouse mobile | Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.4 s, TBT 0 ms, CLS 0 |
| Built asset budget | JavaScript 8.74 KB raw across two entry chunks; CSS 12.75 KB raw; mobile hero 50,986 B; desktop hero 238,934 B |

Live screenshots are under `.factory/evidence/polish-3/live-final/`:
`root-desktop.png`, `root-mobile-menu.png`, `demo.png`, `demo-offline.png`,
`privacy.png`, `terms.png`, and `404.png`. The complete local Lighthouse
report is `.factory/evidence/polish-3/lighthouse-local.json`.

Chrome emits its standard network console message for the intentionally HTTP
404-status *document*; the 404 has no page-script console error. All normal
routes have zero console errors in both the factory verifier and live audit.

## Product checks

- Demo storage namespace: `demo:sandbox-capacity-probe:scenario` only. Normal
  planner input is not persisted.
- The product makes no cross-origin browser request. Its CSP permits only
  same-origin connections.
- The bundled CLI demo is captured in `site/public/demo-output.txt`; its claim
  compares complete normalized stdout and the bundled report with a fresh CLI
  run.
- The Rust probe creates labelled, isolated resources and now removes its
  temporary directory if network creation fails before any container starts.
- The current catalog sentence is verb-first and 91 characters:
  `Measure safe Docker or Podman container capacity before rollout with a bounded local probe.`

## Run and deploy

```sh
npm ci
npm test
npm run build
cargo package --manifest-path cli/Cargo.toml
npm run test:claims -- --grep '@claim:demo-isolated'
/opt/fleet/lib/deploy-static.sh sandbox-capacity-probe dist/site
```

Run each `test` command in `.factory/claims.json` separately for the complete
claim suite. The factory owns registry credentials; do not publish from this
checkout.

## Known limits

No Docker or Podman daemon is available in this worker. The CLI integration
tests use a deterministic local fake runtime to exercise argument construction,
JSON output, cleanup, and the network-creation failure path. The executable
still requires an operator-selected local Docker or Podman runtime for a real
host probe. This is documented behavior, not an unresolved review finding.

See `.factory/polish-3.md` for the full finding-by-finding closure map.
