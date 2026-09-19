"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type SearchHelperPillProps = {
  message?: string;
  storageKey: string;
  isInputFocused: boolean;
  inputValue: string;
  autoDismissMs?: number;
  className?: string;
};

const defaultMessage =
  "We currently cater for Gauteng schools. More provinces will be added soon";

const exitAnimationMs = 200;

function getStoredSeenState(storageKey: string) {
  if (typeof window === "undefined") {
    return true;
  }

  try {
    return window.sessionStorage.getItem(storageKey) === "true";
  } catch {
    return false;
  }
}

function setStoredSeenState(storageKey: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(storageKey, "true");
  } catch {
    // If sessionStorage is unavailable, keep the helper non-blocking.
  }
}

export function SearchHelperPill({
  storageKey,
  isInputFocused,
  inputValue,
  message = defaultMessage,
  autoDismissMs = 7000,
  className,
}: SearchHelperPillProps) {
  const [visible, setVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [hasSeen, setHasSeen] = useState(true);
  const autoDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAutoDismissTimer = useCallback(() => {
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = null;
    }
  }, []);

  const clearExitTimer = useCallback(() => {
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  }, []);

  const hideHelper = useCallback(() => {
    clearAutoDismissTimer();
    setIsExiting(true);
    clearExitTimer();

    exitTimerRef.current = setTimeout(() => {
      setVisible(false);
      setIsExiting(false);
    }, exitAnimationMs);
  }, [clearAutoDismissTimer, clearExitTimer]);

  const markSeen = useCallback(() => {
    setStoredSeenState(storageKey);
    setHasSeen(true);
  }, [storageKey]);

  useEffect(() => {
    setHasSeen(getStoredSeenState(storageKey));
  }, [storageKey]);

  useEffect(() => {
    return () => {
      clearAutoDismissTimer();
      clearExitTimer();
    };
  }, [clearAutoDismissTimer, clearExitTimer]);

  useEffect(() => {
    if (inputValue.trim().length > 0) {
      if (visible) {
        hideHelper();
      }
      return;
    }

    if (!isInputFocused || hasSeen || visible) {
      return;
    }

    setVisible(true);
    setIsExiting(false);
    markSeen();
    clearAutoDismissTimer();

    autoDismissTimerRef.current = setTimeout(() => {
      hideHelper();
    }, autoDismissMs);
  }, [
    autoDismissMs,
    clearAutoDismissTimer,
    hasSeen,
    hideHelper,
    inputValue,
    isInputFocused,
    markSeen,
    visible,
  ]);

  function dismiss() {
    markSeen();
    hideHelper();
  }

  if (!visible) {
    return null;
  }

  return (
    <div
      className={cn(
        "w-full max-w-full mt-2.5 p-3 pl-3.5 rounded-[18px] md:w-fit md:max-w-[680px] md:mt-3 md:mx-auto md:p-3 md:pl-4 md:rounded-full border border-pex-navy/10 bg-[#fff8ed] text-pex-navy shadow-[0_10px_24px_rgba(26,42,64,0.08)] flex items-center gap-2.5 text-sm md:text-[0.925rem] font-bold leading-snug animate-in fade-in slide-in-from-top-1 duration-200",
        isExiting && "animate-out fade-out slide-out-to-top-1 duration-200 fill-mode-forwards",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <span
        className="w-5 h-5 shrink-0 text-pex-coral inline-flex items-center justify-center"
        aria-hidden="true"
      >
        <svg viewBox="0 0 20 20" focusable="false" className="w-5 h-5 fill-none stroke-current stroke-[1.8] stroke-linecap-round stroke-linejoin-round">
          <circle cx="10" cy="10" r="8" />
          <path d="M10 9v5" />
          <path d="M10 6h.01" />
        </svg>
      </span>
      <span className="flex-1 min-w-0 break-words">{message}</span>
      <button
        className="w-11 h-11 min-w-[44px] min-h-[44px] md:w-9 md:h-9 md:min-w-[36px] md:min-h-[36px] rounded-full border-0 p-0 bg-transparent text-pex-navy inline-flex items-center justify-center text-lg leading-none cursor-pointer hover:bg-pex-navy/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pex-coral focus-visible:ring-offset-2 transition-colors"
        type="button"
        onClick={dismiss}
        aria-label="Dismiss Gauteng schools notice"
      >
        {"\u00d7"}
      </button>
    </div>
  );
}
