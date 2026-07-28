import type { PackSelectionItem } from "./types";

function hasPackPricing(items: PackSelectionItem[]) {
  return items.some((item) => typeof item.unitPrice === "number");
}

export function calculatePackTotal(items: PackSelectionItem[]) {
  if (!hasPackPricing(items)) {
    return undefined;
  }

  return items.reduce((total, item) => {
    if (!item.selected || typeof item.unitPrice !== "number") {
      return total;
    }

    return total + item.selectedQuantity * item.unitPrice;
  }, 0);
}
