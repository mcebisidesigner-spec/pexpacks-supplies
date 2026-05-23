"use client";

import { useEffect, useState } from "react";
import {
  SIBLING_SELECTION_COUNT_KEY,
  SIBLING_SELECTION_EVENT,
} from "./SiblingQuickAdd";
import styles from "./MultiLearnerBanner.module.css";

export function MultiLearnerBanner() {
  const [selectedCount, setSelectedCount] = useState(0);

  useEffect(() => {
    function loadSelectionCount() {
      try {
        const stored = Number(
          sessionStorage.getItem(SIBLING_SELECTION_COUNT_KEY) || "0",
        );
        setSelectedCount(Number.isFinite(stored) ? stored : 0);
      } catch {
        setSelectedCount(0);
      }
    }

    loadSelectionCount();
    window.addEventListener(SIBLING_SELECTION_EVENT, loadSelectionCount);
    window.addEventListener("storage", loadSelectionCount);

    return () => {
      window.removeEventListener(SIBLING_SELECTION_EVENT, loadSelectionCount);
      window.removeEventListener("storage", loadSelectionCount);
    };
  }, []);

  const discountActive = selectedCount >= 2;

  return (
    <div
      className={`${styles.multiLearnerBanner} ${
        discountActive ? styles.discountActive : ""
      }`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
      <div>
        <strong>
          {discountActive
            ? "Sibling discount active: 5% off applied."
            : "Ordering for more than one child?"}
        </strong>
        <span>
          {" "}
          {discountActive
            ? `${selectedCount} packs selected from this school.`
            : "Get 5% off when you order 2 or more packs from the same school."}
        </span>
      </div>
    </div>
  );
}
