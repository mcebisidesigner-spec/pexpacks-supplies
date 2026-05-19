"use client";

import { useEffect, useState, type ReactNode } from "react";
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
    // Show animation for 1.5s
    const timer = setTimeout(() => {
      setIsBuilding(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isBuilding) {
    return (
      <div className={styles.animationWrapper} aria-live="polite">
        <div className={styles.boxContainer} aria-hidden="true">
          <div className={`${styles.item} ${styles.item1}`}></div>
          <div className={`${styles.item} ${styles.item2}`}></div>
          <div className={`${styles.item} ${styles.item3}`}></div>
          <div className={styles.box}>
            <div className={styles.boxFront}>
              <span className={styles.boxLabel}>PEXPACKS</span>
            </div>
          </div>
        </div>
        <h2 className={styles.title}>Building your pack...</h2>
        <p className={styles.subtitle}>Matching items for {schoolName}</p>
      </div>
    );
  }

  return <div className={styles.fadeIn}>{children}</div>;
}
