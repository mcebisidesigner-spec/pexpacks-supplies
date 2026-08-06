"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/rbac";
import {
  uploadAsset,
  updateAsset,
  deleteAsset,
  type AssetFormState,
} from "@/lib/admin/assets";

export async function uploadAssetAction(
  _prev: AssetFormState,
  formData: FormData
): Promise<AssetFormState> {
  await requireAdmin({ permission: "assets.upload" });
  const file = formData.get("file");
  const alt = formData.get("alt_text");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose a file to upload." };
  }
  const result = await uploadAsset(file, typeof alt === "string" ? alt : "");
  if (result.ok) revalidatePath("/admin/assets");
  return result;
}

export async function updateAssetAction(
  id: string,
  _prev: AssetFormState,
  formData: FormData
): Promise<AssetFormState> {
  await requireAdmin({ permission: "assets.manage" });
  const name = formData.get("name");
  const alt = formData.get("alt_text");
  const result = await updateAsset(id, {
    name: typeof name === "string" ? name : "",
    alt_text: typeof alt === "string" ? alt : "",
  });
  if (result.ok) revalidatePath("/admin/assets");
  return result;
}

export async function deleteAssetAction(id: string): Promise<void> {
  await requireAdmin({ permission: "assets.manage" });
  const result = await deleteAsset(id);
  if (result.ok) revalidatePath("/admin/assets");
}
