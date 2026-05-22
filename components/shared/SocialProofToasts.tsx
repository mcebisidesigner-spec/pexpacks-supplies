"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SocialProofToasts.module.css";

type SocialProofItem = {
  location: string;
  grade: string;
  school: string;
};

const notifications: SocialProofItem[] = [
  { location: "Johannesburg", grade: "Grade 3", school: "Parktown Primary" },
  { location: "Sandton", grade: "Grade 1", school: "Bryanston Primary" },
  { location: "Randburg", grade: "Grade 7", school: "Blairgowrie Primary" },
  { location: "Midrand", grade: "Grade R", school: "Halfway House Primary" },
  { location: "Pretoria", grade: "Grade 4", school: "Brooklyn Primary" },
  { location: "Centurion", grade: "Grade 2", school: "Laerskool Doringkloof" },
  { location: "Benoni", grade: "Grade 6", school: "St Patrick's School" },
  { location: "Kempton Park", grade: "Grade 5", school: "Edleen Primary" },
  { location: "Roodepoort", grade: "Grade 8", school: "Hoërskool Roodepoort" },
  { location: "Soweto", grade: "Grade 1", school: "Orlando West Primary" },
  { location: "Alberton", grade: "Grade 3", school: "Alberton Primary" },
  { location: "Fourways", grade: "Grade 9", school: "Fourways High" },
  { location: "Boksburg", grade: "Grade R", school: "Sunward Primary" },
  { location: "Bramley", grade: "Grade 10", school: "Waverley Girls' High" },
  { location: "Bryanston", grade: "Grade 11", school: "Bryanston High" },
];

const STORAGE_KEY = "Pexpacks:social-proof-muted";

export function SocialProofToasts() {
  const [activeItem, setActiveItem] = useState<SocialProofItem | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    try {
      setIsMuted(sessionStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      setIsMuted(false);
    }
  }, []);

  useEffect(() => {
    const footer = document.getElementById("site-footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const footerVisible = entries[0]?.isIntersecting ?? false;
        setIsFooterVisible(footerVisible);
        if (footerVisible) {
          setIsVisible(false);
        }
      },
      { rootMargin: "0px" }
    );

    observer.observe(footer);
    return () => observer.disconnect();
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

  if (!activeItem || isMuted || isFooterVisible) {
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
