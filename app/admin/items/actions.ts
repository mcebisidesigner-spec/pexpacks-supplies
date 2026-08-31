"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/rbac";
import { getPublicGradePackPath } from "@/lib/admin/packs";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  createItem,
  updateItem,
  deleteItem,
  reorderItems,
  importItemsCsv,
  reconcilePackItems,
  listStationeryInventory,
  type ItemFormState,
  type ImportItemsResult,
  type StationeryInventoryItem,
  type PackLineInput,
} from "@/lib/admin/items";

async function revalidatePackPublicPage(packId: string) {
  const path = await getPublicGradePackPath(packId);
  if (path) revalidatePath(path);
}

export async function createItemAction(
  _prev: ItemFormState,
  formData: FormData
): Promise<ItemFormState> {
  await requireAdmin({ permission: "items.create" });
  const result = await createItem(formData);
  if (!result.ok) {
    return { ok: false, errors: result.errors, message: result.message };
  }
  revalidatePath("/admin/items");
  revalidatePath(`/admin/packs/${result.item.pack_id}`);
  await revalidatePackPublicPage(result.item.pack_id);
  return { ok: true };
}

export async function updateItemAction(
  id: string,
  _prev: ItemFormState,
  formData: FormData
): Promise<ItemFormState> {
  await requireAdmin({ permission: "items.edit" });
  const result = await updateItem(id, formData);
  if (!result.ok) {
    return { ok: false, errors: result.errors, message: result.message };
  }
  revalidatePath("/admin/items");
  revalidatePath("/admin/products");
  if (result.item.pack_id) {
    revalidatePath(`/admin/packs/${result.item.pack_id}`);
    await revalidatePackPublicPage(result.item.pack_id);
  }
  return {
    ok: true,
    message: result.message,
    item: {
      id: result.item.id,
      name: result.item.name,
      slug: result.item.slug ?? null,
    },
  };
}

export async function deleteItemAction(id: string): Promise<void> {
  const result = await requireAdmin({ permission: "items.delete" });
  const deleted = await deleteItem(id);
  revalidatePath(`/admin/packs`);
  revalidatePath(`/admin/items`);
  if (deleted.packId) await revalidatePackPublicPage(deleted.packId);
  void result;
}

export async function reorderItemsAction(packId: string, orderedIds: string[]): Promise<void> {
  await requireAdmin({ permission: "items.reorder" });
  await reorderItems(packId, orderedIds);
  revalidatePath(`/admin/packs/${packId}`);
  await revalidatePackPublicPage(packId);
}

export async function importItemsAction(
  packId: string,
  csvText: string
): Promise<ImportItemsResult> {
  await requireAdmin({ permission: "items.import" });
  try {
    const result = await importItemsCsv(packId, csvText);
    revalidatePath(`/admin/packs/${packId}`);
    await revalidatePackPublicPage(packId);
    return result;
  } catch (err) {
    console.error("[items] csv import failed:", err);
    return {
      ok: false,
      created: 0,
      updated: 0,
      errors: [err instanceof Error ? err.message : "CSV import failed."],
    };
  }
}

export async function savePackItemsAction(
  packId: string,
  lines: PackLineInput[]
): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin({ permission: "items.edit" });
  const result = await reconcilePackItems(packId, lines);
  if (!result.ok) {
    return { ok: false, message: result.message ?? "Failed to save items." };
  }
  revalidatePath(`/admin/packs/${packId}`);
  revalidatePath("/admin/items");
  await revalidatePackPublicPage(packId);
  return { ok: true };
}

export async function searchStationeryInventoryAction(
  prefix: string
): Promise<StationeryInventoryItem[]> {
  await requireAdmin({ permission: "items.view" });
  return listStationeryInventory(prefix);
}

export async function updatePackItemQuantityAction(
  itemId: string,
  quantity: number
): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin({ permission: "items.edit" });
  const sanitizedQty = Math.max(1, Math.floor(quantity));
  const admin = createSupabaseAdminClient();

  const { data: item, error: fetchErr } = await admin
    .from("school_pack_items")
    .select("id, pack_id")
    .eq("id", itemId)
    .maybeSingle();

  if (fetchErr || !item) {
    return { ok: false, message: "Item not found in pack." };
  }

  const { error: updateErr } = await admin
    .from("school_pack_items")
    .update({ pack_quantity: sanitizedQty, updated_at: new Date().toISOString() })
    .eq("id", itemId);

  if (updateErr) {
    return { ok: false, message: updateErr.message };
  }

  revalidatePath(`/admin/packs/${item.pack_id}`);
  revalidatePath("/admin/packs");
  revalidatePath("/admin/items");
  await revalidatePackPublicPage(item.pack_id);
  return { ok: true };
}
