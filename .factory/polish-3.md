# Polish round 3 — cumulative finding closure

**Work order:** `sandbox-capacity-probe-polish-3`

**Base review:** `479b7c820b367f791f1b6671bfcd173d283ebdc0`

**Repair commits:** `6d5ff5b`, `08ce750`

**Live:** https://sandbox-capacity-probe.sociobot.in/

**Demo:** https://sandbox-capacity-probe.sociobot.in/?demo=1#cli-demo

This pass read `review-1.md`, `review-2.md`, `review-3.md`, `polish-1.md`,
and `polish-2.md`. Every historical finding was rechecked. No finding remains
open.

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the actual bundled CLI recording immediately after the hero. `site/public/demo-output.txt` is captured CLI stdout; the test compares complete normalized stdout, the terminal recording, and both bundled JSON reports. | `@claim:cli-demo` passed from `/tmp/scp-polish3-final-pushed-8MvfvK`; live [demo recording](evidence/polish-3/live-final/demo.png) at the demo URL. |
| F-1-2 | The reviewer-approved alternative was implemented: removed the unavailable $39 purchase, hosted-checkout link, license state, merchant/refund copy, and their claims. The remaining planner and CSV export are free and accountless. | `@claim:free-planner` passed; live root audit asserted no `Planner Pro` text or checkout link; [desktop root](evidence/polish-3/live-final/root-desktop.png). |
| F-1-3 | Retained task-naming headings for the CLI sample, host measurement, containment, and planner. | `.factory/copy-audit.md`; live desktop root and demo audit; `npm test` passed. |
| F-1-4 | Retained one vocabulary: **planned workload** for probe input and **planner** for the local estimate. Removed obsolete saved-scenario/license terminology with the paid flow. | `.factory/copy-audit.md` terminology table; clean-clone `npm test` passed. |
| F-1-5 | Retained result-naming actions: Try sample data, Open the capacity planner, Copy, Export CSV, Reset demo, and Exit demo. | `.factory/copy-audit.md`; `@claim:demo-isolated` and `@claim:csv-export` passed. |
| F-1-6 | Retained concise README copy, plain p50/p95 definitions, and direct CLI instructions. | Complete README inventory in `.factory/copy-audit.md`; clean-clone `npm test` and `cargo package` passed. |
| F-1-7 | Updated the full copy audit for the free planner and current facts/actions. It covers landing copy, dynamic states/errors, terminal evidence, legal copy, and README sentences. | `.factory/copy-audit.md`; `npm run test:claims -- --grep '@claim:mit-license'` passed. |
| F-1-8 | Replaced the desktop-hidden `details` control with a visible four-link desktop navigation and an accessible Menu button only on mobile. Escape closes the mobile menu and returns focus to Menu. | Clean-clone browser test `demo route focuses the real CLI sample and mobile navigation keeps four links`; [mobile menu](evidence/polish-3/live-final/root-mobile-menu.png); live 390 px audit recorded `scrollWidth === 390`. |
| F-2-1 | Retained shared route focus and polite route announcement. Internal page navigation and Back/Forward focus the new route heading; direct demo focuses the CLI sample heading. | Clean-clone browser test `document navigation and Back focus and announce the new route`; live demo audit observed focus on `#cli-demo-title`. |
| F-2-2 | Retained a designed HTTP 404 with its own title, description, canonical, social metadata, legal links, and way home. | Live `https://sandbox-capacity-probe.sociobot.in/does-not-exist` returned HTTP 404 with `Page not found — Sandbox Capacity Probe`, one `h1`, and Axe 0; [404 screenshot](evidence/polish-3/live-final/404.png). |
| F-2-3 | Retained the p95 definition before the terminal sample and planner use it. | `.factory/copy-audit.md`; live demo audit and [demo screenshot](evidence/polish-3/live-final/demo.png). |
| F-3-1 (reopens F-1-2) | Removed all paid and checkout promises because the public provider returned 503. No visitor is asked to buy a product that cannot be purchased. | Final 12-claim manifest contains no checkout claim; live root audit found no pricing, `Planner Pro`, or checkout anchor; CSP has `connect-src 'self'`. |
| F-3-2 (reopens F-1-8) | Made all four header links visible, in the viewport, and keyboard-reachable on desktop. Mobile keeps the same links behind an operable Menu button. | Live 1440 × 900 audit measured four visible header links; mobile audit and screenshot above; clean-clone navigation test passed. |
| F-3-3 | Reduced and reshaped the hero so all three required facts are part of the first screen on both required viewports. The current facts are privacy, offline availability, and free/export access. | Clean-clone browser test `first screen facts remain visible`; live 1440 × 900 and 390 × 844 audits measured every fact within the viewport; root screenshots above. |
| F-3-4 | Wrapped runtime network creation so a failure removes the process-specific temporary directory, including a combined cleanup error if removal itself fails. Extended the fake-runtime test to fail `network create` and assert no directory leak. | `@claim:cli-isolated-cleanup` passed separately from the final clean clone; Rust unit/integration tests and `npm test` passed. |

## Final evidence

- Every `.factory/claims.json` command passed separately from
  `/tmp/scp-polish3-final-pushed-8MvfvK` at pushed commit
  `19a57b4d59274ac4e447be900437f3cfd8bcc2e5`.
- Full final clean-clone suite: `npm ci`, typecheck, lint, `npm test`, build,
  and `cargo package` all passed. `npm test` includes 54 Playwright checks.
- Live factory URL verifier passed root, demo, Privacy, and Terms with zero
  normal-route console errors.
- Playwright Axe recorded zero violations on root desktop, root mobile, demo,
  Privacy, Terms, and 404.
- Final deployment `23acc9d7-e4cc-46d6-b340-56d9d8134597` serves cache version
  `capacity-probe-shell-v7`.

The intentional HTTP 404 document makes Chrome report a network error for the
404 response itself; it is not a page-script error. The 404 is required to
retain its HTTP status and has zero Axe violations.
