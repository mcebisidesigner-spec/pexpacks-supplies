"use client";

import { useState, useEffect } from "react";
import styles from "./CountdownTimer.module.css";

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

export function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [time, setTime] = useState(() => getTimeUntil(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(getTimeUntil(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <span className={styles.countdown}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span className={styles.label}>Order in</span>
      <span className={styles.block}>
        <span className={styles.num}>{pad(time.days)}</span>
        <span className={styles.unit}>d</span>
      </span>
      <span className={styles.sep}>:</span>
      <span className={styles.block}>
        <span className={styles.num}>{pad(time.hours)}</span>
        <span className={styles.unit}>h</span>
      </span>
      <span className={styles.sep}>:</span>
      <span className={styles.block}>
        <span className={styles.num}>{pad(time.minutes)}</span>
        <span className={styles.unit}>m</span>
      </span>
      <span className={styles.sep}>:</span>
      <span className={styles.block}>
        <span className={styles.num}>{pad(time.seconds)}</span>
        <span className={styles.unit}>s</span>
      </span>
      <span className={styles.suffix}>for delivery before school starts in 2027</span>
    </span>
  );
}
