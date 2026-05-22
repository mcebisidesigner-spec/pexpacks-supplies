"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./ReturningParentBanner.module.css";

export const STORAGE_KEY = "pexpacks:recent-school-visits";
export const RECENT_SCHOOL_VISITS_EVENT = "pexpacks:recent-school-visits-updated";

export type LastVisit = {
  schoolName: string;
  schoolSlug: string;
  grade: string;
  gradeSlug: string;
  timestamp: number;
};

/**
 * Save the user's current school/grade visit for the "Continue where you left off" feature.
 * Stores up to 3 recent unique schools.
 */
export function saveSchoolVisit(data: Omit<LastVisit, "timestamp">) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let history: LastVisit[] = [];
    if (raw) {
      // Handle legacy single-object format or new array format
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        history = parsed;
      } else if (parsed && typeof parsed === "object") {
        history = [parsed];
      }
    }

    const entry: LastVisit = { ...data, timestamp: Date.now() };
    
    // Remove previous entries for the same school to avoid duplicates
    history = history.filter(v => v.schoolSlug !== entry.schoolSlug);
    
    // Add to front and keep only top 3
    history.unshift(entry);
    if (history.length > 3) {
      history = history.slice(0, 3);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    window.dispatchEvent(new Event(RECENT_SCHOOL_VISITS_EVENT));
  } catch {
    // localStorage may be unavailable
  }
}

/**
 * Banner shown to returning parents who have previously visited a school page.
 * Provides a one-click link back to their most recent school/grade.
 */
export function ReturningParentBanner() {
  const [lastVisit, setLastVisit] = useState<LastVisit | null>(null);

  useEffect(() => {
    function loadLastVisit() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          setLastVisit(null);
          return;
        }

        const parsed = JSON.parse(raw);
        const visits: LastVisit[] = Array.isArray(parsed) ? parsed : [parsed];
        const mostRecent = visits[0];

        if (
          mostRecent &&
          Date.now() - mostRecent.timestamp < 30 * 24 * 60 * 60 * 1000
        ) {
          setLastVisit(mostRecent);
        } else {
          setLastVisit(null);
        }
      } catch {
        setLastVisit(null);
      }
    }

    loadLastVisit();
    window.addEventListener("storage", loadLastVisit);
    window.addEventListener(RECENT_SCHOOL_VISITS_EVENT, loadLastVisit);

    return () => {
      window.removeEventListener("storage", loadLastVisit);
      window.removeEventListener(RECENT_SCHOOL_VISITS_EVENT, loadLastVisit);
    };
  }, []);

  if (!lastVisit) return null;

  return (
    <div className={styles.returningBanner}>
      <div className={styles.returningBannerInner}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
        <p>
          <strong>Welcome back!</strong> Continue with{" "}
          <Link href={`/schools/${lastVisit.schoolSlug}/${lastVisit.gradeSlug}`}>
            {lastVisit.schoolName} — {lastVisit.grade}
          </Link>
        </p>
        <button
          type="button"
          className={styles.returningDismiss}
          onClick={() => setLastVisit(null)}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
