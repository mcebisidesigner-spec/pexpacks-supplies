"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import {
  BarChart3,
  Bell,
  Boxes,
  Briefcase,
  Building2,
  CheckSquare,
  CircleAlert,
  ClipboardList,
  CreditCard,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Newspaper,
  Package,
  PackageCheck,
  PackageSearch,
  RefreshCw,
  School,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Tags,
  TrendingUp,
  User,
  Users,
  Warehouse,
  X,
  type LucideIcon,
} from "lucide-react";
import type { AdminNavGroup, AdminNavItem } from "@/lib/admin/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import styles from "./AdminShell.module.css";

// Exact navigation items matching the attached reference sample
const ORDERED_NAV_ITEMS: Array<{
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
  { label: "Packing & Fulfilment", href: "/admin/fulfilment", icon: PackageCheck },
  { label: "Tasks", href: "/admin/tasks", icon: CheckSquare },
  { label: "Reports", href: "/admin/reports", icon: TrendingUp },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

function isActiveRoute(href: string, pathname: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "LM";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function AdminShell({
  groups,
  userName,
  userEmail,
  avatarUrl,
  children,
}: {
  groups: AdminNavGroup[];
  userName: string;
  userEmail: string;
  userRoles: string[];
  avatarUrl: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const displayName = userName && userName !== "Admin" ? userName : userEmail;
  const userInitials = getInitials(displayName);

  const { notifications, refresh: refreshNotifications } = useAdminNotifications(true);

  // Search items
  const searchableNav = useMemo(() => {
    return ORDERED_NAV_ITEMS.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setOpen(false);
        setProfileOpen(false);
        setNotificationOpen(false);
        setSearchOpen(false);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) setProfileOpen(false);
      if (notificationRef.current && !notificationRef.current.contains(target)) setNotificationOpen(false);
      if (searchRef.current && !searchRef.current.contains(target)) setSearchOpen(false);
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    setOpen(false);
    setProfileOpen(false);
    setNotificationOpen(false);
    setSearchOpen(false);
    setSearchQuery("");
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <div className={`admin-dark ${styles.shell}`}>
      {/* Mobile overlay */}
      <div
        className={clsx(styles.overlay, open && styles.overlayVisible)}
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />

      {/* ===================================================
          EXACT TRUE-COPY SIDEBAR
          =================================================== */}
      <aside
        id="admin-sidebar"
        className={clsx(styles.sidebar, open && styles.sidebarOpen)}
        aria-label="Admin navigation"
      >
        {/* 1. Brand Logo Header */}
        <div className={styles.sidebarBrandWrap} ref={profileRef}>
          <button
            type="button"
            className={styles.sidebarBrand}
            aria-label="Open account menu"
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen((prev) => !prev)}
          >
            <span className={styles.brandTextGroup}>
              <Image src="/images/logo.svg" alt="Pexpacks" width={140} height={32} className={styles.brandLogoImage} />
            </span>
          </button>

          {profileOpen && (
            <div className={styles.profileDropdown} role="menu">
              <div className={styles.profileHeader}>
                <div className={styles.profileAvatar}>
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt="" width={36} height={36} />
                  ) : (
                    userInitials
                  )}
                </div>
                <div className={`${styles.minW0} ${styles.flex1}`}>
                  <strong className={styles.profileDropdownName}>{displayName}</strong>
                  <div className={styles.profileDropdownEmail}>{userEmail}</div>
                </div>
              </div>
              <button
                type="button"
                className={styles.signOutButton}
                onClick={handleSignOut}
                disabled={signingOut}
              >
                <LogOut size={15} />
                {signingOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          )}
        </div>

        {/* 2. Navigation Items (12 Exact Items) */}
        <nav className={styles.nav}>
          {ORDERED_NAV_ITEMS.map((item) => {
            const active = isActiveRoute(item.href, pathname, item.exact);
            const NavIcon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(styles.navItem, active && styles.navItemActive)}
                aria-current={active ? "page" : undefined}
              >
                <NavIcon aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

      </aside>

      {/* ===================================================
          MAIN CONTENT AREA
          =================================================== */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setOpen((val) => !val)}
            aria-label="Toggle navigation"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Universal Search Bar */}
          <div className={styles.adminSearch} ref={searchRef}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchableNav.length > 0) {
                  router.push(searchableNav[0].href);
                  setSearchOpen(false);
                }
              }}
            >
              <Search aria-hidden="true" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search schools, orders, products, suppliers..."
                autoComplete="off"
              />
              <kbd>⌘K</kbd>
            </form>

            {searchOpen && searchQuery.trim() && (
              <div className={styles.searchResults}>
                {searchableNav.length ? (
                  searchableNav.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href}>
                        <Icon size={14} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })
                ) : (
                  <p className={styles.noResultsText}>
                    No matching pages
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Top Actions: Notification Bell + Discussion Drawer + Global CTA */}
          <div className={styles.topbarActions}>
            <div className={styles.notification} ref={notificationRef}>
              <button
                type="button"
                className={styles.utilityButton}
                onClick={() => setNotificationOpen((val) => !val)}
                aria-label="Notifications"
              >
                <Bell size={16} />
                <span className={styles.utilityBadge}>7</span>
              </button>
            </div>

            <Link
              href="/admin/tasks"
              className={styles.utilityButton}
              aria-label="Messages"
            >
              <MessageSquare size={16} />
            </Link>
          </div>
        </header>

        <main id="admin-content" className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
