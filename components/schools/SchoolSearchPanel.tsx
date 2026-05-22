"use client";

import Link from "next/link";
import { useState } from "react";
import heroStyles from "@/components/marketing/HeroSearch.module.css";
import { SearchHelperPill } from "@/components/ui/SearchHelperPill";
import { usePaginatedSchoolSearch } from "@/lib/hooks/usePaginatedSchoolSearch";
import { InlineSchoolWaitlist } from "./InlineSchoolWaitlist";
import { SchoolResultsAutoLoad } from "./SchoolResultsAutoLoad";
import { ViralReferralBanner } from "./ViralReferralBanner";
import styles from "./SchoolSearchPanel.module.css";

const resultLimit = 12;

type SchoolSearchPanelProps = {
  grades: string[];
  initialQuery?: string;
  initialGrade?: string;
};

function gradeLabel(grades: string[]) {
  if (grades.length <= 3) {
    return grades.join(", ");
  }

  return `${grades.slice(0, 3).join(", ")} +${grades.length - 3} more`;
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) {
    return <>{text}</>;
  }

  const matchIndex = text.toLowerCase().indexOf(query.toLowerCase());
  if (matchIndex === -1) {
    return <>{text}</>;
  }

  const before = text.slice(0, matchIndex);
  const match = text.slice(matchIndex, matchIndex + query.length);
  const after = text.slice(matchIndex + query.length);

  return (
    <>
      {before}
      <span className={heroStyles.searchHighlight}>{match}</span>
      {after}
    </>
  );
}

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

  return (
    <section
      className={`${styles.searchExperience} pex-school-search-focus-anchor`}
      aria-labelledby="school-search-heading"
    >
      <h2 id="school-search-heading" className="sr-only">
        Search by School, Grade or Region
      </h2>
      <div className={styles.searchFormWrapper}>
      <form
        className={styles.searchForm}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setPanelOpen(false);
          }
        }}
        aria-controls="school-search-results"
      >
        <label
          className={`${heroStyles.field} ${heroStyles.schoolSearchField} ${styles.schoolSearchField}`}
          htmlFor="schoolQuery"
        >
          <span>School Name</span>
          <input
            id="schoolQuery"
            name="schoolQuery"
            type="search"
            value={query}
            onFocus={() => setIsSchoolInputFocused(true)}
            onBlur={() => setIsSchoolInputFocused(false)}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="e.g. Parktown Primary"
            autoComplete="off"
          />
        </label>
        <label className={heroStyles.field} htmlFor="schoolGrade">
          <span>Grade</span>
          <select
            id="schoolGrade"
            name="grade"
            value={grade}
            onChange={(event) => updateGrade(event.target.value)}
          >
            <option value="all">Choose grade</option>
            {grades.map((gradeOption) => (
              <option value={gradeOption} key={gradeOption}>
                {gradeOption}
              </option>
            ))}
          </select>
        </label>
      </form>
      {panelOpen ? (
        <div
          className={`${styles.resultsPanel} ${heroStyles.heroResultsPanel}`}
          id="school-search-results"
          aria-live="polite"
          data-school-results-scroll
        >
          {!queryReady ? (
            <p className={heroStyles.heroSearchState}>
              Start typing your school name or choose a grade and region.
            </p>
          ) : null}
          {isLoading ? (
            <p className={heroStyles.heroSearchState}>Loading schools...</p>
          ) : null}
          {error ? (
            <p className={heroStyles.searchError} role="alert">
              {error}
            </p>
          ) : null}
          {!isLoading && queryReady && hasSearched && !error ? (
            <>
              <div className={heroStyles.resultsCount}>
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
                <div className={heroStyles.heroResultsList}>
                  {results.map((school) => (
                    <article className={heroStyles.heroResultCard} key={school.id}>
                      <div className={heroStyles.heroResultContent}>
                        <div className={heroStyles.heroResultSummary}>
                          <h3>
                            <Link href={`/schools/${school.slug}`}>
                              <HighlightMatch text={school.name} query={query} />
                            </Link>
                          </h3>
                          <p>
                            {school.region}
                            {school.province ? `, ${school.province}` : ""}
                          </p>
                        </div>
                        <div className={heroStyles.heroResultMeta}>
                          <span className={heroStyles.heroResultGrades}>
                            {gradeLabel(school.grades)}
                          </span>
                          {school.lowestPrice ? (
                            <span className={heroStyles.heroResultPrice}>
                              From R{school.lowestPrice}
                            </span>
                          ) : null}
                          {school.isFeatured || school.isPartner ? (
                            <div className={heroStyles.heroResultBadges}>
                              {school.isFeatured ? <span>Featured</span> : null}
                              {school.isPartner ? <span>Partner</span> : null}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <Link
                        href={`/schools/${school.slug}`}
                        className={heroStyles.heroResultLink}
                      >
                        View packs
                      </Link>
                    </article>
                  ))}
                </div>
              ) : (
                <div className={heroStyles.noResultsState}>
                  <p className={heroStyles.heroSearchState}>
                    No matching schools found.
                  </p>
                  <InlineSchoolWaitlist
                    schoolName={query}
                    source="schools-search"
                  />
                  <ViralReferralBanner compact />
                </div>
              )}
              <SchoolResultsAutoLoad
                hasMore={hasMore}
                isLoading={isLoading}
                onLoadMore={() => fetchResults(results.length, "append")}
                className={heroStyles.loadMoreSentinel}
              />
              {hasMore ? (
                <button
                  className={heroStyles.loadMoreButton}
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

      <SearchHelperPill
        storageKey="Pexpacks:gauteng-helper:schools"
        isInputFocused={isSchoolInputFocused}
        inputValue={query}
        className={styles.searchHelper}
      />
    </section>
  );
}

