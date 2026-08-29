# Independent verification — FAIL

**Candidate:** `7e77ece9e21aad70ccfb8c57ec349a33bc28993b`  
**Live URL:** https://sandbox-capacity-probe.sociobot.in/  
**Verified:** 2026-08-29 (fresh checkout; no product code changed)

## Release decision

**FAIL.** This is the candidate currently deployed: SHA-256 matched for the live
`index.html`, JS/CSS assets, legal pages, service worker, and hero image against
the fresh `dist/site` build. It is therefore not a deployment-only failure.

The mandatory claims contract is absent, the required one-click sample demo is
absent from both the landing screen and the CLI, and the cold first screen does
not state the intended audience or a plain first action. Any one of those is a
release blocker.

## Mandatory claims and demo gate

- `.factory/claims.json` is **missing**. It was checked before any test work.
  Therefore there were no listed claim commands to run; per the acceptance
  contract this itself is release-blocking. Claims visible in product copy (for
  example “No telemetry”, “Bounded by default”, local results, and offline
  shell) have no required observable claim tests.
- `.factory/demo.md` is also missing.
- The live cold first screen has headline **“Find the edge before your fleet
  does.”** Its prose conveys a Docker/Podman capacity measurement, but does not
  say who it is for in plain words. Its actions are “Run your first survey” and
  “Map a scenario”; neither is “Try it with sample data” or an equivalent
  one-click safe demo. `scp --demo` exits 2: `unexpected argument '--demo'
  found`. There is no persistent demo banner, demo namespace, reset action, or
  bundled sample run.

## Checks that passed

- Clean install: `npm ci` completed with 0 vulnerabilities.
- `npm test` passed: 3 Vitest tests, 6 Rust unit tests, the opt-in runtime test
  harness (it skipped real runtime work because `SCP_RUNTIME_TEST` was unset),
  and 8 Playwright desktop/mobile checks.
- Exact production build: `npm run build` passed and produced `dist/site/` and
  `target/release/scp`. `cargo fmt -- --check` and `cargo clippy --all-targets
  -- -D warnings` passed. There is no TypeScript project config; Vite production
  transpilation/build passed.
- Packaging/consumer check: `cargo package --manifest-path cli/Cargo.toml
  --allow-dirty` verified a 51.8 KiB crate (14.8 KiB compressed). Installing
  that extracted crate into a clean temporary Cargo root succeeded, and its
  installed `scp` produced the expected JSON dry-run report.
- CLI normal/boundary/safety checks:
  - normal 8-container dry run exited 0 with levels `[2,4,6,8]`;
  - maximum bounded plan (64 containers × 16 ports × 16 mounts × 10 samples)
    exited 0 and declared 640 maximum starts / 1,024 maximum ports;
  - 65 containers, mismatched `--confirm`, and `production-west` without an
    override each exited 2 with useful errors;
  - unavailable Docker returned a useful exit-2 error. No Docker or Podman
    daemon was available here, so a real synthetic-container sweep remains
    unverified.
- Live planner: changing the plan to 64 containers × 16 ports showed 1,024
  bindings and 4,439 ms exceeded; CSV download contained the header and that
  row. Keyboard focus was visible (3 px teal outline), no trap was observed,
  390 px mobile had no horizontal overflow, and reduced motion reduced the
  hero animation/transition to `0.00001s` with `scroll-behavior: auto`.
- Playwright axe on `/`, `/privacy/`, and `/terms/` found no serious or critical
  violation; no console/page errors occurred. Axe did report one moderate
  `landmark-complementary-is-top-level` violation on `/`.
- Fresh live request logging through planner interaction and CSV export found
  only the product origin. No external font/script/analytics request occurred
  until a user would explicitly restore a license. Offline reload succeeded
  after service-worker installation; the active cache was `scp-shell-v1` and
  the controlled page reloaded offline without errors. A no-change
  `registration.update()` left that active worker in place, as expected.
- Bundle and cache checks: initial JS is 5.85 kB raw / 2.61 kB gzip total, CSS
  is 10.58 kB raw / 3.36 kB gzip, and the mobile hero variant is 50,986 bytes.
  These are below stated budgets. Hashed assets and WebP have
  `Cache-Control: public, max-age=31536000, immutable`.

## Defects

### Blocker

1. **No claims manifest or claim tests.** `.factory/claims.json` is absent, so
   the required clean-demo evidence for every visitor-facing claim cannot run.
   Add the manifest and one tagged observable test per claim; then run every
   listed command from the demo entry point.
2. **No one-click, isolated sample demo.** The live first screen and the shipped
   CLI do not provide “Try it with sample data” / `scp demo` or `scp --demo`.
   There is no demo storage namespace or `.factory/demo.md`. Ship a realistic
   bundled CLI sample that writes its output in a temp directory and a landing
   recording/one-click entry point, with reset/start-real semantics as required.
3. **Cold first-read requirement fails.** The metaphor headline does not plainly
   identify the job or user, the screen does not name teams operating isolated
   agent/customer containers, and it provides no sample-demo first click.

### High

1. **Invalid planner values generate invalid CLI commands with no recovery.**
   Live tests accepted blank budget as `0`, `budget=49`, and `baseline=60001`.
   The planner recalculated (for example `--startup-budget-ms 49`) even though
   browser validity reports a range error. The generated command will be
   rejected by `scp` (which requires 50–60,000), and no inline/announced error
   explains how to recover. Validate/clamp before calculation/command export,
   preserve the last valid result, and announce a corrective error.
2. **License verification has no observable rate limit.** Thirty sequential
   requests from this one verifier client to
   `GET /api/v1/products/sandbox-capacity-probe/verify?license=qa-invalid-capacity-probe-token`
   all returned `200` invalid; none returned `429` or a `Retry-After` header.
   The documented allowance is not stated in the product, and an allowance
   beyond 30 could not be observed. Enforce and document a per-client limit;
   confirm the first over-limit response is 429 with `Retry-After`.
3. **Security headers are incomplete.** Live `/`, legal routes, assets, and
   `sw.js` omit `Content-Security-Policy` entirely, including response-header
   `frame-ancestors`. This fails the site-structure security requirement.

### Medium

1. **Touch target contract is not met.** Measured live controls include Method
   (60×22), Planner (61×22), range inputs (32 px high), Copy command (39 px
   high), and several footer/legal links (16–25 px high). The required target
   size is at least 44×44 CSS px.
2. **Accessibility semantic issue.** Axe reports
   `landmark-complementary-is-top-level` on the landing route because the
   labelled license `<aside>` is nested in a section. Resolve the landmark
   structure (or use a non-landmark element) and re-run axe.
3. **No real 404 route.** `/404.html` and arbitrary unknown paths return 200 and
   render the landing page/h1, not a styled 404 with a way back. Add the
   required 404 asset and response override.
4. **Required site metadata/skeleton pieces are incomplete.** The landing page
   has no canonical URL, Open Graph/Twitter metadata, apple-touch icon, or
   footer text “Built by Param Factory”; legal headers also lack the consistent
   required navigation. These should be completed with the visual system.

## Privacy, headers, deployment, and API evidence

- Live document response: 200; `Referrer-Policy: strict-origin-when-cross-origin`,
  `X-Content-Type-Options: nosniff`, HSTS, and Permissions-Policy are present.
  CSP/frame protection is absent.
- The planner does not send data while used normally. Its license verification
  correctly targets the documented Sociobot API only after a user supplies a
  token, but the endpoint allowance check above fails.
- The product uses no sign-in, so Entra tenant verification is not applicable.
- No product server endpoint besides the external license verification was
  present. The static deployment, hashes, and `Last-Modified` date prove the
  live files are this candidate build.

## Reproduction commands

```sh
npm ci
npm test
npm run build
cargo fmt --manifest-path cli/Cargo.toml -- --check
cargo clippy --manifest-path cli/Cargo.toml --all-targets -- -D warnings
target/release/scp probe --target dev-laptop --confirm dev-laptop \
  --containers 8 --ports-per-container 2 --mounts 1 --samples 2 --dry-run --json
target/release/scp --demo  # exits 2; confirms missing CLI demo
```

Live browser audit used Playwright 1.58.2 with fresh desktop and 390 px mobile
contexts, request/console logging, `@axe-core/playwright`, keyboard traversal,
reduced motion, service-worker offline reload, and CSV download assertions.
