import { test, expect } from "@playwright/test";
import { blockServiceWorker } from "../helpers";

test.describe("Design System Visual Baselines - Primitives", () => {
  test.beforeEach(async ({ page }) => {
    await blockServiceWorker(page);
  });

  const viewports = [
    { name: "desktop", width: 1280, height: 800 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "mobile", width: 390, height: 844 },
  ];

  for (const vp of viewports) {
    test(`buttons and action primitives visual baseline [${vp.name}]`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/design-system-preview", { waitUntil: "domcontentloaded" });
      const target = page.locator('[data-testid="visual-buttons"]');
      await expect(target).toBeVisible({ timeout: 15_000 });
      await expect(target).toHaveScreenshot(`buttons-${vp.name}.png`);
    });

    test(`badges and status indicator primitives visual baseline [${vp.name}]`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/design-system-preview", { waitUntil: "domcontentloaded" });
      const target = page.locator('[data-testid="visual-badges"]');
      await expect(target).toBeVisible({ timeout: 15_000 });
      await expect(target).toHaveScreenshot(`badges-${vp.name}.png`);
    });

    test(`cards and panels visual baseline [${vp.name}]`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/design-system-preview", { waitUntil: "domcontentloaded" });
      const target = page.locator('[data-testid="visual-cards"]');
      await expect(target).toBeVisible({ timeout: 15_000 });
      await expect(target).toHaveScreenshot(`cards-${vp.name}.png`);
    });

    test(`forms and input controls visual baseline [${vp.name}]`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/design-system-preview", { waitUntil: "domcontentloaded" });
      const target = page.locator('[data-testid="visual-inputs"]');
      await expect(target).toBeVisible({ timeout: 15_000 });
      await expect(target).toHaveScreenshot(`inputs-${vp.name}.png`);
    });

    test(`loading skeletons visual baseline [${vp.name}]`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/design-system-preview", { waitUntil: "domcontentloaded" });
      const target = page.locator('[data-testid="visual-skeletons"]');
      await expect(target).toBeVisible({ timeout: 15_000 });
      await expect(target).toHaveScreenshot(`skeletons-${vp.name}.png`);
    });
  }
});
