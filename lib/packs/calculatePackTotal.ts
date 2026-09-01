import type { PackSelectionItem } from "./types";

export function calculateItemLineTotal(unitPrice: number, quantity: number) {
  return Math.round((unitPrice * quantity + Number.EPSILON) * 100) / 100;
}

function hasPackPricing(items: PackSelectionItem[]) {
  return items.some((item) => typeof item.unitPrice === "number");
}

export type CustomPackPricingOptions = {
  fullPackPrice?: number | null;
  marginRate?: number | null;
  fixedPackCost?: number | null;
};

/**
 * Calculates raw items subtotal without margin or fixed pack costs.
 */
export function calculatePackTotal(items: PackSelectionItem[]) {
  if (!hasPackPricing(items)) {
    return undefined;
  }

  const total = items.reduce((sum, item) => {
    if (!item.selected || typeof item.unitPrice !== "number") {
      return sum;
    }

    return sum + calculateItemLineTotal(item.unitPrice, item.selectedQuantity);
  }, 0);

  return calculateItemLineTotal(total, 1);
}

/**
 * Authoritative custom pack price calculation matching the Grade Pack pricing formula:
 * Total = (sum(item.unitPrice * item.selectedQuantity) / (1 - marginRate)) + fixedPackCost
 *
 * When items are added or removed, the cost delta is adjusted by the gross margin target
 * and added/subtracted from the pack total, ensuring gross margin target and fixed costs
 * (packaging, assembly, freight) are fully preserved.
 */
export function calculateCustomPackTotal(
  items: PackSelectionItem[],
  options?: CustomPackPricingOptions,
): number | undefined {
  if (!hasPackPricing(items)) {
    return undefined;
  }

  // If no items are selected at all, return 0
  const hasSelectedItems = items.some(
    (item) => item.selected && item.selectedQuantity > 0,
  );
  if (!hasSelectedItems) {
    return 0;
  }

  // Selected items subtotal
  const selectedItemsSubtotal = items.reduce((sum, item) => {
    if (!item.selected || typeof item.unitPrice !== "number") {
      return sum;
    }
    return sum + calculateItemLineTotal(item.unitPrice, item.selectedQuantity);
  }, 0);

  // Check if exactly the full pack items and required quantities are selected
  const isFullPack =
    items.length > 0 &&
    items.every(
      (item) =>
        item.selected && item.selectedQuantity === item.requiredQuantity,
    );

  const fullPackPrice = options?.fullPackPrice ?? null;

  if (isFullPack && typeof fullPackPrice === "number" && fullPackPrice > 0) {
    return fullPackPrice;
  }

  const baseItemsSubtotal = items.reduce((sum, item) => {
    if (typeof item.unitPrice !== "number") return sum;
    return sum + calculateItemLineTotal(item.unitPrice, item.requiredQuantity);
  }, 0);

  const marginRate = options?.marginRate ?? null;
  let fixedPackCost = options?.fixedPackCost ?? null;

  // If fixedPackCost is not explicitly provided (or 0) but fullPackPrice and baseItemsSubtotal exist,
  // derive the fixed pack cost from the base pack definition.
  if (
    typeof marginRate === "number" &&
    marginRate > 0 &&
    marginRate < 1 &&
    typeof fullPackPrice === "number" &&
    fullPackPrice > 0 &&
    baseItemsSubtotal > 0
  ) {
    const baseItemsWithMargin = baseItemsSubtotal / (1 - marginRate);
    if (typeof fixedPackCost !== "number" || fixedPackCost <= 0) {
      if (fullPackPrice > baseItemsWithMargin) {
        fixedPackCost = fullPackPrice - baseItemsWithMargin;
      }
    }
  }

  // If marginRate is valid, calculate (items / (1 - marginRate)) + fixedPackCost
  if (typeof marginRate === "number" && marginRate > 0 && marginRate < 1) {
    const safeFixedCost =
      typeof fixedPackCost === "number" ? Math.max(0, fixedPackCost) : 0;
    const itemsWithMargin = selectedItemsSubtotal / (1 - marginRate);
    return (
      Math.round((itemsWithMargin + safeFixedCost + Number.EPSILON) * 100) / 100
    );
  }

  // If marginRate was not given, but fullPackPrice and baseItemsSubtotal exist
  if (
    typeof fullPackPrice === "number" &&
    fullPackPrice > 0 &&
    baseItemsSubtotal > 0
  ) {
    if (typeof fixedPackCost === "number" && fullPackPrice > fixedPackCost) {
      const derivedMarginRate =
        1 - baseItemsSubtotal / (fullPackPrice - fixedPackCost);
      if (derivedMarginRate > 0 && derivedMarginRate < 1) {
        const itemsWithMargin = selectedItemsSubtotal / (1 - derivedMarginRate);
        return (
          Math.round((itemsWithMargin + fixedPackCost + Number.EPSILON) * 100) /
          100
        );
      }
    }
    // Fallback markup multiplier
    const markupMultiplier = fullPackPrice / baseItemsSubtotal;
    return (
      Math.round(
        (selectedItemsSubtotal * markupMultiplier + Number.EPSILON) * 100,
      ) / 100
    );
  }

  // Final fallback to raw item subtotal if no pack pricing metadata exists
  return calculateItemLineTotal(selectedItemsSubtotal, 1);
}
