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
  await page.goto("/?demo=1#planner");
  await expect(page.locator("#demo-banner")).toBeVisible();
  await expect(page.locator("#containers")).toHaveValue("24");
  expect(await page.evaluate(() => localStorage.getItem("sb_scenarios:sandbox-capacity-probe"))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem("demo:sandbox-capacity-probe:scenario"))).toContain('"containers":24');
  await page.locator("#containers").fill("30");
  await page.locator("#reset-demo").click();
  await expect(page.locator("#containers")).toHaveValue("24");
  expect(await page.evaluate(() => localStorage.getItem("sb_scenarios:sandbox-capacity-probe"))).toBeNull();
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
  expect(await page.evaluate(() => caches.keys())).toContain("capacity-probe-shell-v3");
  await page.evaluate(async () => { await (await navigator.serviceWorker.getRegistration())?.update(); });
  expect(await page.evaluate(() => caches.keys())).toContain("capacity-probe-shell-v3");
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
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  expect(await page.locator(".hero-image img").evaluate((image) => getComputedStyle(image).animationDuration)).toBe("1e-05s");
});

test("invalid numeric planner input keeps the last valid command and announces recovery", async ({ page }) => {
  await page.goto("/");
  const command = await page.locator("#generated-command").textContent();
  await page.locator("#budget").fill("");
  await expect(page.locator("#planner-error")).toContainText("p95 budget must be a whole number between 50 and 60,000 ms");
  await expect(page.locator("#generated-command")).toHaveText(command ?? "");
  await page.locator("#budget").fill("1500");
  await page.locator("#budget").fill("49");
  await expect(page.locator("#planner-error")).toContainText("p95 budget must be a whole number between 50 and 60,000 ms");
  await expect(page.locator("#generated-command")).toHaveText(command ?? "");
  await page.locator("#baseline").fill("60001");
  await expect(page.locator("#planner-error")).toContainText("Baseline startup must be a whole number between 1 and 60,000 ms");
  await page.locator("#budget").fill("1500");
  await page.locator("#baseline").fill("200");
  await expect(page.locator("#planner-error")).toBeHidden();
  await expect(page.locator("#generated-command")).toContainText("--startup-budget-ms 1500");
});

test("fractional planner values keep the last valid command and explain the integer requirement", async ({ page }) => {
  await page.goto("/");
  const command = await page.locator("#generated-command").textContent();
  await page.locator("#budget").fill("50.5");
  await expect(page.locator("#planner-error")).toContainText("p95 budget must be a whole number");
  await expect(page.locator("#budget")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#generated-command")).toHaveText(command ?? "");
});

test("corrupt saved-scenario storage recovers without aborting initialization", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.addInitScript(() => localStorage.setItem("sb_scenarios:sandbox-capacity-probe", "not-json"));
  await page.goto("/");
  await expect(page.locator("#saved-scenarios")).toContainText("No saved scenarios yet");
  await expect(page.locator("#connection-state")).toContainText("Online");
  expect(await page.evaluate(() => localStorage.getItem("sb_scenarios:sandbox-capacity-probe"))).toBeNull();
  expect(errors).toEqual([]);
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

test("@claim:cli-demo writes a bundled report only to a process-specific temporary directory", () => {
  const result = runCli(["--demo"]);
  expect(result.status).toBe(0);
  expect(result.stdout).toContain("no container runtime was contacted");
  const match = result.stdout.match(/Sample report written to (.+capacity-demo\.json)/);
  expect(match).not.toBeNull();
  const reportPath = match![1].trim();
  expect(reportPath.startsWith(tmpdir())).toBe(true);
  expect(JSON.parse(readFileSync(reportPath, "utf8")).schema_version).toBe(1);
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
  await expect(page.getByRole("link", { name: "Buy Planner Pro" })).toHaveAttribute("href", "https://api.sociobot.in/api/v1/products/sandbox-capacity-probe/checkout");
  for (let containers = 10; containers <= 15; containers += 1) {
    await page.locator("#containers").fill(String(containers));
    await page.locator("#save-scenario").click();
  }
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("sb_scenarios:sandbox-capacity-probe") ?? "[]"));
  expect(saved).toHaveLength(5);
  expect(saved[0].containers).toBe(11);
  await expect(page.locator("#saved-scenarios li")).toHaveCount(5);
});

test("the installed command name cannot shadow OpenSSH scp", () => {
  const manifest = readFileSync("cli/Cargo.toml", "utf8");
  expect(manifest).toContain('name = "capacity-probe"');
  expect(manifest).not.toContain('name = "scp"');
  expect(runCli(["--help"]).stdout).toContain("Usage: capacity-probe");
});
