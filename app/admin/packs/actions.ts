"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { invalidateSchoolSearchCache } from "@/lib/schools/schoolSearchData";
import { SCHOOL_DATA_TAG } from "@/lib/school-utils";
import { requireAdmin } from "@/lib/admin/rbac";
import {
  createPack,
  updatePack,
  updatePackPrice,
  deletePack,
  duplicatePack,
  setPackVisible,
  type PackFormState,
} from "@/lib/admin/packs";

/**
 * Single revalidation call for all pack mutations.
 * Uses revalidateTag instead of multiple revalidatePath calls
 * to conserve Vercel Hobby-plan ISR writes (200K/month limit).
 */
function revalidatePackData() {
  invalidateSchoolSearchCache();
  revalidateTag(SCHOOL_DATA_TAG, { expire: 0 });
}

export async function createPackAction(
  _prev: PackFormState,
  formData: FormData,
): Promise<PackFormState> {
  await requireAdmin({ permission: "packs.create" });
  const result = await createPack(formData);
  if (!result.ok) {
    return { ok: false, errors: result.errors, message: result.message };
  }
  revalidatePackData();
  redirect(`/admin/packs/${result.pack.id}`);
}

export async function createSchoolPackAction(
  schoolId: string,
  schoolRoute: string,
  _prev: PackFormState,
  formData: FormData,
): Promise<PackFormState> {
  await requireAdmin({ permission: "packs.create" });
  formData.set("school_id", schoolId);
  const result = await createPack(formData);
  if (!result.ok) {
    return { ok: false, errors: result.errors, message: result.message };
  }
  void schoolRoute; // was used for revalidatePath, no longer needed
  revalidatePackData();
  redirect(
    `/admin/packs/${encodeURIComponent(result.pack.slug || result.pack.id)}`,
  );
}

export async function updatePackAction(
  id: string,
  _prev: PackFormState,
  formData: FormData,
): Promise<PackFormState> {
  await requireAdmin({ permission: "packs.edit" });
  const result = await updatePack(id, formData);
  if (!result.ok) {
    return { ok: false, errors: result.errors, message: result.message };
  }
  revalidatePackData();
  return { ok: true };
}

export async function updatePackPriceAction(
  id: string,
  _prev: PackFormState,
  formData: FormData,
): Promise<PackFormState> {
  await requireAdmin({ permission: "packs.edit" });
  const rawPrice = formData.get("price");
  const price = typeof rawPrice === "string" ? Number(rawPrice) : Number.NaN;
  if (!Number.isFinite(price)) {
    return { ok: false, errors: { price: "Enter a valid price." } };
  }

  const result = await updatePackPrice(id, price);
  if (!result.ok) {
    return {
      ok: false,
      errors: { price: result.message ?? "Failed to update price." },
    };
  }

  revalidatePackData();
  return { ok: true, message: "Price saved and synced to the public pages." };
}

export async function deletePackAction(id: string): Promise<void> {
  await requireAdmin({ permission: "packs.delete" });
  await deletePack(id);
  revalidatePackData();
}

export async function duplicatePackAction(
  id: string,
): Promise<{ ok: boolean; packId?: string }> {
  await requireAdmin({ permission: "packs.duplicate" });
  const result = await duplicatePack(id);
  if (!result.ok) return { ok: false };
  revalidatePackData();
  return { ok: true, packId: result.packId };
}

export async function setPackVisibleAction(
  id: string,
  visible: boolean,
): Promise<void> {
  await requireAdmin({ permission: "packs.edit" });
  await setPackVisible(id, visible);

  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const admin = createSupabaseAdminClient();
  await admin
    .from("school_packs")
    .select("id, slug, school_id, schools(slug)")
    .eq("id", id)
    .maybeSingle();

  revalidatePackData();
}

export async function setSchoolPacksVisibleAction(
  schoolId: string,
  visible: boolean,
): Promise<void> {
  await requireAdmin({ permission: "packs.edit" });
  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const admin = createSupabaseAdminClient();

  await admin
    .from("school_packs")
    .update({ visible })
    .eq("school_id", schoolId);
  await admin
    .from("schools")
    .update({
      status: visible ? "active" : "inactive",
      published: visible,
    })
    .eq("id", schoolId)
    .select("slug")
    .maybeSingle();

  revalidatePackData();
}

export async function deleteSchoolPacksAction(schoolId: string): Promise<void> {
  await requireAdmin({ permission: "packs.delete" });
  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const admin = createSupabaseAdminClient();
  await admin.from("school_packs").delete().eq("school_id", schoolId);
  revalidatePackData();
}
