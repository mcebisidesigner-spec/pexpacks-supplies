"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePaginatedSchoolSearch } from "@/lib/hooks/usePaginatedSchoolSearch";
import { InlineSchoolWaitlist } from "@/components/schools/InlineSchoolWaitlist";
import { SchoolResultsAutoLoad } from "@/components/schools/SchoolResultsAutoLoad";
import { SearchHelperPill } from "@/components/ui/SearchHelperPill";
import { homepagePacks } from "@/data/packs";
import { slugify } from "@/lib/slugify";
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

const resultLimit = 12;

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
      <span className={styles.searchHighlight}>{match}</span>
      {after}
    </>
  );
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
        aria-controls="school-search-results"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setPanelOpen(false);
          }
        }}
      >
        <label
          className={`${styles.field} ${styles.schoolSearchField}`}
          htmlFor="homeSchoolQuery"
        >
          <span>School Name</span>
          <input
            id="homeSchoolQuery"
            name="schoolQuery"
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
                          <div className={styles.heroResultRow}>
                            {school.image ? (
                              <Image
                                src={school.image}
                                alt=""
                                className={styles.heroResultLogo}
                                width={36}
                                height={36}
                              />
                            ) : null}
                            <div className={styles.heroResultSummary}>
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
                          </div>
                          <div className={styles.heroResultMeta}>
                            <div className={styles.heroResultGrades}>
                              {school.grades.slice(0, 4).map((schoolGrade) => (
                                <Link
                                  key={schoolGrade}
                                  href={`/schools/${school.slug}/${slugify(schoolGrade)}`}
                                  className={styles.gradePill}
                                >
                                  {schoolGrade}
                                </Link>
                              ))}
                              {school.grades.length > 4 ? (
                                <span className={styles.gradePillMore}>
                                  +{school.grades.length - 4} more
                                </span>
                              ) : null}
                            </div>
                            {school.lowestPrice ? (
                              <span className={styles.heroResultPrice}>
                                From R{school.lowestPrice}
                              </span>
                            ) : null}
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
                    <div className={styles.noResultsPacks}>
                      <p className={styles.noResultsPacksLabel}>
                        Browse standard packs instead
                      </p>
                      <div className={styles.noResultsPackGrid}>
                        {homepagePacks.map((pack) => (
                          <Link
                            key={pack.id}
                            href={pack.href}
                            className={styles.noResultsPackCard}
                          >
                            <span className={styles.noResultsPackName}>
                              {pack.name}
                            </span>
                            <span className={styles.noResultsPackPrice}>
                              {pack.priceLabel}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <SchoolResultsAutoLoad
                  hasMore={hasMore}
                  isLoading={isLoading}
                  onLoadMore={() => fetchResults(results.length, "append")}
                  className={styles.loadMoreSentinel}
                />
                {hasMore && !isLoading ? (
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
        <label className={styles.field} htmlFor="homeSchoolGrade">
          <span>Grade</span>
          <select
            id="homeSchoolGrade"
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
