"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Schools.module.css";

const STORAGE_KEY = "pexpacks:last-school-visit";

type LastVisit = {
  schoolName: string;
  schoolSlug: string;
  grade: string;
  gradeSlug: string;
  timestamp: number;
};

/**
 * Save the user's current school/grade visit for the "Continue where you left off" feature.
 */
export function saveSchoolVisit(data: Omit<LastVisit, "timestamp">) {
  try {
    const entry: LastVisit = { ...data, timestamp: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // localStorage may be unavailable
  }
}

/**
 * Banner shown to returning parents who have previously visited a school page.
 * Provides a one-click link back to their last school/grade.
 */
export function ReturningParentBanner() {
  const [lastVisit, setLastVisit] = useState<LastVisit | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed: LastVisit = JSON.parse(raw);
      // Only show if visit was within the last 30 days
      if (Date.now() - parsed.timestamp < 30 * 24 * 60 * 60 * 1000) {
        setLastVisit(parsed);
      }
    } catch {
      // ignore
    }
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
