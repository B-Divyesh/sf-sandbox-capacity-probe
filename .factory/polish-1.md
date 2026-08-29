# Polish round 1 — all review findings closed

**Work order:** `sandbox-capacity-probe-polish-1`
**Review commit:** `1574eb7e81c86256e752137024fcea3021681261`
**Repair source commit:** `86ebbc8a`
**Deployment:** `ac4aaa7d-3881-4859-9e9f-5276e364f302`
**Live URL:** https://sandbox-capacity-probe.sociobot.in/
**Demo URL:** https://sandbox-capacity-probe.sociobot.in/?demo=1#cli-demo

Every finding in `.factory/review-1.md` is resolved. No earlier
`.factory/review-*.md` or `.factory/polish-*.md` file exists before this round.
The review's historical table was also checked; none of those repaired defects
has returned.

## Finding map

| Finding | Change made | Exact evidence |
| --- | --- | --- |
| F-1-1 | Added “Run the CLI sample without a runtime” directly after the hero. It is a self-hosted HTML terminal recording of `capacity-probe demo`, with replay, copyable command, real bundled measurements, and a temporary output path. `/demo-capacity.json` matches `cli/examples/demo-capacity.json` byte-for-data. `?demo=1#cli-demo` focuses this section while also loading the isolated planner sample. | `@claim:cli-demo` runs the binary, validates its temporary report, compares both shipped JSON files, and checks the visible recording values. Clean-clone claim pass. [Desktop recording](evidence/live-demo-cli-desktop.png), [mobile recording](evidence/live-demo-cli-mobile.png), and the live demo URL above. |
| F-1-2 | Removed the unprovable refund-revocation and merchant automation statements. Added discrete claims for the $39 one-time price, hosted checkout, account-free planner, and unlicensed CLI/JSON/CSV paths. The remaining refund copy only directs questions to support. | `@claim:planner-pro-price`, `@claim:planner-pro-checkout`, `@claim:planner-pro-no-account`, and `@claim:planner-pro-free-features` each select exactly one test. The live checkout redirected to a 200 Dodo session naming Sandbox Capacity Probe, `$39.00`, and `one-time`. |
| F-1-3 | Replaced every abstract section heading with a task name: host measurement, startup-time measurement, budget comparison, report comparison, containment, workload planning, saved scenarios, and license restoration. | Browser test `demo route focuses the real CLI sample and mobile navigation keeps four links`; live cold check found none of the old headings; `.factory/copy-audit.md` inventories each new heading. |
| F-1-4 | Standardized planner inputs and container configuration as **planned workload**. Standardized every saved paid item as **scenario**. Updated landing copy, empty state, CLI help/output, README, and terminology table. | `rg` terminology audit found no old task-copy use of route, shape, contour, slope, or station. `@claim:planner-pro-five` saved six scenarios and proved only the latest five remain. |
| F-1-5 | Renamed actions to “Open the capacity planner,” “Buy Planner Pro for $39,” “Exit demo and use your data,” “Restore Planner Pro access,” and “Save current scenario.” | `@claim:demo-isolated` exercises reset and exit; `@claim:planner-pro-checkout` finds the renamed buy action; `.factory/copy-audit.md` lists every action with its word count. |
| F-1-6 | Rewrote the README into short, direct sentences. Defined p50 and p95 at first use. Replaced synthetic-sweep, runtime-context, least-squares, merchant, and shape shorthand in task prose. | `.factory/copy-audit.md` lists every README heading and sentence. Maximum sentence length is 22 words; banned-word and terminology searches are clear. Documented commands pass Rust, browser, package, build, or claim tests. |
| F-1-7 | Replaced the partial audit with a complete inventory of landing prose, headings, navigation, actions, labels, facts, states, errors, terminal evidence, and every README sentence. Added the one-word terminology table. | `.factory/copy-audit.md`; browser test `every declared claim has exactly one tagged browser test`; all 16 manifest commands passed separately from `/tmp/scp-polish-clean-20260829`. |
| F-1-8 | Removed the fifth purchase link from the header. Added an accessible four-link `details` menu on phones; the purchase action now appears only in the paid section. | Browser test `demo route focuses the real CLI sample and mobile navigation keeps four links` ran in desktop and 390 px projects. Live 390 × 844 check found four visible menu links and `scrollWidth === 390`. |

## Additional required acceptance checks

| Area | Evidence |
| --- | --- |
| First screen | Cold root keeps the five-word job headline, 19-word audience sentence, sample action, result note, and three short facts. The action now opens the real CLI evidence and isolated scenario. |
| Demo isolation | `@claim:demo-isolated` uses real-data sentinels, proves no billing request or real-key mutation during demo, resets the sample, exits, and proves the demo key is removed. |
| Claims | `.factory/claims.json` contains 16 unique claims. A manifest test proves one tag per claim. Every exact command passed separately from the clean clone. |
| Titles and metadata | Live root title is “Sandbox Capacity Probe — Measure container capacity”; demo, privacy, terms, and 404 have route-specific titles. Canonical, description, social card, favicon, theme color, and language checks pass. |
| Routing and focus | Root, query demo, privacy, and terms return 200. An unknown path returns the designed page with HTTP 404. Demo navigation focuses `#cli-demo-title`. Skip-link focus and keyboard sliders pass. |
| Legal and links | Privacy and Terms are linked from every footer. A live crawl returned 200 for all internal pages, the source repository, demo, and hosted checkout. |
| Accessibility | All 62 Playwright checks passed in desktop and mobile projects. `@axe-core/playwright` found zero violations on root, demo, privacy, terms, 404, and dark/reduced-motion states. Factory `verify-url.sh` found no console errors or missing semantics on every 200 route. |
| Mobile | 390 px root and demo have no horizontal page overflow. Targets remain at least 44 px. The terminal alone scrolls horizontally for literal output. |
| Privacy and offline | Demo requests remain same-origin. CLI demo works behind unreachable proxy settings. The service worker cache `capacity-probe-shell-v5` reloads the demo offline in its own browser context. |
| Performance | Live Lighthouse 12.8.2: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1,220 ms, TBT 47 ms, CLS 0, transfer 65,059 bytes. Built JS is 9.85 kB raw and CSS is 13.21 kB raw. |
| Packaging | `cargo package --manifest-path cli/Cargo.toml --allow-dirty` passed: 11 files, 60.6 KiB unpacked, 16.9 KiB compressed. |

## Screenshots

- [Live desktop CLI demo](evidence/live-demo-cli-desktop.png)
- [Live 390 px CLI demo](evidence/live-demo-cli-mobile.png)
- [Local desktop CLI demo](evidence/demo-cli-desktop.png)
- [Local 390 px CLI demo](evidence/demo-cli-mobile.png)

## Result

All eight findings are closed at source, test, clean-clone, and live-deployment
levels. No finding of any severity remains open.
