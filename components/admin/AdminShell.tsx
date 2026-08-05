"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { AdminNavGroup } from "@/lib/admin/navigation";
import { AdminIcon } from "@/components/admin/icons";
import styles from "./AdminShell.module.css";

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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const roleLabels = userRoles.length > 0 ? userRoles.join(", ") : "Staff";

  return (
    <div className={styles.shell}>
      <div
        className={clsx(styles.overlay, open && styles.overlayVisible)}
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />

      <aside
        className={clsx(styles.sidebar, open && styles.sidebarOpen)}
        aria-label="Admin navigation"
      >
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true" />
          <div>
            <div className={styles.brandName}>Pexpacks</div>
            <div className={styles.brandSub}>Admin Console</div>
          </div>
        </div>

        <nav className={styles.nav}>
          {groups.map((group) => (
            <div key={group.title} className={styles.navGroup}>
              <div className={styles.navGroupTitle}>{group.title}</div>
              {group.items.map((item) => {
                const active = isActive(item.href, pathname, item.end);
                if (!item.ready) {
                  return (
                    <span
                      key={item.href}
                      className={styles.navItemDisabled}
                      title="Coming soon"
                      aria-disabled="true"
                    >
                      <AdminIcon name={item.icon} size={18} />
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
                    <AdminIcon name={item.icon} size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userChip}>
            <span className={styles.userAvatar}>{initials(userName)}</span>
            <span className={styles.userMeta}>
              <span className={styles.userName}>{userName}</span>
              <span className={styles.userEmail}>{userEmail}</span>
              <span className={styles.userRoles} title={roleLabels}>
                {roleLabels}
              </span>
            </span>
          </div>
        </div>
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
            <AdminIcon name={open ? "close" : "menu"} size={20} />
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
