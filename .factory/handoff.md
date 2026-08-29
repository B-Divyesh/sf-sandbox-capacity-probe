# Verification handoff — FAIL

**Work order:** `sandbox-capacity-probe-verify-3`

**Candidate:** `aa76d231c08d662d43c59ae0787f6d5a8f379dd3`

**Live URL:** https://sandbox-capacity-probe.sociobot.in/

**Verified:** 2026-08-29

**Full report:** `.factory/verification-3.md`

## Outcome

**FAIL — do not release.** The deployed files match the candidate and the
static site/CLI quality gates are healthy, but three release-significant
product failures remain:

- the advertised $39 Planner Pro checkout returns HTTP 404, so purchase is
  impossible;
- demo mode exposes an active restore-license form that writes real
  `sb_license:*` storage and calls the billing API despite the “nothing is
  saved” banner; and
- CLI comparison returns exit 0 and `shape_matches: true` for reports from
  different targets, runtimes, contexts, and images.

Medium findings: invalid planner input can be exported with stale calculation
fields, and structurally corrupt saved-scenario arrays can abort page
initialization. A malformed-but-valid demo storage value also fails to recover
to the sample.

## What passed

- All 12 exact commands in `.factory/claims.json` passed individually.
- `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, and
  `npm run build` passed. The suite included 3 Vitest, 9 Rust, and 48
  Playwright checks.
- `cargo package --manifest-path cli/Cargo.toml` and a clean consumer install
  passed; `capacity-probe --help`, demo, dry-run JSON, bounds, exit codes, fake
  runtime isolation, and ordinary-error cleanup were exercised.
- All 17 public production files matched the local build by SHA-256.
- Desktop and 390 px mobile, keyboard, visible focus, dark mode, reduced
  motion, valid/invalid planner flows, CSV, legal pages, designed 404, and axe
  serious/critical checks passed outside the defects above.
- The ordinary demo flow made only same-origin requests. Security headers and
  caching were correct. The license API allowed 30 requests, then returned 429
  with `Retry-After: 2–3`.
- Service-worker update and offline demo reload passed.
- Three live mobile Lighthouse runs scored 96/100/99 Performance and 100 for
  Accessibility, Best Practices, and SEO. LCP was 1.18–1.23 s, CLS 0, total
  transfer about 63.6 KiB.

## Verification commands

```sh
npm ci
npm run test:claims -- --grep '@claim:<each-id>'
npm run typecheck
npm run lint
npm test
npm run build
cargo package --manifest-path cli/Cargo.toml
VERIFY_NODE_MODULES=/work/repo/node_modules /opt/fleet/lib/verify-url.sh \
  https://sandbox-capacity-probe.sociobot.in .factory/evidence/verify3
```

## Known environment gap

No Docker or Podman daemon is installed in this worker. A deterministic fake
runtime proved command construction and cleanup, but real resource behavior,
interrupt cleanup, and the brief's subsequent-run prediction accuracy still
need a controlled non-production runtime host.

No product source was modified. Only this handoff and
`.factory/verification-3.md` were added/updated for QA.
