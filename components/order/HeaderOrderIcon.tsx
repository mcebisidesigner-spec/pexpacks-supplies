"use client";

import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { Backpack } from "lucide-react";
import { usePackTrayStore } from "@/store/usePackTrayStore";
import { useHasMounted } from "@/hooks/useHasMounted";
import { Tooltip } from "@/components/ui/Tooltip";
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
        aria-label="Fill up your Backpack"
        disabled
        style={{ opacity: 0, pointerEvents: "none" }}
      >
        <Backpack aria-hidden="true" size={22} strokeWidth={1.8} />
      </button>
    );
  }

  return (
    <Tooltip content="Fill up your Backpack" position="bottom">
      <button
        type="button"
        className={clsx(styles.iconButton, animate && styles.iconPop)}
        onClick={handleClick}
        aria-label={`Fill up your Backpack (${packCount} pack${packCount === 1 ? "" : "s"})`}
      >
        <Backpack aria-hidden="true" size={22} strokeWidth={1.8} />
        <span className={styles.badge} aria-hidden="true">
          {packCount > 9 ? "9+" : packCount}
        </span>
      </button>
    </Tooltip>
  );
}
