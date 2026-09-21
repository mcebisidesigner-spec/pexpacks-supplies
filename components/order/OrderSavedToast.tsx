"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePackTrayStore } from "@/store/usePackTrayStore";
import { useHasMounted } from "@/hooks/useHasMounted";

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
    }, 9750);
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
      className={cn(
        "fixed z-[9999] bottom-[86px] right-4 left-4 sm:inset-0 sm:m-auto sm:h-fit sm:w-[380px] sm:max-w-[calc(100vw-3rem)] p-[14px_18px] rounded-2xl bg-pex-navy text-white shadow-[0_16px_40px_rgba(26,42,64,0.25)] flex items-center gap-3 motion-reduce:animate-none",
        closing
          ? "[animation:toastSlideDown_0.25s_ease-in_forwards]"
          : "[animation:toastSlideUp_0.35s_cubic-bezier(0.16,1,0.3,1)_forwards]"
      )}
      role="status"
      aria-live="polite"
    >
      <button
        type="button"
        className="shrink-0 w-8 h-8 rounded-full bg-white/15 text-pex-keppel grid place-items-center cursor-pointer border-0 p-0 transition-opacity hover:opacity-90"
        onClick={handleOpenTray}
        aria-label="Open your order"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 stroke-[2.5]">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      </button>
      <div className="flex-1 min-w-0">
        <p className="m-0 text-sm font-bold leading-snug text-white">
          {packs.length === 1
            ? "Pack saved to your order."
            : `${packs.length} packs saved to your order.`}
        </p>
        <small className="block mt-[3px] text-xs opacity-80 leading-snug text-white">Open the bag icon anytime.</small>
      </div>
      <button
        type="button"
        className="shrink-0 w-7 h-7 border-0 rounded-full bg-white/10 text-white text-sm cursor-pointer grid place-items-center transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white/50 focus-visible:outline-offset-2 p-0 leading-none"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
      >
        &times;
      </button>
    </div>
  );
}
