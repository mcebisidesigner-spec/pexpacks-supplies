"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/rbac";
import {
  createRole,
  updateRole,
  deleteRole,
  setRolePermissions,
  type RoleFormState,
} from "@/lib/admin/roles";

function parsePermissionKeys(formData: FormData): string[] {
  const raw = formData.get("permissions");
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((p): p is string => typeof p === "string").slice(0, 200);
    }
  } catch {
    return [];
  }
  return [];
}

export async function createRoleAction(
  _prev: RoleFormState,
  formData: FormData
): Promise<RoleFormState> {
  await requireAdmin({ permission: "roles.manage" });
  const permissionKeys = parsePermissionKeys(formData);
  const result = await createRole(formData);
  if (result.ok) {
    if (permissionKeys.length > 0) {
      await setRolePermissions(result.role.id, permissionKeys);
    }
    revalidatePath("/admin/roles");
    revalidatePath("/admin");
    return { ok: true, message: `Role "${result.role.name}" created.` };
  }
  return { ok: false, errors: result.errors, message: result.message };
}

export async function updateRoleAction(
  id: string,
  _prev: RoleFormState,
  formData: FormData
): Promise<RoleFormState> {
  await requireAdmin({ permission: "roles.manage" });
  const permissionKeys = parsePermissionKeys(formData);
  const result = await updateRole(id, formData);
  if (result.ok) {
    await setRolePermissions(id, permissionKeys);
    revalidatePath("/admin/roles");
    revalidatePath(`/admin/roles/${id}`);
    return { ok: true, message: `Role "${result.role.name}" updated.` };
  }
  return { ok: false, errors: result.errors, message: result.message };
}

export async function deleteRoleAction(roleId: string): Promise<void> {
  await requireAdmin({ permission: "roles.manage" });
  await deleteRole(roleId);
  revalidatePath("/admin/roles");
}
