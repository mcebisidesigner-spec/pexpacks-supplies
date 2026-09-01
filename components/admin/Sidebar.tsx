"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  Package,
  School,
  Briefcase,
  Boxes,
  Users,
  FileText,
  FileSpreadsheet,
  CreditCard,
  ShoppingCart,
  PackageCheck,
  CheckSquare,
  Layers,
  TrendingUp,
  Settings,
  type LucideIcon,
} from "lucide-react";
import styles from "./AdminShell.module.css";

export const ORDERED_NAV_ITEMS: Array<{
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}> = [
  { label: "Dashboard", href: "/admin", icon: Package, exact: true },
  { label: "Schools", href: "/admin/schools", icon: School },
  { label: "School Packs", href: "/admin/packs", icon: Briefcase },
  { label: "Master Products", href: "/admin/products", icon: Boxes },
  { label: "Suppliers", href: "/admin/suppliers", icon: Users },
  { label: "Orders", href: "/admin/orders", icon: FileText },
  { label: "Quotations", href: "/admin/quotations", icon: FileSpreadsheet },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Procurement", href: "/admin/procurement", icon: ShoppingCart },
  {
    label: "Packing & Fulfilment",
    href: "/admin/fulfilment",
    icon: PackageCheck,
  },
  { label: "Tasks", href: "/admin/tasks", icon: CheckSquare },
  { label: "Content CMS", href: "/admin/content", icon: Layers },
  { label: "Reports", href: "/admin/reports", icon: TrendingUp },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

function isActiveRoute(href: string, pathname: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      {ORDERED_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActiveRoute(item.href, pathname, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={clsx(styles.navItem, active && styles.navItemActive)}
          >
            <span className={styles.navItemIcon}>
              <Icon size={18} />
            </span>
            <span className={styles.navItemLabel}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
