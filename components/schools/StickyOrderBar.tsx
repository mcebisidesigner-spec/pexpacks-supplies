"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import styles from "./StickyOrderBar.module.css";

type StickyOrderBarProps = {
  schoolName: string;
  gradeLabel: string;
  priceLabel: string;
  targetSelector: string;
};

export function StickyOrderBar({
  schoolName,
  gradeLabel,
  priceLabel,
  targetSelector,
}: StickyOrderBarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const target = document.querySelector(targetSelector);
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show the sticky bar when the target (e.g. actions panel) scrolls out of view above the viewport
        setIsVisible(entry.boundingClientRect.y < 0 && !entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-100px 0px 0px 0px" } // trigger slightly after it passes
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
      observer.disconnect();
    };
  }, [targetSelector]);

  const scrollToTarget = () => {
    const target = document.querySelector(targetSelector);
    if (target) {
      const offset = 80; // approximate header height
      const targetPos = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: targetPos - offset,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      className={clsx(styles.stickyBar, isVisible && styles.visible)}
      aria-hidden={!isVisible}
    >
      <div className={styles.inner}>
        <div className={styles.content}>
          <p className={styles.title}>
            {schoolName} &mdash; {gradeLabel} Pack
          </p>
          <p className={styles.price}>From {priceLabel}</p>
        </div>
        <button
          type="button"
          className={styles.orderButton}
          onClick={scrollToTarget}
          tabIndex={isVisible ? 0 : -1}
        >
          Order Now
        </button>
      </div>
    </div>
  );
}
