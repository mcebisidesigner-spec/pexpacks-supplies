// Legacy marker retained only for old stationery_items compatibility.
// Canonical inventory lives in master_products and pack composition in school_pack_items.
export const PACK_LINE_INVENTORY_MARKER = "__pexpacks_pack_line__";
export const INVENTORY_ITEM_FILTER =
  `image.is.null,image.neq.${PACK_LINE_INVENTORY_MARKER}`;

export function inventoryItemNameKey(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-ZA");
}
