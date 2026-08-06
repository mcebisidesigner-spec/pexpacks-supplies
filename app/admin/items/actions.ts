"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/rbac";
import { getPublicGradePackPath } from "@/lib/admin/packs";
import {
  createItem,
  updateItem,
  deleteItem,
  reorderItems,
  importItemsCsv,
  type ItemFormState,
  type ImportItemsResult,
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
  const result = await importItemsCsv(packId, csvText);
  revalidatePath(`/admin/packs/${packId}`);
  await revalidatePackPublicPage(packId);
  return result;
}
