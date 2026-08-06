"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import {
  createPack,
  updatePack,
  updatePackPrice,
  deletePack,
  duplicatePack,
  setPackVisible,
  getPublicGradePackPath,
  type PackFormState,
} from "@/lib/admin/packs";

export async function createPackAction(
  _prev: PackFormState,
  formData: FormData
): Promise<PackFormState> {
  await requireAdmin({ permission: "packs.create" });
  const result = await createPack(formData);
  if (!result.ok) {
    return { ok: false, errors: result.errors, message: result.message };
  }
  revalidatePath("/admin/packs");
  revalidatePath("/schools");
  revalidatePath("/", "layout");
  redirect(`/admin/packs/${result.pack.id}`);
}

export async function updatePackAction(
  id: string,
  _prev: PackFormState,
  formData: FormData
): Promise<PackFormState> {
  await requireAdmin({ permission: "packs.edit" });
  const result = await updatePack(id, formData);
  if (!result.ok) {
    return { ok: false, errors: result.errors, message: result.message };
  }
  revalidatePath(`/admin/packs/${result.pack.id}`);
  revalidatePath("/admin/packs");
  revalidatePath("/schools");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updatePackPriceAction(
  id: string,
  _prev: PackFormState,
  formData: FormData
): Promise<PackFormState> {
  await requireAdmin({ permission: "packs.edit" });
  const rawPrice = formData.get("price");
  const price = typeof rawPrice === "string" ? Number(rawPrice) : Number.NaN;
  if (!Number.isFinite(price)) {
    return { ok: false, errors: { price: "Enter a valid price." } };
  }

  const result = await updatePackPrice(id, price);
  if (!result.ok) {
    return { ok: false, errors: { price: result.message ?? "Failed to update price." } };
  }

  revalidatePath(`/admin/packs/${id}`);
  revalidatePath("/admin/packs");
  revalidatePath("/schools");
  revalidatePath("/", "layout");
  const path = await getPublicGradePackPath(id);
  if (path) revalidatePath(path);
  return { ok: true, message: "Price saved and synced to the public pages." };
}

export async function deletePackAction(id: string): Promise<void> {
  await requireAdmin({ permission: "packs.delete" });
  await deletePack(id);
  revalidatePath("/admin/packs");
  revalidatePath("/schools");
  revalidatePath("/", "layout");
  redirect("/admin/packs");
}

export async function duplicatePackAction(id: string): Promise<{ ok: boolean; packId?: string }> {
  await requireAdmin({ permission: "packs.duplicate" });
  const result = await duplicatePack(id);
  if (!result.ok) return { ok: false };
  revalidatePath("/admin/packs");
  revalidatePath("/schools");
  revalidatePath("/", "layout");
  return { ok: true, packId: result.packId };
}

export async function setPackVisibleAction(id: string, visible: boolean): Promise<void> {
  await requireAdmin({ permission: "packs.edit" });
  await setPackVisible(id, visible);
  revalidatePath("/admin/packs");
  revalidatePath(`/admin/packs/${id}`);
  revalidatePath("/schools");
  revalidatePath("/", "layout");
}
