import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 2,
  timeout: 60_000,
  reporter: process.env.CI ? "github" : "list",
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
      animations: "disabled",
    },
  },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-iphone",
      testMatch: /responsive\.spec\.ts/,
      use: { ...devices["iPhone 13"], browserName: "chromium" },
    },
    {
      name: "mobile-android",
      testMatch: /responsive\.spec\.ts/,
      use: { ...devices["Pixel 7"], browserName: "chromium" },
    },
    {
      name: "tablet",
      testMatch: /responsive\.spec\.ts/,
      use: { ...devices["iPad (gen 7)"], browserName: "chromium" },
    },
  ],
});