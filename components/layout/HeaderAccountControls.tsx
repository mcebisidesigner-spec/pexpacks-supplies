"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { logout } from "@/app/login/actions";
import { HeaderOrderIcon } from "@/components/order/HeaderOrderIcon";
import { TrackPackIcon } from "@/components/ui/icons";
import headerStyles from "./Header.module.css";
import styles from "./HeaderAccountControls.module.css";

export type AdminUser = {
  name: string;
  username: string;
};

type HeaderAccountControlsProps = {
  variant: "desktop" | "mobile";
  adminUser: AdminUser | null;
  adminUserLoading: boolean;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function HeaderAccountControls({
  variant,
  adminUser,
  adminUserLoading,
}: HeaderAccountControlsProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [open, setOpen] = useState(false);
  const [isLoggingOut, startLogoutTransition] = useTransition();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (isAdmin) {
    const user = adminUser;

    return (
      <div ref={wrapRef} className={styles.accountControls}>
        <button
          type="button"
          className={styles.profileButton}
          onClick={() => setOpen((v) => !v)}
          aria-label={
            user ? `Account menu for ${user.name}` : "Open account menu"
          }
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {user && !adminUserLoading ? (
            <span className={styles.avatar}>{getInitials(user.name)}</span>
          ) : (
            <span className={[styles.avatar, styles.avatarSilhouette].join(" ")}>
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
              </svg>
            </span>
          )}
        </button>

        {open && user ? (
          <div className={styles.dropdown} role="menu">
            <div className={styles.dropdownHeader}>
              <div className={styles.dropdownName}>{user.name}</div>
              <div className={styles.dropdownUsername}>@{user.username}</div>
            </div>
            <div className={styles.dropdownDivider} role="separator" />
            <button
              type="button"
              className={styles.logoutButton}
              role="menuitem"
              onClick={() => startLogoutTransition(() => logout())}
              disabled={isLoggingOut}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  if (variant === "desktop") {
    return (
      <div className={styles.accountControls}>
        <HeaderOrderIcon />
        <Link className={headerStyles.desktopLogin} href="/login" aria-label="Login" title="Login">
          <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
          </svg>
          <span className="sr-only">Login</span>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.accountControls}>
      <Link
        href="/track-order"
        className={styles.mobileTrackLink}
        aria-label="Track Your Pack"
        title="Track Your Pack"
      >
        <TrackPackIcon aria-hidden="true" />
      </Link>
      <HeaderOrderIcon />
    </div>
  );
}
