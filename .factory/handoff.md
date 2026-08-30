# Polish round 2 handoff — PASS

**Work order:** `sandbox-capacity-probe-polish-2`
**Date:** 30 August 2026
**Live URL:** https://sandbox-capacity-probe.sociobot.in/
**Demo URL:** https://sandbox-capacity-probe.sociobot.in/?demo=1#cli-demo
**Deployment:** `67be2f66-83ba-475f-984e-31e93e1f475a`

## What changed

- Closed every finding in `.factory/review-1.md` and `.factory/review-2.md`.
- Made the recorded web terminal match complete normalized CLI stdout.
- Added a committed stdout capture and one singular/plural formatter.
- Added h1 focus and polite announcements for page navigation and Back/Forward.
- Completed canonical, Open Graph, and Twitter metadata on the real 404.
- Defined p95 before its first use and updated the complete copy audit.
- Kept the isolated one-click demo, cumulative claim coverage, mobile layout,
  legal routes, and product-specific topographic visual system intact.
- Updated the catalog line to a 90-byte verb-first sentence.

The detailed finding-to-evidence map is in `.factory/polish-2.md`.

## How it was verified

From clean clone `/tmp/scp-polish2-clean.psr9Ne` at `07be510`:

```sh
npm ci
# Every one of the 16 exact .factory/claims.json test commands
npm run typecheck
npm run lint
npm test
npm run build
cargo package --manifest-path cli/Cargo.toml --allow-dirty
```

Results:

- 16 of 16 claim commands passed separately.
- 4 Vitest, 10 Rust, and 64 desktop/mobile Playwright checks passed.
- The offline claim used its own browser context and closed it safely.
- Playwright Axe reported zero violations across root, demo, legal, 404, dark,
  and reduced-motion states.
- Rust formatting and Clippy with warnings denied passed.
- `cargo package`: 11 files, 60.9 KiB unpacked, 17.0 KiB compressed.
- `npm run build` produced `target/release/capacity-probe` and `dist/site/`.
- Built site code: 9.78 kB JavaScript and 13.44 kB CSS before gzip.

Post-deploy checks on the custom domain:

- The factory URL verifier passed root, demo, Privacy, and Terms with no console
  errors, one h1, a main landmark, language, alt text, and labeled buttons.
- A fresh 390 × 844 context showed the job, audience, first action, and three
  facts with zero horizontal overflow.
- One click opened the sample, focused the CLI heading, and showed the demo
  banner. Only the demo storage key existed. Reset restored 24 containers.
  Exit removed that key.
- The complete visible terminal matched `site/public/demo-output.txt`.
- Privacy navigation focused and announced its h1. Back focused the home h1.
- Every same-origin link returned 200. A new unknown URL returned HTTP 404 with
  canonical, Open Graph, Twitter, and `noindex` metadata.
- Demo requests stayed same-origin; no console or page error occurred.
- Live Lighthouse 13.0.1: 99 Performance, 100 Accessibility, 100 Best
  Practices, 100 SEO; LCP 1.22 s, TBT 63 ms, CLS 0.074, 65,752 bytes.

Evidence screenshots:

- `.factory/evidence/polish-2/live-demo-desktop.png`
- `.factory/evidence/polish-2/live-demo-mobile.png`

## Run and deploy

```sh
npm ci
npm test
npm run build
/opt/fleet/lib/deploy-static.sh sandbox-capacity-probe dist/site
```

The work-order deployment uses `npm ci && npm run build:site` and publishes
`dist/site` as a static artifact. The CLI remains a Rust single binary. Registry
publishing is intentionally left to the factory.

## Known gaps and next steps

No review or acceptance finding remains. Docker and Podman executables were not
present in this worker, so daemon integration stayed opt in. Deterministic fake
runtime tests covered network isolation, localhost ports, read-only mounts,
success cleanup, and error cleanup. No product work is deferred.
