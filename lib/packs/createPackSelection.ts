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

export function serialiseSelectedItems(items: PackSelectionItem[]) {
  return items
    .filter((item) => item.selected && item.selectedQuantity > 0)
    .map((item) => `${item.selectedQuantity} x ${item.name}`)
    .join("; ");
}

export function serialiseRemovedItems(items: PackSelectionItem[]) {
  return items
    .filter((item) => !item.selected || item.selectedQuantity === 0)
    .map((item) => item.name)
    .join("; ");
}
