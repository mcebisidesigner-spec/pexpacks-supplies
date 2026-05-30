"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { CompleteListTable } from "./CompleteListTable";
import type { CompleteListPack } from "./packListTypes";
import styles from "./CompleteListModal.module.css";

type CompleteListModalProps = {
  pack: CompleteListPack | null;
  onClose: () => void;
  onAddToOrder?: () => void;
};

function safeId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

export function CompleteListModal({ pack, onClose, onAddToOrder }: CompleteListModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const closeModal = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleCustomise = useCallback(() => {
    if (!pack?.customiseTargetId) return;
    const targetId = pack.customiseTargetId;
    closeModal();
    window.setTimeout(() => {
      const trigger = document.getElementById(targetId) as HTMLButtonElement | null;
      trigger?.click();
    }, 0);
  }, [closeModal, pack]);

  const isOpen = Boolean(pack);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
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
    [closeModal]
  );

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        closeModal();
      }
    },
    [closeModal]
  );

  if (!pack) return null;

  const idBase = safeId(pack.id);
  const titleId = `${idBase}-complete-list-title`;

  return (
    <div className={styles.overlay} role="presentation" onMouseDown={handleOverlayClick}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={dialogRef}
        tabIndex={-1}
      >
        <div className={styles.header}>
          <div>
            <h2 id={titleId}>{pack.modalTitle}</h2>
            <span className={styles.headerSubtitle}>{pack.gradeLabel} stationery list</span>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={closeModal}
            aria-label={`Close ${pack.gradeLabel} stationery list`}
            ref={closeButtonRef}
          >
            &times;
          </button>
        </div>

        <div className={styles.content}>
          <CompleteListTable
            items={pack.items}
            label={`${pack.gradeLabel} complete stationery list`}
          />
        </div>

        <div className={styles.footer}>
          <p className={styles.price}>{pack.priceLabel}</p>

          {onAddToOrder ? (
            <button
              type="button"
              className={styles.addToOrderButton}
              onClick={onAddToOrder}
            >
              Add to Order
            </button>
          ) : pack.fullPackHref ? (
            <Link href={pack.fullPackHref} className={styles.addToOrderButton}>
              Add to Order
            </Link>
          ) : (
            <button type="button" className={styles.addToOrderButton} disabled>
              Add to Order
            </button>
          )}

          {pack.customiseTargetId ? (
            <button
              type="button"
              className={styles.customiseButton}
              onClick={handleCustomise}
            >
              Customise This Pack
            </button>
          ) : (
            <button type="button" className={styles.customiseButton} disabled>
              Customise This Pack
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
