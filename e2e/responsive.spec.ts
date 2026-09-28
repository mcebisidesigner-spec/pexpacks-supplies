import { test, expect } from "@playwright/test";
import { blockServiceWorker } from "./helpers";

const CORE_ROUTES = ["/", "/schools", "/order", "/pexcover", "/checkout"];

test.describe("Responsive core route smoke tests", () => {
  test.beforeEach(async ({ page }) => {
    await blockServiceWorker(page);
  });

  for (const route of CORE_ROUTES) {
    test("renders " + route + " without horizontal overflow", async ({ page }) => {
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBe(200);
      await expect(page.locator("#site-main")).toBeVisible();

      const dimensions = await page.evaluate(() => ({
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
      }));

      expect(dimensions.documentWidth).toBeLessThanOrEqual(
        dimensions.viewportWidth + 1,
      );
    });
  }
});
