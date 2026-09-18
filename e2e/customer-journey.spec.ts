import { test, expect } from "@playwright/test";
import { blockServiceWorker } from "./helpers";

test.beforeEach(async ({ page }) => {
  await blockServiceWorker(page);
});

test.describe("Customer Discovery & Exploration Journey", () => {
  test("navigates from homepage to schools directory and verifies search interface", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.status()).toBe(200);

    // Primary navigation to schools
    const schoolsLink = page.locator('a[href="/schools"]').first();
    await expect(schoolsLink).toBeVisible();
    await schoolsLink.click();

    await expect(page).toHaveURL(/\/schools$/);
    await expect(page.locator("main")).toBeVisible();

    // Verify search input or heading is present in schools view
    const searchOrHeading = page.locator('input[type="search"], input[placeholder*="school" i], h1');
    await expect(searchOrHeading.first()).toBeVisible();
  });

  test("accesses AI stationery list converter page with upload options", async ({ page }) => {
    const res = await page.goto("/order");
    expect(res?.status()).toBe(200);

    await expect(page.getByText("AI School List Converter")).toBeVisible();
    await expect(page.getByText("Photo or PDF Upload")).toBeVisible();

    // Test tab switching to paste/type
    const pasteTab = page.getByText("Paste / Type List");
    await expect(pasteTab).toBeVisible();
    await pasteTab.click();

    const textarea = page.getByRole("textbox");
    await expect(textarea).toBeVisible();
  });

  test("verifies core public navigational footers and support contact routes", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    // Verify contact route is reachable
    const contactRes = await page.goto("/contact");
    expect(contactRes?.status()).toBe(200);
    await expect(page.locator("main")).toBeVisible();
  });
});
