"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import {
  Bell,
  Boxes,
  Briefcase,
  CheckSquare,
  CreditCard,
  FileSpreadsheet,
  FileText,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  PackageCheck,
  School,
  Search,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import type { AdminNavGroup } from "@/lib/admin/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./AdminShell.module.css";
type NotificationCounts = {
  orders_today: number;
  pending_payments: number;
  failed_payments: number;
  awaiting_fulfilment: number;
  pending_schools: number;
  procurement_outstanding: number;
  open_tasks: number;
};

const EMPTY_NOTIFICATION_COUNTS: NotificationCounts = {
  orders_today: 0,
  pending_payments: 0,
  failed_payments: 0,
  awaiting_fulfilment: 0,
  pending_schools: 0,
  procurement_outstanding: 0,
  open_tasks: 0,
};

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
  userName,
  userEmail,
  userRoles = [],
  avatarUrl,
  children,
}: {
  groups: AdminNavGroup[];
  userName: string;
  userEmail: string;
  userRoles?: string[];
  avatarUrl: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationCounts, setNotificationCounts] = useState<NotificationCounts>(EMPTY_NOTIFICATION_COUNTS);
  const [signingOut, setSigningOut] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const displayName = userName && userName !== "Admin" ? userName : userEmail;
  const userInitials = getInitials(displayName);

  const isSuperUser =
    userRoles.includes("super_admin") ||
    userEmail.toLowerCase() === "mcebisimhayise@gmail.com" ||
    userEmail.toLowerCase() === "pexpacks@gmail.com";

  const visibleNavItems = useMemo(() => {
    return ORDERED_NAV_ITEMS.filter((item) => {
      if (item.href === "/admin/settings") {
        return isSuperUser;
      }
      return true;
    });
  }, [isSuperUser]);
  const notificationItems = useMemo(() => [
    { label: "Orders today", value: notificationCounts.orders_today, href: "/admin/orders" },
    { label: "Pending payments", value: notificationCounts.pending_payments, href: "/admin/payments" },
    { label: "Failed payments", value: notificationCounts.failed_payments, href: "/admin/payments" },
    { label: "Awaiting fulfilment", value: notificationCounts.awaiting_fulfilment, href: "/admin/fulfilment" },
    { label: "Pending schools", value: notificationCounts.pending_schools, href: "/admin/schools" },
    { label: "Procurement outstanding", value: notificationCounts.procurement_outstanding, href: "/admin/procurement" },
    { label: "Open tasks", value: notificationCounts.open_tasks, href: "/admin/tasks" },
  ].filter((item) => item.value > 0), [notificationCounts]);

  const notificationTotal = notificationItems.reduce((sum, item) => sum + item.value, 0);
  // Search items
  const searchableNav = useMemo(() => {
    return visibleNavItems.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [visibleNavItems, searchQuery]);

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
        setSearchOpen(false);
        setNotificationOpen(false);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(target)) setSearchOpen(false);
      if (notificationRef.current && !notificationRef.current.contains(target)) setNotificationOpen(false);
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    setOpen(false);
    setProfileOpen(false);
    setSearchOpen(false);
    setNotificationOpen(false);
    setSearchQuery("");
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;

    async function loadNotifications() {
      try {
        const response = await fetch("/api/admin/notifications", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json() as Partial<NotificationCounts>;
        if (!cancelled) {
          setNotificationCounts({
            orders_today: Number(data.orders_today ?? 0),
            pending_payments: Number(data.pending_payments ?? 0),
            failed_payments: Number(data.failed_payments ?? 0),
            awaiting_fulfilment: Number(data.awaiting_fulfilment ?? 0),
            pending_schools: Number(data.pending_schools ?? 0),
            procurement_outstanding: Number(data.procurement_outstanding ?? 0),
            open_tasks: Number(data.open_tasks ?? 0),
          });
        }
      } catch (err) {
        console.error("[admin-shell] notifications failed:", err);
      }
    }

    void loadNotifications();
    const interval = window.setInterval(loadNotifications, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);
  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
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

        {/* 2. Navigation Items */}
        <nav className={styles.nav}>
          {visibleNavItems.map((item) => {
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
              <kbd>Ctrl K</kbd>
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
                onClick={() => setNotificationOpen((prev) => !prev)}
                aria-label="Notifications"
                aria-expanded={notificationOpen}
              >
                <Bell size={16} />
                {notificationTotal > 0 && (
                  <span className={styles.utilityBadge}>{notificationTotal > 99 ? "99+" : notificationTotal}</span>
                )}
              </button>

              {notificationOpen && (
                <div className={styles.notificationDropdown} role="menu">
                  <strong className={styles.notificationTitle}>Operational alerts</strong>
                  {notificationItems.length ? (
                    notificationItems.map((item) => (
                      <Link key={item.label} href={item.href} className={styles.notificationItem}>
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                      </Link>
                    ))
                  ) : (
                    <p className={styles.notificationEmpty}>No open alerts</p>
                  )}
                </div>
              )}
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
