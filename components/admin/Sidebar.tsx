"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  Package,
  School,
  Briefcase,
  Boxes,
  Users,
  ShoppingCart,
  FileText,
  FileSpreadsheet,
  Mail,
  ChevronDown,
  CreditCard,
  PackageCheck,
  CheckSquare,
  Layers,
  Settings,
  type LucideIcon,
} from "lucide-react";
import styles from "./AdminShell.module.css";

export interface NavSubItemConfig {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

export interface NavItemConfig {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  children?: NavSubItemConfig[];
}

export const ORDERED_NAV_ITEMS: NavItemConfig[] = [
  { label: "Dashboard", href: "/admin", icon: Package, exact: true },
  { label: "Schools", href: "/admin/schools", icon: School },
  { label: "School Packs", href: "/admin/packs", icon: Briefcase },
  { label: "Master Products", href: "/admin/products", icon: Boxes },
  { label: "Suppliers", href: "/admin/suppliers", icon: Users },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  {
    label: "Documents",
    href: "/admin/documents",
    icon: FileText,
    children: [
      { label: "Quotations", href: "/admin/quotations", icon: FileSpreadsheet },
      { label: "Official Letters", href: "/admin/letters", icon: Mail },
    ],
  },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Procurement", href: "/admin/procurement", icon: ShoppingCart },
  {
    label: "Packing & Fulfilment",
    href: "/admin/fulfilment",
    icon: PackageCheck,
  },
  { label: "Tasks", href: "/admin/tasks", icon: CheckSquare },
  { label: "Content CMS", href: "/admin/content", icon: Layers },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function isActiveRoute(href: string, pathname: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const isDocActive =
      pathname.startsWith("/admin/documents") ||
      pathname.startsWith("/admin/quotations") ||
      pathname.startsWith("/admin/letters");
    return { Documents: isDocActive };
  });

  // Automatically expand group when navigating into one of its child routes
  useEffect(() => {
    if (
      pathname.startsWith("/admin/documents") ||
      pathname.startsWith("/admin/quotations") ||
      pathname.startsWith("/admin/letters")
    ) {
      setExpandedGroups((prev) => ({ ...prev, Documents: true }));
    }
  }, [pathname]);

  const toggleGroup = (groupLabel: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupLabel]: !prev[groupLabel],
    }));
  };

  return (
    <nav className={styles.nav}>
      {ORDERED_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const hasChildren = item.children && item.children.length > 0;
        const isChildActive = hasChildren
          ? item.children!.some((child) => isActiveRoute(child.href, pathname, child.exact))
          : false;
        const active = isActiveRoute(item.href, pathname, item.exact) || isChildActive;
        const isExpanded = expandedGroups[item.label] ?? false;

        if (hasChildren) {
          return (
            <div key={item.label} className={styles.navGroup}>
              <button
                type="button"
                onClick={() => toggleGroup(item.label)}
                className={clsx(
                  styles.navItem,
                  (active || isExpanded) && styles.navItemActive
                )}
                aria-expanded={isExpanded}
              >
                <span className={styles.navItemIcon}>
                  <Icon size={18} />
                </span>
                <span className={styles.navItemLabel}>{item.label}</span>
                <span
                  className={clsx(
                    styles.navItemChevron,
                    isExpanded && styles.navItemChevronOpen
                  )}
                >
                  <ChevronDown size={14} />
                </span>
              </button>

              {isExpanded && (
                <div className={styles.navSubmenu}>
                  {item.children!.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const subActive = isActiveRoute(subItem.href, pathname, subItem.exact);
                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        onClick={onClose}
                        className={clsx(
                          styles.navSubItem,
                          subActive && styles.navSubItemActive
                        )}
                      >
                        <SubIcon size={15} />
                        <span>{subItem.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

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
