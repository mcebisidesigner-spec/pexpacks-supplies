import { test, expect } from "@playwright/test";
import { blockServiceWorker } from "./helpers";

test.beforeEach(async ({ page }) => {
  await blockServiceWorker(page);
});

test("homepage renders site chrome and a main landmark", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);
  await expect(page.locator("header")).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();
  await expect(page.locator("main")).toBeVisible();
});

test("primary navigation reaches the schools directory", async ({ page }) => {
  await page.goto("/");
  const schoolsLink = page.locator('a[href="/schools"]').first();
  await schoolsLink.click();
  await expect(page).toHaveURL(/\/schools$/);
  await expect(page.locator("main")).toBeVisible();
});