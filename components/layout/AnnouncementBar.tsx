"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import styles from "./AnnouncementBar.module.css";

export interface AnnouncementBarProps {
  id?: string;
  text?: string;
  badge?: string;
  linkUrl?: string | null;
  linkLabel?: string | null;
}

export function AnnouncementBar({
  id,
  text,
  badge,
  linkUrl,
  linkLabel,
}: AnnouncementBarProps) {
  const [isDismissed, setIsDismissed] = useState(true); // Default hidden until hydrated to prevent flash

  const storageKey = `pexpacks_banner_dismissed_${id || text || "active"}`;

  useEffect(() => {
    if (!text) return;
    try {
      const dismissed = sessionStorage.getItem(storageKey);
      if (dismissed === "true") {
        setIsDismissed(true);
        document.documentElement.style.setProperty("--announcement-bar-height", "0px");
      } else {
        setIsDismissed(false);
        document.documentElement.style.setProperty("--announcement-bar-height", "42px");
      }
    } catch {
      setIsDismissed(false);
      document.documentElement.style.setProperty("--announcement-bar-height", "42px");
    }

    return () => {
      document.documentElement.style.setProperty("--announcement-bar-height", "0px");
    };
  }, [storageKey, text]);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    document.documentElement.style.setProperty("--announcement-bar-height", "0px");
    try {
      sessionStorage.setItem(storageKey, "true");
    } catch {
      // Ignore quota or private-browsing errors
    }
  }, [storageKey]);

  if (isDismissed || !text) {
    return null;
  }

  return (
    <aside
      className={styles.bar}
      role="region"
      aria-label="Storefront announcement"
    >
      <div className={styles.inner}>
        <div className={styles.contentWrap}>
          {badge && <span className={styles.badge}>{badge}</span>}
          <span className={styles.message}>{text}</span>
          {linkUrl && (
            <Link href={linkUrl} className={styles.actionLink}>
              <span>{linkLabel || "Find Your School"}</span>
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          )}
        </div>

        <button
          type="button"
          className={styles.closeBtn}
          onClick={handleDismiss}
          aria-label="Dismiss announcement banner"
          title="Dismiss banner"
        >
          <X size={15} aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
