"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SocialProofToasts.module.css";

type SocialProofItem = {
  location: string;
  grade: string;
  school: string;
};

const notifications: SocialProofItem[] = [
  {
    location: "Johannesburg",
    grade: "Grade 3",
    school: "Parktown Primary",
  },
  {
    location: "Sandton",
    grade: "Grade 1",
    school: "Bryanston Primary",
  },
  {
    location: "Randburg",
    grade: "Grade 7",
    school: "Blairgowrie Primary",
  },
  {
    location: "Midrand",
    grade: "Grade R",
    school: "Halfway House Primary",
  },
];

const STORAGE_KEY = "pexpacks:social-proof-muted";

export function SocialProofToasts() {
  const [activeItem, setActiveItem] = useState<SocialProofItem | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    try {
      setIsMuted(sessionStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      setIsMuted(false);
    }
  }, []);

  useEffect(() => {
    if (isMuted) return;

    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    let intervalTimer: ReturnType<typeof setInterval> | undefined;

    const showNext = () => {
      const nextItem = notifications[indexRef.current % notifications.length];
      indexRef.current += 1;
      setActiveItem(nextItem);
      setIsVisible(true);
      hideTimer = setTimeout(() => setIsVisible(false), 6200);
    };

    const startTimer = setTimeout(() => {
      showNext();
      intervalTimer = setInterval(showNext, 32000);
    }, 8500);

    return () => {
      clearTimeout(startTimer);
      if (hideTimer) clearTimeout(hideTimer);
      if (intervalTimer) clearInterval(intervalTimer);
    };
  }, [isMuted]);

  function dismiss() {
    setIsVisible(false);
    setIsMuted(true);

    try {
      sessionStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Ignore storage failures.
    }
  }

  if (!activeItem || isMuted) {
    return null;
  }

  return (
    <div
      className={[styles.toast, isVisible ? styles.toastVisible : ""]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-live="polite"
    >
      <div className={styles.icon} aria-hidden="true">
        <span />
      </div>
      <p>
        A parent from {activeItem.location} just ordered a {activeItem.grade}{" "}
        pack for {activeItem.school}.
      </p>
      <button
        className={styles.dismiss}
        type="button"
        onClick={dismiss}
        aria-label="Hide social proof notifications"
      >
        Close
      </button>
    </div>
  );
}
