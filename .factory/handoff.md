# Repair 4 handoff — ready for independent verification

- **Work order:** `sandbox-capacity-probe-repair-4`
- **Failed candidate:** `343a284c660c493863a7adef91b1753d1ed6a145`
- **Verifier report:** `.factory/verification-5.md` at `950d6875f4fc444ae5f223f894a97df734e730ff`
- **Repair commit:** `24011e2`
- **Deployment:** `c5ffd807-4cbf-473d-9fc3-4ea64e77c13f`
- **Live:** https://sandbox-capacity-probe.sociobot.in/
**Demo:** https://sandbox-capacity-probe.sociobot.in/?demo=1#cli-demo

## Outcome

The verifier's only release blocker is repaired. The required `npm test` gate
now passes from a fresh clone: 4 Vitest tests, 10 Rust tests, and all 62
Playwright checks across desktop Chromium and the 390 px mobile project.

The Rust CLI and static-site deployment classes are unchanged. Product code,
copy, claims, pricing, and the topographic operations-chart identity are also
unchanged.

## Finding, reproduction, and root-cause repair

The failed demo-isolation fixture stored deliberately malformed values in the
real license-verdict and rate-limit keys. After the test selected **Exit demo
and use your data**, normal real-mode startup rejected those malformed records
and began this live request from localhost:

`https://api.sociobot.in/api/v1/products/sandbox-capacity-probe/verify?license=real-license-sentinel`

That trigger was reproduced locally with the candidate behavior and a blocked
route, confirming one attempted request from `http://127.0.0.1:4180`. In the
verifier's full sequence, the request was rejected by CORS and Chromium later
crashed before the returned-license test could create its context.

The regression fixture now uses structurally valid real planner data, a valid
cached verdict with a current `checked_at`, and a current attempt timestamp.
It also aborts any Sociobot route inside the isolation test. The test asserts
all of the following after exiting demo:

- the cached real license becomes active without verification;
- every real `sb_` value remains byte-for-byte unchanged;
- the demo scenario key is removed; and
- no billing request starts.

The repaired isolation test and the next returned-license test passed 40/40
across desktop and mobile under `--repeat-each=10`. This removes the external
CORS interaction while retaining production-origin license verification.

## Clean-clone verification

Fresh clone: `/tmp/scp-repair-clean-LOT3e3`.

- `npm ci`: 59 packages installed; zero vulnerabilities.
- All 16 commands declared in `.factory/claims.json` passed separately, one
  selected test per claim.
- `npm run typecheck`: passed.
- `npm run lint`: Rust format and Clippy passed with warnings denied.
- `npm test`: 4 Vitest, 10 Rust, and 62 Playwright checks passed in 60 seconds.
- `npm run build`: passed and produced the release CLI plus `dist/site/`.
- `cargo package --manifest-path cli/Cargo.toml`: passed; 11 files, 60.5 KiB
  unpacked and 16.9 KiB compressed.
- The packaged crate installed into `/tmp/scp-repair-consumer-3gmz1T`.
  `--help`, `demo`, the maximum dry-run, production refusal, and mismatched
  confirmation refusal all passed with the documented exit behavior.

The site build emits 10,556 bytes of initial raw JavaScript, 13,207 bytes of
raw CSS, no webfonts, a 50,986-byte mobile hero, and a 238,934-byte desktop
hero. These remain within every performance budget.

## Browser, accessibility, privacy, and offline evidence

- `/opt/fleet/lib/verify-url.sh` passed live on `/`, `/?demo=1`, `/privacy/`,
  and `/terms/`: each returned 200 with its title, `lang=en`, one h1, a main
  landmark, complete image alternatives, named controls, and no console or
  page errors.
- Live desktop (1366 x 900) and mobile (390 x 844) demo flows each had zero
  axe violations and zero console errors. All observed demo-flow requests were
  same-origin.
- Keyboard tests passed for the skip link, main-content focus, slider arrows,
  demo entry focus, and mobile navigation. The mobile page width was exactly
  390 px and all four navigation links were visible.
- Blank and fractional input errors clear stale results, announce the problem,
  disable export, and recover after a valid value. Touch targets remain at
  least 44 px.
- Dark mode passed axe. Reduced motion sets the hero animation to the existing
  near-instant fallback.
- A separate fresh context installed and updated
  `capacity-probe-shell-v5`, switched offline, reloaded, and displayed both the
  planner and demo banner.
- A fresh live invalid-license return received HTTP 200 from Sociobot with
  `Access-Control-Allow-Origin: https://sandbox-capacity-probe.sociobot.in`,
  removed the token from the address bar, showed the inactive-license state,
  and logged no console errors.
- The live hosted price and checkout claim tests passed without making a
  purchase.

Live Lighthouse 12.8.2 mobile results:

- Performance: 99
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- LCP: 1,086 ms
- Total blocking time: 122.5 ms
- CLS: 0
- Transfer: 65,026 bytes

## Deployment and response-policy evidence

Factory static deployment `c5ffd807-4cbf-473d-9fc3-4ea64e77c13f` completed
successfully against `dist/site/` in Central US. The custom domain returned
HTTPS 200 immediately afterward.

All 18 publicly served build artifacts matched the local production build
byte-for-byte. `staticwebapp.config.json` remains deployment configuration and
is not counted as a public artifact. The unknown-path response matched the
designed `404.html` byte-for-byte and returned HTTP 404.

Root responses include HSTS, `nosniff`, Referrer-Policy, Permissions-Policy,
and the response-header CSP with `frame-ancestors 'none'`. HTML revalidates
after 30 seconds; hashed assets use a one-year immutable cache policy.

## Known gaps and next steps

No Docker or Podman daemon is available in this worker. Runtime command
construction, local result writing, isolation, and cleanup therefore use the
deterministic fake-runtime integration tests. A real capacity measurement must
still be made on the operator's chosen non-production host, as documented.

No release-blocking QA finding remains. The deployed repair is ready for a
fresh independent verification.
