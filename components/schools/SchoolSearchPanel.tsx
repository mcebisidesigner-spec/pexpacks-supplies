"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { usePaginatedSchoolSearch } from "@/lib/hooks/usePaginatedSchoolSearch";
import { SearchHelperPill } from "@/components/ui/SearchHelperPill";
import { GradeSelect } from "./GradeSelect";
import { SchoolResultsPanel } from "./SchoolResultsPanel";
import styles from "./Schools.module.css";

const resultLimit = 12;

type SchoolSearchPanelProps = {
  grades: string[];
  initialQuery?: string;
  initialGrade?: string;
};

export function SchoolSearchPanel({
  grades,
  initialQuery = "",
  initialGrade = "all",
}: SchoolSearchPanelProps) {
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
    initialQuery,
    initialGrade,
    initialPanelOpen:
      initialQuery.trim().length >= 2 || initialGrade !== "all",
    gradeAllValue: "all",
    resultLimit,
    errorMessage:
      "We couldn't load the school list. Please refresh or contact Pexpacks.",
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPanelOpen(true);

    if (queryReady) {
      void fetchResults(0, "replace");
    }
  }

  return (
    <section
      className={`${styles.searchExperience} pex-school-search-focus-anchor`}
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
