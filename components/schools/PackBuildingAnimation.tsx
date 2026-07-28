"use client";

import { useEffect, useState, type ReactNode } from "react";
import clsx from "clsx";
import styles from "./PackBuildingAnimation.module.css";

type PackBuildingAnimationProps = {
  children: ReactNode;
  schoolName: string;
};

export function PackBuildingAnimation({
  children,
  schoolName,
}: PackBuildingAnimationProps) {
  const [isBuilding, setIsBuilding] = useState(true);

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem("Pexpacks:pack-animation-seen");
      if (seen) {
        setIsBuilding(false);
        return;
      }
    } catch {
      // Ignore storage access errors in private browsing/sandboxed settings
    }

    // Show animation for a snappy 700ms
    const timer = setTimeout(() => {
      setIsBuilding(false);
      try {
        sessionStorage.setItem("Pexpacks:pack-animation-seen", "true");
      } catch {
        // Ignore storage write errors
      }
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isBuilding ? (
        <div className={styles.animationWrapper} aria-live="polite">
          <div className={styles.boxContainer} aria-hidden="true">
            <div className={clsx(styles.item, styles.item1)}></div>
            <div className={clsx(styles.item, styles.item2)}></div>
            <div className={clsx(styles.item, styles.item3)}></div>
            <div className={styles.box}>
              <div className={styles.boxFront}>
                <span className={styles.boxLabel}>Pexpacks</span>
              </div>
            </div>
          </div>
          <h2 className={styles.title}>Building your pack...</h2>
          <p className={styles.subtitle}>Matching items for {schoolName}</p>
        </div>
      ) : null}
      <div className={isBuilding ? styles.contentWhileBuilding : styles.fadeIn}>
        {children}
      </div>
    </>
  );
}
