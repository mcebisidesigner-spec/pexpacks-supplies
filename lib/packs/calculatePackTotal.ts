import type { PackSelectionItem } from "./types";

export function calculateItemLineTotal(unitPrice: number, quantity: number) {
  return Math.round((unitPrice * quantity + Number.EPSILON) * 100) / 100;
}

function hasPackPricing(items: PackSelectionItem[]) {
  return items.some((item) => typeof item.unitPrice === "number");
}

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
