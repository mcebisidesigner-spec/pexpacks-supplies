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

test.beforeEach(async ({ page }) => {
  await blockServiceWorker(page);
});

test("homepage has no critical or serious accessibility violations", async ({ page }) => {
  // color-contrast is excluded here: the homepage marketing palette (coral CTAs,
  // teal eyebrows) is a pre-existing design backlog, not part of this batch.
  await page.goto("/");
  await expect(page.locator("main")).toBeVisible();
  const violations = await criticalViolations(page, {
    disable: ["color-contrast"],
  });
  expect(
    violations.map((v) => `${v.id} (${v.impact})`),
  ).toEqual([]);
});

test("order page dropzone has no critical or serious accessibility violations", async ({ page }) => {
  await page.goto("/order");
  await expect(page.getByText("AI School List Converter")).toBeVisible();
  const violations = await criticalViolations(page);
  expect(
    violations.map((v) => `${v.id} (${v.impact})`),
  ).toEqual([]);
});