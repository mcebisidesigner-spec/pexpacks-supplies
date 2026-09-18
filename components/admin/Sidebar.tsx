"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { cn } from "@/lib/utils";

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
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    () => {
      const isDocActive =
        pathname.startsWith("/admin/documents") ||
        pathname.startsWith("/admin/quotations") ||
        pathname.startsWith("/admin/letters");
      return { Documents: isDocActive };
    },
  );

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
    <nav className="flex-1 overflow-y-auto px-3 py-2 pb-4 flex flex-col gap-0.5">
      {ORDERED_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const hasChildren = item.children && item.children.length > 0;
        const isChildActive = hasChildren
          ? item.children!.some((child) =>
              isActiveRoute(child.href, pathname, child.exact),
            )
          : false;
        const active =
          isActiveRoute(item.href, pathname, item.exact) || isChildActive;
        const isExpanded = expandedGroups[item.label] ?? false;

        if (hasChildren) {
          return (
            <div key={item.label} className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => toggleGroup(item.label)}
                className={cn(
                  "relative flex items-center gap-3 w-full min-h-[42px] px-3.5 rounded-lg text-slate-300 font-inherit text-[13px] font-semibold cursor-pointer outline-none transition-colors select-none hover:bg-slate-800/60 hover:text-white",
                  active &&
                    "bg-emerald-500/16 text-emerald-400 font-bold hover:bg-emerald-500/22 hover:text-emerald-300",
                )}
                aria-expanded={isExpanded}
              >
                <span className="flex items-center justify-center shrink-0">
                  <Icon size={18} />
                </span>
                <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.label}
                </span>
                <span
                  className={cn(
                    "text-slate-400 shrink-0 transition-transform duration-160",
                    isExpanded && "rotate-180 text-emerald-400",
                  )}
                >
                  <ChevronDown size={14} />
                </span>
              </button>

              {isExpanded && (
                <div className="flex flex-col gap-0.5 pl-7 pr-1 py-1">
                  {item.children!.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const subActive = isActiveRoute(
                      subItem.href,
                      pathname,
                      subItem.exact,
                    );
                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-400 no-underline transition-colors hover:bg-slate-800/50 hover:text-white",
                          subActive &&
                            "bg-emerald-500/12 text-emerald-400 font-bold hover:bg-emerald-500/18 hover:text-emerald-300",
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
            className={cn(
              "relative flex items-center gap-3 w-full min-h-[42px] px-3.5 rounded-lg text-slate-300 font-inherit text-[13px] font-semibold cursor-pointer outline-none transition-colors select-none hover:bg-slate-800/60 hover:text-white",
              active &&
                "bg-emerald-500/16 text-emerald-400 font-bold hover:bg-emerald-500/22 hover:text-emerald-300",
            )}
          >
            <span className="flex items-center justify-center shrink-0">
              <Icon size={18} />
            </span>
            <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
