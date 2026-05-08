"use client";

import Link from "next/link";
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
  return (
    <div
      id="mobile-menu"
      className={[styles.mobileMenu, open ? styles.mobileMenuOpen : ""].filter(Boolean).join(" ")}
      aria-hidden={!open}
    >
      <nav className={styles.mobileMenuNav} aria-label="Mobile navigation">
        {mainNavLinks.map((link) => {
          const active = isActivePath(link.href, pathname);

          return (
            <Link
              href={link.href}
              key={link.href}
              onClick={onClose}
              className={[styles.mobileMenuLink, active ? styles.mobileMenuLinkActive : ""].filter(Boolean).join(" ")}
              aria-current={active ? "page" : undefined}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <Link href="/order" className={styles.mobileMenuCta} onClick={onClose} aria-label="Order a PexPacks pack">
        <span>Order a Pack</span>
        <IconCircle className={styles.mobileMenuCtaIcon} />
      </Link>
    </div>
  );
}
