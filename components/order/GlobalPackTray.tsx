"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { usePackTrayStore } from "@/store/usePackTrayStore";
import { HeroSearch } from "@/components/marketing/HeroSearch";
import { PackTrayItem } from "./PackTrayItem";
import { PackTrayFooter } from "./PackTrayFooter";
import styles from "./GlobalPackTray.module.css";

export function GlobalPackTray() {
  const packs = usePackTrayStore((s) => s.packs);
  const isOpen = usePackTrayStore((s) => s.isTrayOpen);
  const closeTray = useCallback(() => usePackTrayStore.getState().closeTray(), []);

  const trayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeTray();
        return;
      }

      if (e.key === "Tab" && trayRef.current) {
        const focusable = trayRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [closeTray]
  );

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";

      requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });
    } else {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";

      requestAnimationFrame(() => {
        previousFocusRef.current?.focus();
      });
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        closeTray();
      }
    },
    [closeTray]
  );

  if (!isOpen) return null;

  const hasPacks = packs.length > 0;

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={handleOverlayClick}
    >
      <div
        className={styles.tray}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pack-tray-title"
        ref={trayRef}
        tabIndex={-1}
      >
        <div className={styles.header}>
          <div>
            <h2 id="pack-tray-title">Your Order</h2>
            <span className={styles.headerSubtitle}>
              Packs saved for checkout
            </span>
          </div>
          <div className={styles.headerRight}>
            {hasPacks ? (
              <span
                className={styles.packCountBadge}
                aria-label={`${packs.length} pack${packs.length === 1 ? "" : "s"} saved`}
              >
                {packs.length}
              </span>
            ) : null}
            <button
              type="button"
              className={styles.closeButton}
              onClick={closeTray}
              aria-label="Close your order"
              ref={closeButtonRef}
            >
              &times;
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {hasPacks ? (
            packs.map((pack, index) => (
              <div
                key={pack.id}
                className={index === packs.length - 1 ? styles.packCardAdded : ""}
              >
                <PackTrayItem pack={pack} />
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <p>No packs saved yet. Choose a school pack and add it to your order.</p>
              <div className={styles.emptySearchContainer}>
                <h3 className={styles.emptySearchTitle}>Find Your School Pack</h3>
                <HeroSearch onResultClick={closeTray} />
              </div>
            </div>
          )}
        </div>

        <PackTrayFooter />
      </div>
    </div>
  );
}
