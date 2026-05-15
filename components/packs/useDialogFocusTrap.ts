"use client";

import { RefObject, useEffect } from "react";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

type UseDialogFocusTrapOptions = {
  isOpen: boolean;
  dialogRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  onClose: () => void;
};

export function useDialogFocusTrap({
  isOpen,
  dialogRef,
  initialFocusRef,
  onClose,
}: UseDialogFocusTrapOptions) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const siteShell = document.querySelector<HTMLElement>(".site-shell");
    const previousAriaHidden = siteShell?.getAttribute("aria-hidden");
    const previousInert = siteShell?.hasAttribute("inert") ?? false;

    document.body.style.overflow = "hidden";
    siteShell?.setAttribute("aria-hidden", "true");
    siteShell?.setAttribute("inert", "");

    window.setTimeout(() => {
      initialFocusRef?.current?.focus();
    }, 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((element) => element.offsetParent !== null);

      if (!focusable.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;

      if (!siteShell) {
        return;
      }

      if (previousAriaHidden === null || previousAriaHidden === undefined) {
        siteShell.removeAttribute("aria-hidden");
      } else {
        siteShell.setAttribute("aria-hidden", previousAriaHidden);
      }

      if (!previousInert) {
        siteShell.removeAttribute("inert");
      }
    };
  }, [dialogRef, initialFocusRef, isOpen, onClose]);
}
