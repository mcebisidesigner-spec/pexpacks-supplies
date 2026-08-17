// Pack lines and inventory records currently share stationery_items. This marker
// keeps pack-only copies out of inventory reads without affecting public packs.
export const PACK_LINE_INVENTORY_MARKER = "__pexpacks_pack_line__";
export const INVENTORY_ITEM_FILTER =
  `image.is.null,image.neq.${PACK_LINE_INVENTORY_MARKER}`;
