"use server";

import { revalidatePath } from "next/cache";
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
    revalidatePath("/admin/schools");
    revalidatePath("/admin");
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
    revalidatePath("/admin/schools");
    revalidatePath(`/admin/schools/${id}`);
    return { ok: true, message: `School "${result.school.name}" updated.` };
  }
  return { ok: false, errors: result.errors, message: result.message };
}

export async function archiveSchoolAction(id: string): Promise<void> {
  await requireAdmin({ permission: "schools.archive" });
  await setSchoolStatus(id, "archived");
  revalidatePath("/admin/schools");
}

export async function restoreSchoolAction(id: string): Promise<void> {
  await requireAdmin({ permission: "schools.restore" });
  await setSchoolStatus(id, "active");
  revalidatePath("/admin/schools");
}

export async function deleteSchoolAction(id: string): Promise<void> {
  await requireAdmin({ permission: "schools.delete" });
  await deleteSchool(id);
  revalidatePath("/admin/schools");
}
