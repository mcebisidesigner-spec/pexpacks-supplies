import { test, expect } from "@playwright/test";
import { blockServiceWorker } from "./helpers";

test.beforeEach(async ({ page }) => {
  await blockServiceWorker(page);
});

test.describe("Admin Backoffice Security & Boundaries", () => {
  test("redirects unauthenticated access from /admin to authentication boundary", async ({ page }) => {
    await page.goto("/admin");
    // requireAdmin() in app/admin/layout.tsx redirects unauthenticated visitors to /login or /pex-console-secure
    await page.waitForURL(/\/(login|pex-console-secure)(\?.*)?$/);
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(login|pex-console-secure)/);
  });

  test("redirects unauthenticated access from /admin/products to authentication boundary", async ({ page }) => {
    await page.goto("/admin/products");
    await page.waitForURL(/\/(login|pex-console-secure)(\?.*)?$/);
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(login|pex-console-secure)/);
  });

  test("renders secure admin console login portal with authentication form", async ({ page }) => {
    const res = await page.goto("/pex-console-secure");
    expect(res?.status()).toBe(200);

    // Form must have email and password inputs
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
  });
});
