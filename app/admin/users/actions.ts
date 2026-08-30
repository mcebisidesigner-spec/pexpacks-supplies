"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/rbac";
import {
  inviteUser,
  syncUserRoles,
  setUserPermissionOverrides,
  deactivateUser,
  reactivateUser,
  deleteUser,
  type InviteResult,
} from "@/lib/admin/users";

export async function inviteUserAction(
  _prev: InviteResult,
  formData: FormData
): Promise<InviteResult> {
  await requireAdmin({ permission: "users.create" });
  const result = await inviteUser(formData);
  if (result.ok) {
    revalidatePath("/admin/users");
  }
  return result;
}

export async function updateUserRolesAction(
  userId: string,
  formData: FormData
): Promise<void> {
  await requireAdmin({ permission: "users.edit" });
  const roles = formData
    .getAll("roles")
    .filter((r): r is string => typeof r === "string" && Boolean(r));
  await syncUserRoles(userId, roles);
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export interface PermissionOverrideState {
  ok?: boolean;
  message?: string;
}

export async function updateUserPermissionsAction(
  userId: string,
  _prev: PermissionOverrideState,
  formData: FormData
): Promise<PermissionOverrideState> {
  await requireAdmin({ permission: "users.edit" });
  const raw = formData.get("overrides");
  let overrides: { key: string; granted: boolean }[] = [];
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        overrides = parsed
          .filter(
            (o): o is { key: string; granted: boolean } =>
              Boolean(o && typeof o.key === "string" && typeof o.granted === "boolean")
          )
          .slice(0, 200);
      }
    } catch {
      overrides = [];
    }
  }
  const result = await setUserPermissionOverrides(userId, overrides);
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { ok: result.ok, message: result.message };
}

export async function deactivateUserAction(userId: string): Promise<void> {
  await requireAdmin({ permission: "users.deactivate" });
  await deactivateUser(userId);
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function reactivateUserAction(userId: string): Promise<void> {
  await requireAdmin({ permission: "users.deactivate" });
  await reactivateUser(userId);
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function deleteUserAction(userId: string): Promise<void> {
  await requireAdmin({ permission: "users.delete" });
  await deleteUser(userId);
  revalidatePath("/admin/users");
}
