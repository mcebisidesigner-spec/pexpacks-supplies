"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import {
  BarChart3,
  Bell,
  Camera,
  ChevronDown,
  CircleAlert,
  ClipboardList,
  CreditCard,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  Package,
  PackageCheck,
  PackageSearch,
  ShoppingCart,
  Tags,
  Truck,
  Warehouse,
  RefreshCw,
  School,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import type { AdminNavGroup, AdminNavItem } from "@/lib/admin/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import styles from "./AdminShell.module.css";

const NAV_ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  school: School,
  pack: Package,
  items: PackageSearch,
  pricing: Tags,
  suppliers: Truck,
  procurement: ShoppingCart,
  fulfilment: Warehouse,
  tasks: PackageCheck,
  orders: ClipboardList,
  payments: CreditCard,
  users: Users,
  roles: Shield,
  content: FileText,
  blog: Newspaper,
  assets: ImageIcon,
  reports: BarChart3,
  settings: Settings,
  audit: ShieldCheck,
};

const BOTTOM_NAV_PRIORITY = [
  "/admin",
  "/admin/schools",
  "/admin/packs",
  "/admin/orders",
  "/admin/settings",
];

function isActive(href: string, pathname: string, end?: boolean) {
  return end ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "PX";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function AdminShell({
  groups,
  userName,
  userEmail,
  userRoles,
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
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(avatarUrl);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const searchableItems = useMemo(
    () =>
      groups.flatMap((group) =>
        group.items
          .filter((item) => item.ready)
          .map((item) => ({ ...item, groupTitle: group.title })),
      ),
    [groups],
  );
  const readyItems = searchableItems as Array<AdminNavItem & { groupTitle: string }>;
  const bottomNavItems = BOTTOM_NAV_PRIORITY.map((href) =>
    readyItems.find((item) => item.href === href),
  ).filter((item): item is AdminNavItem & { groupTitle: string } => Boolean(item));
  const filteredItems = searchQuery.trim()
    ? readyItems
        .filter((item) =>
          `${item.label} ${item.groupTitle}`.toLowerCase().includes(searchQuery.trim().toLowerCase()),
        )
        .slice(0, 7)
    : [];
  const ordersItem = readyItems.find((item) => item.href === "/admin/orders");
  const paymentsItem = readyItems.find((item) => item.href === "/admin/payments");
  const schoolsItem = readyItems.find((item) => item.href === "/admin/schools");
  const procurementItem = readyItems.find((item) => item.href === "/admin/procurement");
  const tasksItem = readyItems.find((item) => item.href === "/admin/tasks");
  const roleLabels = userRoles.length ? userRoles.join(", ") : "Staff";
  const userInitials = initials(userName);
  const {
    notifications,
    isLoading: notificationsLoading,
    isRefreshing: notificationsRefreshing,
    isError: notificationsError,
    refresh: refreshNotifications,
  } = useAdminNotifications(Boolean(ordersItem || paymentsItem || schoolsItem || procurementItem || tasksItem));

  const notificationItems = [
    notifications?.failed_payments
      ? {
          key: "failed-payments",
          title: `${notifications.failed_payments} failed payment${notifications.failed_payments === 1 ? "" : "s"}`,
          detail: "Requires payment follow-up.",
          href: paymentsItem?.href ?? ordersItem?.href ?? "/admin",
          icon: CircleAlert,
          tone: "danger",
        }
      : null,
    notifications?.pending_payments
      ? {
          key: "pending-payments",
          title: `${notifications.pending_payments} pending payment${notifications.pending_payments === 1 ? "" : "s"}`,
          detail: "Waiting for payment confirmation.",
          href: paymentsItem?.href ?? ordersItem?.href ?? "/admin",
          icon: CreditCard,
          tone: "warning",
        }
      : null,
    notifications?.awaiting_fulfilment
      ? {
          key: "awaiting-fulfilment",
          title: `${notifications.awaiting_fulfilment} pack${notifications.awaiting_fulfilment === 1 ? "" : "s"} to fulfil`,
          detail: "Paid orders ready for operations.",
          href: ordersItem?.href ?? "/admin",
          icon: PackageCheck,
          tone: "info",
        }
      : null,
    notifications?.pending_schools
      ? {
          key: "pending-schools",
          title: `${notifications.pending_schools} pending school${notifications.pending_schools === 1 ? "" : "s"}`,
          detail: "School records require review.",
          href: schoolsItem?.href ?? "/admin",
          icon: School,
          tone: "info",
        }
      : null,
    notifications?.procurement_outstanding
      ? { key: "procurement", title: `${notifications.procurement_outstanding} units outstanding`, detail: "Committed paid-order demand is not yet secured.", href: procurementItem?.href ?? "/admin", icon: ShoppingCart, tone: "warning" }
      : null,
    notifications?.open_tasks
      ? { key: "tasks", title: `${notifications.open_tasks} open operational task${notifications.open_tasks === 1 ? "" : "s"}`, detail: "Assigned work requires attention.", href: tasksItem?.href ?? "/admin", icon: PackageCheck, tone: "info" }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));
  const notificationCount = notificationItems.reduce((total, item) => {
    if (item.key === "failed-payments") return total + (notifications?.failed_payments ?? 0);
    if (item.key === "pending-payments") return total + (notifications?.pending_payments ?? 0);
    if (item.key === "awaiting-fulfilment") return total + (notifications?.awaiting_fulfilment ?? 0);
    if (item.key === "procurement") return total + (notifications?.procurement_outstanding ?? 0);
    if (item.key === "tasks") return total + (notifications?.open_tasks ?? 0);
    return total + (notifications?.pending_schools ?? 0);
  }, 0);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || avatarUploading) return;
    setAvatarError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarError("Use a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Profile images must be 2 MB or smaller.");
      return;
    }

    setAvatarUploading(true);
    try {
      const body = new FormData();
      body.append("avatar", file);
      const response = await fetch("/api/admin/profile/avatar", { method: "POST", body });
      const result = (await response.json()) as { avatarUrl?: string; error?: string };
      if (!response.ok || !result.avatarUrl) throw new Error(result.error ?? "Upload failed.");
      setCurrentAvatarUrl(result.avatarUrl);
      router.refresh();
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : "The profile image could not be uploaded.");
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleAvatarRemove() {
    if (avatarUploading) return;
    setAvatarError("");
    setAvatarUploading(true);
    try {
      const response = await fetch("/api/admin/profile/avatar", { method: "DELETE" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Removal failed.");
      setCurrentAvatarUrl(null);
      router.refresh();
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : "The profile image could not be removed.");
    } finally {
      setAvatarUploading(false);
    }
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const firstResult = filteredItems[0];
    if (!firstResult) return;
    setSearchOpen(false);
    setSearchQuery("");
    router.push(firstResult.href);
  }

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

  useEffect(() => {
    setCurrentAvatarUrl(avatarUrl);
  }, [avatarUrl]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className={`${styles.shell} admin-dark`}>
      <div
        className={clsx(styles.overlay, open && styles.overlayVisible)}
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />

      <aside
        id="admin-sidebar"
        className={clsx(styles.sidebar, open && styles.sidebarOpen)}
        aria-label="Admin navigation"
      >
        <Link href="/admin" className={styles.sidebarBrand} aria-label="Pexpacks dashboard">
          <Image src="/images/logo-white.svg" alt="Pexpacks" width={132} height={52} priority />
          <span>Back Office</span>
        </Link>

        <nav className={styles.nav}>
          {groups.map((group) => (
            <section
              className={styles.navGroup}
              key={group.title}
              aria-label={group.title === "Overview" ? "Dashboard navigation" : group.title}
            >
              {group.title === "Overview" ? null : <h2>{group.title}</h2>}
              {group.items.map((item) => {
                const active = isActive(item.href, pathname, item.end);
                const NavIcon = NAV_ICONS[item.icon] ?? FileText;
                return item.ready ? (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(styles.navItem, active && styles.navItemActive)}
                    aria-current={active ? "page" : undefined}
                  >
                    <NavIcon aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <span
                    key={item.href}
                    className={clsx(styles.navItem, styles.navItemDisabled)}
                    aria-disabled="true"
                  >
                    <NavIcon aria-hidden="true" />
                    <span>{item.label}</span>
                    <small>Soon</small>
                  </span>
                );
              })}
            </section>
          ))}
        </nav>


      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="admin-sidebar"
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>

          <div className={styles.adminSearch} ref={searchRef}>
            <form role="search" onSubmit={handleSearchSubmit}>
              <Search aria-hidden="true" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search back office..."
                aria-label="Search admin pages"
                autoComplete="off"
              />
              <kbd>Ctrl K</kbd>
            </form>
            {searchOpen && searchQuery.trim() ? (
              <div className={styles.searchResults} role="listbox" aria-label="Admin pages">
                {filteredItems.length ? filteredItems.map((item) => {
                  const SearchIcon = NAV_ICONS[item.icon] ?? FileText;
                  return (
                    <Link key={item.href} href={item.href} role="option">
                      <SearchIcon aria-hidden="true" />
                      <span><strong>{item.label}</strong><small>{item.groupTitle}</small></span>
                    </Link>
                  );
                }) : <p>No matching admin pages</p>}
              </div>
            ) : null}
          </div>

          <div className={styles.topbarActions}>
            {ordersItem ? (
              <Link href={ordersItem.href} className={styles.utilityButton} aria-label="Open orders received today" title="Orders received today">
                <Mail aria-hidden="true" />
                {notifications?.orders_today ? (
                  <span className={styles.utilityBadge}>{notifications.orders_today > 99 ? "99+" : notifications.orders_today}</span>
                ) : null}
              </Link>
            ) : null}
            {ordersItem || paymentsItem || schoolsItem ? (
              <div className={styles.notification} ref={notificationRef}>
                <button
                  type="button"
                  className={clsx(styles.utilityButton, notificationOpen && styles.utilityButtonActive)}
                  aria-label={`Open notifications${notificationCount ? `, ${notificationCount} unread` : ""}`}
                  aria-haspopup="menu"
                  aria-expanded={notificationOpen}
                  title="Notifications"
                  onClick={() => {
                    setNotificationOpen((value) => !value);
                    setProfileOpen(false);
                  }}
                >
                  <Bell aria-hidden="true" />
                  {notificationCount ? (
                    <span className={styles.utilityBadge}>{notificationCount > 99 ? "99+" : notificationCount}</span>
                  ) : null}
                </button>

                {notificationOpen ? (
                  <div className={styles.notificationDropdown} role="menu" aria-label="Operational notifications">
                    <div className={styles.notificationHeader}>
                      <div><strong>Notifications</strong><span>Live operational activity</span></div>
                      <button
                        type="button"
                        onClick={() => void refreshNotifications()}
                        disabled={notificationsRefreshing}
                        aria-label="Refresh notifications"
                        title="Refresh notifications"
                      >
                        <RefreshCw className={clsx(notificationsRefreshing && styles.refreshing)} aria-hidden="true" />
                      </button>
                    </div>
                    {notificationsLoading ? (
                      <p className={styles.notificationEmpty}>Loading current activity...</p>
                    ) : notificationsError ? (
                      <p className={styles.notificationError}>Activity could not be refreshed.</p>
                    ) : notificationItems.length ? (
                      <div className={styles.notificationList}>
                        {notificationItems.map((item) => {
                          const NotificationIcon = item.icon;
                          return (
                            <Link key={item.key} href={item.href} role="menuitem">
                              <span className={clsx(styles.notificationIcon, styles[`notificationIcon_${item.tone}`])}>
                                <NotificationIcon aria-hidden="true" />
                              </span>
                              <span><strong>{item.title}</strong><small>{item.detail}</small></span>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <p className={styles.notificationEmpty}>All clear. There is no activity requiring attention.</p>
                    )}
                    <div className={styles.notificationFooter}>
                      Live updates with 60-second fallback
                      {notifications?.generated_at ? ` · ${new Date(notifications.generated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className={styles.profile} ref={profileRef}>
              <button
                type="button"
                className={clsx(styles.profileTrigger, profileOpen && styles.profileTriggerActive)}
                onClick={() => {
                  setProfileOpen((value) => !value);
                  setNotificationOpen(false);
                }}
                aria-haspopup="menu"
                aria-expanded={profileOpen}
              >
                <span className={styles.profileAvatar}>
                  {currentAvatarUrl ? <Image src={currentAvatarUrl} alt="" width={44} height={44} /> : userInitials}
                </span>
                <span className={styles.profileCopy}>
                  <strong>{userName.split(" ")[0].replace(/@.*/, "").charAt(0).toUpperCase() + userName.split(" ")[0].replace(/@.*/, "").slice(1)}</strong>
                </span>
              </button>

              {profileOpen ? (
                <div className={styles.profileDropdown} role="menu" aria-label="User profile">
                  <div className={styles.profileHeader}>
                    <button
                      type="button"
                      className={styles.profilePhotoButton}
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={avatarUploading}
                      aria-label="Change profile photo"
                      title="Change profile photo"
                    >
                      <span className={styles.profileAvatar}>
                        {currentAvatarUrl ? <Image src={currentAvatarUrl} alt="" width={40} height={40} /> : userInitials}
                      </span>
                      <span className={styles.cameraBadge}><Camera aria-hidden="true" /></span>
                    </button>
                    <div>
                      <strong>{userName}</strong>
                      <span>{userEmail}</span>
                      <small>{roleLabels}</small>
                    </div>
                  </div>
                  <input
                    ref={avatarInputRef}
                    className={styles.avatarInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                  />
                  <div className={styles.profilePhotoActions}>
                    <button type="button" onClick={() => avatarInputRef.current?.click()} disabled={avatarUploading}>
                      <Camera aria-hidden="true" />
                      {avatarUploading ? "Updating..." : "Change photo"}
                    </button>
                    {currentAvatarUrl ? (
                      <button type="button" onClick={handleAvatarRemove} disabled={avatarUploading}>Remove</button>
                    ) : null}
                  </div>
                  {avatarError ? <p className={styles.avatarError} role="alert">{avatarError}</p> : null}
                  <button
                    type="button"
                    className={styles.signOutButton}
                    onClick={handleSignOut}
                    disabled={signingOut}
                    role="menuitem"
                  >
                    <LogOut aria-hidden="true" />
                    {signingOut ? "Signing out..." : "Sign out"}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main id="admin-content" className={styles.content}>{children}</main>
      </div>

      {bottomNavItems.length ? (
        <nav className={styles.bottomNav} aria-label="Primary navigation">
          {bottomNavItems.map((item) => {
            const active = isActive(item.href, pathname, item.end);
            const NavIcon = NAV_ICONS[item.icon] ?? FileText;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(styles.bottomNavItem, active && styles.bottomNavItemActive)}
                aria-current={active ? "page" : undefined}
              >
                <NavIcon aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
