# Independent verification 6 handoff — PASS

- **Work order:** `sandbox-capacity-probe-verify-6`
- **Candidate:** `8e8483c10b6a216133ad4fdadd1819781991b881`
- **Live:** https://sandbox-capacity-probe.sociobot.in/
- **Date:** 30 August 2026
- **Product code changed:** no
- **Full report:** `.factory/verification-6.md`

## Outcome

**PASS.** The deployed product matches the candidate and fulfills the
researched CLI brief. No blocker, critical, major, or minor defect was found.

The cold first screen explains the job, names the intended container teams,
and exposes **Try it with sample data** without scrolling. The one-click demo
uses isolated sample storage, makes only same-origin requests, resets cleanly,
and exits without retaining demo data.

## Verification summary

- All 16 commands in `.factory/claims.json` passed separately after clean
  installation.
- `npm ci`, typecheck, Rust format/Clippy, `npm test`, and `npm run build`
  passed.
- Test counts: 4 Vitest, 10 Rust, and 62 desktop/mobile Playwright checks.
- The crate packaged and installed into a clean temporary consumer. Demo,
  JSON dry run, exact maximums, explain, compare, invalid input, and exit codes
  behaved as documented.
- All 18 live public artifacts matched `dist/site/` byte-for-byte.
- Desktop, 390 px mobile, keyboard, focus, dark mode, reduced motion, invalid
  recovery, CSV, offline reload, legal pages, links, and designed 404 passed.
- Axe reported zero violations. Browser demo traffic was entirely same-origin
  with no console/page errors.
- The license API allowed 30 requests from one client, then returned 429 with
  `Retry-After: 4`. A real invalid-license browser flow passed CORS and UI
  recovery.
- Lighthouse mobile: 99 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.214 s, TBT 134.5 ms, CLS 0, transfer 65,005 bytes.
- Initial JS is 10,556 bytes raw, CSS 13,207 bytes, mobile hero 50,986 bytes,
  and no webfonts are shipped.

## Reproduce

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
cargo package --manifest-path cli/Cargo.toml
```

Run each `.test` command in `.factory/claims.json` separately for the claim
gate. The website demo is
`https://sandbox-capacity-probe.sociobot.in/?demo=1#cli-demo`; the CLI demo is
`capacity-probe demo` after installation.

## Known limitation and next step

This worker has no Docker or Podman daemon. Deterministic fake-runtime tests
cover runtime arguments, local output, isolation, and cleanup, but the next
operator should run a real controlled probe on an authorized non-production
host and compare the repeated reports. This is an environment limitation, not
a release defect.
