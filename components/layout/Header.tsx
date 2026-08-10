"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { HeaderActiveLink } from "./HeaderActiveLink";
import { HeaderMenu } from "./HeaderMenu";
import { HeaderScrollWrapper } from "./HeaderScrollWrapper";
import { mainNavLinks } from "@/data/navigation";
import { HeaderAccountControls } from "./HeaderAccountControls";
import { PackageIcon } from "@/components/ui/icons";
import styles from "./Header.module.css";

export function Header() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [adminUser, setAdminUser] = useState<{
    name: string;
    username: string;
  } | null>(null);
  const [adminUserLoading, setAdminUserLoading] = useState(isAdmin);

  useEffect(() => {
    if (!isAdmin) {
      setAdminUser(null);
      setAdminUserLoading(false);
      return;
    }

    let cancelled = false;
    setAdminUserLoading(true);

    (async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;

      if (data?.user) {
        const meta = data.user.user_metadata ?? {};
        setAdminUser({
          name: meta.full_name || meta.name || data.user.email || "Admin",
          username:
            meta.username ||
            meta.user_name ||
            data.user.email?.split("@")[0] ||
            "admin",
        });
      }
      setAdminUserLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

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
        <div className={styles.adminBrand}>
          <Link className={styles.logoLink} href="/" aria-label="Pexpacks home" data-mobile-menu-close>
            <Logo priority />
          </Link>
          {isAdmin && (
            <span className={styles.adminUserTitle}>
              {adminUserLoading ? "Admin" : adminUser?.name ?? "Admin"}
            </span>
          )}
        </div>
        {!isAdmin && (
          <nav className={styles.desktopNav} aria-label="Primary navigation">
            {mainNavLinks.map((link) => (
              <HeaderActiveLink href={link.href} label={link.label} key={link.href} />
            ))}
          </nav>
        )}
        <div className={styles.desktopActions}>
          <HeaderAccountControls
            variant="desktop"
            adminUser={adminUser}
            adminUserLoading={adminUserLoading}
          />
          {!isAdmin && (
            <Link className={styles.desktopOrder} href="/track-order">
              <span>Track Your Pack</span>
              <span className={styles.orderIcon} aria-hidden="true">
                <PackageIcon />
              </span>
            </Link>
          )}
        </div>
        <div className={styles.mobileActions}>
          <HeaderAccountControls
            variant="mobile"
            adminUser={adminUser}
            adminUserLoading={adminUserLoading}
          />
          {!isAdmin && <HeaderMenu />}
        </div>
      </div>
    </HeaderScrollWrapper>
  );
}
