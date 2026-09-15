// Marker used to exclude generated pack-line rows from catalogue item filters.
// Canonical inventory lives in master_products and pack composition in school_pack_items.
export const PACK_LINE_INVENTORY_MARKER = "__pexpacks_pack_line__";
export const INVENTORY_ITEM_FILTER =
  `image.is.null,image.neq.${PACK_LINE_INVENTORY_MARKER}`;

export function inventoryItemNameKey(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-ZA");
}

export const MASTER_PRODUCT_CATEGORIES = [
  "Adhesives",
  "Art Supplies",
  "Book Covering",
  "Calculators",
  "Colouring",
  "Cutting",
  "Digital",
  "Erasers",
  "Exercise Books",
  "Filing",
  "Fineliners",
  "Hardcover Books",
  "Highlighters",
  "Markers",
  "Mathematics",
  "Measurement",
  "Packaging",
  "Paper",
  "Pencil Cases",
  "Pencils",
  "Pens",
  "Sharpeners",
  "Stationery",
] as const;

export type MasterProductCategory = (typeof MASTER_PRODUCT_CATEGORIES)[number];
