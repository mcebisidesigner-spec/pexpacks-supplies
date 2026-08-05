import type { PermissionKey } from "@/lib/admin/rbac";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: string;
  permission: PermissionKey;
  ready: boolean;
  end?: boolean;
}

export interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

/**
 * Single source of truth for the admin sidebar. `ready` is flipped on as each
 * module ships; non-ready sections render as disabled until their pages exist.
 */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: "dashboard", permission: "dashboard.view", ready: true, end: true }],
  },
  {
    title: "Catalogue",
    items: [
      { label: "Schools", href: "/admin/schools", icon: "school", permission: "schools.view", ready: false },
      { label: "School Packs", href: "/admin/packs", icon: "pack", permission: "packs.view", ready: false },
      { label: "Stationery Items", href: "/admin/items", icon: "items", permission: "items.view", ready: false },
    ],
  },
  {
    title: "Commerce",
    items: [
      { label: "Orders", href: "/admin/orders", icon: "orders", permission: "orders.view", ready: false },
      { label: "Payments", href: "/admin/payments", icon: "payments", permission: "payments.view", ready: false },
    ],
  },
  {
    title: "People",
    items: [
      { label: "Users", href: "/admin/users", icon: "users", permission: "users.view", ready: false },
      { label: "Roles", href: "/admin/roles", icon: "roles", permission: "roles.manage", ready: false },
    ],
  },
  {
    title: "Growth",
    items: [
      { label: "Website Content", href: "/admin/content", icon: "content", permission: "content.view", ready: false },
      { label: "Assets", href: "/admin/assets", icon: "assets", permission: "assets.view", ready: false },
      { label: "Reports", href: "/admin/reports", icon: "reports", permission: "reports.view", ready: false },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Settings", href: "/admin/settings", icon: "settings", permission: "settings.manage", ready: false },
      { label: "Audit Logs", href: "/admin/audit", icon: "audit", permission: "audit.view", ready: false },
    ],
  },
];

export function filterNav(permissions: Set<string>, isSuperAdmin: boolean) {
  return ADMIN_NAV.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => isSuperAdmin || permissions.has(item.permission)
    ),
  })).filter((group) => group.items.length > 0);
}
