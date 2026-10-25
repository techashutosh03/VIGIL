import { test, expect } from "@playwright/test";

test("backend returns 500 mid-flow — dashboard shows error state, not a crash screen", async ({ page }) => {
  await page.route("**/api/v1/dashboard/overlap-graph", (route) =>
    route.fulfill({ status: 500, body: JSON.stringify({ error: "Internal Server Error" }) })
  );
  await page.goto("/dashboard");
  await page.click("text=Overlap & War Room");

  await expect(page.locator("text=/error|unavailable|demo mode/i")).toBeVisible({ timeout: 5000 });
  await expect(page.locator("text=Unhandled Runtime Error")).toHaveCount(0);
});

test("backend returns malformed JSON — app doesn't white-screen", async ({ page }) => {
  await page.route("**/api/v1/dashboard/risk-score/*", (route) =>
    route.fulfill({ status: 200, body: "{not valid json!!" })
  );
  await page.goto("/dashboard");
  await page.click("text=Risk DNA & Forecast");
  await expect(page.locator("body")).not.toBeEmpty();
  await expect(page.locator("text=Unhandled Runtime Error")).toHaveCount(0);
});

test("extremely slow backend (8s delay) shows loading state, not frozen UI", async ({ page }) => {
  await page.route("**/api/v1/workflow/cases", async (route) => {
    await new Promise((r) => setTimeout(r, 8000));
    route.fulfill({ status: 200, body: JSON.stringify({ cases: [] }) });
  });
  await page.goto("/dashboard");
  await page.click("text=Workflow & SLA");
  await expect(page.locator("[data-testid='loading-skeleton']")).toBeVisible();
});

test("network flips offline mid-session after initial successful load", async ({ page, context }) => {
  await page.goto("/dashboard");
  await page.click("text=Overlap & War Room");
  await expect(page.locator("text=/LIVE|DEMO MODE/")).toBeVisible();

  await context.setOffline(true);
  await page.click("text=AI Co-Pilot");
  await context.setOffline(false);

  await expect(page.locator("text=Unhandled Runtime Error")).toHaveCount(0);
});

test("spam-clicking DNA resolve button 20x does not duplicate requests or crash", async ({ page }) => {
  let requestCount = 0;
  await page.route("**/api/v1/institutions/resolve", (route) => {
    requestCount++;
    route.fulfill({ status: 200, body: JSON.stringify({ matched: false }) });
  });

  await page.goto("/dashboard");
  await page.fill("[data-testid='dna-input']", "Spam Test Institute");
  const button = page.locator("[data-testid='dna-resolve-btn']");

  for (let i = 0; i < 20; i++) {
    await button.click({ force: true, noWaitAfter: true });
  }
  await page.waitForTimeout(1000);
  expect(requestCount).toBeLessThan(20); // should be debounced/disabled-while-loading
});
