"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/rbac";
import { getPublicGradePackPath } from "@/lib/admin/packs";
import { SCHOOL_DATA_TAG } from "@/lib/school-utils";
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
  revalidateTag(SCHOOL_DATA_TAG, { expire: 0 });
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
  revalidatePath(`/admin/packs/${result.item.pack_id}`);
  await revalidatePackPublicPage(result.item.pack_id);
  return { ok: true };
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
