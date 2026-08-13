"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  School,
  Package,
  PackageSearch,
  ClipboardList,
  CreditCard,
  Users,
  Shield,
  FileText,
  Newspaper,
  Image,
  BarChart3,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { AdminNavGroup } from "@/lib/admin/navigation";
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
  assets: Image,
  reports: BarChart3,
  settings: Settings,
  audit: ShieldCheck,
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A";
  if (parts.length === 1) return parts[0].slice(0, 2);
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function isActive(href: string, pathname: string, end?: boolean) {
  if (end) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
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

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    function onOutsideClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
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

  const roleLabels = userRoles.length > 0 ? userRoles.join(", ") : "Staff";
  const avatarInitials = initials(userName);

  return (
    <div className={`${styles.shell} admin-dark`}>
      <div
        className={clsx(styles.overlay, open && styles.overlayVisible)}
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />

      <aside
        className={clsx(styles.sidebar, open && styles.sidebarOpen)}
        aria-label="Admin navigation"
      >
        {/* ── Brand + Profile trigger ── */}
        <div className={styles.brand} ref={profileRef}>
          <button
            type="button"
            className={clsx(styles.brandMark, profileOpen && styles.brandMarkActive)}
            onClick={() => setProfileOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={profileOpen}
            aria-label="Profile menu"
          >
            <span className={styles.brandMarkInitials}>{avatarInitials}</span>
          </button>
          <div>
            <div className={styles.brandName}>Pexpacks</div>
            <div className={styles.brandSub}>Admin Console</div>
          </div>

          {/* Profile dropdown */}
          {profileOpen && (
            <div className={styles.profileDropdown} role="menu" aria-label="User profile">
              <div className={styles.profileHeader}>
                <span className={styles.profileAvatar}>{avatarInitials}</span>
                <div className={styles.profileMeta}>
                  <span className={styles.profileName}>{userName}</span>
                  <span className={styles.profileEmail}>{userEmail}</span>
                  <span className={styles.profileRole}>{roleLabels}</span>
                </div>
              </div>
              <div className={styles.profileDivider} />
              <button
                type="button"
                className={styles.signOutButton}
                onClick={handleSignOut}
                disabled={signingOut}
                role="menuitem"
              >
                <LogOut size={15} />
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          )}
        </div>

        <nav className={styles.nav}>
          {groups.map((group) => (
            <div key={group.title} className={styles.navGroup}>
              <div className={styles.navGroupTitle}>{group.title}</div>
              {group.items.map((item) => {
                const active = isActive(item.href, pathname, item.end);
                const NavIcon = NAV_ICONS[item.icon] ?? FileText;
                if (!item.ready) {
                  return (
                    <span
                      key={item.href}
                      className={clsx(styles.navItem, styles.navItemDisabled)}
                      title="Coming soon"
                      aria-disabled="true"
                    >
                      <NavIcon size={18} />
                      <span>{item.label}</span>
                      <span className={styles.navItemSoon}>Soon</span>
                    </span>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(styles.navItem, active && styles.navItemActive)}
                    aria-current={active ? "page" : undefined}
                  >
                    <NavIcon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

      </aside>

      <div className={styles.main}>
        <div className={styles.topbar}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="admin-sidebar"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className={styles.topbarTitle}>Pexpacks Admin</span>
        </div>
        <main id="admin-content" className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
