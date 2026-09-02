"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const barRef = useRef<HTMLElement | null>(null);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  const storageKey = `pexpacks_banner_dismissed_${id || text || "active"}`;

  const setCssHeight = useCallback((heightPx: number) => {
    document.documentElement.style.setProperty(
      "--announcement-bar-height",
      `${heightPx}px`
    );
  }, []);

  useEffect(() => {
    if (!text) return;

    try {
      const dismissed = sessionStorage.getItem(storageKey);
      if (dismissed === "true") {
        setIsDismissed(true);
        setCssHeight(0);
        return;
      }
    } catch {
      // Ignore sessionStorage access errors
    }

    setIsDismissed(false);
    setIsExiting(false);

    const measureAndSetHeight = () => {
      if (barRef.current) {
        const height = barRef.current.offsetHeight;
        setCssHeight(height > 0 ? height : 44);
      } else {
        setCssHeight(44);
      }
    };

    // Defer measurement until paint
    const rafId = requestAnimationFrame(measureAndSetHeight);
    window.addEventListener("resize", measureAndSetHeight, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", measureAndSetHeight);
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
      setCssHeight(0);
    };
  }, [storageKey, text, setCssHeight]);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setCssHeight(0);

    try {
      sessionStorage.setItem(storageKey, "true");
    } catch {
      // Ignore quota or private-browsing errors
    }

    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }

    dismissTimerRef.current = setTimeout(() => {
      setIsDismissed(true);
    }, 240);
  }, [storageKey, setCssHeight]);

  if (!text) {
    return null;
  }

  const isExternalLink =
    Boolean(linkUrl) &&
    (linkUrl!.startsWith("http://") || linkUrl!.startsWith("https://"));

  return (
    <aside
      ref={barRef}
      className={[
        styles.bar,
        isDismissed ? styles.barDismissed : "",
        isExiting ? styles.barExiting : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="region"
      aria-label="Storefront announcement"
      aria-hidden={isDismissed}
    >
      {/* Luminous multi-stop accent light at the bottom edge */}
      <div className={styles.accentLine} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.contentWrap}>
          {Boolean(badge) ? (
            <span className={styles.badge}>
              <span className={styles.pulseContainer} aria-hidden="true">
                <span className={styles.pulseRing} />
                <span className={styles.pulseCore} />
              </span>
              <span className={styles.badgeText}>{badge}</span>
            </span>
          ) : null}

          <span className={styles.message}>{text}</span>

          {Boolean(linkUrl) ? (
            isExternalLink ? (
              <a
                href={linkUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.actionLink}
              >
                <span>{linkLabel || "Learn more"}</span>
                <ArrowRight size={12} className={styles.arrowIcon} aria-hidden="true" />
              </a>
            ) : (
              <Link href={linkUrl!} className={styles.actionLink}>
                <span>{linkLabel || "Learn more"}</span>
                <ArrowRight size={12} className={styles.arrowIcon} aria-hidden="true" />
              </Link>
            )
          ) : null}
        </div>

        <button
          type="button"
          className={styles.closeBtn}
          onClick={handleDismiss}
          aria-label="Dismiss announcement banner"
          title="Dismiss banner"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
