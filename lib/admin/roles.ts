import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";
import { getAdminUser, hasPermission, writeAuditLog, PERMISSION_CATALOG, type PermissionKey, type AdminSession } from "@/lib/admin/rbac";

export type RoleRow = Database["public"]["Tables"]["roles"]["Row"];
export type PermissionRow = Database["public"]["Tables"]["permissions"]["Row"];

export interface RoleListItem extends RoleRow {
  memberCount: number;
  permissionCount: number;
}

export interface RoleDetail extends RoleRow {
  memberCount: number;
  permissionKeys: string[];
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

/** All permission keys in catalog order (DB catalog may be a superset). */
export function permissionCatalog(): PermissionKey[] {
  return Object.keys(PERMISSION_CATALOG) as PermissionKey[];
}

export function permissionGroups(): { group: string; items: { key: string; name: string }[] }[] {
  const map = new Map<string, { key: string; name: string }[]>();
  for (const [key, meta] of Object.entries(PERMISSION_CATALOG)) {
    const group = meta.group;
    const list = map.get(group) ?? [];
    list.push({ key, name: meta.name });
    map.set(group, list);
  }
  return [...map.entries()].map(([group, items]) => ({ group, items }));
}

export async function listRoles(): Promise<RoleListItem[]> {
  const admin = createSupabaseAdminClient();
  const [roles, userRoles, rolePermissions] = await Promise.all([
    admin.from("roles").select("id,name,slug,description,created_at").order("name", { ascending: true }),
    admin.from("user_roles").select("role_id"),
    admin.from("role_permissions").select("role_id, permission_id"),
  ]);

  const memberCount = new Map<string, number>();
  for (const r of userRoles.data ?? []) {
    memberCount.set(r.role_id, (memberCount.get(r.role_id) ?? 0) + 1);
  }
  const permCount = new Map<string, number>();
  for (const r of rolePermissions.data ?? []) {
    permCount.set(r.role_id, (permCount.get(r.role_id) ?? 0) + 1);
  }

  return (roles.data ?? []).map((r) => ({
    ...r,
    memberCount: memberCount.get(r.id) ?? 0,
    permissionCount: permCount.get(r.id) ?? 0,
  }));
}

export async function getRole(id: string): Promise<RoleDetail | null> {
  const admin = createSupabaseAdminClient();
  const { data: role, error } = await admin.from("roles").select("id,name,slug,description,created_at").eq("id", id).maybeSingle();
  if (error || !role) {
    console.error("[roles] get failed:", error);
    return null;
  }

  const [{ count: memberCount }, rolePermissions] = await Promise.all([
    admin.from("user_roles").select("role_id", { count: "exact", head: true }).eq("role_id", id),
    admin.from("role_permissions").select("permission_id").eq("role_id", id),
  ]);

  let permissionKeys: string[] = [];
  if ((rolePermissions.data ?? []).length > 0) {
    const ids = rolePermissions.data!.map((r) => r.permission_id);
    const { data: perms } = await admin.from("permissions").select("key").in("id", ids);
    permissionKeys = (perms ?? []).map((p) => p.key);
  }

  return { ...role, memberCount: memberCount ?? 0, permissionKeys };
}

export async function listPermissions(): Promise<PermissionRow[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("permissions").select("id,key,name,description,created_at").order("name", { ascending: true });
  if (error) return [];
  return data ?? [];
}

export async function listRoleMembers(roleId: string): Promise<{ user_id: string }[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("user_roles").select("user_id").eq("role_id", roleId);
  if (error) return [];
  return data ?? [];
}

const roleSchema = z.object({
  name: z.string().trim().min(2, "Enter a role name").max(80, "Name is too long"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_-]+$/, "Slug can only contain a-z, 0-9, dashes and underscores")
    .max(80, "Slug is too long"),
  description: z
    .union([z.literal(""), z.string().trim().max(300, "Description is too long")])
    .transform((v) => (v === "" ? null : v)),
});

export type RoleFormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
};

export type RoleFormResult =
  | { ok: true; role: RoleRow }
  | { ok: false; errors: Record<string, string>; message?: string };

function raw(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

function slugifyRole(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 80) || "role"
  );
}

async function ensureUniqueSlug(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  slug: string,
  excludeId?: string
): Promise<string> {
  let candidate = slug;
  let n = 1;
  while (true) {
    const { data } = await admin.from("roles").select("id").eq("slug", candidate).maybeSingle();
    if (!data || data.id === excludeId) return candidate;
    n += 1;
    candidate = `${slug}_${n}`;
  }
}

export async function createRole(formData: FormData): Promise<RoleFormResult> {
  const actor = await assertCan("roles.manage");
  const parsed = roleSchema.safeParse({
    name: raw(formData, "name"),
    slug: raw(formData, "slug") || slugifyRole(raw(formData, "name")),
    description: raw(formData, "description"),
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, errors };
  }

  const admin = createSupabaseAdminClient();
  try {
    const slug = await ensureUniqueSlug(admin, parsed.data.slug);
    const { data: created, error } = await admin
      .from("roles")
      .insert({ name: parsed.data.name, slug, description: parsed.data.description })
      .select()
      .single();
    if (error) {
      if (error.code === "23505") {
        return { ok: false, errors: { slug: "A role with this slug already exists." } };
      }
      throw error;
    }
    void writeAuditLog({
      actorId: actor.user.id,
      actorName: actor.user.email,
      action: "roles.create",
      entityType: "role",
      entityId: created.id,
      summary: `Created role "${created.name}"`,
    });
    return { ok: true, role: created };
  } catch (err) {
    console.error("[roles] create failed:", err);
    return { ok: false, errors: {}, message: "Failed to create role." };
  }
}

export async function updateRole(id: string, formData: FormData): Promise<RoleFormResult> {
  const actor = await assertCan("roles.manage");
  const parsed = roleSchema.safeParse({
    name: raw(formData, "name"),
    slug: raw(formData, "slug") || slugifyRole(raw(formData, "name")),
    description: raw(formData, "description"),
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, errors };
  }

  const admin = createSupabaseAdminClient();
  const existing = await getRole(id);
  if (!existing) return { ok: false, errors: {}, message: "Role not found." };

  // Guard the seed super_admin role.
  if (existing.slug === "super_admin" && parsed.data.slug !== "super_admin") {
    return { ok: false, errors: { slug: "The Super Admin role slug cannot be changed." } };
  }

  try {
    const slug = await ensureUniqueSlug(admin, parsed.data.slug, id);
    const { data: updated, error } = await admin
      .from("roles")
      .update({ name: parsed.data.name, slug, description: parsed.data.description })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    void writeAuditLog({
      actorId: actor.user.id,
      actorName: actor.user.email,
      action: "roles.update",
      entityType: "role",
      entityId: updated.id,
      summary: `Updated role "${updated.name}"`,
    });
    return { ok: true, role: updated };
  } catch (err) {
    console.error("[roles] update failed:", err);
    return { ok: false, errors: {}, message: "Failed to update role." };
  }
}

export async function deleteRole(id: string): Promise<{ ok: boolean; message?: string }> {
  const actor = await assertCan("roles.manage");
  const admin = createSupabaseAdminClient();

  const existing = await getRole(id);
  if (!existing) return { ok: false, message: "Role not found." };
  if (existing.slug === "super_admin") return { ok: false, message: "The Super Admin role cannot be deleted." };
  if (existing.memberCount > 0) {
    return { ok: false, message: `This role has ${existing.memberCount} member(s). Unassign it first.` };
  }

  const { error } = await admin.from("roles").delete().eq("id", id);
  if (error) {
    console.error("[roles] delete failed:", error);
    return { ok: false, message: "Failed to delete role." };
  }
  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "roles.delete",
    entityType: "role",
    entityId: id,
    summary: `Deleted role "${existing.name}"`,
  });
  return { ok: true, message: "Role deleted." };
}

export async function setRolePermissions(
  roleId: string,
  permissionKeys: string[]
): Promise<{ ok: boolean; message?: string }> {
  const actor = await assertCan("roles.manage");
  const admin = createSupabaseAdminClient();

  const role = await getRole(roleId);
  if (!role) return { ok: false, message: "Role not found." };

  try {
    const { data: perms } = await admin.from("permissions").select("id, key");
    const idByKey = new Map((perms ?? []).map((p) => [p.key, p.id]));

    // Replace the full set.
    await admin.from("role_permissions").delete().eq("role_id", roleId);
    const rows = permissionKeys
      .map((key) => ({ role_id: roleId, permission_id: idByKey.get(key) }))
      .filter((r): r is { role_id: string; permission_id: string } => Boolean(r.permission_id));
    if (rows.length > 0) {
      await admin.from("role_permissions").insert(rows);
    }

    void writeAuditLog({
      actorId: actor.user.id,
      actorName: actor.user.email,
      action: "roles.update_permissions",
      entityType: "role",
      entityId: roleId,
      summary: `Updated permission set for role "${role.name}"`,
      details: { permissions: permissionKeys },
    });

    return { ok: true, message: `Permission set updated for ${role.name}.` };
  } catch (err) {
    console.error("[roles] set permissions failed:", err);
    return { ok: false, message: "Failed to update permissions." };
  }
}
