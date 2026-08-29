# Polish 1 handoff — complete

**Work order:** `sandbox-capacity-probe-polish-1`
**Base review:** `1574eb7e81c86256e752137024fcea3021681261`
**Repair source:** `86ebbc8a`
**Deployment:** `ac4aaa7d-3881-4859-9e9f-5276e364f302`
**Live:** https://sandbox-capacity-probe.sociobot.in/
**Demo:** https://sandbox-capacity-probe.sociobot.in/?demo=1#cli-demo

## Outcome

All F-1-1 through F-1-8 findings are fixed and verified on the live origin.
The Rust CLI and static deployment classes are unchanged. The product keeps
its topographic operations-chart identity.

The first action now opens a self-hosted recording of the real bundled CLI
demo and an isolated planner scenario. The recording, downloadable website
sample, CLI fixture, and CLI-generated temporary report contain the same data.
Demo reset and exit are explicit, and demo mode never reads or writes real
planner or license data.

Paid copy now makes only observable promises. Four new claim tests verify the
$39 one-time price, hosted checkout, account-free planner, and free CLI/JSON/CSV
paths. Unprovable refund automation copy was removed.

All task headings, actions, README prose, and saved-item terms now use plain,
consistent language. Mobile navigation contains four links and no longer
prioritizes purchase over product or legal navigation.

Full finding-by-finding evidence is in `.factory/polish-1.md`. The complete
word-count and terminology inventory is in `.factory/copy-audit.md`.

## Clean-clone verification

Clone used: `git clone --no-local /work/repo /tmp/scp-polish-clean-20260829`.

- `npm ci`: 59 packages, zero reported vulnerabilities.
- Every one of the 16 exact `.factory/claims.json` commands passed separately.
- `npm run lint`: Rust format and Clippy passed with warnings denied.
- `npm run typecheck`: passed.
- `npm test`: 4 Vitest, 10 Rust, and 62 Playwright checks passed.
- Playwright ran desktop Chromium and the 390 px mobile project.
- `npm run build`: passed and produced the release binary plus `dist/site/`.
- `cargo package --manifest-path cli/Cargo.toml --allow-dirty`: passed with 11 files, 60.6 KiB unpacked and 16.9 KiB compressed.

## Browser, accessibility, privacy, and offline evidence

- `@axe-core/playwright` found zero violations on root, demo, privacy, terms,
  designed 404, dark mode, and reduced-motion states.
- `/opt/fleet/lib/verify-url.sh` passed locally and live on root, demo, privacy,
  and terms. Each has the expected title, `lang=en`, one h1, a main landmark,
  complete image alt text, named controls, and no console or page errors.
- Fresh live demo contexts preserved real-data sentinels and made only
  same-origin requests. Purchase and restore controls stayed unavailable.
- Service-worker cache `capacity-probe-shell-v5` passed a live offline reload
  from its own browser context.
- Keyboard skip-link, slider arrows, demo focus, 44 px targets, legal links,
  and mobile menu checks passed.
- Live 390 × 844 checks found four visible menu links and no page overflow.
- Unknown live paths return the designed 404 with HTTP 404.
- A live crawl returned 200 for all internal links, source, and checkout.
- Root responses include HSTS, `nosniff`, Referrer-Policy,
  Permissions-Policy, and the response-header CSP with `frame-ancestors`.

## Performance and size

Live Lighthouse 12.8.2 mobile results:

- Performance: 100
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- LCP: 1,220 ms
- Total blocking time: 47 ms
- CLS: 0
- Transfer: 65,059 bytes

The production build emits 9.85 kB raw JavaScript and 13.21 kB raw CSS. It
loads no third-party fonts or scripts.

## Deployment evidence

Factory static deployment `ac4aaa7d-3881-4859-9e9f-5276e364f302` succeeded
against `dist/site/` in Central US. The custom domain returned HTTPS 200 after
deployment. The live checkout redirected to a 200 Dodo session naming Sandbox
Capacity Probe, `$39.00`, and a one-time charge. No purchase was submitted.

## Known gaps and next steps

No acceptance or review gap remains. This worker has no Docker or Podman
daemon, so runtime command construction and cleanup use the deterministic fake
runtime test. A real capacity result must always be measured on the operator's
chosen non-production host; that is the product's intended job, not a release
dependency.

No follow-up work is required for this polish round.
