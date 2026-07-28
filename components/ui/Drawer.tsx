"use client";

import { useRef, useCallback } from "react";
import type { ReactNode, RefObject } from "react";
import { useDialogFocusTrap } from "@/components/packs/useDialogFocusTrap";
import styles from "./Drawer.module.css";
import clsx from "clsx";

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleId: string;
  subtitle?: string;
  headerRight?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  closeButtonRef?: RefObject<HTMLButtonElement | null>;
  className?: string;
};

export function Drawer({
  isOpen,
  onClose,
  title,
  titleId,
  subtitle,
  headerRight,
  children,
  footer,
  closeButtonRef: externalCloseRef,
  className = "",
}: DrawerProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const internalCloseRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = externalCloseRef ?? internalCloseRef;

  useDialogFocusTrap({
    isOpen,
    dialogRef,
    initialFocusRef: closeBtnRef,
    onClose,
  });

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} role="presentation" onMouseDown={handleOverlayClick}>
      <div
        className={clsx(styles.dialog, className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={dialogRef}
        tabIndex={-1}
      >
        <div className={styles.header}>
          <div>
            <h2 id={titleId}>{title}</h2>
            {subtitle ? <span className={styles.headerSubtitle}>{subtitle}</span> : null}
          </div>
          <div className={styles.headerRight}>
            {headerRight}
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label={`Close ${title}`}
              ref={closeBtnRef}
            >
              &times;
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {children}
        </div>

        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>
  );
}
