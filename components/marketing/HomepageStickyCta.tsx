"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import clsx from "clsx";
import styles from "./HomepageStickyCta.module.css";

type HomepageStickyCtaProps = {
  targetSelector: string;
};

export function HomepageStickyCta({ targetSelector }: HomepageStickyCtaProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const target = document.querySelector(targetSelector);
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.boundingClientRect.y < 0 && !entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-90px 0px 0px 0px" },
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
      observer.disconnect();
    };
  }, [targetSelector]);

  return (
    <div
      className={clsx(styles.stickyBar, isVisible && styles.visible)}
      aria-hidden={!isVisible}
    >
      <div className={styles.inner}>
        <Link
          href="/schools"
          className={styles.primaryButton}
          data-conversion-event="homepage_sticky_find_school"
          tabIndex={isVisible ? 0 : -1}
        >
          Find my school pack
        </Link>
        <Link
          href="/happy-pay"
          className={styles.secondaryButton}
          data-conversion-event="homepage_sticky_split"
          tabIndex={isVisible ? 0 : -1}
        >
          Split in 2
        </Link>
      </div>
    </div>
  );
}
