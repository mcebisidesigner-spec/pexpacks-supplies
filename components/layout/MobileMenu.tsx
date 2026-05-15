"use client";

import Link from "next/link";
import { useRef } from "react";
import { IconCircle } from "@/components/ui/IconCircle";
import { mainNavLinks } from "@/data/navigation";
import { isActivePath } from "@/lib/isActivePath";
import styles from "./Header.module.css";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  pathname: string;
};

export function MobileMenu({ open, onClose, pathname }: MobileMenuProps) {
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX.current;

    // If swiped right by more than 50px, close the menu
    if (deltaX > 50) {
      onClose();
    }
    touchStartX.current = null;
  };

  return (
    <div
      id="mobile-menu"
      className={[styles.mobileMenu, open ? styles.mobileMenuOpen : ""]
        .filter(Boolean)
        .join(" ")}
      inert={!open ? true : undefined}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
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
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/order"
        className={styles.mobileMenuCta}
        onClick={onClose}
        aria-label="Order a Pexpacks pack"
      >
        <span>Order a Pack</span>
        <IconCircle className={styles.mobileMenuCtaIcon} />
      </Link>
    </div>
  );
}
