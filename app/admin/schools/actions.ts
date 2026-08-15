"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { invalidateSchoolSearchCache } from "@/lib/schools/schoolSearchData";
import { SCHOOL_DATA_TAG } from "@/lib/school-utils";
import { requireAdmin } from "@/lib/admin/rbac";
import {
  createSchool,
  updateSchool,
  setSchoolStatus,
  deleteSchool,
  type SchoolFormState,
} from "@/lib/admin/schools";

export async function createSchoolAction(
  _prev: SchoolFormState,
  formData: FormData
): Promise<SchoolFormState> {
  await requireAdmin({ permission: "schools.create" });
  const result = await createSchool(formData);
  if (result.ok) {
    invalidateSchoolSearchCache();
    revalidateTag(SCHOOL_DATA_TAG, { expire: 0 });
    revalidatePublicSchoolSurfaces();
    revalidatePath("/admin");
    if (result.school.slug) {
      revalidatePath(`/schools/${result.school.slug}`);
    }
    return { ok: true, message: `School "${result.school.name}" created.` };
  }
  return { ok: false, errors: result.errors, message: result.message };
}

export async function updateSchoolAction(
  id: string,
  _prev: SchoolFormState,
  formData: FormData
): Promise<SchoolFormState> {
  await requireAdmin({ permission: "schools.edit" });
  const result = await updateSchool(id, formData);
  if (result.ok) {
    invalidateSchoolSearchCache();
    revalidateTag(SCHOOL_DATA_TAG, { expire: 0 });
    revalidatePublicSchoolSurfaces();
    revalidatePath(`/admin/schools/${id}`);
    revalidatePath(`/admin/schools/${id}/profile`);
    if (result.school.slug) {
      revalidatePath(`/schools/${result.school.slug}`);
    }
    return { ok: true, message: `School "${result.school.name}" updated.` };
  }
  return { ok: false, errors: result.errors, message: result.message };
}

function revalidatePublicSchoolSurfaces() {
  revalidatePath("/admin/schools");
  revalidatePath("/schools");
  revalidatePath("/partnership");
  revalidatePath("/sitemap.xml");
  revalidatePath("/api/google-merchant-feed");
}

export async function hideSchoolAction(id: string): Promise<void> {
  await requireAdmin({ permission: "schools.archive" });
  await setSchoolStatus(id, "archived");
  invalidateSchoolSearchCache();
  revalidateTag(SCHOOL_DATA_TAG, { expire: 0 });
  revalidatePublicSchoolSurfaces();
}

export async function showSchoolAction(id: string): Promise<void> {
  await requireAdmin({ permission: "schools.restore" });
  await setSchoolStatus(id, "active");
  invalidateSchoolSearchCache();
  revalidateTag(SCHOOL_DATA_TAG, { expire: 0 });
  revalidatePublicSchoolSurfaces();
}

export async function deleteSchoolAction(id: string): Promise<void> {
  await requireAdmin({ permission: "schools.delete" });
  await deleteSchool(id);
  invalidateSchoolSearchCache();
  revalidateTag(SCHOOL_DATA_TAG, { expire: 0 });
  revalidatePublicSchoolSurfaces();
}
