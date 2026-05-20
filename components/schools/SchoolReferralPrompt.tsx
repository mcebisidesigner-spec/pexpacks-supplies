"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { School } from "@/data/schools";
import { ViralReferralBanner } from "./ViralReferralBanner";
import styles from "./SchoolReferralPrompt.module.css";

type SchoolReferralPromptProps = {
  school: School;
};

const POPUP_DELAY_MS = 5000;

export function SchoolReferralPrompt({ school }: SchoolReferralPromptProps) {
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const [hasReachedBanner, setHasReachedBanner] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupDismissed, setIsPopupDismissed] = useState(false);
  const shouldPrompt = school.grades.length > 0;

  const closePopup = useCallback(() => {
    setIsPopupOpen(false);
    setIsPopupDismissed(true);
  }, []);

  useEffect(() => {
    if (!shouldPrompt) {
      return;
    }

    const banner = bannerRef.current;

    if (!banner) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasReachedBanner(true);
          setIsPopupOpen(false);
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(banner);

    return () => {
      observer.disconnect();
    };
  }, [shouldPrompt]);

  useEffect(() => {
    if (
      !shouldPrompt ||
      hasReachedBanner ||
      isPopupDismissed ||
      isPopupOpen
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsPopupOpen(true);
    }, POPUP_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    hasReachedBanner,
    isPopupDismissed,
    isPopupOpen,
    shouldPrompt,
  ]);

  return (
    <>
      <div ref={bannerRef} className={styles.inlineBanner}>
        <ViralReferralBanner />
      </div>

      {isPopupOpen ? (
        <div className={styles.popupLayer} aria-live="polite">
          <ViralReferralBanner
            compact
            className={styles.popupBanner}
            headingId="school-referral-popup-heading"
            onClose={closePopup}
          />
        </div>
      ) : null}
    </>
  );
}
