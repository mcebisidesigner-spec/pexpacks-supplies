"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { mainNavLinks } from "@/data/navigation";
import { isActivePath } from "@/lib/isActivePath";
import { TrackPackIcon } from "@/components/ui/icons";
import styles from "./Header.module.css";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  pathname: string;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function MobileMenu({ open, onClose, pathname }: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;

    const menu = menuRef.current;
    if (!menu) return;

    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;

      const el = menuRef.current;
      if (!el) return;

      const focusable = [
        ...el.querySelectorAll<HTMLElement>(FOCUSABLE),
      ];
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleTab);

    const firstFocusable = menu.querySelector<HTMLElement>(FOCUSABLE);
    firstFocusable?.focus();

    return () => document.removeEventListener("keydown", handleTab);
  }, [open]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current!;

    if (deltaX > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      onClose();
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <div
      ref={menuRef}
      id="mobile-menu"
      role="dialog"
      aria-modal={open ? "true" : "false"}
      aria-label="Navigation menu"
      className={[styles.mobileMenu, open ? styles.mobileMenuOpen : ""]
        .filter(Boolean)
        .join(" ")}
      inert={!open}
      aria-hidden={!open ? "true" : undefined}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.mobileMenuInner}>
        <nav className={styles.mobileMenuNav} aria-label="Mobile navigation">
          {mainNavLinks.map((link) => {
            const active = isActivePath(link.href, pathname);

            return (
              <Link
                href={link.href}
                key={link.href}
                onClick={onClose}
                className={[
                  styles.mobileMenuLink,
                  active ? styles.mobileMenuLinkActive : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-current={active ? "page" : undefined}
                data-conversion-event={`mobile_nav_${link.label.toLowerCase().replaceAll(" ", "_")}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.mobileMenuDivider} role="separator" />

        <div className={styles.mobileMenuSecondary}>
          <Link
            href="/track-order"
            className={styles.mobileMenuCta}
            onClick={onClose}
            data-conversion-event="mobile_track_pack"
          >
            <span>Track Your Pack</span>
            <span className={styles.mobileMenuCtaIcon}>
              <TrackPackIcon aria-hidden="true" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
