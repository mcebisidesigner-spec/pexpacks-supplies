"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./SearchHelperPill.module.css";

type SearchHelperPillProps = {
  message?: string;
  storageKey: string;
  isInputFocused: boolean;
  inputValue: string;
  autoDismissMs?: number;
  className?: string;
};

const defaultMessage =
  "We currently cater for Gauteng schools. Find your school by name.";

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
  autoDismissMs = 5000,
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

  const hideHelper = useCallback(
    (immediate = false) => {
      clearAutoDismissTimer();
      clearExitTimer();

      if (immediate) {
        setIsExiting(false);
        setVisible(false);
        return;
      }

      setIsExiting(true);
      exitTimerRef.current = setTimeout(() => {
        setVisible(false);
        setIsExiting(false);
        exitTimerRef.current = null;
      }, exitAnimationMs);
    },
    [clearAutoDismissTimer, clearExitTimer]
  );

  const markSeen = useCallback(() => {
    setStoredSeenState(storageKey);
    setHasSeen(true);
  }, [storageKey]);

  useEffect(() => {
    setHasSeen(getStoredSeenState(storageKey));
    setVisible(false);
    setIsExiting(false);
    clearAutoDismissTimer();
    clearExitTimer();
  }, [clearAutoDismissTimer, clearExitTimer, storageKey]);

  useEffect(() => {
    return () => {
      clearAutoDismissTimer();
      clearExitTimer();
    };
  }, [clearAutoDismissTimer, clearExitTimer]);

  useEffect(() => {
    const hasValue = inputValue.trim().length > 0;

    if (hasValue) {
      hideHelper(true);
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

  const helperClassName = [
    styles.helper,
    isExiting ? styles.helperExiting : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={helperClassName} role="status" aria-live="polite">
      <span className={styles.icon} aria-hidden="true">
        <svg viewBox="0 0 20 20" focusable="false">
          <circle cx="10" cy="10" r="8" />
          <path d="M10 9v5" />
          <path d="M10 6h.01" />
        </svg>
      </span>
      <span className={styles.message}>{message}</span>
      <button
        className={styles.closeButton}
        type="button"
        onClick={dismiss}
        aria-label="Dismiss Gauteng schools notice"
      >
        {"\u00d7"}
      </button>
    </div>
  );
}
