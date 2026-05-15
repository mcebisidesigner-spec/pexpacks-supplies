"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActivePath } from "@/lib/isActivePath";
import styles from "./Header.module.css";

type HeaderActiveLinkProps = {
  href: string;
  label: string;
};

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
    >
      {label}
    </Link>
  );
}
