import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const cli = resolve("target/debug/capacity-probe");

function runCli(args: string[], env: NodeJS.ProcessEnv = process.env) {
  return spawnSync(cli, args, { encoding: "utf8", env });
}

function fakeRuntimeFixture() {
  const fixture = mkdtempSync(join(tmpdir(), "capacity-probe-runtime-"));
  const fakeRuntime = join(fixture, "docker");
  const log = join(fixture, "runtime.log");
  writeFileSync(fakeRuntime, `#!/bin/sh
printf '%s\\n' "$*" >> "$FAKE_RUNTIME_LOG"
case "$*" in
  "--version") echo "Docker fake" ;;
  "context show") echo "staging-test" ;;
  "run "*) if [ "$FAKE_RUNTIME_FAIL_RUN" = "1" ]; then echo "synthetic failure" >&2; exit 1; else echo "container-id"; fi ;;
  "inspect --format {{.State.Running}} "*) echo "true" ;;
esac
exit 0
`);
  chmodSync(fakeRuntime, 0o755);
  return {
    fixture,
    log,
    env: { ...process.env, PATH: `${fixture}:${process.env.PATH}`, FAKE_RUNTIME_LOG: log }
  };
}

test("core planner works without a license and has no serious accessibility issues", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("main")).toBeVisible();
  await page.locator("#containers").fill("20");
  await expect(page.locator("#binding-count")).toHaveText("40");
  await expect(page.locator("#generated-command")).toContainText("--containers 20");
  await expect(page.locator("#export-csv")).toBeEnabled();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("@claim:demo-isolated loads sample data in its own namespace and resets it", async ({ page }) => {
  const billingRequests: string[] = [];
  await page.route("https://api.sociobot.in/**", (route) => route.abort("blockedbyclient"));
  page.on("request", (request) => {
    if (request.url().startsWith("https://api.sociobot.in/")) billingRequests.push(request.url());
  });
  const checkedAt = Date.now();
  const realData = {
    "sb_scenarios:sandbox-capacity-probe": JSON.stringify([{
      containers: 8,
      ports: 2,
      mounts: 1,
      baselineMs: 220,
      budgetMs: 1200,
      predictedMs: 303,
      status: "comfortable"
    }]),
    "sb_license:sandbox-capacity-probe": "real-license-sentinel",
    "sb_license_verdict:sandbox-capacity-probe": JSON.stringify({
      valid: true,
      reason: "ok",
      checked_at: checkedAt
    }),
    "sb_license_verify_attempt:sandbox-capacity-probe": String(checkedAt)
  };
  await page.addInitScript((entries) => {
    for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, value);
  }, realData);
  await page.goto("/?demo=1#planner");
  await expect(page).toHaveTitle("Demo — Sandbox Capacity Probe");
  await expect(page.locator("#demo-banner")).toBeVisible();
  await expect(page.locator("#containers")).toHaveValue("24");
  await expect(page.locator("#license-form")).toBeHidden();
  await expect(page.locator("[data-real-only]")).toHaveCount(1);
  await expect(page.locator("[data-real-only]:visible")).toHaveCount(0);
  await page.evaluate(() => {
    const input = document.querySelector<HTMLInputElement>("#license-token")!;
    input.disabled = false;
    input.value = "qa-demo-isolation-invalid";
    document.querySelector<HTMLFormElement>("#license-form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
  await expect(page.locator("#license-status")).toContainText("Demo mode cannot restore licenses");
  expect(await page.evaluate(() => Object.fromEntries(Object.entries(localStorage).filter(([key]) => key.startsWith("sb_"))))).toEqual(realData);
  expect(billingRequests).toEqual([]);
  expect(await page.evaluate(() => localStorage.getItem("demo:sandbox-capacity-probe:scenario"))).toContain('"containers":24');
  await page.locator("#containers").fill("30");
  await page.locator("#reset-demo").click();
  await expect(page.locator("#containers")).toHaveValue("24");
  expect(await page.evaluate(() => Object.fromEntries(Object.entries(localStorage).filter(([key]) => key.startsWith("sb_"))))).toEqual(realData);
  await page.locator("#start-real").click();
  await expect(page).toHaveURL("http://127.0.0.1:4173/");
  await expect(page.locator("#license-status")).toContainText("Planner Pro is active");
  expect(await page.evaluate(() => localStorage.getItem("demo:sandbox-capacity-probe:scenario"))).toBeNull();
  expect(await page.evaluate(() => Object.fromEntries(Object.entries(localStorage).filter(([key]) => key.startsWith("sb_"))))).toEqual(realData);
  expect(billingRequests).toEqual([]);
});

test("@claim:local-planner calculates the sample without a cross-origin request", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/?demo=1");
  await page.locator("#containers").fill("32");
  await expect(page.locator("#binding-count")).toHaveText("128");
  expect(requests.every((url) => new URL(url).origin === "http://127.0.0.1:4173")).toBe(true);
});

test("@claim:no-telemetry sends no third-party request while using the demo planner", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/?demo=1");
  await page.locator("#budget").fill("1800");
  await page.locator("#export-csv").click();
  expect(requests.every((url) => new URL(url).origin === "http://127.0.0.1:4173")).toBe(true);
  const demo = runCli(["--demo"], { ...process.env, HTTP_PROXY: "http://127.0.0.1:1", HTTPS_PROXY: "http://127.0.0.1:1" });
  expect(demo.status).toBe(0);
  expect(demo.stdout).toContain("no container runtime was contacted");
});

test("@claim:csv-export downloads the current scenario as CSV", async ({ page }) => {
  await page.goto("/?demo=1");
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#export-csv").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("sandbox-capacity-scenario.csv");
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(chunk);
  const csv = Buffer.concat(chunks).toString("utf8");
  expect(csv).toContain("containers,ports,mounts,baseline_ms,budget_ms,predicted_p95_ms,status,headroom_ms");
  expect(csv).toContain("24,4,2,240,1500");
});

test("@claim:offline-reload keeps the planner available after the first visit", async ({ page, context }) => {
  await page.goto("/?demo=1");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  expect(await page.evaluate(() => caches.keys())).toContain("capacity-probe-shell-v5");
  await page.evaluate(async () => { await (await navigator.serviceWorker.getRegistration())?.update(); });
  expect(await page.evaluate(() => caches.keys())).toContain("capacity-probe-shell-v5");
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator("#planner-title")).toBeVisible();
  await expect(page.locator("#demo-banner")).toBeVisible();
  await context.setOffline(false);
});

test("deployment policy has a response-header CSP and a real 404 override", () => {
  const config = JSON.parse(readFileSync("site/public/staticwebapp.config.json", "utf8")) as {
    globalHeaders: Record<string, string>;
    responseOverrides: Record<string, { rewrite: string; statusCode: number }>;
  };
  expect(config.globalHeaders["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
  expect(config.globalHeaders["Content-Security-Policy"]).toContain("connect-src 'self' https://api.sociobot.in");
  expect(config.responseOverrides["404"]).toEqual({ rewrite: "/404.html", statusCode: 404 });
});

test("every declared claim has exactly one tagged browser test", () => {
  const claims = JSON.parse(readFileSync(".factory/claims.json", "utf8")) as Array<{ id: string; test: string }>;
  const source = readFileSync("site/tests/site.spec.ts", "utf8");
  expect(new Set(claims.map(({ id }) => id)).size).toBe(claims.length);
  for (const claim of claims) {
    expect(claim.test).toBe(`npm run test:claims -- --grep '@claim:${claim.id}'`);
    expect(source.split(`@claim:${claim.id}`).length - 1, claim.id).toBe(1);
  }
});

test("keyboard navigation reaches the primary action and planner", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
  await page.locator("#containers").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#container-value")).toHaveText("13");
});

test("legal pages are available", async ({ page }) => {
  for (const path of ["/privacy/", "/terms/", "/404.html"]) {
    await page.goto(path);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main")).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  }
});

test("dark treatment has no serious accessibility violations", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/?demo=1");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  expect(await page.locator(".hero-image img").evaluate((image) => getComputedStyle(image).animationDuration)).toBe("1e-05s");
});

test("invalid numeric planner input clears stale output and disables export until recovery", async ({ page }) => {
  await page.goto("/");
  await page.locator("#budget").fill("");
  await expect(page.locator("#planner-error")).toContainText("p95 budget must be a whole number between 50 and 60,000 ms");
  await expect(page.locator("#prediction")).toHaveText("—");
  await expect(page.locator("#binding-count")).toHaveText("—");
  await expect(page.locator("#headroom")).toHaveText("—");
  await expect(page.locator("#generated-command")).toHaveText("Correct the planner inputs to create a command.");
  await expect(page.locator("#export-csv")).toBeDisabled();
  await expect(page.locator("#copy-command")).toBeDisabled();
  await page.locator("#budget").fill("1500");
  await page.locator("#budget").fill("49");
  await expect(page.locator("#planner-error")).toContainText("p95 budget must be a whole number between 50 and 60,000 ms");
  await page.locator("#baseline").fill("60001");
  await expect(page.locator("#planner-error")).toContainText("Baseline startup must be a whole number between 1 and 60,000 ms");
  await page.locator("#budget").fill("1500");
  await page.locator("#baseline").fill("200");
  await expect(page.locator("#planner-error")).toBeHidden();
  await expect(page.locator("#generated-command")).toContainText("--startup-budget-ms 1500");
  await expect(page.locator("#export-csv")).toBeEnabled();
});

test("fractional planner values cannot export stale calculation fields", async ({ page }) => {
  await page.goto("/");
  await page.locator("#containers").fill("64");
  await page.locator("#ports").fill("16");
  await page.locator("#mounts").fill("16");
  await page.locator("#baseline").fill("60000");
  await page.locator("#budget").fill("60000");
  await expect(page.locator("#prediction")).toHaveText("65027 ms");
  await page.locator("#budget").fill("50.5");
  await expect(page.locator("#planner-error")).toContainText("p95 budget must be a whole number");
  await expect(page.locator("#budget")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#prediction")).toHaveText("—");
  await expect(page.locator("#headroom")).toHaveText("—");
  await expect(page.locator("#export-csv")).toBeDisabled();
});

test("corrupt saved-scenario values recover without aborting initialization", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.goto("/");
  for (const corrupt of ["not-json", "[null]", "[{}]", '[{"containers":0,"ports":1,"mounts":1,"baselineMs":1,"budgetMs":50,"predictedMs":1,"status":"comfortable"}]']) {
    await page.evaluate((value) => localStorage.setItem("sb_scenarios:sandbox-capacity-probe", value), corrupt);
    await page.reload();
    await expect(page.locator("#saved-scenarios")).toContainText("No saved scenarios yet");
    await expect(page.locator("#connection-state")).toContainText("Online");
    expect(await page.evaluate(() => localStorage.getItem("sb_scenarios:sandbox-capacity-probe"))).toBeNull();
  }
  expect(errors).toEqual([]);
});

test("corrupt demo values recover to the complete bundled sample", async ({ page }) => {
  await page.goto("/?demo=1");
  for (const corrupt of ['"bad-value"', "{}", '{"containers":24,"ports":4,"mounts":2,"baselineMs":0,"budgetMs":0}']) {
    await page.evaluate((value) => localStorage.setItem("demo:sandbox-capacity-probe:scenario", value), corrupt);
    await page.reload();
    await expect(page.locator("#containers")).toHaveValue("24");
    await expect(page.locator("#ports")).toHaveValue("4");
    await expect(page.locator("#mounts")).toHaveValue("2");
    await expect(page.locator("#baseline")).toHaveValue("240");
    await expect(page.locator("#budget")).toHaveValue("1500");
    expect(JSON.parse(await page.evaluate(() => localStorage.getItem("demo:sandbox-capacity-probe:scenario")) ?? "null")).toEqual({
      containers: 24, ports: 4, mounts: 2, baselineMs: 240, budgetMs: 1500
    });
  }
});

test("metadata, targets, and designed 404 are shipped", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Sandbox Capacity Probe — Measure container capacity");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://sandbox-capacity-probe.sociobot.in/");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /social-card\.webp$/);
  const tooSmall = await page.locator("button, a, input[type=range]").evaluateAll((elements) =>
    elements.filter((element) => {
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return box.width > 0 && box.height > 0 && style.visibility !== "hidden" && (box.width < 44 || box.height < 44);
    }).map((element) => (element as HTMLElement).outerHTML)
  );
  expect(tooSmall).toEqual([]);
  await page.goto("/404.html");
  await expect(page.locator("h1")).toHaveText("That page was not found.");
  await expect(page.getByRole("link", { name: "Privacy" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Terms" }).first()).toBeVisible();
});

test("demo route focuses the real CLI sample and mobile navigation keeps four links", async ({ page }, testInfo) => {
  await page.goto("/?demo=1#cli-demo");
  await expect(page.locator("#cli-demo-title")).toBeFocused();
  await expect(page.locator(".terminal-recording")).toBeVisible();
  await expect(page.locator("#cli-demo-output")).toContainText("capacity-probe demo");
  if (testInfo.project.name === "mobile-chromium") {
    await page.getByText("Menu", { exact: true }).click();
    const links = page.locator(".nav-menu .nav-links a");
    await expect(links).toHaveCount(4);
    for (const link of await links.all()) await expect(link).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  }
});

test("mobile uses the lightweight hero and stable assets are revalidated", async ({ page }, testInfo) => {
  await page.goto("/");
  if (testInfo.project.name === "mobile-chromium") {
    await expect(page.locator(".hero-image img")).toHaveJSProperty("currentSrc", "http://127.0.0.1:4173/topographic-envelope-700.webp");
  }
  const config = readFileSync("site/public/staticwebapp.config.json", "utf8");
  expect(config).not.toContain("topographic-envelope*.webp");
  expect(config).not.toContain('"route": "/social-card.webp"');
  expect(config).not.toContain('"route": "/apple-touch-icon.png"');
});

test("a returned license is stored, stripped from the URL, and verified", async ({ page }) => {
  await page.route("https://api.sociobot.in/api/v1/products/sandbox-capacity-probe/verify?license=license-test", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ valid: true, reason: "ok", expires_at: null }) })
  );
  await page.goto("/?license=license-test");
  await expect(page).toHaveURL("http://127.0.0.1:4173/");
  await expect(page.locator("#license-status")).toContainText("Planner Pro is active");
  await expect(page.locator("#pro-tools")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("sb_license:sandbox-capacity-probe"))).toBe("license-test");
});

test("@claim:license-policy stores the token locally and limits manual and automatic checks", async ({ page }) => {
  let requests = 0;
  const verifyUrl = "https://api.sociobot.in/api/v1/products/sandbox-capacity-probe/verify?license=invalid-token";
  await page.route(verifyUrl, (route) => {
    requests += 1;
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ valid: false, reason: "invalid" }) });
  });
  await page.goto("/");
  await page.locator("#license-token").fill("invalid-token");
  await page.locator("#license-form button").click();
  await expect(page.locator("#license-status")).toContainText("License no longer active");
  await page.locator("#license-form button").click();
  await expect(page.locator("#license-status")).toContainText("Too many verification attempts");
  expect(requests).toBe(1);
  expect(await page.evaluate(() => localStorage.getItem("sb_license:sandbox-capacity-probe"))).toBe("invalid-token");
  await page.reload();
  await expect(page.locator("#license-status")).toContainText("Free planner active");
  expect(requests).toBe(1);
  await page.evaluate(() => localStorage.removeItem("sb_license_verify_attempt:sandbox-capacity-probe"));
  await page.unroute(verifyUrl);
  await page.route(verifyUrl, (route) => route.fulfill({
    status: 429,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Expose-Headers": "Retry-After",
      "Retry-After": "12"
    },
    body: "rate limited"
  }));
  await page.locator("#license-token").fill("invalid-token");
  await page.locator("#license-form button").click();
  await expect(page.locator("#license-status")).toContainText("Try again after 12 seconds");
});

test("@claim:cli-demo matches the website recording to the bundled report without a runtime", async ({ page }) => {
  const result = runCli(["--demo"]);
  expect(result.status).toBe(0);
  expect(result.stdout).toContain("no container runtime was contacted");
  const match = result.stdout.match(/Sample report written to (.+capacity-demo\.json)/);
  expect(match).not.toBeNull();
  const reportPath = match![1].trim();
  expect(reportPath.startsWith(tmpdir())).toBe(true);
  const report = JSON.parse(readFileSync(reportPath, "utf8"));
  const shipped = JSON.parse(readFileSync("cli/examples/demo-capacity.json", "utf8"));
  const website = JSON.parse(readFileSync("site/public/demo-capacity.json", "utf8"));
  expect(report).toEqual(shipped);
  expect(website).toEqual(shipped);
  await page.goto("/?demo=1#cli-demo");
  const recording = page.locator("#cli-demo-output");
  await expect(recording).toContainText("$ capacity-probe demo");
  await expect(recording).toContainText(`${report.config.containers} containers × ${report.config.ports_per_container} ports × ${report.config.mounts_per_container} mount`);
  await expect(recording).toContainText(`predicted p95 ${report.model.predicted_p95_ms.toFixed(1)} ms / ${report.config.startup_budget_ms} ms budget`);
  await expect(recording).toContainText(`(${report.envelope.headroom_ms.toFixed(1)} ms headroom)`);
  await expect(recording).toContainText(report.host.rule_count_method);
  await expect(page.locator(".terminal-recording")).toHaveAttribute("data-recording-source", "/demo-capacity.json");
  rmSync(dirname(reportPath), { recursive: true, force: true });
});

test("@claim:cli-safety-bounds refuses production markers and enforces documented maximums", () => {
  for (const target of ["productionwest", "prod1", "live01", "customerproduction"]) {
    const refused = runCli(["probe", "--target", target, "--confirm", target, "--dry-run"]);
    expect(refused.status, target).toBe(2);
    expect(refused.stderr).toContain("looks like production");
  }
  const maximum = runCli([
    "probe", "--target", "staging", "--confirm", "staging", "--containers", "64",
    "--ports-per-container", "16", "--mounts", "16", "--samples", "10",
    "--startup-budget-ms", "60000", "--dry-run", "--json"
  ]);
  expect(maximum.status).toBe(0);
  expect(JSON.parse(maximum.stdout)).toMatchObject({ maximum_container_starts: 640, maximum_published_ports: 1024 });
  const tooMany = runCli(["probe", "--target", "staging", "--confirm", "staging", "--containers", "65", "--dry-run"]);
  expect(tooMany.status).toBe(2);
});

test("@claim:cli-isolated-cleanup uses an internal network, localhost ports, labels, and cleanup", () => {
  const { fixture, log, env } = fakeRuntimeFixture();
  const args = ["probe", "--target", "staging", "--confirm", "staging", "--runtime", "docker", "--containers", "1", "--ports-per-container", "1", "--mounts", "1", "--samples", "1", "--startup-budget-ms", "60000", "--ci"];
  expect(runCli(args, env).status).toBe(0);
  let calls = readFileSync(log, "utf8");
  expect(calls).toContain("network create --internal --label in.sociobot.capacity-probe=true");
  expect(calls).toContain("--publish 127.0.0.1::18080");
  expect(calls).toContain("readonly");
  expect(calls).toContain("alpine:3.20 sleep 600");
  expect(calls).toContain("rm --force capacity-probe-");
  expect(calls).toContain("network rm capacity-probe-");
  writeFileSync(log, "");
  expect(runCli(args, { ...env, FAKE_RUNTIME_FAIL_RUN: "1" }).status).toBe(2);
  calls = readFileSync(log, "utf8");
  expect(calls).toContain("network rm capacity-probe-");
  rmSync(fixture, { recursive: true, force: true });
});

test("@claim:cli-report-compare renders reports and checks the 25 percent prediction target", () => {
  const demo = runCli(["demo"]);
  const reportPath = demo.stdout.match(/Sample report written to (.+capacity-demo\.json)/)![1].trim();
  const report = JSON.parse(readFileSync(reportPath, "utf8"));
  expect(report).toMatchObject({
    schema_version: 1,
    config: {
      target: "staging-west-demo",
      runtime: "docker",
      context: "demo-sample",
      containers: 12,
      ports_per_container: 2,
      mounts_per_container: 1,
      image: "alpine:3.20"
    }
  });
  expect(report.caveats.length).toBeGreaterThan(0);
  expect(report.levels.length).toBeGreaterThan(0);
  expect(report.model.predicted_p95_ms).toBeGreaterThan(0);
  expect(["comfortable", "watch", "exceeded"]).toContain(report.envelope.status);
  const explained = runCli(["explain", reportPath]);
  expect(explained.stdout).toContain("Sandbox capacity envelope");
  const compared = runCli(["compare", reportPath, reportPath, "--json"]);
  expect(compared.status).toBe(0);
  expect(JSON.parse(compared.stdout)).toMatchObject({ absolute_error_percent: 0, within_25_percent: true, shape_matches: true });
  for (const [field, value] of [
    ["target", "different-host"],
    ["runtime", "podman"],
    ["context", "production-remote"],
    ["image", "different/image:latest"]
  ]) {
    const incompatiblePath = join(dirname(reportPath), `capacity-${field}.json`);
    const incompatible = structuredClone(report);
    incompatible.config[field] = value;
    writeFileSync(incompatiblePath, JSON.stringify(incompatible));
    const rejected = runCli(["compare", reportPath, incompatiblePath, "--json"]);
    expect(rejected.status, field).toBe(3);
    expect(JSON.parse(rejected.stdout)).toMatchObject({
      within_25_percent: false,
      shape_matches: false,
      mismatched_fields: [field]
    });
  }
  const incompatiblePath = join(dirname(reportPath), "capacity-incompatible.json");
  const incompatible = structuredClone(report);
  Object.assign(incompatible.config, {
    target: "different-host",
    runtime: "podman",
    context: "production-remote",
    image: "different/image:latest"
  });
  writeFileSync(incompatiblePath, JSON.stringify(incompatible));
  const rejected = runCli(["compare", reportPath, incompatiblePath, "--json"]);
  expect(rejected.status).toBe(3);
  expect(JSON.parse(rejected.stdout)).toMatchObject({
    within_25_percent: false,
    shape_matches: false,
    mismatched_fields: ["target", "runtime", "context", "image"]
  });
  const missedPath = join(dirname(reportPath), "capacity-missed.json");
  const missed = structuredClone(report);
  missed.levels.at(-1).p95_ms = report.model.predicted_p95_ms * 2;
  writeFileSync(missedPath, JSON.stringify(missed));
  expect(runCli(["compare", reportPath, missedPath, "--json"]).status).toBe(3);
  rmSync(dirname(reportPath), { recursive: true, force: true });
});

test("@claim:local-results writes the requested CLI report locally", () => {
  const { fixture, env } = fakeRuntimeFixture();
  const reportPath = join(fixture, "capacity.json");
  const result = runCli([
    "probe", "--target", "staging", "--confirm", "staging", "--runtime", "docker",
    "--containers", "1", "--ports-per-container", "0", "--mounts", "0", "--samples", "1",
    "--startup-budget-ms", "60000", "--output", reportPath, "--ci"
  ], env);
  expect(result.status).toBe(0);
  expect(JSON.parse(readFileSync(reportPath, "utf8")).schema_version).toBe(1);
  expect(runCli(["explain", reportPath]).status).toBe(0);
  rmSync(fixture, { recursive: true, force: true });
});

test("@claim:planner-pro-five keeps only the five latest local scenarios for review", async ({ page }) => {
  await page.route("https://api.sociobot.in/api/v1/products/sandbox-capacity-probe/verify?license=pro-test", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ valid: true, reason: "ok" }) })
  );
  await page.goto("/?license=pro-test");
  await expect(page.locator("#pro-tools")).toBeVisible();
  await expect(page.locator(".price")).toContainText("$39");
  await expect(page.locator(".price")).toContainText("one-time purchase");
  await expect(page.getByRole("link", { name: "Buy Planner Pro for $39" })).toHaveAttribute("href", "https://api.sociobot.in/api/v1/products/sandbox-capacity-probe/checkout");
  for (let containers = 10; containers <= 15; containers += 1) {
    await page.locator("#containers").fill(String(containers));
    await page.locator("#save-scenario").click();
  }
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("sb_scenarios:sandbox-capacity-probe") ?? "[]"));
  expect(saved).toHaveLength(5);
  expect(saved[0].containers).toBe(11);
  await expect(page.locator("#saved-scenarios li")).toHaveCount(5);
});

test("@claim:planner-pro-price verifies the $39 one-time hosted offer", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator(".price")).toHaveText(/\$39\s+one-time purchase/);
  const response = await request.get("https://api.sociobot.in/api/v1/products/sandbox-capacity-probe/checkout");
  expect(response.ok()).toBe(true);
  const body = await response.text();
  expect(body).toContain("Sandbox Capacity Probe");
  expect(body).toMatch(/\$39|39\.00/);
  expect(body.toLowerCase()).toContain("one-time");
});

test("@claim:planner-pro-checkout opens the hosted checkout for this product", async ({ page, request }) => {
  await page.goto("/");
  const buy = page.getByRole("link", { name: "Buy Planner Pro for $39" });
  const checkout = await buy.getAttribute("href");
  expect(checkout).toBe("https://api.sociobot.in/api/v1/products/sandbox-capacity-probe/checkout");
  const response = await request.get(checkout!);
  expect(response.ok()).toBe(true);
  expect(response.url()).toMatch(/^https:\/\/checkout\.dodopayments\.com\/session\//);
  expect(await response.text()).toContain("Sandbox Capacity Probe");
});

test("@claim:planner-pro-no-account uses the free planner without account or billing traffic", async ({ page }) => {
  const outsideRequests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== "http://127.0.0.1:4173") outsideRequests.push(request.url());
  });
  await page.goto("/");
  await expect(page.locator("#license-status")).toHaveText("Free planner active. No account required.");
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await page.locator("#containers").fill("18");
  await expect(page.locator("#generated-command")).toContainText("--containers 18");
  expect(outsideRequests).toEqual([]);
});

test("@claim:planner-pro-free-features keeps CLI safety, JSON, and CSV available without a license", async ({ page }) => {
  await page.goto("/");
  expect(await page.evaluate(() => localStorage.getItem("sb_license:sandbox-capacity-probe"))).toBeNull();
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#export-csv").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("sandbox-capacity-scenario.csv");
  const refused = runCli(["probe", "--target", "production", "--confirm", "production", "--dry-run", "--json"]);
  expect(refused.status).toBe(2);
  expect(refused.stderr).toContain("looks like production");
  const safe = runCli(["probe", "--target", "staging", "--confirm", "staging", "--containers", "1", "--dry-run", "--json"]);
  expect(safe.status).toBe(0);
  expect(JSON.parse(safe.stdout)).toMatchObject({ maximum_container_starts: 2 });
});

test("the installed command name cannot shadow OpenSSH scp", () => {
  const manifest = readFileSync("cli/Cargo.toml", "utf8");
  expect(manifest).toContain('name = "capacity-probe"');
  expect(manifest).not.toContain('name = "scp"');
  expect(runCli(["--help"]).stdout).toContain("Usage: capacity-probe");
});
