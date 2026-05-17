"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { usePaginatedSchoolSearch } from "@/lib/hooks/usePaginatedSchoolSearch";
import { SchoolResultsPanel } from "@/components/schools/SchoolResultsPanel";
import { SearchHelperPill } from "@/components/ui/SearchHelperPill";
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

export function HeroSearch() {
  const [isSchoolInputFocused, setIsSchoolInputFocused] = useState(false);
  const {
    query,
    grade,
    results,
    total,
    hasMore,
    hasSearched,
    panelOpen,
    isLoading,
    error,
    queryReady,
    setPanelOpen,
    fetchResults,
    updateQuery,
    updateGrade,
  } = usePaginatedSchoolSearch({
    gradeAllValue: "",
    resultLimit,
    errorMessage: "We couldn't search schools right now. Please try again.",
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPanelOpen(true);

    if (queryReady) {
      void fetchResults(0, "replace");
    }
  }

  return (
    <div className={`${styles.heroSearchWrapper} pex-search-focus-anchor`}>
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
            onFocus={() => setIsSchoolInputFocused(true)}
            onBlur={() => setIsSchoolInputFocused(false)}
            onChange={(event) => updateQuery(event.target.value)}
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
      <SearchHelperPill
        storageKey="pexpacks:gauteng-helper:home"
        isInputFocused={isSchoolInputFocused}
        inputValue={query}
        className={styles.searchHelper}
      />
    </div>
  );
}
