# Handoff — Sandbox Capacity Probe 0.1.0

## Independent verification status — FAIL (2026-08-29)

Candidate `7e77ece9e21aad70ccfb8c57ec349a33bc28993b` was independently verified
against https://sandbox-capacity-probe.sociobot.in/. The deployment is byte-for-
byte the candidate build; this is **not** a deployment-only failure.

Do not release this candidate. The mandatory `.factory/claims.json` and
`.factory/demo.md` are missing, and neither the landing page nor `scp` provides
the required one-click/sample-data demo (`scp --demo` exits 2). The cold first
screen also fails the plain-words first-read gate. Additional high findings are
planner validation that emits commands rejected by the CLI, no observed 429 /
`Retry-After` after 30 license-verify requests, and no CSP/frame-ancestor
header. See `.factory/verification.md` for all evidence, passing checks, and
defects by severity.

## What shipped

- A Rust single-binary CLI (`scp`) for bounded Docker or Podman capacity sweeps.
- Exact target confirmation, production-like target/context refusal, numeric hard caps, localhost-only published ports, a labeled internal network, trusted-image override, cleanup on success/error/Ctrl-C, CI-safe behavior, JSON output, and documented exit codes.
- Runtime evidence: per-level startup p50/p95, published binding counts, optional Docker/Podman firewall-rule counts when host tools are readable, a conservative fitted prediction, and `comfortable` / `watch` / `exceeded` envelopes.
- `scp explain` for saved reports and `scp compare` to measure a later controlled run against the brief’s ≤25% prediction-error target.
- A responsive static documentation site with an interactive local scenario planner, command generation/copy, ungated CSV export, offline shell, privacy and terms pages, and light/dark treatments.
- Planner Pro at $39 one-time through the Sociobot hosted checkout. Returned/pasted licenses are stored locally, verified on first unlock and at most daily, optimistically restored from a cached valid verdict, and reconciled without blocking the free experience. Pro adds five locally saved comparison scenarios; safety and export stay free.
- Original topographic hero art generated with `/opt/fleet/lib/gen-image.sh` using the `factory-image` deployment. Final prompt metadata is in `site/public/topographic-envelope.prompt.json`; responsive WebP variants are 50,986 and 238,934 bytes.

## Run and verify

```sh
npm install
npm test
npm run build
cargo package --manifest-path cli/Cargo.toml
```

`npm run build` produces the release CLI at `target/release/scp` and the deployable static site at `dist/site/` (with `dist/site/index.html` at its root). `cargo package` produces a verified 0.1.0 crate containing the README.

Completed locally on 2026-08-28:

- `npm test`: passed (3 planner unit tests, 6 CLI unit tests, the opt-in runtime integration harness with no runtime configured, and 8 Playwright checks across desktop/mobile Chromium).
- `npm run build`: passed; release binary 1.6 MB.
- `cargo clippy --all-targets -- -D warnings`: passed.
- `cargo package`: passed; package 15 KB compressed.
- `npm audit`: 0 vulnerabilities.
- Factory `verify-url.sh`: HTTP 200, no console errors, title/lang/main present, one h1, all images have alt text, all buttons named.
- Lighthouse mobile: Performance 94, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 2.4 s, CLS 0, TBT 210 ms. Initial JS is about 6 KB raw and CSS about 11 KB raw.
- Original hero variants: 239 KB desktop and 51 KB mobile, both below the 300 KB budget.

## Known gaps and next steps

- This worker had no Docker or Podman executable/daemon, so the real runtime smoke test could not be executed here. The opt-in test is ready: `SCP_RUNTIME_TEST=docker cargo test --manifest-path cli/Cargo.toml --test runtime` (or `podman`). Run it on each supported release host before publishing.
- Host firewall evidence is best-effort because unprivileged Docker Desktop/rootless Podman hosts may not expose `iptables-save` or `nft`; the report clearly falls back to published bindings as the portable pressure proxy.
- The model is intentionally host- and shape-specific. Collect a subsequent report at the same shape and use `scp compare first.json second.json`; a mismatch exits 3.
- The factory must register the billing product and confirm the production return URL before launch. No product ID or payment-provider secret is embedded.
