"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { footerNavLinks } from "@/data/navigation";
import { isActivePath } from "@/lib/isActivePath";
import styles from "./Footer.module.css";

export function FooterNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.mainNav} aria-label="Footer navigation">
      {footerNavLinks.map((link, index) => {
        const active = isActivePath(link.href, pathname);

        return (
          <span key={link.label} className={styles.navItem}>
            <Link
              href={link.href}
              className={[styles.navLink, active ? styles.navLinkActive : ""]
                .filter(Boolean)
                .join(" ")}
              aria-current={active ? "page" : undefined}
            >
              {link.label}
            </Link>
            {index < footerNavLinks.length - 1 && (
              <span className={styles.separator} aria-hidden="true">
                |
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
