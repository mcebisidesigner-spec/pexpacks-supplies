"use client";

import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import styles from "./WarningBannerModal.module.css";

export interface WarningBannerModalProps {
  isOpen: boolean;
  schoolName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function WarningBannerModal({
  isOpen,
  schoolName = "This school",
  onConfirm,
  onCancel,
}: WarningBannerModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="warning-modal-title"
      aria-describedby="warning-modal-description"
      onClick={onCancel}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.brandRow}>
          <span>
            <strong>Pexpacks</strong> Partnership Notice
          </span>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onCancel}
            aria-label="Close warning"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.headerRow}>
          <div className={styles.iconWrapperWarning}>
            <AlertTriangle size={24} />
          </div>
          <div className={styles.titleBlock}>
            <h2 id="warning-modal-title" className={styles.title}>
              Refused Partnership Mode
            </h2>
            <p id="warning-modal-description" className={styles.description}>
              You are setting <strong>{schoolName}</strong> to &ldquo;Refused Partnership&rdquo;.
            </p>
          </div>
        </div>

        <div className={styles.detailsList}>
          <div className={styles.detailItem}>
            <span className={styles.detailBullet}>•</span>
            <span>
              <strong>Public Web Page:</strong> The public storefront will switch to display the dedicated <strong>&ldquo;Not yet an official partner&rdquo;</strong> layout with stationery list upload and WhatsApp actions. Grade pack cards will not be shown.
            </span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailBullet}>•</span>
            <span>
              <strong>Search Discovery:</strong> This school <strong>remains fully discoverable</strong> in the search discovery tray/drawer for parents looking up this school.
            </span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailBullet}>•</span>
            <span>
              <strong>Reversible:</strong> You can switch back to &ldquo;Partner&rdquo; or &ldquo;Non-partner&rdquo; at any time to re-enable pack cards.
            </span>
          </div>
        </div>

        <div className={styles.buttonRow}>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            Revert to Non-partner
          </button>
          <button
            type="button"
            className={styles.confirmBtn}
            onClick={onConfirm}
            autoFocus
          >
            Got it, Keep Refused Partnership
          </button>
        </div>
      </div>
    </div>
  );
}
