import { describe, it, expect } from "vitest";
import { QuickMetricsGrid, type QuickMetricItem } from "@/components/admin/ui/QuickMetricsGrid";

describe("QuickMetricsGrid Architecture", () => {
  it("renders metric cards and handles empty state safely", () => {
    const res = QuickMetricsGrid({ metrics: [] });
    expect(res).toBeNull();
  });

  it("handles valid metric card items with varied tones and directions", () => {
    const items: QuickMetricItem[] = [
      {
        label: "TOTAL SCHOOLS",
        value: 3342,
        subtitle: "+6 vs last 7 days",
        trendDirection: "up",
        tone: "emerald",
      },
      {
        label: "INACTIVE",
        value: 3339,
        subtitle: "Inactive school packs",
        trendDirection: "down",
        tone: "red",
      },
    ];

    const element = QuickMetricsGrid({ metrics: items });
    expect(element).not.toBeNull();
    expect(element?.props.className).toContain("grid");
  });
});
