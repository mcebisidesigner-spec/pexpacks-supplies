import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import styles from "./IconLink.module.css";

type IconLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
  variant?: "tertiary" | "pill";
};

export function IconLink({
  href,
  children,
  icon,
  variant = "tertiary",
  className = "",
  ...props
}: IconLinkProps) {
  return (
    <Link
      href={href}
      className={[styles.link, styles[variant], className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <span>{children}</span>
    </Link>
  );
}
