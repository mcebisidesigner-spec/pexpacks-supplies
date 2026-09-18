import { test, expect } from "@playwright/test";
import { blockServiceWorker } from "../helpers";

test.describe("Design System Visual Baselines - Views & Routes", () => {
  test.beforeEach(async ({ page }) => {
    await blockServiceWorker(page);
  });

  const viewports = [
    { name: "desktop", width: 1280, height: 800 },
    { name: "mobile", width: 390, height: 844 },
  ];

  for (const vp of viewports) {
    test(`admin authentication portal baseline [${vp.name}]`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/pex-console-secure", { waitUntil: "domcontentloaded" });
      await expect(page.locator("#site-main")).toBeVisible();

      await expect(page).toHaveScreenshot(`view-admin-login-${vp.name}.png`, {
        mask: [
          // Mask dynamic cursor / status or helper texts if needed
          page.locator('[data-dynamic="true"]'),
        ],
      });
    });

    test(`stationery converter & order dropzone baseline [${vp.name}]`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/order", { waitUntil: "domcontentloaded" });
      await expect(page.locator("#site-main")).toBeVisible();

      await expect(page).toHaveScreenshot(`view-order-dropzone-${vp.name}.png`, {
        mask: [
          // Mask chat widget or transient elements
          page.locator('[aria-label="Open Ask Pex Assistant"]'),
        ],
      });
    });

    test(`schools directory baseline [${vp.name}]`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/schools", { waitUntil: "domcontentloaded" });
      await expect(page.locator("#site-main")).toBeVisible();

      await expect(page).toHaveScreenshot(`view-schools-directory-${vp.name}.png`, {
        mask: [
          page.locator('[aria-label="Open Ask Pex Assistant"]'),
        ],
      });
    });

    test(`storefront homepage above-the-fold hero baseline [${vp.name}]`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/", { waitUntil: "domcontentloaded" });
      const hero = page.locator("main > section").first();
      await expect(hero).toBeVisible();

      await expect(hero).toHaveScreenshot(`view-homepage-hero-${vp.name}.png`, {
        mask: [
          page.locator('[aria-label="Open Ask Pex Assistant"]'),
        ],
      });
    });
  }
});
