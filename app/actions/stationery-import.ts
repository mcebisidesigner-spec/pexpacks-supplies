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

export async function bulkImportStationeryAction(items: CSVStationeryRow[], packId?: string) {
  // Only authenticated staff with the items.import permission may bulk-import.
  const actor = await requireAdmin({ permission: "items.import" });

  if (!items || items.length === 0) {
    throw new Error("No items provided for import.");
  }

  const admin = createSupabaseAdminClient();
  let targetPackId = packId;
  if (!targetPackId) {
    const { data: firstPack } = await admin.from("stationery_packs").select("id").limit(1).maybeSingle();
    targetPackId = firstPack?.id ?? "00000000-0000-0000-0000-000000000000";
  }

  // 2. Format & sanitize payload
  const formattedItems = items.map((item) => ({
    pack_id: targetPackId,
    name: item.title.trim(),
    description: item.description?.trim() || null,
    unit_price: Math.max(0, Number(item.unit_price) || 0),
    specification: item.category?.trim() || "General",
    visible: true,
    updated_at: new Date().toISOString(),
  }));

  // 3. Batch Upsert to Supabase (service role bypasses RLS; the RBAC gate above
  // is the security boundary)
  const { data, error } = await admin
    .from("stationery_items")
    .upsert(formattedItems, {
      ignoreDuplicates: false,
    })
    .select("id");

  if (error) {
    throw new Error(`Database import failed: ${error.message}`);
  }

  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "items.import",
    entityType: "pack",
    entityId: packId,
    summary: `Bulk-imported stationery: ${data?.length ?? formattedItems.length} items`,
  });
  revalidatePath("/admin/items");
  revalidateTag(SCHOOL_DATA_TAG, { expire: 0 });
  return { success: true, importedCount: data?.length ?? formattedItems.length };
}
