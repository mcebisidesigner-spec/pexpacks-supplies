import { describe, expect, it } from "vitest";
import {
  calculateSellingPrice,
  grossMargin,
  selectPricingRule,
  type PricingRule,
} from "../lib/operations/pricing";

describe("operations pricing", () => {
  it("distinguishes markup from gross margin", () => {
    expect(calculateSellingPrice(100, "markup", 0.25)).toBe(125);
    expect(calculateSellingPrice(100, "margin", 0.25)).toBeCloseTo(133.34, 2);
  });

  it("rounds upwards to the configured commercial increment", () => {
    expect(calculateSellingPrice(10, "markup", 0.2, 0.5)).toBe(12);
    expect(calculateSellingPrice(10.01, "markup", 0.2, 0.5)).toBe(12.5);
  });

  it("calculates gross margin safely", () => {
    expect(grossMargin(150, 100)).toBeCloseTo(1 / 3);
    expect(grossMargin(0, 100)).toBeNull();
  });

  it("selects the most specific active rule", () => {
    const rules: PricingRule[] = [
      {
        id: "global",
        name: "Global",
        scope: "global",
        scope_value: null,
        method: "markup",
        rate: 0.2,
        rounding_increment: 0.01,
        priority: 1,
        active: true,
      },
      {
        id: "category",
        name: "Paper",
        scope: "category",
        scope_value: "Paper",
        method: "margin",
        rate: 0.3,
        rounding_increment: 0.01,
        priority: 100,
        active: true,
      },
      {
        id: "product",
        name: "Specific",
        scope: "product",
        scope_value: "product-1",
        method: "markup",
        rate: 0.1,
        rounding_increment: 0.01,
        priority: 100,
        active: true,
      },
    ];
    expect(
      selectPricingRule(rules, { id: "product-1", category: "Paper" })?.id,
    ).toBe("product");
    expect(
      selectPricingRule(rules, { id: "product-2", category: "Paper" })?.id,
    ).toBe("category");
    expect(
      selectPricingRule(rules, { id: "product-3", category: "Tools" })?.id,
    ).toBe("global");
  });
});
