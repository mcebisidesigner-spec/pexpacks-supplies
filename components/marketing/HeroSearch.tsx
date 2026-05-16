"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SchoolSearchRecord } from "@/lib/schools/types";
import { SchoolResultCard } from "@/components/schools/SchoolResultCard";
import styles from "./HeroSearch.module.css";

const gradeOptions = [
  "Grade R",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];

const resultLimit = 8;

function shouldSearch(query: string, grade: string) {
  return query.trim().length >= 2 || grade !== "";
}

export function HeroSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [grade, setGrade] = useState("");
  const [results, setResults] = useState<SchoolSearchRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const activeRequest = useRef<AbortController | null>(null);

  const queryReady = useMemo(
    () => shouldSearch(debouncedQuery, grade),
    [debouncedQuery, grade]
  );

  /* ── Debounce the text query ── */
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 275);
    return () => window.clearTimeout(timer);
  }, [query]);

  /* ── Fetch from the same /api/schools/search endpoint ── */
  const fetchResults = useCallback(
    async (nextOffset: number, mode: "replace" | "append") => {
      if (!shouldSearch(debouncedQuery, grade)) {
        setResults([]);
        setTotal(0);
        setHasMore(false);
        return;
      }

      activeRequest.current?.abort();
      const controller = new AbortController();
      activeRequest.current = controller;
      setIsLoading(true);
      setError("");

      const params = new URLSearchParams({
        q: debouncedQuery.trim(),
        limit: String(resultLimit),
        offset: String(nextOffset),
      });

      if (grade) {
        params.set("grade", grade);
      }

      try {
        const response = await fetch(
          `/api/schools/search?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("school_search_failed");
        }

        const data = (await response.json()) as {
          success: boolean;
          results: SchoolSearchRecord[];
          total: number;
          hasMore: boolean;
        };
        setResults((current) =>
          mode === "append" ? [...current, ...data.results] : data.results
        );
        setTotal(data.total);
        setHasMore(data.hasMore);
        setHasSearched(true);
      } catch (fetchError) {
        if (
          fetchError instanceof DOMException &&
          fetchError.name === "AbortError"
        ) {
          return;
        }
        setError(
          "We couldn't search schools right now. Please try again."
        );
      } finally {
        if (activeRequest.current === controller) {
          setIsLoading(false);
        }
      }
    },
    [debouncedQuery, grade]
  );

  /* ── Auto-search on debounced query or grade change ── */
  useEffect(() => {
    if (!panelOpen) return;

    if (!queryReady) {
      setResults([]);
      setTotal(0);
      setHasMore(false);
      setHasSearched(false);
      return;
    }

    void fetchResults(0, "replace");
  }, [fetchResults, panelOpen, queryReady]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPanelOpen(true);

    if (queryReady) {
      void fetchResults(0, "replace");
    }
  }

  function updateQuery(value: string) {
    setQuery(value);
    setPanelOpen(true);
  }

  function updateGrade(value: string) {
    setGrade(value);
    setPanelOpen(true);
  }

  return (
    <div className={styles.heroSearchWrapper}>
      <form
        className={styles.heroSearch}
        onSubmit={handleSubmit}
        role="search"
        noValidate
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setPanelOpen(false);
          }
        }}
      >
        <label className={`${styles.field} ${styles.schoolSearchField}`}>
          <span>School Name</span>
          <input
            name="q"
            type="search"
            placeholder="e.g. Parktown Primary"
            autoComplete="off"
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span>Grade</span>
          <select
            name="grade"
            value={grade}
            onChange={(event) => updateGrade(event.target.value)}
          >
            <option value="">Choose grade</option>
            {gradeOptions.map((gradeOption) => (
              <option value={gradeOption} key={gradeOption}>
                {gradeOption}
              </option>
            ))}
          </select>
        </label>
        <button
          className={styles.searchButton}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
        {error ? (
          <p className={styles.searchError} role="alert">
            {error}
          </p>
        ) : null}
      </form>

      {/* ── Results panel (same data as /schools, homepage design) ── */}
      {panelOpen ? (
        <div className={styles.heroResultsPanel} aria-live="polite">
          {!queryReady ? (
            <p className={styles.heroSearchState}>
              Start typing a school name or choose a grade to find packs.
            </p>
          ) : null}

          {isLoading ? (
            <p className={styles.heroSearchState}>Searching schools...</p>
          ) : null}

          {!isLoading && queryReady && hasSearched && !error ? (
            <>
              <div className={styles.resultsCount}>
                <strong>
                  {total === 1 ? "1 school found" : `${total} schools found`}
                </strong>
                {total > 0 ? (
                  <span>
                    Showing {results.length} of {total}
                  </span>
                ) : null}
              </div>

              {results.length > 0 ? (
                <div className={styles.heroResultsList}>
                  {results.map((school) => (
                    <SchoolResultCard school={school} key={school.id} />
                  ))}
                </div>
              ) : (
                <div className={styles.noResultsState}>
                  <p className={styles.heroSearchState}>
                    No matching schools found.
                  </p>
                  <div className={styles.noResultsActions}>
                    <Link
                      href="/add-your-school#school-request-form"
                      className={styles.addSchoolLink}
                    >
                      Add your school
                    </Link>
                    <Link
                      href="/standard-school-packs"
                      className={styles.standardPackLink}
                    >
                      Standard Packs
                    </Link>
                  </div>
                </div>
              )}

              {hasMore ? (
                <button
                  className={styles.loadMoreButton}
                  type="button"
                  onClick={() => fetchResults(results.length, "append")}
                >
                  Load more schools
                </button>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
