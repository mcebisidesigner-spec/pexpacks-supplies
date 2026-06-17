"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./WaitlistBanner.module.css";

const STORAGE_KEY = "pex-waitlist-banner-dismissed";

function isDismissed(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    const dismissedAt = parseInt(stored, 10);
    if (isNaN(dismissedAt)) return false;
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - dismissedAt < sevenDays;
  } catch {
    return false;
  }
}

export function WaitlistBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isDismissed()) {
      setVisible(true);
      document.documentElement.classList.add("has-waitlist-banner");
    }
    return () => {
      document.documentElement.classList.remove("has-waitlist-banner");
    };
  }, []);

  function handleDismiss() {
    setVisible(false);
    document.documentElement.classList.remove("has-waitlist-banner");
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // localStorage unavailable
    }
  }

  if (!visible) return null;

  return (
    <div className={styles.banner} role="status">
      <span>
        2027 orders open September 2026 &mdash;{" "}
        <Link href="/waiting-list">Join the waiting list</Link>
        <span className={styles.discountBadge}>2% off</span>
      </span>
      <button
        className={styles.closeBtn}
        onClick={handleDismiss}
        aria-label="Dismiss waiting list banner"
        type="button"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  );
}
