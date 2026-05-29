"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./SchoolSearchWidget.module.css";

type SchoolSearchResult = {
  id: string;
  name: string;
  slug: string;
  city: string;
  province: string;
};

type SchoolSearchWidgetProps = {
  compact?: boolean;
  titleText?: string;
  bodyText?: string;
  headingLevel?: "h2" | "h3";
};

export function SchoolSearchWidget({
  compact = false,
  titleText = "Gauteng school pack finder",
  bodyText = "Skip the retail store hopping. Search for your school to find and order their official pre-packed grade lists.",
  headingLevel = "h3",
}: SchoolSearchWidgetProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SchoolSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({ q: query.trim(), limit: "10" });
        const response = await fetch(
          `/api/schools/search?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) throw new Error("Search failed");

        const data = (await response.json()) as {
          success: true;
          results: SchoolSearchResult[];
        };
        setResults(data.results);
        setOpen(true);
      } catch {
        if (!controller.signal.aborted) {
          setResults([]);
          setError("Could not search schools.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/schools?q=${encodeURIComponent(query.trim())}`);
  }

  function selectSchool(result: SchoolSearchResult) {
    setOpen(false);
    router.push(`/schools/${result.slug}`);
  }

  return (
    <article
      className={`${styles.widgetCard} ${compact ? styles.compactWidget : ""}`}
    >
      <span className={styles.eyebrow}>Skip the queue</span>
      {headingLevel === "h2" ? (
        <h2 className={styles.title}>{titleText}</h2>
      ) : (
        <h3 className={styles.title}>{titleText}</h3>
      )}
      <p className={styles.text}>{bodyText}</p>

      <form onSubmit={handleSearch} className={styles.searchForm}>
        <div className={styles.inputGroup} ref={wrapperRef}>
          <label htmlFor="widgetSchoolQuery" className={styles.inputLabel}>
            Enter school name
          </label>
          <input
            id="widgetSchoolQuery"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError("");
            }}
            onFocus={() => {
              if (results.length > 0 || loading) setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder="e.g. Parktown Primary"
            className={styles.inputField}
            required
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls="widget-school-results"
          />
          {open ? (
            <div
              className={styles.schoolResults}
              id="widget-school-results"
              role="listbox"
            >
              {loading ? (
                <p className={styles.schoolEmpty}>Searching schools...</p>
              ) : null}
              {!loading && results.length > 0
                ? results.map((result) => (
                      <button
                        type="button"
                        role="option"
                        aria-selected={false}
                        className={styles.schoolResult}
                        key={result.id}
                        onClick={() => selectSchool(result)}
                      >
                      <strong>{result.name}</strong>
                      <span>
                        {result.city}, {result.province}
                      </span>
                    </button>
                  ))
                : null}
              {!loading && !results.length && query.trim() ? (
                <p className={styles.schoolEmpty}>
                  No matching schools found. You can also{" "}
                  <Link href="/schools">browse schools</Link>.
                </p>
              ) : null}
              {error ? (
                <p className={styles.schoolError} role="alert">
                  {error}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </form>

      {!compact && (
        <>
          <div className={styles.divider} role="separator" />
          <ul className={styles.featuresList}>
            <li className={styles.featureItem}>
              <svg
                className={styles.checkIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>100% correct items packed per grade list</span>
            </li>
            <li className={styles.featureItem}>
              <svg
                className={styles.checkIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Teacher-preferred brands only</span>
            </li>
            <li className={styles.featureItem}>
              <svg
                className={styles.checkIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
