"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  PaginatedSchoolResults,
  SchoolSearchRecord,
} from "@/lib/schools/types";
import { SearchHelperPill } from "@/components/ui/SearchHelperPill";
import { GradeSelect } from "./GradeSelect";
import { RegionSelect } from "./RegionSelect";
import { SchoolResultsPanel } from "./SchoolResultsPanel";
import styles from "./Schools.module.css";

const resultLimit = 12;

type SchoolSearchPanelProps = {
  grades: string[];
  initialQuery?: string;
  initialGrade?: string;
};

function shouldSearch(query: string, grade: string) {
  return query.trim().length >= 2 || grade !== "all";
}

export function SchoolSearchPanel({
  grades,
  initialQuery = "",
  initialGrade = "all",
}: SchoolSearchPanelProps) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [grade, setGrade] = useState(initialGrade);
  const [results, setResults] = useState<SchoolSearchRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [panelOpen, setPanelOpen] = useState(
    shouldSearch(initialQuery, initialGrade)
  );
  const [isSchoolInputFocused, setIsSchoolInputFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const activeRequest = useRef<AbortController | null>(null);

  const queryReady = useMemo(
    () => shouldSearch(debouncedQuery, grade),
    [debouncedQuery, grade]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 275);
    return () => window.clearTimeout(timer);
  }, [query]);

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

      if (grade !== "all") {
        params.set("grade", grade);
      }

      try {
        const response = await fetch(
          `/api/schools/search?${params.toString()}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("school_search_failed");
        }

        const data = (await response.json()) as PaginatedSchoolResults & {
          success: boolean;
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
          "We couldn't load the school list. Please refresh or contact Pexpacks."
        );
      } finally {
        if (activeRequest.current === controller) {
          setIsLoading(false);
        }
      }
    },
    [debouncedQuery, grade]
  );

  useEffect(() => {
    if (!panelOpen) {
      return;
    }

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
    <section
      className={styles.searchExperience}
      aria-labelledby="school-search-heading"
    >
      <h2 id="school-search-heading" className="sr-only">
        Search by School, Grade or Region
      </h2>
      <form
        className={styles.searchForm}
        onSubmit={handleSubmit}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setPanelOpen(false);
          }
        }}
        aria-controls="school-search-results"
      >
        <label
          className={`${styles.searchField} ${styles.schoolSearchField}`}
          htmlFor="schoolQuery"
        >
          <span>School Name</span>
          <input
            id="schoolQuery"
            name="schoolQuery"
            value={query}
            onFocus={() => setIsSchoolInputFocused(true)}
            onBlur={() => setIsSchoolInputFocused(false)}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="e.g. Parktown Primary"
            autoComplete="off"
          />
        </label>
        <SchoolResultsPanel
          isOpen={panelOpen}
          isLoading={isLoading}
          hasSearched={hasSearched}
          queryReady={queryReady}
          results={results}
          total={total}
          visibleCount={results.length}
          hasMore={hasMore}
          error={error}
          onLoadMore={() => fetchResults(results.length, "append")}
        />
        <GradeSelect grades={grades} value={grade} onChange={updateGrade} />
        <button
          className={styles.schoolSearchButton}
          type="submit"
          aria-label="Search schools"
        >
          Search
        </button>
      </form>
      <SearchHelperPill
        storageKey="pexpacks:gauteng-helper:schools"
        isInputFocused={isSchoolInputFocused}
        inputValue={query}
        className={styles.searchHelper}
      />
    </section>
  );
}
