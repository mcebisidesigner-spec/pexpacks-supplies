import type { PackItem, PackSelectionItem } from "./types";

export function createFullPackSelection(items: PackItem[]): PackSelectionItem[] {
  return items.map((item) => ({
    ...item,
    selected: true,
    selectedQuantity: item.selectedQuantity ?? item.requiredQuantity,
  }));
}

export function createCustomPackSelection(
  items: PackItem[]
): PackSelectionItem[] {
  return createFullPackSelection(items);
}


