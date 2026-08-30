# Polish round 2 — every cumulative finding closed

**Work order:** `sandbox-capacity-probe-polish-2`
**Candidate:** `8e8483c10b6a216133ad4fdadd1819781991b881`
**Review commit:** `4ebc275e7dd58b4a9e197f9ade447031c3f798b5`
**Repair commits:** `7d07139`, `07be510`
**Deployment:** `67be2f66-83ba-475f-984e-31e93e1f475a`
**Live URL:** https://sandbox-capacity-probe.sociobot.in/
**Demo URL:** https://sandbox-capacity-probe.sociobot.in/?demo=1#cli-demo

Every finding in `.factory/review-1.md` and `.factory/review-2.md` was checked
at source, in a clean clone, and on the custom live domain. Round 1 repairs
remain in place. No finding of any severity remains open.

## Finding map

| Finding | Change made | Exact evidence |
| --- | --- | --- |
| F-1-1, including its round 2 regression | Kept the one-click CLI demo and isolated planner. Added `site/public/demo-output.txt` as captured stdout, made CLI count labels singular or plural from one formatter, and changed the claim test to compare the complete normalized CLI stdout, capture, and rendered terminal. Only the process-specific temporary directory number is normalized. | `@claim:cli-demo` passed from `/tmp/scp-polish2-clean.psr9Ne`. The live cold check compared all terminal text exactly. [Desktop CLI recording](evidence/polish-2/live-demo-desktop.png), [mobile demo](evidence/polish-2/live-demo-mobile.png), and the live demo URL above. |
| F-1-2 | Retained the 16-entry claims manifest and the four discrete price, checkout, account-free, and free-feature claims. Unprovable merchant/refund automation wording remains removed. | `@claim:planner-pro-price`, `@claim:planner-pro-checkout`, `@claim:planner-pro-no-account`, and `@claim:planner-pro-free-features` each passed separately from the clean clone. The hosted checkout returned the named $39 one-time offer. |
| F-1-3 | Retained task-naming headings for the CLI sample, measurement method, containment steps, planner, scenarios, and license restoration. | Browser test `demo route focuses the real CLI sample and mobile navigation keeps four links`; `.factory/copy-audit.md`; live screenshot paths above. No reviewed metaphor heading appears in product copy. |
| F-1-4 | Retained **planned workload** for the requested container configuration and **scenario** for saved planner items. The CLI transcript now shares that language. | `@claim:planner-pro-five`; terminology table in `.factory/copy-audit.md`; clean source search found no reviewed route, shape, contour, slope, or station wording in task copy. |
| F-1-5 | Retained result-naming actions for opening the planner, buying Pro, leaving demo, restoring access, and saving a scenario. | `@claim:demo-isolated` exercised reset and exit. `@claim:planner-pro-checkout` selected the buy action. The action inventory in `.factory/copy-audit.md` contains the live labels. |
| F-1-6 | Retained the short README rewrite and its definitions for p50 and p95. | `.factory/copy-audit.md` inventories every README sentence. The maximum remains 22 words. Banned-word search returned no match. Documented CLI and package commands passed in the clean clone. |
| F-1-7 | Updated the complete copy audit with the p95 definition and route announcements. It still covers landing prose, headings, actions, labels, dynamic states, errors, terminal evidence, and README copy. | `.factory/copy-audit.md`; browser test `every declared claim has exactly one tagged browser test`; all 16 manifest commands passed separately. |
| F-1-8 | Retained the four-link header and accessible mobile disclosure. Purchase remains in the paid section, not the header. | Browser test `demo route focuses the real CLI sample and mobile navigation keeps four links` passed in both projects. The live 390 px cold check measured zero horizontal overflow. |
| F-2-1 | Added shared document-route handling. Internal page navigation records intent; the next route focuses its h1 and announces its title. Back/Forward does the same. Direct cold pages keep the skip link first, while the documented demo hash focuses its sample heading. | Browser test `document navigation and Back focus and announce the new route` passed on desktop and mobile. The live cold test observed `Privacy — Sandbox Capacity Probe. Privacy.` and focused the home h1 after Back. |
| F-2-2 | Added the 404 canonical URL, `og:url`, and route-specific Twitter title, description, and image while retaining `noindex` and HTTP 404 behavior. | Browser test `metadata, targets, and designed 404 are shipped`; live `/missing-polish-two` returned 404 with every required tag. |
| F-2-3 | Defined p95 before its first terminal and planner use: “The 95th-percentile (p95) startup time is the time that 95% of starts met.” | `.factory/copy-audit.md`; live demo screenshot; URL verifier text capture. The sentence has 13 words. |

## Clean-clone and live evidence

- Clean clone: `/tmp/scp-polish2-clean.psr9Ne` from commit `07be510`.
- Claims: all 16 exact `.factory/claims.json` commands passed separately.
- Full gates: 4 Vitest, 10 Rust, and 64 Playwright checks passed. TypeScript,
  Rust formatting, Clippy with warnings denied, release build, site build, and
  `cargo package` passed.
- Package: 11 files, 60.9 KiB unpacked and 17.0 KiB compressed.
- Accessibility: Playwright Axe found zero violations on root, demo, Privacy,
  Terms, 404, dark mode, and reduced motion. The factory URL verifier found no
  missing title, language, main landmark, alt text, or button label.
- Privacy/offline: complete demo traffic stayed same-origin. Demo storage used
  only `demo:sandbox-capacity-probe:scenario`. The offline claim used a new,
  independently closed browser context and reloaded cache version v6.
- Live Lighthouse 13.0.1: Performance 99, Accessibility 100, Best Practices
  100, SEO 100; LCP 1,220 ms, TBT 63 ms, CLS 0.074, 65,752 bytes transferred.
- Built first-load code: 9.78 kB JavaScript and 13.44 kB CSS before gzip.
- Live route crawl: root, demo, anchors, Privacy, and Terms returned 200. An
  unknown route returned the designed page with HTTP 404. No console or page
  errors were observed.

## Result

All cumulative review findings are closed in source, claims, clean-clone tests,
and the deployed product. There are no deferred minor items.
