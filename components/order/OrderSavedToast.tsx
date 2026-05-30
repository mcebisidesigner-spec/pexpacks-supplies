"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePackTrayStore } from "@/store/usePackTrayStore";
import { useHasMounted } from "@/hooks/useHasMounted";
import styles from "./OrderSavedToast.module.css";

export function OrderSavedToast() {
  const hasMounted = useHasMounted();
  const showSavedToast = usePackTrayStore((s) => s.showSavedToast);
  const dismissSavedToast = usePackTrayStore((s) => s.dismissSavedToast);
  const openTray = usePackTrayStore((s) => s.openTray);
  const packs = usePackTrayStore((s) => s.packs);
  const isTrayOpen = usePackTrayStore((s) => s.isTrayOpen);
  const [closing, setClosing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isVisibleRef = useRef(false);

  const startDismissTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setClosing(true);
      setTimeout(() => {
        dismissSavedToast();
        setClosing(false);
      }, 250);
    }, 4500);
  }, [dismissSavedToast]);

  useEffect(() => {
    if (showSavedToast && !isTrayOpen) {
      isVisibleRef.current = true;
      startDismissTimer();
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (isVisibleRef.current) {
        setClosing(true);
        setTimeout(() => {
          dismissSavedToast();
          setClosing(false);
          isVisibleRef.current = false;
        }, 250);
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [showSavedToast, isTrayOpen, startDismissTimer, dismissSavedToast]);

  const handleDismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setClosing(true);
    setTimeout(() => {
      dismissSavedToast();
      setClosing(false);
    }, 250);
  }, [dismissSavedToast]);

  const handleOpenTray = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    dismissSavedToast();
    openTray();
  }, [dismissSavedToast, openTray]);

  if (!hasMounted || !showSavedToast || isTrayOpen) return null;

  return (
    <div
      className={`${styles.toast} ${closing ? styles.toastClosing : ""}`}
      role="status"
      aria-live="polite"
    >
      <button
        type="button"
        className={styles.toastIcon}
        onClick={handleOpenTray}
        aria-label="Open your order"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      </button>
      <div className={styles.toastContent}>
        <p>
          {packs.length === 1
            ? "Pack saved to your order."
            : `${packs.length} packs saved to your order.`}
        </p>
        <small>Open the bag icon anytime.</small>
      </div>
      <button
        type="button"
        className={styles.toastClose}
        onClick={handleDismiss}
        aria-label="Dismiss notification"
      >
        &times;
      </button>
    </div>
  );
}
