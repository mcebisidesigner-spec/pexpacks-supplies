"use server";

import { revalidateTag } from "next/cache";
import { invalidateSchoolSearchCache } from "@/lib/schools/schoolSearchData";
import { SCHOOL_DATA_TAG } from "@/lib/school-utils";
import { requireAdmin } from "@/lib/admin/rbac";
import {
  getSchool,
  listSchools,
  createSchool,
  updateSchool,
  setSchoolStatus,
  deleteSchool,
  type SchoolFormState,
  type SchoolListFilters,
  type SchoolListResult,
} from "@/lib/admin/schools";

/**
 * Single revalidation call for all school mutations.
 * Uses revalidateTag instead of multiple revalidatePath calls
 * to conserve Vercel Hobby-plan ISR writes (200K/month limit).
 */
function revalidateSchoolData() {
  invalidateSchoolSearchCache();
  revalidateTag(SCHOOL_DATA_TAG, { expire: 0 });
}

export async function createSchoolAction(
  _prev: SchoolFormState,
  formData: FormData
): Promise<SchoolFormState> {
  await requireAdmin({ permission: "schools.create" });
  const result = await createSchool(formData);
  if (result.ok) {
    revalidateSchoolData();
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
    revalidateSchoolData();
    return { ok: true, message: `School "${result.school.name}" updated.` };
  }
  return { ok: false, errors: result.errors, message: result.message };
}

export async function hideSchoolAction(id: string): Promise<void> {
  await requireAdmin({ permission: "schools.archive" });
  await setSchoolStatus(id, "archived");
  revalidateSchoolData();
}

export async function showSchoolAction(id: string): Promise<void> {
  await requireAdmin({ permission: "schools.restore" });
  await setSchoolStatus(id, "active");
  revalidateSchoolData();
}

export async function deleteSchoolAction(id: string): Promise<void> {
  await requireAdmin({ permission: "schools.delete" });
  await deleteSchool(id);
  revalidateSchoolData();
}

export async function listSchoolsAction(filters: SchoolListFilters = {}): Promise<SchoolListResult> {
  await requireAdmin({ permission: "schools.view" });
  return listSchools(filters);
}

export async function toggleSchoolVisibilityAction(schoolId: string): Promise<{ ok: boolean; newStatus?: string; message?: string }> {
  await requireAdmin({ permission: "schools.edit" });
  const school = await getSchool(schoolId);
  if (!school) return { ok: false, message: "School not found" };

  const nextStatus = school.status === "active" ? "inactive" : "active";
  const res = await setSchoolStatus(school.id, nextStatus);
  if (res.ok) {
    revalidateSchoolData();
  }
  return { ...res, newStatus: nextStatus };
}
