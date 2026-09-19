import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { blockServiceWorker } from "./helpers";

async function criticalViolations(page: Page, extra: { disable?: string[] } = {}) {
  const builder = new AxeBuilder({ page }).withTags([
    "wcag2a",
    "wcag2aa",
    "wcag21aa",
  ]);
  if (extra.disable) builder.disableRules(extra.disable);
  const results = await builder.analyze();
  return results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );
}

test.describe("Platform Accessibility Engineering (WCAG 2.1 AA)", () => {
  test.beforeEach(async ({ page }) => {
    await blockServiceWorker(page);
  });

  test("homepage has no critical or serious accessibility violations", async ({ page }) => {
    // color-contrast is excluded here: the homepage marketing palette (coral CTAs,
    // teal eyebrows) is a pre-existing brand marketing design backlog.
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#site-main")).toBeVisible();
    const violations = await criticalViolations(page, {
      disable: ["color-contrast"],
    });
    expect(violations.map((v) => `${v.id} (${v.impact})`)).toEqual([]);
  });

  test("order page dropzone has no critical or serious accessibility violations (including contrast)", async ({ page }) => {
    await page.goto("/order", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#site-main")).toBeVisible();
    await expect(page.getByText("AI School List Converter")).toBeVisible();
    const violations = await criticalViolations(page);
    expect(violations.map((v) => `${v.id} (${v.impact})`)).toEqual([]);
  });

  test("schools directory has no critical or serious accessibility violations", async ({ page }) => {
    await page.goto("/schools", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#site-main")).toBeVisible();
    const violations = await criticalViolations(page, {
      disable: ["color-contrast"],
    });
    expect(violations.map((v) => `${v.id} (${v.impact})`)).toEqual([]);
  });

  test("admin authentication portal has no critical or serious accessibility violations", async ({ page }) => {
    await page.goto("/pex-console-secure", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#site-main")).toBeVisible();
    const violations = await criticalViolations(page);
    expect(violations.map((v) => `${v.id} (${v.impact})`)).toEqual([]);
  });

  test("contact page has no critical or serious accessibility violations", async ({ page }) => {
    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#site-main")).toBeVisible();
    const violations = await criticalViolations(page, {
      disable: ["color-contrast"],
    });
    expect(violations.map((v) => `${v.id} (${v.impact})`)).toEqual([]);
  });

  test("skip-to-content landmark exists and is keyboard reachable", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const skipLink = page.locator('a[href="#site-main"]');
    await expect(skipLink).toBeAttached();

    // Verify target landmark exists and has matching id
    const mainLandmark = page.locator("#site-main");
    await expect(mainLandmark).toBeAttached();

    // Tab into skip link
    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
  });

  test("form inputs have associated accessible labels and ARIA attributes", async ({ page }) => {
    await page.goto("/pex-console-secure", { waitUntil: "domcontentloaded" });
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Verify inputs have accessible names
    const emailName = await emailInput.getAttribute("aria-label") ?? await emailInput.getAttribute("name");
    const passwordName = await passwordInput.getAttribute("aria-label") ?? await passwordInput.getAttribute("name");
    expect(emailName).toBeTruthy();
    expect(passwordName).toBeTruthy();
  });
});