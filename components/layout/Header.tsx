"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { HeaderActiveLink } from "./HeaderActiveLink";
import { HeaderMenu } from "./HeaderMenu";
import { mainNavLinks } from "@/data/navigation";
import { useHideHeaderOnScroll } from "@/lib/hooks/useHideHeaderOnScroll";
import styles from "./Header.module.css";

export function Header() {
  const pathname = usePathname();
  const [isKeyboardNavigating, setIsKeyboardNavigating] = useState(false);
  const [isHeaderKeyboardFocused, setIsHeaderKeyboardFocused] = useState(false);
  const shouldPinHeader = pathname === "/order" || pathname === "/track-order";

  const { isHidden, isAtTop } = useHideHeaderOnScroll({
    disabled: shouldPinHeader || isHeaderKeyboardFocused,
  });

  return (
    <header
      className={`${styles.siteHeader} ${isHidden ? styles.headerHidden : styles.headerVisible} ${isAtTop ? styles.headerAtTop : styles.headerScrolled}`}
      onKeyDownCapture={(event) => {
        if (event.key === "Tab") {
          setIsKeyboardNavigating(true);
        }
      }}
      onPointerDownCapture={() => {
        setIsKeyboardNavigating(false);
        setIsHeaderKeyboardFocused(false);
      }}
      onFocusCapture={() => {
        if (isKeyboardNavigating) {
          setIsHeaderKeyboardFocused(true);
        }
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setIsHeaderKeyboardFocused(false);
        }
      }}
    >
      <div className={styles.headerInner}>
        <Link
          className={styles.logoLink}
          href="/"
          aria-label="Pexpacks home"
          data-mobile-menu-close
        >
          <Logo />
        </Link>

        <nav className={styles.desktopNav} aria-label="Primary navigation">
          {mainNavLinks.map((link) => (
            <HeaderActiveLink
              href={link.href}
              label={link.label}
              key={link.href}
            />
          ))}
        </nav>

        <Link
          className={styles.desktopOrder}
          href="/order"
          aria-label="Order a Pexpacks pack"
        >
          <span>Order a Pack</span>
          <span className={styles.orderIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </span>
        </Link>

        <HeaderMenu />
      </div>
    </header>
  );
}
