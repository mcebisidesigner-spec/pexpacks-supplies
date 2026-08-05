"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/rbac";
import {
  createItem,
  updateItem,
  deleteItem,
  reorderItems,
  importItemsCsv,
  type ItemFormState,
  type ImportItemsResult,
} from "@/lib/admin/items";

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
  return { ok: true };
}

export async function deleteItemAction(id: string): Promise<void> {
  const result = await requireAdmin({ permission: "items.delete" });
  await deleteItem(id);
  revalidatePath(`/admin/packs`);
  revalidatePath(`/admin/items`);
  void result;
}

export async function reorderItemsAction(packId: string, orderedIds: string[]): Promise<void> {
  await requireAdmin({ permission: "items.reorder" });
  await reorderItems(packId, orderedIds);
  revalidatePath(`/admin/packs/${packId}`);
}

export async function importItemsAction(
  packId: string,
  csvText: string
): Promise<ImportItemsResult> {
  await requireAdmin({ permission: "items.import" });
  const result = await importItemsCsv(packId, csvText);
  revalidatePath(`/admin/packs/${packId}`);
  return result;
}
