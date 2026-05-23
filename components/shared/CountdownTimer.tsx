"use client";

import { useState, useEffect } from "react";
import styles from "./CountdownTimer.module.css";

const deadlineLabel = "30 September 2026";

function getTimeUntil(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

const timeParts = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
] as const;

export function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [time, setTime] = useState(() => getTimeUntil(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(getTimeUntil(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <span
      className={styles.countdown}
      aria-label={`Order deadline countdown to ${deadlineLabel}`}
    >
      <span className={styles.header}>
        <span className={styles.iconWrap} aria-hidden="true">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </span>
        <span className={styles.copy}>
          <span className={styles.label}>Order deadline</span>
          <span className={styles.deadline}>{deadlineLabel}</span>
        </span>
      </span>

      <span className={styles.blocks} aria-hidden="true">
        {timeParts.map((part) => (
          <span className={styles.block} key={part.key}>
            <span className={styles.num}>{pad(time[part.key])}</span>
            <span className={styles.unit}>{part.label}</span>
          </span>
        ))}
      </span>

      <span className={styles.suffix}>
        Secure your school pack before the cut-off.
      </span>
    </span>
  );
}
