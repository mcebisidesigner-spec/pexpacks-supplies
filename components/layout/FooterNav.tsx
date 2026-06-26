import Link from "next/link";
import { footerNavLinks } from "@/data/navigation";
import styles from "./Footer.module.css";

export function FooterNav() {

  return (
    <nav className={styles.mainNav} aria-label="Footer navigation">
      {footerNavLinks.map((link, index) => (
          <span key={link.label} className={`${styles.navItem} ${link.label === "BrandPack" ? styles.hideOnMobile : ""}`}>
            <Link href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
            {index < footerNavLinks.length - 1 && (
              <span className={styles.separator} aria-hidden="true">
                |
              </span>
            )}
          </span>
      ))}
    </nav>
  );
}
