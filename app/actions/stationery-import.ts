"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin, writeAuditLog } from "@/lib/admin/rbac";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { SCHOOL_DATA_TAG } from "@/lib/school-utils";

export interface CSVStationeryRow {
  sku?: string;
  title: string;
  description?: string;
  unit_price: number;
  category?: string;
}

export async function bulkImportStationeryAction(
  items: CSVStationeryRow[],
  packId?: string,
) {
  // Only authenticated staff with the items.import permission may bulk-import.
  const actor = await requireAdmin({ permission: "items.import" });

  if (!items || items.length === 0) {
    throw new Error("No items provided for import.");
  }

  const admin = createSupabaseAdminClient();
  let targetPackId = packId;
  if (!targetPackId) {
    const { data: firstPack } = await admin
      .from("school_packs")
      .select("id")
      .limit(1)
      .maybeSingle();
    targetPackId = firstPack?.id ?? "00000000-0000-0000-0000-000000000000";
  }

  const formattedProducts = items.map((item) => {
    const title = item.title.trim();
    const sku =
      item.sku?.trim().toUpperCase() ||
      `PEX-${title
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80)}`;
    const unitPrice = Math.max(0, Number(item.unit_price) || 0);
    return {
      sku,
      name: title,
      description: item.description?.trim() || null,
      category: item.category?.trim() || "General",
      specification: item.category?.trim() || "General",
      visibility: "public",
      availability: "available",
      current_selling_price: unitPrice,
      calculated_selling_price: unitPrice,
      pricing_status: unitPrice > 0 ? "review" : "unpriced",
      active: true,
      created_by: actor.user.id,
      updated_by: actor.user.id,
      updated_at: new Date().toISOString(),
    };
  });

  const { data, error } = await admin
    .from("master_products")
    .upsert(formattedProducts, {
      onConflict: "sku",
      ignoreDuplicates: false,
    })
    .select("id, sku, name, current_selling_price");

  if (error) {
    throw new Error(`Database import failed: ${error.message}`);
  }

  if (packId && data && data.length > 0) {
    const rows = data.map((product, index) => ({
      pack_id: targetPackId,
      product_id: product.id,
      pack_quantity: 1,
      selling_price_override: product.current_selling_price,
      sort_order: index + 1,
      active: true,
    }));
    const { error: linkError } = await admin
      .from("school_pack_items")
      .upsert(rows, {
        onConflict: "pack_id,product_id",
        ignoreDuplicates: false,
      });
    if (linkError) {
      throw new Error(`Pack composition import failed: ${linkError.message}`);
    }
  }

  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "items.import",
    entityType: "pack",
    entityId: packId,
    summary: `Bulk-imported stationery: ${data?.length ?? formattedProducts.length} products`,
  });
  revalidatePath("/admin/items");
  revalidateTag(SCHOOL_DATA_TAG, { expire: 0 });
  return {
    success: true,
    importedCount: data?.length ?? formattedProducts.length,
  };
}
