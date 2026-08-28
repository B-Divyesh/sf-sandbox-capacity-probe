import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

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
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
  expect(consoleErrors).toEqual([]);
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
  }
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
