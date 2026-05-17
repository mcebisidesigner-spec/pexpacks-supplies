"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { mostPopularPacksHref } from "@/data/packs";
import { usePaginatedSchoolSearch } from "@/lib/hooks/usePaginatedSchoolSearch";
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

function gradeLabel(grades: string[]) {
  if (grades.length <= 3) {
    return grades.join(", ");
  }

  return `${grades.slice(0, 3).join(", ")} +${grades.length - 3} more`;
}

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
        {panelOpen ? (
          <div
            className={styles.heroResultsPanel}
            id="school-search-results"
            aria-live="polite"
            data-school-results-scroll
          >
            {!queryReady ? (
              <p className={styles.heroSearchState}>
                Start typing your school name or choose a grade.
              </p>
            ) : null}
            {isLoading ? (
              <p className={styles.heroSearchState}>Loading schools...</p>
            ) : null}
            {error ? (
              <p className={styles.searchError} role="alert">
                {error}
              </p>
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
                      <article className={styles.heroResultCard} key={school.id}>
                        <div className={styles.heroResultContent}>
                          <div className={styles.heroResultSummary}>
                            <h3>
                              <Link href={`/schools/${school.slug}`}>
                                {school.name}
                              </Link>
                            </h3>
                            <p>
                              {school.region}
                              {school.province ? `, ${school.province}` : ""}
                            </p>
                          </div>
                          <div className={styles.heroResultMeta}>
                            <span className={styles.heroResultGrades}>
                              {gradeLabel(school.grades)}
                            </span>
                            {school.isFeatured || school.isPartner ? (
                              <div className={styles.heroResultBadges}>
                                {school.isFeatured ? <span>Featured</span> : null}
                                {school.isPartner ? <span>Partner</span> : null}
                              </div>
                            ) : null}
                          </div>
                        </div>
                        <Link
                          href={`/schools/${school.slug}`}
                          className={styles.heroResultLink}
                        >
                          View packs
                        </Link>
                      </article>
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
                        href={mostPopularPacksHref}
                        className={styles.standardPackLink}
                      >
                        Buy standard pack
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
