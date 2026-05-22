"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./SchoolSearchWidget.module.css";

type SchoolSearchWidgetProps = {
  compact?: boolean;
  titleText?: string;
  bodyText?: string;
};

export function SchoolSearchWidget({
  compact = false,
  titleText = "Gauteng school pack finder",
  bodyText = "Skip the retail store hopping. Search for your school to find and order their official pre-packed grade lists.",
}: SchoolSearchWidgetProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Redirect parents directly to the search panel on `/schools`
    router.push(`/schools?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <article className={`${styles.widgetCard} ${compact ? styles.compactWidget : ""}`}>
      <span className={styles.eyebrow}>Skip the queue</span>
      <h3 className={styles.title}>{titleText}</h3>
      <p className={styles.text}>{bodyText}</p>
      
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <div className={styles.inputGroup}>
          <label htmlFor="widgetSchoolQuery" className={styles.inputLabel}>
            Enter school name
          </label>
          <input
            id="widgetSchoolQuery"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Parktown Primary"
            className={styles.inputField}
            required
            autoComplete="off"
          />
        </div>
        <button type="submit" className={styles.searchButton}>
          <svg
            className={styles.searchIcon}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          Search Pack
        </button>
      </form>

      {!compact && (
        <>
          <div className={styles.divider} role="separator" />
          <ul className={styles.featuresList}>
            <li className={styles.featureItem}>
              <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>100% correct items packed per grade list</span>
            </li>
            <li className={styles.featureItem}>
              <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Teacher-preferred brands only</span>
            </li>
            <li className={styles.featureItem}>
              <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Custom school development fund rebates</span>
            </li>
          </ul>
        </>
      )}
    </article>
  );
}
