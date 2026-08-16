"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { isActivePath } from "@/lib/isActivePath";
import styles from "./Header.module.css";

type HeaderActiveLinkProps = {
  href: string;
  label: string;
};

function LinkPendingStatus() {
  const { pending } = useLinkStatus();
  return pending ? <span className={styles.navLinkPending} aria-hidden="true" /> : null;
}

export function HeaderActiveLink({ href, label }: HeaderActiveLinkProps) {
  const pathname = usePathname();
  const active = isActivePath(href, pathname);

  return (
    <Link
      className={[styles.navLink, active ? styles.navLinkActive : ""]
        .filter(Boolean)
        .join(" ")}
      href={href}
      aria-current={active ? "page" : undefined}
      data-conversion-event={`header_${label.toLowerCase().replaceAll(" ", "_")}`}
    >
      {label}
      <LinkPendingStatus />
    </Link>
  );
}
