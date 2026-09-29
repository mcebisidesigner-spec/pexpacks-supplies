import { test, expect } from "@playwright/test";
import { blockServiceWorker } from "./helpers";

type MetricState = {
  lcp: number | null;
  cls: number;
  inp: number | null;
};

type PerformanceWindow = Window & {
  __pexMetrics?: MetricState;
};

const CORE_ROUTES = ["/", "/schools", "/pexcover", "/checkout"];
const MAX_TRANSFER_BYTES = 3 * 1024 * 1024;
const MAX_LCP_MS = 3500;
const MAX_CLS = 0.1;
const MAX_INP_MS = 300;

test.describe("Core Web Vitals and transfer budgets", () => {
  test.beforeEach(async ({ page }) => {
    await blockServiceWorker(page);
    await page.addInitScript(() => {
      const metrics: MetricState = { lcp: null, cls: 0, inp: null };
      const target = window as PerformanceWindow;
      target.__pexMetrics = metrics;

      try {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const last = entries[entries.length - 1];
          if (last) metrics.lcp = last.startTime;
        }).observe({ type: "largest-contentful-paint", buffered: true });
      } catch {}

      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as (PerformanceEntry & {
            hadRecentInput?: boolean;
            value?: number;
          })[]) {
            if (!entry.hadRecentInput) metrics.cls += entry.value ?? 0;
          }
        }).observe({ type: "layout-shift", buffered: true });
      } catch {}

      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            metrics.inp = Math.max(metrics.inp ?? 0, entry.duration);
          }
        }).observe({ type: "event", buffered: true, durationThreshold: 40 } as PerformanceObserverInit);
      } catch {}
    });
  });

  for (const route of CORE_ROUTES) {
    test("keeps " + route + " within browser performance budgets", async ({ page }) => {
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBe(200);
      await expect(page.locator("#site-main")).toBeVisible();
      await page.waitForTimeout(1000);

      const metrics = await page.evaluate(() => {
        const target = window as PerformanceWindow;
        const navigation = performance.getEntriesByType(
          "navigation",
        )[0] as PerformanceNavigationTiming | undefined;
        const resources = performance.getEntriesByType(
          "resource",
        ) as PerformanceResourceTiming[];

        return {
          ...(target.__pexMetrics ?? { lcp: null, cls: 0, inp: null }),
          ttfb: navigation?.responseStart ?? 0,
          transferBytes: resources.reduce(
            (total, entry) => total + (entry.transferSize || 0),
            0,
          ),
        };
      });

      expect(metrics.ttfb).toBeLessThan(800);
      expect(metrics.transferBytes).toBeLessThan(MAX_TRANSFER_BYTES);
      expect(metrics.cls).toBeLessThanOrEqual(MAX_CLS);
      if (metrics.lcp !== null) expect(metrics.lcp).toBeLessThan(MAX_LCP_MS);
      if (metrics.inp !== null) expect(metrics.inp).toBeLessThan(MAX_INP_MS);
    });
  }
});