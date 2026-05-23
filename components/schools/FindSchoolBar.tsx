"use client";

import { useEffect, useState } from "react";
import styles from "./FindSchoolBar.module.css";

export function FindSchoolBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const gradeSection = document.querySelector("#school-grade-packs");
    if (!gradeSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.boundingClientRect.top < 0 && !entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(gradeSection);
    return () => observer.disconnect();
  }, []);

  function handleClick() {
    const searchInput = document.querySelector<HTMLInputElement>("#schoolQuery");
    if (searchInput) {
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  return (
    <div
      className={`${styles.bar} ${visible ? styles.visible : ""}`}
      aria-hidden={!visible}
    >
      <button className={styles.form} onClick={handleClick} type="button">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={styles.icon}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <span className={styles.label}>Find your school pack...</span>
        <span className={styles.btn}>Search</span>
      </button>
    </div>
  );
}
