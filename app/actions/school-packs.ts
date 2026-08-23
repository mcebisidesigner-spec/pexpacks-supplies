"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, writeAuditLog } from "@/lib/admin/rbac";
import { revalidateCatalog } from "@/lib/admin/catalog-revalidate";

export interface ToggleVisibilityResult {
  ok: boolean;
  message?: string;
  visible?: boolean;
}

/**
 * Toggles a school's visibility between Active (Partnered with Grade Packs)
 * and Hidden (Unpartnered / Not yet an official partner).
 */
export async function toggleSchoolVisibilityAction(
  schoolId: string,
  makeVisible: boolean
): Promise<ToggleVisibilityResult> {
  try {
    const actor = await requireAdmin({ permission: "packs.edit" });
    const admin = createSupabaseAdminClient();

    // 1. Fetch existing school details
    const { data: school, error: fetchErr } = await admin
      .from("schools")
      .select("id, name, slug")
      .eq("id", schoolId)
      .single();

    if (fetchErr || !school) {
      return { ok: false, message: "School record not found." };
    }

    // 2. Update schools table
    // When hidden: refused_partnership = true, is_partner = false (shows "Not yet an official partner")
    // When shown: refused_partnership = false, is_partner = true (shows full grade packs)
    const schoolUpdatePayload = makeVisible
      ? {
          refused_partnership: false,
          is_partner: true,
          status: "published",
          published: true,
          updated_at: new Date().toISOString(),
        }
      : {
          refused_partnership: true,
          is_partner: false,
          updated_at: new Date().toISOString(),
        };

    const { error: schoolUpdateErr } = await admin
      .from("schools")
      .update(schoolUpdatePayload)
      .eq("id", schoolId);

    if (schoolUpdateErr) {
      console.error("[toggleSchoolVisibilityAction] School update failed:", schoolUpdateErr);
      return { ok: false, message: "Failed to update school partnership status." };
    }

    // 3. Update all grade packs associated with this school
    const { error: packsErr } = await admin
      .from("school_packs")
      .update({
        visible: makeVisible,
        updated_at: new Date().toISOString(),
      })
      .eq("school_id", schoolId);

    if (packsErr) {
      console.error("[toggleSchoolVisibilityAction] Pack update by school_id error:", packsErr);
    }

    if (school.slug) {
      await admin
        .from("school_packs")
        .update({
          visible: makeVisible,
          updated_at: new Date().toISOString(),
        })
        .ilike("slug", `${school.slug}-%`);
    }

    // 4. Audit Log
    void writeAuditLog({
      actorId: actor.user.id,
      actorName: actor.user.email,
      action: "packs.update",
      entityType: "school",
      entityId: schoolId,
      summary: `${makeVisible ? "Showed" : "Hidden"} school packs for "${school.name}" (${
        makeVisible ? "Partnered / Active" : "Unpartnered / Not Yet an Official Partner"
      })`,
    });

    // 5. Invalidate caches across public and admin routes
    revalidateCatalog();
    revalidatePath("/schools");
    revalidatePath(`/schools/${school.slug}`);
    revalidatePath("/admin/packs");

    return { ok: true, visible: makeVisible };
  } catch (err) {
    console.error("[toggleSchoolVisibilityAction] Unhandled exception:", err);
    return { ok: false, message: "An unexpected error occurred while updating school visibility." };
  }
}
