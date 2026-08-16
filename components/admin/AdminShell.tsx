"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import {
  BarChart3,
  ClipboardList,
  CreditCard,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Package,
  PackageSearch,
  School,
  Settings,
  Shield,
  ShieldCheck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import type { AdminNavGroup, AdminNavItem } from "@/lib/admin/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./AdminShell.module.css";

const NAV_ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  school: School,
  pack: Package,
  items: PackageSearch,
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

export function AdminShell({
  groups,
  userName,
  userEmail,
  userRoles,
  children,
}: {
  groups: AdminNavGroup[];
  userName: string;
  userEmail: string;
  userRoles: string[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const readyItems = groups.flatMap((group) => group.items).filter((item) => item.ready);
  const currentItem = readyItems.find((item) => isActive(item.href, pathname, item.end));
  const bottomNavItems = BOTTOM_NAV_PRIORITY.map((href) =>
    readyItems.find((item) => item.href === href),
  ).filter((item): item is AdminNavItem => Boolean(item));
  const roleLabels = userRoles.length ? userRoles.join(", ") : "Staff";

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setProfileOpen(false);
      }
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (!profileOpen) return;
    function handleOutsideClick(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [profileOpen]);

  useEffect(() => {
    setOpen(false);
    setProfileOpen(false);
  }, [pathname]);

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
          <Image
            src="/images/logo-white.svg"
            alt="Pexpacks"
            width={132}
            height={52}
            priority
          />
          <span>Admin Console</span>
        </Link>

        <nav className={styles.nav}>
          {groups.map((group) => (
            <section className={styles.navGroup} key={group.title} aria-label={group.title}>
              <h2>{group.title}</h2>
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

          <div className={styles.topbarContext}>
            <span>Operational Console</span>
            <strong>{currentItem?.label ?? "Pexpacks Admin"}</strong>
          </div>

          <div className={styles.profile} ref={profileRef}>
            <button
              type="button"
              className={clsx(styles.profileTrigger, profileOpen && styles.profileTriggerActive)}
              onClick={() => setProfileOpen((value) => !value)}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              aria-label="Open Pexpacks account menu"
            >
              <Image src="/images/logo-white.svg" alt="Pexpacks" width={104} height={41} priority />
            </button>

            {profileOpen ? (
              <div className={styles.profileDropdown} role="menu" aria-label="User profile">
                <div className={styles.profileHeader}>
                  <Image src="/images/PexLogo.png" alt="" width={48} height={18} aria-hidden="true" />
                  <div>
                    <strong>{userName}</strong>
                    <span>{userEmail}</span>
                    <small>{roleLabels}</small>
                  </div>
                </div>
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
