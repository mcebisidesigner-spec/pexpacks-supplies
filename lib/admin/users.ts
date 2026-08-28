import type { User } from "@supabase/supabase-js";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminUser, hasPermission, writeAuditLog, type PermissionKey, type AdminSession } from "@/lib/admin/rbac";

/**
 * Staff / customer directory backed by Supabase Auth plus the RBAC mapping
 * tables. Role and permission overrides are stored in `user_roles` /
 * `user_permissions` and synced to the `auth.users` JWT claims via the
 * `grant_role` / `revoke_role` RPCs.
 */

export interface RoleInfo {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface UserListItem extends User {
  roleIds: string[];
  roleSlugs: string[];
  isStaff: boolean;
}

export interface UserListResult {
  users: UserListItem[];
  total: number;
  page: number;
  pageCount: number;
  roleOptions: RoleInfo[];
}

export interface UserListFilters {
  q?: string;
  role?: string;
  page?: number;
  pageSize?: number;
}

async function assertCan(permission: PermissionKey): Promise<AdminSession> {
  const session = await getAdminUser();
  if (!session || !hasPermission(session, permission)) {
    const err = new Error("You don't have permission to do that.");
    (err as Error & { status?: number }).status = 403;
    throw err;
  }
  return session;
}

function roleLabels(user: User): { fullName: string } {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  return {
    fullName:
      (meta["full_name"] as string) ||
      (meta["name"] as string) ||
      user.email?.split("@")[0] ||
      "—",
  };
}

/** Pulls every auth user via pagination (fine for a staff directory). */
async function fetchAllAuthUsers(): Promise<User[]> {
  const admin = createSupabaseAdminClient();
  const users: User[] = [];
  let page = 1;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 500 });
    if (error) throw error;
    const batch = data?.users ?? [];
    users.push(...batch);
    if (batch.length < 500) break;
    page += 1;
  }
  return users;
}

export async function listRoles(): Promise<RoleInfo[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("roles")
    .select("id, name, slug, description")
    .order("name", { ascending: true });
  if (error) return [];
  return data ?? [];
}

async function buildRoleMap(): Promise<Map<string, { roleIds: string[]; roleSlugs: string[] }>> {
  const admin = createSupabaseAdminClient();
  const [userRoles, roles] = await Promise.all([
    admin.from("user_roles").select("user_id, role_id"),
    admin.from("roles").select("id, slug"),
  ]);
  const slugById = new Map((roles.data ?? []).map((r) => [r.id, r.slug]));
  const map = new Map<string, { roleIds: string[]; roleSlugs: string[] }>();
  for (const row of userRoles.data ?? []) {
    const entry = map.get(row.user_id) ?? { roleIds: [], roleSlugs: [] };
    entry.roleIds.push(row.role_id);
    const slug = slugById.get(row.role_id);
    if (slug) entry.roleSlugs.push(slug);
    map.set(row.user_id, entry);
  }
  return map;
}

export async function listUsers(filters: UserListFilters = {}): Promise<UserListResult> {
  const roleOptions = await listRoles();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 20));
  const needsFullScan = Boolean(filters.q?.trim() || filters.role);
  let users: User[] = [];
  let authTotal: number | null = null;
  try {
    if (needsFullScan) {
      users = await fetchAllAuthUsers();
    } else {
      const admin = createSupabaseAdminClient();
      const res = (await admin.auth.admin.listUsers({
        page,
        perPage: pageSize,
      })) as unknown as {
        data?: { users?: User[] };
        count?: number | null;
        error?: unknown;
      };
      if (res.error) throw res.error;
      users = res.data?.users ?? [];
      authTotal = res.count ?? null;
    }
  } catch (err) {
    console.error("[users] list failed:", err);
  }

  const roleMap = await buildRoleMap();
  const q = filters.q?.trim().toLowerCase();

  let filtered = users.map((u) => {
    const { roleIds, roleSlugs } = roleMap.get(u.id) ?? { roleIds: [], roleSlugs: [] };
    const { fullName } = roleLabels(u);
    return {
      ...u,
      roleIds,
      roleSlugs,
      isStaff: roleSlugs.length > 0 || (u.app_metadata as Record<string, unknown> | undefined)?.role === "admin",
      __search: `${u.email ?? ""} ${fullName} ${u.id}`.toLowerCase(),
    } as UserListItem & { __search: string };
  });

  if (q) filtered = filtered.filter((u) => u.__search.includes(q));
  if (filters.role) filtered = filtered.filter((u) => u.roleSlugs.includes(filters.role as string));

  const total = needsFullScan ? filtered.length : authTotal ?? filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize;
  const sorted = filtered.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
  const slice = needsFullScan ? sorted.slice(from, from + pageSize) : sorted;
  for (const u of slice) delete (u as UserListItem & { __search?: string }).__search;

  return {
    users: slice,
    total,
    page,
    pageCount,
    roleOptions,
  };
}

export async function getUser(id: string): Promise<UserListItem | null> {
  try {
    const admin = createSupabaseAdminClient();
    const { data } = await admin.auth.admin.getUserById(id);
    const user = data?.user;
    if (!user) return null;
    const roleMap = await buildRoleMap();
    const { roleIds, roleSlugs } = roleMap.get(id) ?? { roleIds: [], roleSlugs: [] };
    return {
      ...user,
      roleIds,
      roleSlugs,
      isStaff: roleSlugs.length > 0 || (user.app_metadata as Record<string, unknown> | undefined)?.role === "admin",
    };
  } catch (err) {
    console.error("[users] get failed:", err);
    return null;
  }
}

export async function getUserPermissionKeys(userId: string): Promise<{ key: string; granted: boolean }[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("user_permissions")
    .select("permission_id, granted")
    .eq("user_id", userId);
  if (error || !data || data.length === 0) return [];
  const ids = [...new Set(data.map((d) => d.permission_id))];
  const { data: perms } = await admin.from("permissions").select("id, key").in("id", ids);
  const keyById = new Map((perms ?? []).map((p) => [p.id, p.key]));
  return data
    .map((d) => ({ key: keyById.get(d.permission_id) ?? "", granted: d.granted }))
    .filter((d) => Boolean(d.key));
}

export function isBanned(user: User): boolean {
  return Boolean(user.banned_until && new Date(user.banned_until).getTime() > Date.now());
}

const inviteEmailSchema = z.string().trim().toLowerCase().email("Enter a valid email address").max(200);

export interface InviteResult {
  ok: boolean;
  errors?: Record<string, string>;
  message?: string;
  userId?: string;
}

function generateSecureTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let randomPart = "";
  for (let i = 0; i < 8; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `Pex#${randomPart}26!`;
}

export async function inviteUser(formData: FormData): Promise<InviteResult> {
  const actor = await assertCan("users.create");
  const parsed = inviteEmailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { ok: false, errors: { email: "Enter a valid email address." } };
  }
  const email = parsed.data;
  const fullName = typeof formData.get("full_name") === "string" ? String(formData.get("full_name")).trim() : "";
  const department = typeof formData.get("department") === "string" ? String(formData.get("department")).trim() : "";
  const roleSlugsRaw = formData.getAll("roles");
  const roleSlugs = roleSlugsRaw.filter((r): r is string => typeof r === "string" && Boolean(r));

  try {
    const admin = createSupabaseAdminClient();
    const tempPassword = generateSecureTempPassword();
    let userId: string;

    const { data: createData, error: createError } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        name: fullName,
        department: department || undefined,
        must_change_password: true,
        onboarded_via: "users_directory",
      },
    });

    if (createError) {
      const errMsg = createError.message.toLowerCase();
      if (errMsg.includes("already registered") || errMsg.includes("already exists") || errMsg.includes("duplicate")) {
        const { data: listData } = await admin.auth.admin.listUsers();
        const existing = listData?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
        if (existing) {
          userId = existing.id;
          const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
              ...existing.user_metadata,
              full_name: fullName,
              name: fullName,
              department: department || undefined,
              must_change_password: true,
            },
          });
          if (updateError) throw updateError;
        } else {
          return { ok: false, errors: {}, message: `A user with email ${email} is already registered.` };
        }
      } else {
        throw createError;
      }
    } else {
      userId = createData.user.id;
    }

    if (!userId) throw new Error("No user returned from invite");

    const allRoles = await listRoles();
    const assigned: string[] = [];
    const assignedRolesInfo: { slug: string; name: string; description: string }[] = [];

    for (const slug of roleSlugs) {
      try {
        await admin.rpc("grant_role", { target_user_id: userId, role_slug: slug, granted_by: actor.user.id });
        assigned.push(slug);
        const matched = allRoles.find((r) => r.slug === slug);
        if (matched) {
          assignedRolesInfo.push({
            slug: matched.slug,
            name: matched.name,
            description: matched.description || "",
          });
        }
      } catch (err) {
        console.error(`[users] grant_role ${slug} failed:`, err);
      }
    }

    void writeAuditLog({
      actorId: actor.user.id,
      actorName: actor.user.email,
      action: "users.create",
      entityType: "user",
      entityId: userId,
      summary: `Invited ${email} with temporary credentials`,
      details: { roles: assigned },
    });

    const { sendUserInvitationEmail } = await import("@/lib/email/sendUserInvitationEmail");
    await sendUserInvitationEmail({
      toEmail: email,
      fullName: fullName || email.split("@")[0],
      department: department || undefined,
      roles: assignedRolesInfo,
      invitedByName: actor.user.email,
      tempPassword,
    });

    return { ok: true, message: `Invitation sent to ${email} with temporary credentials.`, userId };
  } catch (err) {
    console.error("[users] invite failed:", err);
    return { ok: false, errors: {}, message: "Failed to invite user. Check the email is not already registered." };
  }
}

export const MAX_SUPERUSERS = 2;

export interface RoleSyncResult {
  ok: boolean;
  message?: string;
  added?: string[];
  removed?: string[];
}

export async function syncUserRoles(userId: string, roleSlugs: string[]): Promise<RoleSyncResult> {
  const actor = await assertCan("users.edit");
  const { isSuperUserEmail, isPrimarySuperUserEmail } = await import("@/lib/admin/rbac");
  const admin = createSupabaseAdminClient();

  const current = await getUser(userId);
  if (!current) return { ok: false, message: "User not found." };

  // Mcebisi Hlatshwayo is the permanent Superuser and can never have super_admin revoked
  if (isPrimarySuperUserEmail(current.email) && !roleSlugs.includes("super_admin")) {
    return {
      ok: false,
      message: "Mcebisi Hlatshwayo's permanent Superuser status cannot be modified or revoked.",
    };
  }

  const targetIsSuperUser =
    isSuperUserEmail(current.email) || current.roleSlugs.includes("super_admin");
  const actorIsSuperUser =
    actor.isSuperAdmin || isSuperUserEmail(actor.user.email);

  // Superusers are not managed by anyone else; their roles/status can only be updated by another superuser.
  if (targetIsSuperUser && !actorIsSuperUser) {
    return {
      ok: false,
      message: "Superusers are protected and can only be managed by another Superuser.",
    };
  }

  // Never allow a super admin to remove their own super_admin role (lockout guard).
  if (userId === actor.user.id && current.roleSlugs.includes("super_admin") && !roleSlugs.includes("super_admin")) {
    return { ok: false, message: "You cannot remove your own Super Admin role." };
  }

  // Only super admins / superusers may grant or remove the super_admin role.
  const superAdminChanged =
    current.roleSlugs.includes("super_admin") !== roleSlugs.includes("super_admin");
  if (superAdminChanged && !actorIsSuperUser) {
    return { ok: false, message: "Only Superusers can change the Super Admin role." };
  }

  // Enforce MAX 2 Superusers rule
  if (roleSlugs.includes("super_admin") && !current.roleSlugs.includes("super_admin")) {
    const roleMap = await buildRoleMap();
    let superuserCount = 0;
    for (const [, entry] of roleMap.entries()) {
      if (entry.roleSlugs.includes("super_admin")) superuserCount++;
    }
    if (superuserCount >= MAX_SUPERUSERS) {
      return {
        ok: false,
        message: `Maximum limit reached: Only ${MAX_SUPERUSERS} Superusers are permitted in the system.`,
      };
    }
  }

  const target = new Set(roleSlugs);
  const added = roleSlugs.filter((s) => !current.roleSlugs.includes(s));
  const removed = current.roleSlugs.filter((s) => !target.has(s));

  for (const slug of added) {
    await admin.rpc("grant_role", { target_user_id: userId, role_slug: slug, granted_by: actor.user.id });
  }
  for (const slug of removed) {
    await admin.rpc("revoke_role", { target_user_id: userId, role_slug: slug });
  }

  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "users.update_roles",
    entityType: "user",
    entityId: userId,
    summary: `Updated roles for ${current.email ?? userId}`,
    details: { added, removed },
  });

  return { ok: true, message: "Roles updated.", added, removed };
}

export interface PermissionOverride {
  key: string;
  granted: boolean;
}

export async function setUserPermissionOverrides(
  userId: string,
  overrides: PermissionOverride[]
): Promise<RoleSyncResult> {
  const actor = await assertCan("users.edit");
  const admin = createSupabaseAdminClient();

  const existing = await getUserPermissionKeys(userId);
  const existingKeys = new Set(existing.map((e) => e.key));
  const requestedKeys = new Set(overrides.map((o) => o.key));

  for (const o of overrides) {
    await admin.rpc("set_user_permission", {
      target_user_id: userId,
      permission_key: o.key,
      granted: o.granted,
      granted_by: actor.user.id,
    });
  }

  const cleared: string[] = [];
  for (const key of existingKeys) {
    if (!requestedKeys.has(key)) {
      const { data: perm } = await admin.from("permissions").select("id").eq("key", key).maybeSingle();
      if (perm) {
        await admin.from("user_permissions").delete().eq("user_id", userId).eq("permission_id", perm.id);
        cleared.push(key);
      }
    }
  }

  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "users.update_permissions",
    entityType: "user",
    entityId: userId,
    summary: `Updated permission overrides for ${userId}`,
    details: {
      overrides: overrides.map((o) => ({ key: o.key, granted: o.granted })),
      cleared,
    },
  });

  return { ok: true, message: "Permission overrides updated." };
}

export async function deactivateUser(userId: string): Promise<{ ok: boolean; message?: string }> {
  const actor = await assertCan("users.deactivate");
  const { isSuperUserEmail } = await import("@/lib/admin/rbac");
  if (userId === actor.user.id) return { ok: false, message: "You cannot deactivate your own account." };

  const target = await getUser(userId);
  const { isPrimarySuperUserEmail } = await import("@/lib/admin/rbac");

  if (isPrimarySuperUserEmail(target?.email)) {
    return {
      ok: false,
      message: "Mcebisi Hlatshwayo's permanent Superuser account cannot be deactivated.",
    };
  }

  const targetIsSuperUser =
    target?.roleSlugs.includes("super_admin") || isSuperUserEmail(target?.email);
  const actorIsSuperUser =
    actor.isSuperAdmin || isSuperUserEmail(actor.user.email);

  if (targetIsSuperUser && !actorIsSuperUser) {
    return { ok: false, message: "Superuser accounts can only be managed by another Superuser." };
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, { ban_duration: "876000h" });
  if (error) {
    console.error("[users] deactivate failed:", error);
    return { ok: false, message: "Failed to deactivate user." };
  }
  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "users.deactivate",
    entityType: "user",
    entityId: userId,
    summary: `Deactivated ${userId}`,
  });
  return { ok: true, message: "User deactivated." };
}

export async function reactivateUser(userId: string): Promise<{ ok: boolean; message?: string }> {
  const actor = await assertCan("users.deactivate");
  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, { ban_duration: "none" });
  if (error) {
    console.error("[users] reactivate failed:", error);
    return { ok: false, message: "Failed to reactivate user." };
  }
  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "users.reactivate",
    entityType: "user",
    entityId: userId,
    summary: `Reactivated ${userId}`,
  });
  return { ok: true, message: "User reactivated." };
}

export async function deleteUser(userId: string): Promise<{ ok: boolean; message?: string }> {
  const actor = await assertCan("users.delete");
  const { isSuperUserEmail, isPrimarySuperUserEmail } = await import("@/lib/admin/rbac");
  const admin = createSupabaseAdminClient();

  const target = await getUser(userId);
  const targetEmail = target?.email?.toLowerCase();

  // Mcebisi Hlatshwayo is the permanent primary Superuser and cannot be deleted by anyone
  if (isPrimarySuperUserEmail(targetEmail)) {
    return {
      ok: false,
      message: "Mcebisi Hlatshwayo's account is the permanent Primary Superuser and cannot be deleted by anyone.",
    };
  }

  if (userId === actor.user.id) return { ok: false, message: "You cannot delete your own active account." };

  const targetIsSuperUser =
    target?.roleSlugs.includes("super_admin") || isSuperUserEmail(target?.email);
  const actorIsSuperUser =
    actor.isSuperAdmin || isSuperUserEmail(actor.user.email);

  // Superuser accounts can only be deleted by another Superuser (e.g. Mcebisi)
  if (targetIsSuperUser && !actorIsSuperUser) {
    return { ok: false, message: "Superusers are protected and can only be deleted by another Superuser." };
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    console.error("[users] delete failed:", error);
    return { ok: false, message: "Failed to delete user." };
  }

  // Also remove user roles from DB table user_roles to ensure clean state
  try {
    await admin.from("user_roles").delete().eq("user_id", userId);
  } catch {
    // ignore
  }

  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "users.delete",
    entityType: "user",
    entityId: userId,
    summary: `Deleted ${target?.email ?? userId}${targetIsSuperUser ? " (Superuser)" : ""}`,
  });
  return { ok: true, message: "User successfully deleted." };
}
