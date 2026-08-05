"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { HeaderActiveLink } from "./HeaderActiveLink";
import { HeaderMenu } from "./HeaderMenu";
import { HeaderScrollWrapper } from "./HeaderScrollWrapper";
import { mainNavLinks } from "@/data/navigation";
import { HeaderAccountControls } from "./HeaderAccountControls";
import styles from "./Header.module.css";

export function Header() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <HeaderScrollWrapper>
      <div
        className={[
          styles.headerInner,
          isAdmin ? styles.headerInnerAdmin : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <Link className={styles.logoLink} href="/" aria-label="Pexpacks home" data-mobile-menu-close>
          <Logo priority />
        </Link>
        {!isAdmin && (
          <nav className={styles.desktopNav} aria-label="Primary navigation">
            {mainNavLinks.map((link) => (
              <HeaderActiveLink href={link.href} label={link.label} key={link.href} />
            ))}
          </nav>
        )}
        <div className={styles.desktopActions}>
          <HeaderAccountControls variant="desktop" />
          {!isAdmin && (
            <Link className={styles.desktopOrder} href="/schools#school-search" aria-label="Find your Pexpacks pack">
              <span>Find Your Pack</span>
              <span className={styles.orderIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </span>
            </Link>
          )}
        </div>
        <div className={styles.mobileActions}>
          <HeaderAccountControls variant="mobile" />
          {!isAdmin && <HeaderMenu />}
        </div>
      </div>
    </HeaderScrollWrapper>
  );
}
