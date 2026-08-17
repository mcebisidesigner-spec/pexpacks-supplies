export type PricingMethod = "markup" | "margin";

export type PricingRule = {
  id: string;
  name: string;
  scope: "global" | "category" | "brand" | "product";
  scope_value: string | null;
  method: PricingMethod;
  rate: number;
  rounding_increment: number;
  priority: number;
  active: boolean;
};

export function calculateSellingPrice(
  cost: number,
  method: PricingMethod,
  rate: number,
  roundingIncrement = 0.01,
) {
  if (!Number.isFinite(cost) || cost < 0)
    throw new Error("Cost must be zero or greater.");
  if (!Number.isFinite(rate) || rate < 0 || rate >= 1)
    throw new Error("Pricing rate must be between 0 and 1.");
  if (!Number.isFinite(roundingIncrement) || roundingIncrement <= 0)
    throw new Error("Rounding increment must be greater than zero.");
  const raw = method === "margin" ? cost / (1 - rate) : cost * (1 + rate);
  return Math.ceil(raw / roundingIncrement) * roundingIncrement;
}

export function grossMargin(sellingPrice: number, cost: number) {
  return sellingPrice > 0 ? (sellingPrice - cost) / sellingPrice : null;
}

export function selectPricingRule(
  rules: PricingRule[],
  product: { id: string; category?: string | null; brand?: string | null },
) {
  return (
    [...rules]
      .filter((rule) => {
        if (!rule.active) return false;
        if (rule.scope === "global") return true;
        if (rule.scope === "product") return rule.scope_value === product.id;
        if (rule.scope === "category")
          return (
            rule.scope_value?.toLowerCase() === product.category?.toLowerCase()
          );
        return rule.scope_value?.toLowerCase() === product.brand?.toLowerCase();
      })
      .sort((a, b) => {
        const specificity = { global: 0, category: 1, brand: 2, product: 3 };
        return (
          specificity[b.scope] - specificity[a.scope] || a.priority - b.priority
        );
      })[0] ?? null
  );
}
