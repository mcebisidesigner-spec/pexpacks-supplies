"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CompleteListTable } from "./CompleteListTable";
import type { CompleteListPack } from "./packListTypes";
import { useDialogFocusTrap } from "./useDialogFocusTrap";
import styles from "./CompleteListModal.module.css";

type CompleteListModalProps = {
  pack: CompleteListPack | null;
  onClose: () => void;
};

function safeId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

export function CompleteListModal({ pack, onClose }: CompleteListModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const closeModal = useCallback(() => {
    onClose();
  }, [onClose]);

  useDialogFocusTrap({
    isOpen: isMounted && Boolean(pack),
    dialogRef,
    initialFocusRef: closeButtonRef,
    onClose: closeModal,
  });

  if (!isMounted || !pack) {
    return null;
  }

  const idBase = safeId(pack.id);
  const titleId = `${idBase}-complete-list-title`;
  const descriptionId = `${idBase}-complete-list-description`;

  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        ref={dialogRef}
        tabIndex={-1}
      >
        <div className={styles.header}>
          <div className={styles.titlePill}>
            <h2 id={titleId}>{pack.modalTitle}</h2>
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
        </div>

        <div className={styles.content}>
          <div className={styles.intro}>
            <p>{pack.contentHeading ?? "Official school stationery list"}</p>
            <span id={descriptionId}>{pack.description}</span>
          </div>
          <CompleteListTable
            items={pack.items}
            label={`${pack.gradeLabel} complete stationery list`}
          />
        </div>

        <div className={styles.footer}>
          <p className={styles.microcopy}>
            Need everything? Buy the full pack. Already have some items?
            Customise it.
          </p>
          <p className={styles.price}>{pack.priceLabel}</p>
          {pack.footerActions ? (
            <div className={styles.footerActions}>{pack.footerActions}</div>
          ) : null}
        </div>
      </section>
    </div>,
    document.body
  );
}
