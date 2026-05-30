"use client";

import { useCallback, useEffect, useState } from "react";
import { usePackTrayStore } from "@/store/usePackTrayStore";
import { useHasMounted } from "@/hooks/useHasMounted";
import styles from "./HeaderOrderIcon.module.css";

export function HeaderOrderIcon() {
  const hasMounted = useHasMounted();
  const packs = usePackTrayStore((s) => s.packs);
  const openTray = usePackTrayStore((s) => s.openTray);
  const [animate, setAnimate] = useState(false);

  const packCount = packs.length;

  useEffect(() => {
    if (packCount > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 600);
      return () => clearTimeout(timer);
    }
  }, [packCount]);

  const handleClick = useCallback(() => {
    openTray();
  }, [openTray]);

  if (!hasMounted) {
    return (
      <button
        type="button"
        className={styles.iconButton}
        aria-label="Open saved order"
        disabled
        style={{ opacity: 0, pointerEvents: "none" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`${styles.iconButton} ${animate ? styles.iconPop : ""}`}
      onClick={handleClick}
      aria-label={`Open saved order${packCount > 0 ? ` (${packCount} pack${packCount === 1 ? "" : "s"})` : ""}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
      {packCount > 0 ? (
        <span className={styles.badge} aria-hidden="true">
          {packCount > 9 ? "9+" : packCount}
        </span>
      ) : null}
    </button>
  );
}
