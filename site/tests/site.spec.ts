import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";

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
  expect(await page.evaluate(() => caches.keys())).toContain("scp-shell-v2");
  await page.evaluate(async () => { await (await navigator.serviceWorker.getRegistration())?.update(); });
  expect(await page.evaluate(() => caches.keys())).toContain("scp-shell-v2");
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
  for (const path of ["/privacy/", "/terms/"]) {
    await page.goto(path);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main")).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  }
});

test("invalid numeric planner input keeps the last valid command and announces recovery", async ({ page }) => {
  await page.goto("/");
  const command = await page.locator("#generated-command").textContent();
  await page.locator("#budget").fill("");
  await expect(page.locator("#planner-error")).toContainText("p95 budget must be between 50 and 60,000 ms");
  await expect(page.locator("#generated-command")).toHaveText(command ?? "");
  await page.locator("#budget").fill("1500");
  await page.locator("#budget").fill("49");
  await expect(page.locator("#planner-error")).toContainText("p95 budget must be between 50 and 60,000 ms");
  await expect(page.locator("#generated-command")).toHaveText(command ?? "");
  await page.locator("#baseline").fill("60001");
  await expect(page.locator("#planner-error")).toContainText("Baseline startup must be between 1 and 60,000 ms");
  await page.locator("#budget").fill("1500");
  await page.locator("#baseline").fill("200");
  await expect(page.locator("#planner-error")).toBeHidden();
  await expect(page.locator("#generated-command")).toContainText("--startup-budget-ms 1500");
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

test("license verification is limited to one manual attempt per browser minute", async ({ page }) => {
  let requests = 0;
  await page.route("https://api.sociobot.in/api/v1/products/sandbox-capacity-probe/verify?license=invalid-token", (route) => {
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
});
