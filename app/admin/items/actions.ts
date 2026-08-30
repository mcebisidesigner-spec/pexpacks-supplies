"use server";

import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/rbac";
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

/**
 * Single revalidation call for all data mutations.
 * Uses revalidateTag instead of multiple revalidatePath calls
 * to conserve Vercel Hobby-plan ISR writes (200K/month limit).
 */
function revalidateData() {
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
  revalidateData();
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
  revalidateData();
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
  await requireAdmin({ permission: "items.delete" });
  await deleteItem(id);
  revalidateData();
}

export async function reorderItemsAction(packId: string, orderedIds: string[]): Promise<void> {
  await requireAdmin({ permission: "items.reorder" });
  await reorderItems(packId, orderedIds);
  revalidateData();
}

export async function importItemsAction(
  packId: string,
  csvText: string
): Promise<ImportItemsResult> {
  await requireAdmin({ permission: "items.import" });
  try {
    const result = await importItemsCsv(packId, csvText);
    revalidateData();
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
  revalidateData();
  return { ok: true };
}

export async function searchStationeryInventoryAction(
  prefix: string
): Promise<StationeryInventoryItem[]> {
  await requireAdmin({ permission: "items.view" });
  return listStationeryInventory(prefix);
}
