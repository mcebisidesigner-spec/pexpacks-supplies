"use client";

import { useHideHeaderOnScroll } from "@/lib/hooks/useHideHeaderOnScroll";
import styles from "./Header.module.css";

type HeaderScrollWrapperProps = {
  children: React.ReactNode;
};

export function HeaderScrollWrapper({ children }: HeaderScrollWrapperProps) {
  const { isHidden, isAtTop } = useHideHeaderOnScroll();

  const headerClass = [
    styles.siteHeader,
    isHidden ? styles.headerHidden : styles.headerVisible,
    isAtTop ? styles.headerAtTop : "",
  ]
    .filter(Boolean)
    .join(" ");

  return <header className={headerClass}>{children}</header>;
}