"use client";

import Link from "next/link";
import { useState } from "react";
import { usePaginatedSchoolSearch } from "@/lib/hooks/usePaginatedSchoolSearch";
import { InlineSchoolWaitlist } from "@/components/schools/InlineSchoolWaitlist";
import { SchoolResultsAutoLoad } from "@/components/schools/SchoolResultsAutoLoad";
import { SearchHelperPill } from "@/components/ui/SearchHelperPill";
import { ViralReferralBanner } from "@/components/schools/ViralReferralBanner";
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

const alphabetLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const popularSchools = [
  "Parktown Primary",
  "Auckland Park Primary",
  "Mamelodi Primary",
  "Bryanston Primary",
];

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

  const queryEmpty = query.trim().length === 0;

  return (
    <div className={`${styles.heroSearchWrapper} pex-search-focus-anchor`}>
      <form
        className={styles.heroSearch}
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
            onFocus={() => {
              setIsSchoolInputFocused(true);
              setPanelOpen(true);
            }}
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
            {!hasSearched && isLoading ? (
              <p className={styles.heroSearchState}>Loading schools...</p>
            ) : null}
            {error ? (
              <p className={styles.searchError} role="alert">
                {error}
              </p>
            ) : null}
            {queryEmpty ? (
              <div className={styles.quickStartPanel}>
                <p className={styles.quickStartLabel}>Browse schools by letter</p>
                <div className={styles.alphabetStrip} aria-label="School alphabet quick index">
                  {alphabetLetters.map((letter) => (
                    <button
                      type="button"
                      className={styles.letterButton}
                      onClick={() => updateQuery(letter)}
                      key={letter}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
                <p className={styles.quickStartLabel}>Popular Gauteng schools</p>
                <div className={styles.popularSchools}>
                  {popularSchools.map((school) => (
                    <button
                      type="button"
                      className={styles.popularSchoolButton}
                      onClick={() => updateQuery(school)}
                      key={school}
                    >
                      {school}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {!queryEmpty && !isLoading && queryReady && hasSearched && !error ? (
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
                    <InlineSchoolWaitlist
                      schoolName={query}
                      source="home-search"
                    />
                    <ViralReferralBanner compact />
                  </div>
                )}
                <SchoolResultsAutoLoad
                  hasMore={hasMore}
                  isLoading={isLoading}
                  onLoadMore={() => fetchResults(results.length, "append")}
                  className={styles.loadMoreSentinel}
                />
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
        {error ? (
          <p className={styles.searchError} role="alert">
            {error}
          </p>
        ) : null}
      </form>
      <SearchHelperPill
        storageKey="Pexpacks:gauteng-helper:home"
        isInputFocused={isSchoolInputFocused}
        inputValue={query}
        className={styles.searchHelper}
      />
    </div>
  );
}
