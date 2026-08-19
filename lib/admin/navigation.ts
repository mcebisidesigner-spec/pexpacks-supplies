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
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: "dashboard",
        permission: "dashboard.view",
        ready: true,
        end: true,
      },
    ],
  },
  {
    title: "Catalogue",
    items: [
      {
        label: "Schools",
        href: "/admin/schools",
        icon: "school",
        permission: "schools.view",
        ready: true,
      },
      {
        label: "School Packs",
        href: "/admin/packs",
        icon: "pack",
        permission: "packs.view",
        ready: true,
      },
      {
        label: "Master Products",
        href: "/admin/products",
        icon: "items",
        permission: "catalogue.view",
        ready: true,
      },
      {
        label: "Pricing",
        href: "/admin/pricing",
        icon: "pricing",
        permission: "pricing.view",
        ready: true,
      },
      {
        label: "Suppliers",
        href: "/admin/suppliers",
        icon: "suppliers",
        permission: "suppliers.view",
        ready: true,
      },
    ],
  },
  {
    title: "Commerce",
    items: [
      {
        label: "Orders",
        href: "/admin/orders",
        icon: "orders",
        permission: "orders.view",
        ready: true,
      },
      {
        label: "Payments",
        href: "/admin/payments",
        icon: "payments",
        permission: "payments.view",
        ready: true,
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Seasons",
        href: "/admin/seasons",
        icon: "seasons",
        permission: "settings.manage",
        ready: true,
      },
      {
        label: "Procurement",
        href: "/admin/procurement",
        icon: "procurement",
        permission: "procurement.view",
        ready: true,
      },
      {
        label: "Fulfilment",
        href: "/admin/fulfilment",
        icon: "fulfilment",
        permission: "fulfilment.view",
        ready: true,
      },
      {
        label: "Tasks",
        href: "/admin/tasks",
        icon: "tasks",
        permission: "tasks.view",
        ready: true,
      },
    ],
  },
  {
    title: "People",
    items: [
      {
        label: "Users",
        href: "/admin/users",
        icon: "users",
        permission: "users.view",
        ready: true,
      },
      {
        label: "Roles",
        href: "/admin/roles",
        icon: "roles",
        permission: "roles.manage",
        ready: true,
      },
    ],
  },
  {
    title: "Growth",
    items: [
      {
        label: "Website Content",
        href: "/admin/content",
        icon: "content",
        permission: "content.view",
        ready: true,
      },
      {
        label: "Blog",
        href: "/admin/blog",
        icon: "blog",
        permission: "blog.view",
        ready: true,
      },
      {
        label: "Assets",
        href: "/admin/assets",
        icon: "assets",
        permission: "assets.view",
        ready: true,
      },
      {
        label: "Reports",
        href: "/admin/reports",
        icon: "reports",
        permission: "reports.view",
        ready: true,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Settings",
        href: "/admin/settings",
        icon: "settings",
        permission: "settings.manage",
        ready: true,
      },
      {
        label: "Audit Logs",
        href: "/admin/audit",
        icon: "audit",
        permission: "audit.view",
        ready: true,
      },
    ],
  },
];

export function filterNav(permissions: Set<string>, isSuperAdmin: boolean) {
  return ADMIN_NAV.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => isSuperAdmin || permissions.has(item.permission),
    ),
  })).filter((group) => group.items.length > 0);
}
