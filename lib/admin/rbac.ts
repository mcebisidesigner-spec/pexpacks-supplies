import { redirect, notFound } from "next/navigation";
import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import type { Json } from "@/lib/supabase/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Dynamic permission catalog. Stored in the `permissions` table (DB is the
 * source of truth); this list is only used to render management UI and to give
 * legacy super-admins the full key set.
 */
export const PERMISSION_CATALOG = {
  "dashboard.view": { name: "View Dashboard", group: "Dashboard" },
  "schools.view": { name: "View Schools", group: "Schools" },
  "schools.create": { name: "Create Schools", group: "Schools" },
  "schools.edit": { name: "Edit Schools", group: "Schools" },
  "schools.delete": { name: "Delete Schools", group: "Schools" },
  "schools.archive": { name: "Hide Schools", group: "Schools" },
  "schools.restore": { name: "Show Schools", group: "Schools" },
  "schools.import": { name: "Import Schools", group: "Schools" },
  "packs.view": { name: "View Packs", group: "Packs" },
  "packs.create": { name: "Create Packs", group: "Packs" },
  "packs.edit": { name: "Edit Packs", group: "Packs" },
  "packs.delete": { name: "Delete Packs", group: "Packs" },
  "packs.duplicate": { name: "Duplicate Packs", group: "Packs" },
  "packs.import": { name: "Import Packs", group: "Packs" },
  "items.view": { name: "View Items", group: "Items" },
  "items.create": { name: "Create Items", group: "Items" },
  "items.edit": { name: "Edit Items", group: "Items" },
  "items.delete": { name: "Delete Items", group: "Items" },
  "items.reorder": { name: "Reorder Items", group: "Items" },
  "items.import": { name: "Import Items", group: "Items" },
  "catalogue.view": { name: "View Master Catalogue", group: "Catalogue" },
  "catalogue.manage": { name: "Manage Master Catalogue", group: "Catalogue" },
  "suppliers.view": { name: "View Suppliers", group: "Suppliers" },
  "suppliers.manage": { name: "Manage Suppliers", group: "Suppliers" },
  "pricing.view": { name: "View Pricing", group: "Pricing" },
  "pricing.manage": { name: "Manage Pricing", group: "Pricing" },
  "procurement.view": { name: "View Procurement", group: "Procurement" },
  "procurement.manage": { name: "Manage Procurement", group: "Procurement" },
  "fulfilment.view": { name: "View Fulfilment", group: "Fulfilment" },
  "fulfilment.manage": { name: "Manage Fulfilment", group: "Fulfilment" },
  "tasks.view": { name: "View Tasks", group: "Collaboration" },
  "tasks.manage": { name: "Manage Tasks", group: "Collaboration" },
  "approvals.manage": { name: "Manage Approvals", group: "Approvals" },
  "orders.view": { name: "View Orders", group: "Orders" },
  "orders.edit": { name: "Edit Orders", group: "Orders" },
  "orders.export": { name: "Export Orders", group: "Orders" },
  "orders.refund": { name: "Refund Orders", group: "Orders" },
  "orders.delete": { name: "Delete Orders", group: "Orders" },
  "payments.view": { name: "View Payments", group: "Payments" },
  "payments.refund": { name: "Process Refunds", group: "Payments" },
  "users.view": { name: "View Users", group: "Users" },
  "users.create": { name: "Invite Users", group: "Users" },
  "users.edit": { name: "Edit Users", group: "Users" },
  "users.deactivate": { name: "Deactivate Users", group: "Users" },
  "users.delete": { name: "Delete Users", group: "Users" },
  "roles.manage": { name: "Manage Roles", group: "Access" },
  "forms.assign": { name: "Assign Forms", group: "Access" },
  "content.view": { name: "View Website Content", group: "Content" },
  "content.manage": { name: "Manage Website Content", group: "Content" },
  "blog.view": { name: "View Blog", group: "Content" },
  "blog.manage": { name: "Manage Blog", group: "Content" },
  "assets.view": { name: "View Assets", group: "Assets" },
  "assets.upload": { name: "Upload Assets", group: "Assets" },
  "assets.manage": { name: "Manage Assets", group: "Assets" },
  "reports.view": { name: "View Reports", group: "Reports" },
  "reports.export": { name: "Export Reports", group: "Reports" },
  "settings.manage": { name: "Manage Settings", group: "Settings" },
  "audit.view": { name: "View Audit Logs", group: "Audit" },
  "audit.export": { name: "Export Audit Logs", group: "Audit" },
} as const;

export type PermissionKey = keyof typeof PERMISSION_CATALOG;

export interface AdminSession {
  user: User;
  roles: string[];
  permissions: Set<string>;
  isSuperAdmin: boolean;
}

const STAFF_ROLE_SLUGS = new Set([
  "super_admin",
  "administrator",
  "content_manager",
  "school_manager",
  "office_manager",
  "order_manager",
  "operations_manager",
  "catalogue_pricing",
  "procurement",
  "fulfilment",
  "finance",
  "management_viewer",
  "viewer",
]);

export const SUPERUSER_EMAILS = new Set([
  "mcebisimhayise@gmail.com",
  "pexpacks@gmail.com",
]);

export function isSuperUserEmail(email?: string | null): boolean {
  if (!email) return false;
  return SUPERUSER_EMAILS.has(email.trim().toLowerCase());
}

export function isStaffClaim(
  appMetadata: Record<string, unknown> | undefined,
): boolean {
  if (!appMetadata) return false;
  const legacy = appMetadata["role"];
  if (legacy === "admin") return true;
  const roles = Array.isArray(appMetadata["roles"]) ? appMetadata["roles"] : [];
  return roles.some((r) => typeof r === "string" && STAFF_ROLE_SLUGS.has(r));
}

export function displayName(user: User): string {
  const meta = user.user_metadata ?? {};
  if (user.email && isSuperUserEmail(user.email)) {
    if (user.email.toLowerCase() === "mcebisimhayise@gmail.com") {
      return (meta["full_name"] as string) || (meta["name"] as string) || "Mcebisi Hlatshwayo";
    }
  }
  return (
    (meta["full_name"] as string) ||
    (meta["name"] as string) ||
    (user.email ?? user.id)
  );
}

/**
 * Loads the signed-in user plus their effective roles and permissions.
 * Returns null when there is no session.
 */
async function loadAdminUser(): Promise<AdminSession | null> {
  const supabase = await createSupabaseServerClient();
  let user: User | null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch (err) {
    console.error("[rbac] getUser failed (network/auth error):", (err as Error).message);
    return null;
  }
  if (!user) return null;

  const admin = createSupabaseAdminClient();
  const legacyAdmin =
    (user.app_metadata as Record<string, unknown> | undefined)?.role ===
    "admin";

  // 1. Fetch user_roles and user_permissions in parallel (both depend only on user.id)
  const [userRolesResult, overridesResult] = await Promise.all([
    admin.from("user_roles").select("role_id").eq("user_id", user.id),
    admin
      .from("user_permissions")
      .select("permission_id, granted")
      .eq("user_id", user.id),
  ]);

  const roleIds = (userRolesResult.data ?? []).map((r) => r.role_id);

  // 2. Fetch roles, role_permissions in parallel (both depend only on roleIds)
  const [rolesResult, rpResult] = await Promise.all([
    roleIds.length > 0
      ? admin.from("roles").select("slug").in("id", roleIds)
      : Promise.resolve({ data: [] }),
    roleIds.length > 0
      ? admin
          .from("role_permissions")
          .select("permission_id")
          .in("role_id", roleIds)
      : Promise.resolve({ data: [] }),
  ]);

  const roleSlugs = (rolesResult.data ?? []).map((r) => r.slug);
  const isSuperUser = isSuperUserEmail(user.email);
  const isSuperAdmin = legacyAdmin || isSuperUser || roleSlugs.includes("super_admin");
  if (isSuperAdmin) {
    return {
      user,
      roles: roleSlugs.length > 0 ? roleSlugs : ["super_admin"],
      permissions: new Set(Object.keys(PERMISSION_CATALOG)),
      isSuperAdmin: true,
    };
  }

  // 3. Resolve role-derived permissions
  const permissionSet = new Set<string>();
  const rpIds = (rpResult.data ?? []).map((r) => r.permission_id);
  if (rpIds.length > 0) {
    const { data: permissions } = await admin
      .from("permissions")
      .select("key")
      .in("id", rpIds);
    (permissions ?? []).forEach((p) => permissionSet.add(p.key));
  }

  // 4. Resolve per-user overrides
  const overrides = overridesResult.data;
  if (overrides && overrides.length > 0) {
    const ids = [...new Set(overrides.map((o) => o.permission_id))];
    const { data: permissionKeys } = await admin
      .from("permissions")
      .select("id, key")
      .in("id", ids);
    const keyById = new Map((permissionKeys ?? []).map((p) => [p.id, p.key]));
    overrides.forEach((o) => {
      const key = keyById.get(o.permission_id);
      if (!key) return;
      if (o.granted) permissionSet.add(key);
      else permissionSet.delete(key);
    });
  }

  return {
    user,
    roles: roleSlugs,
    permissions: permissionSet,
    isSuperAdmin: false,
  };
}

export const getAdminUser = cache(loadAdminUser);

/**
 * Gate for admin pages and server actions.
 * - unauthenticated → redirect to /login
 * - authenticated but not staff → masked 404
 * - lacks an optional required permission → masked 404
 */
export async function requireAdmin(options?: {
  permission?: PermissionKey;
}): Promise<AdminSession> {
  const session = await getAdminUser();
  if (!session) {
    redirect("/pex-console-secure");
  }
  if (!session.isSuperAdmin && session.roles.length === 0) {
    notFound();
  }
  if (options?.permission && !session.permissions.has(options.permission)) {
    notFound();
  }
  return session;
}

/**
 * Gate strictly for Superusers / Superadmins (e.g. Settings Control Centre).
 */
export async function requireSuperAdmin(): Promise<AdminSession> {
  const session = await requireAdmin();
  if (!session.isSuperAdmin && !session.roles.includes("super_admin")) {
    notFound();
  }
  return session;
}

/** True when the session has a permission (super admins always pass). */
export function hasPermission(
  session: AdminSession,
  key: PermissionKey,
): boolean {
  return session.isSuperAdmin || session.permissions.has(key);
}

export interface AuditEntry {
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  details?: Record<string, unknown> | null;
  actorId?: string | null;
  actorName?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}

const CRITICAL_ACTIONS = new Set([
  "settings.update",
  "settings.restore",
  "pricing.update",
  "pricing.manage",
  "users.create",
  "users.update_roles",
  "users.deactivate",
  "users.delete",
  "orders.delete",
  "orders.refund",
  "payments.refund",
  "suppliers.manage",
  "quotations.delete",
  "system.restore",
]);

/** Fire-and-forget audit log insert via the service-role client (bypasses RLS). */
export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  try {
    const admin = createSupabaseAdminClient();
    await admin.from("audit_logs").insert({
      actor_id: entry.actorId ?? null,
      actor_name: entry.actorName ?? null,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId ?? null,
      summary: entry.summary,
      details: entry.details ? (entry.details as Json) : null,
      ip: entry.ip ?? null,
      user_agent: entry.userAgent ?? null,
    });

    // If a non-superuser performs a critical DB update, notify pexpacks@gmail.com immediately
    const actorEmail = entry.actorName?.includes("@") ? entry.actorName : null;
    if (CRITICAL_ACTIONS.has(entry.action) && !isSuperUserEmail(actorEmail)) {
      const { sendCriticalAlertEmail } = await import("@/lib/email/sendCriticalAlertEmail");
      void sendCriticalAlertEmail({
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        actorName: entry.actorName,
        actorEmail: actorEmail,
        summary: entry.summary,
        details: entry.details,
      });
    }
  } catch (err) {
    console.error("[audit] failed to write audit log:", err);
  }
}
