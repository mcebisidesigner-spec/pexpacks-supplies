"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/rbac";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface CSVStationeryRow {
  sku?: string;
  title: string;
  description?: string;
  unit_price: number;
  category?: string;
}

export async function bulkImportStationeryAction(items: CSVStationeryRow[], packId: string) {
  // Only authenticated staff with the items.import permission may bulk-import.
  await requireAdmin({ permission: "items.import" });

  if (!items || items.length === 0) {
    throw new Error("No items provided for import.");
  }
  if (!packId) {
    throw new Error("A target grade pack is required for import.");
  }

  // 2. Format & sanitize payload
  const formattedItems = items.map((item) => ({
    pack_id: packId,
    name: item.title.trim(),
    description: item.description?.trim() || null,
    unit_price: Math.max(0, Number(item.unit_price) || 0),
    specification: item.category?.trim() || "General",
    visible: true,
    updated_at: new Date().toISOString(),
  }));

  // 3. Batch Upsert to Supabase (service role bypasses RLS; the RBAC gate above
  // is the security boundary)
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("stationery_items")
    .upsert(formattedItems, {
      ignoreDuplicates: false,
    })
    .select("id");

  if (error) {
    throw new Error(`Database import failed: ${error.message}`);
  }

  revalidatePath("/admin/items");
  return { success: true, importedCount: data?.length ?? formattedItems.length };
}
