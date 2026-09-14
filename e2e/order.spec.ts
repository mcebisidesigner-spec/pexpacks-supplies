import { test, expect } from "@playwright/test";
import { blockServiceWorker } from "./helpers";

test.beforeEach(async ({ page }) => {
  await blockServiceWorker(page);
});

test("AI list converter renders upload and paste modes", async ({ page }) => {
  const res = await page.goto("/order");
  expect(res?.status()).toBe(200);
  await expect(page.getByText("AI School List Converter")).toBeVisible();
  await expect(page.getByText("Photo or PDF Upload")).toBeVisible();

  await page.getByText("Paste / Type List").click();
  await expect(page.getByRole("textbox")).toBeVisible();
});

test("dropzone is keyboard accessible", async ({ page }) => {
  await page.goto("/order");

  const browseButton = page.getByRole("button", { name: "Browse Files" });
  await expect(browseButton).toBeVisible();

  const fileChooserPromise = page.waitForEvent("filechooser");
  await browseButton.focus();
  await page.keyboard.press("Enter");
  const fileChooser = await fileChooserPromise;
  expect(fileChooser).toBeTruthy();
});