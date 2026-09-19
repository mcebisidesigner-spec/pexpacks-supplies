"use client";

import { useRef, useCallback } from "react";
import type { ReactNode, RefObject } from "react";
import { useDialogFocusTrap } from "@/components/packs/useDialogFocusTrap";
import { cn } from "@/lib/utils";

export type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleId: string;
  subtitle?: ReactNode;
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
    <div
      className="fixed inset-0 z-[900] bg-[rgba(15,37,55,0.52)] flex justify-end overflow-hidden animate-in fade-in duration-200"
      role="presentation"
      onMouseDown={handleOverlayClick}
    >
      <div
        className={cn(
          "w-full sm:w-[min(480px,100%)] h-screen h-[100dvh] overflow-y-auto bg-white shadow-drawer flex flex-col animate-in slide-in-from-right duration-300 text-left",
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={dialogRef}
        tabIndex={-1}
      >
        <div className="sticky top-0 z-10 p-4 sm:p-6 border-b border-pex-border bg-white/95 backdrop-blur-md grid grid-cols-[1fr_auto] gap-4 items-start pt-[max(1rem,env(safe-area-inset-top))] sm:pt-6">
          <div>
            <h2
              id={titleId}
              className="m-0 text-pex-navy font-heading text-2xl sm:text-3xl font-extrabold leading-none"
            >
              {title}
            </h2>
            {subtitle ? (
              <span className="block mt-1.5 text-pex-keppel text-sm font-bold">
                {subtitle}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2.5">
            {headerRight}
            <button
              type="button"
              className="w-11 h-11 rounded-full border border-pex-border bg-white text-pex-navy text-2xl grid place-items-center cursor-pointer transition-colors duration-150 hover:border-pex-keppel hover:text-pex-keppel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pex-keppel focus-visible:ring-offset-2"
              onClick={onClose}
              aria-label={`Close ${title}`}
              ref={closeBtnRef}
            >
              &times;
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-6 grid gap-3.5 content-start">
          {children}
        </div>

        {footer ? (
          <div className="sticky bottom-0 z-10 mt-auto p-4 sm:p-6 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] border-t border-pex-border bg-white/95 backdrop-blur-md shadow-[0_-16px_34px_rgba(15,37,55,0.08)] grid gap-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
