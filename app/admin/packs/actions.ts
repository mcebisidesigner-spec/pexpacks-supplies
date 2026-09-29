"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { revalidateCatalog } from "@/lib/admin/catalog-revalidate";
import { requireAdmin } from "@/lib/admin/rbac";
import {
  createPack,
  updatePack,
  updatePackPrice,
  recalculatePackPrice,
  deletePack,
  duplicatePack,
  setPackVisible,
  getPublicGradePackPath,
  type PackFormState,
} from "@/lib/admin/packs";

export async function createPackAction(
  _prev: PackFormState,
  formData: FormData,
): Promise<PackFormState> {
  await requireAdmin({ permission: "packs.create" });
  const result = await createPack(formData);
  if (!result.ok) {
    return { ok: false, errors: result.errors, message: result.message };
  }
  revalidatePath("/admin/packs");
  revalidatePath("/admin/packs", "layout");
  revalidatePath("/schools");
  revalidatePath("/", "layout");
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
  revalidatePath("/admin/packs");
  revalidatePath("/admin/packs", "layout");
  revalidatePath(`/admin/packs/${schoolRoute}`);
  revalidatePath(`/admin/packs/${result.pack.slug || result.pack.id}`);
  revalidatePath("/schools");
  revalidatePath("/", "layout");
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
  revalidateCatalog();
  revalidatePath(`/admin/packs/${result.pack.id}`);
  revalidatePath("/admin/packs");
  revalidatePath("/schools");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updatePackPriceAction(
  id: string,
  _prev: PackFormState,
  formData: FormData,
): Promise<PackFormState> {
  await requireAdmin({ permission: "packs.edit" });

  const shouldRecalculate = formData.get("recalculate") === "true";
  const rawPrice = formData.get("price");

  if (shouldRecalculate || !rawPrice) {
    const result = await recalculatePackPrice(id);
    if (!result.ok) {
      return {
        ok: false,
        errors: { price: result.message ?? "Failed to recalculate price." },
      };
    }
    revalidateCatalog();
    revalidatePath(`/admin/packs/${id}`);
    revalidatePath("/admin/packs");
    revalidatePath("/schools");
    revalidatePath("/", "layout");
    const path = await getPublicGradePackPath(id);
    if (path) revalidatePath(path);
    return {
      ok: true,
      message: `Price recalculated and synced (R ${(result.price ?? 0).toFixed(2)}).`,
    };
  }

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
  revalidateCatalog();
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
  revalidatePath("/admin/packs", "layout");
  revalidatePath("/schools");
  revalidatePath("/", "layout");
}

export async function duplicatePackAction(
  id: string,
): Promise<{ ok: boolean; packId?: string }> {
  await requireAdmin({ permission: "packs.duplicate" });
  const result = await duplicatePack(id);
  if (!result.ok) return { ok: false };
  revalidatePath("/admin/packs");
  revalidatePath("/admin/packs", "layout");
  revalidatePath("/schools");
  revalidatePath("/", "layout");
  return { ok: true, packId: result.packId };
}

export async function setPackVisibleAction(
  id: string,
  visible: boolean,
): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin({ permission: "packs.edit" });
  const result = await setPackVisible(id, visible);
  if (!result.ok) return result;

  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const admin = createSupabaseAdminClient();
  const { data: pack } = await admin
    .from("school_packs")
    .select("id, slug, school_id, schools(slug)")
    .eq("id", id)
    .maybeSingle();

  const schoolSlug = (pack as { schools?: { slug?: string } | null })?.schools?.slug;
  const packSlug = pack?.slug || pack?.id;
  revalidateCatalog({ schoolSlug, packSlug });
  revalidatePath("/admin/packs");
  revalidatePath(`/admin/packs/${id}`);
  if (schoolSlug) {
    revalidatePath(`/admin/packs/${schoolSlug}`);
    revalidatePath(`/schools/${schoolSlug}`);
  }
  if (packSlug) {
    revalidatePath(`/admin/packs/${packSlug}`);
    revalidatePath(`/schools/packs/${packSlug}`);
  }
  revalidatePath("/schools");
  revalidatePath("/", "layout");
  return result;
}

export async function setSchoolPacksVisibleAction(
  schoolId: string,
  visible: boolean,
): Promise<{ ok: boolean; message?: string }> {
  const actor = await requireAdmin({ permission: "packs.edit" });
  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const admin = createSupabaseAdminClient();

  if (visible) {
    const { error: schoolError } = await admin
      .from("schools")
      .update({
        status: "active",
        published: true,
        publication_status: "published",
      })
      .eq("id", schoolId);
    if (schoolError) return { ok: false, message: "The school could not be published." };

    const { data: packs, error: packsError } = await admin
      .from("school_packs")
      .select("id")
      .eq("school_id", schoolId);
    if (packsError) return { ok: false, message: "The school packs could not be loaded." };

    const results = await Promise.all(
      (packs ?? []).map(async (pack) => {
        const { data, error } = await admin.rpc("publish_school_pack", {
          p_pack_id: pack.id,
          p_user_id: actor.user.id,
        });
        const payload = (data ?? {}) as { success?: boolean; reasons?: unknown };
        if (error || payload.success !== true) {
          const reasons = Array.isArray(payload.reasons)
            ? payload.reasons.filter((reason): reason is string => typeof reason === "string")
            : [];
          return reasons.join(" ") || "Pack is not ready for publication.";
        }
        return null;
      }),
    );
    const failures = results.filter((message): message is string => Boolean(message));
    revalidateCatalog();
    revalidatePath("/admin/packs");
    revalidatePath("/schools");
    revalidatePath("/", "layout");
    return failures.length > 0
      ? { ok: false, message: `${failures.length} pack(s) stayed draft: ${failures[0]}` }
      : { ok: true };
  }

  const { error: packError } = await admin
    .from("school_packs")
    .update({
      visible: false,
      publication_status: "draft",
      published_at: null,
      published_by: null,
    })
    .eq("school_id", schoolId);
  if (packError) return { ok: false, message: "The school packs could not be hidden." };

  const { data: school, error: schoolError } = await admin
    .from("schools")
    .update({ status: "inactive", published: false, publication_status: "draft" })
    .eq("id", schoolId)
    .select("slug")
    .maybeSingle();
  if (schoolError) return { ok: false, message: "The school could not be hidden." };

  revalidateCatalog({ schoolSlug: school?.slug });
  revalidatePath("/admin/packs");
  revalidatePath("/schools");
  revalidatePath("/", "layout");
  return { ok: true };
}
export async function deleteSchoolPacksAction(schoolId: string): Promise<void> {
  await requireAdmin({ permission: "packs.delete" });
  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const admin = createSupabaseAdminClient();
  const { data: school } = await admin
    .from("schools")
    .select("slug")
    .eq("id", schoolId)
    .maybeSingle();
  await admin.from("school_packs").delete().eq("school_id", schoolId);
  revalidateCatalog({ schoolSlug: school?.slug });
  revalidatePath("/admin/packs");
  revalidatePath("/admin/packs", "layout");
  revalidatePath("/schools");
  revalidatePath("/", "layout");
}
