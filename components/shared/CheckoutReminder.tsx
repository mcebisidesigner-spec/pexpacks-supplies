"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadCheckoutState, clearCheckoutState } from "@/lib/order/checkoutPersistence";
import styles from "./CheckoutReminder.module.css";

export function CheckoutReminder() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = loadCheckoutState();
    if (saved) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <aside className={styles.banner} role="status" aria-label="Incomplete checkout reminder">
      <div className={styles.inner}>
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
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <p>
          <strong>You have an incomplete order.</strong> Finish your checkout.
        </p>
        <Link href="/order#checkout-form" className={styles.link}>
          Resume order
        </Link>
        <button
          type="button"
          className={styles.dismiss}
          onClick={() => {
            clearCheckoutState();
            setVisible(false);
          }}
          aria-label="Dismiss reminder"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
