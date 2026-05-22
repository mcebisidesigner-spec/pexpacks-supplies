import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { HeaderActiveLink } from "./HeaderActiveLink";
import { HeaderMenu } from "./HeaderMenu";
import { mainNavLinks } from "@/data/navigation";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={`${styles.siteHeader} ${styles.headerVisible} ${styles.headerAtTop}`}>
      <div className={styles.headerInner}>
        <Link className={styles.logoLink} href="/" aria-label="Pexpacks home" data-mobile-menu-close>
          <Logo priority />
        </Link>
        <nav className={styles.desktopNav} aria-label="Primary navigation">
          {mainNavLinks.map((link) => (
            <HeaderActiveLink href={link.href} label={link.label} key={link.href} />
          ))}
        </nav>
        <div className={styles.desktopActions}>
          <Link className={styles.desktopLogin} href="/login" aria-label="Open parent portal" title="Parent portal">
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
            </svg>
            <span className="sr-only">Parent portal</span>
          </Link>
          <Link className={styles.desktopOrder} href="/order" aria-label="Order a Pexpacks pack">
            <span>Order a Pack</span>
            <span className={styles.orderIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </span>
          </Link>
        </div>
        <HeaderMenu />
      </div>
    </header>
  );
}
