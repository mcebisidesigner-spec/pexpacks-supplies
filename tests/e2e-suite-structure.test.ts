import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("Playwright End-to-End Test Suite Structure & Readiness", () => {
  it("verifies playwright.config.ts is properly configured", () => {
    const configPath = resolve(root, "playwright.config.ts");
    expect(existsSync(configPath)).toBe(true);

    const config = readFileSync(configPath, "utf8");
    expect(config).toContain('testDir: "./e2e"');
    expect(config).toContain("webServer:");
    expect(config).toContain("baseURL:");
    expect(config).toContain('"chromium"');
  });

  it("verifies all expected e2e spec files exist", () => {
    const expectedSpecs = [
      "e2e/home.spec.ts",
      "e2e/order.spec.ts",
      "e2e/a11y.spec.ts",
      "e2e/customer-journey.spec.ts",
      "e2e/admin-backoffice.spec.ts",
      "e2e/helpers.ts",
    ];

    for (const spec of expectedSpecs) {
      const specPath = resolve(root, spec);
      expect(existsSync(specPath), `Spec file ${spec} must exist`).toBe(true);
    }
  });

  it("verifies e2e helpers safely patch service worker registration for headless stability", () => {
    const helpersPath = resolve(root, "e2e/helpers.ts");
    const content = readFileSync(helpersPath, "utf8");
    expect(content).toContain("blockServiceWorker");
    expect(content).toContain("navigator.serviceWorker");
  });

  it("verifies customer-journey.spec.ts covers schools navigation and converter interface", () => {
    const content = readFileSync(resolve(root, "e2e/customer-journey.spec.ts"), "utf8");
    expect(content).toContain("Customer Discovery & Exploration Journey");
    expect(content).toContain('a[href="/schools"]');
    expect(content).toContain("AI School List Converter");
    expect(content).toContain("blockServiceWorker");
  });

  it("verifies admin-backoffice.spec.ts tests auth boundary and console login portal", () => {
    const content = readFileSync(resolve(root, "e2e/admin-backoffice.spec.ts"), "utf8");
    expect(content).toContain("Admin Backoffice Security & Boundaries");
    expect(content).toContain("/admin");
    expect(content).toContain("/admin/products");
    expect(content).toContain("/pex-console-secure");
    expect(content).toContain("blockServiceWorker");
  });

  it("verifies package.json exposes test:e2e script", () => {
    const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
    expect(pkg.scripts["test:e2e"]).toBe("playwright test");
  });
});
