"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import heroStyles from "@/components/marketing/HeroSearch.module.css";
import { SchoolPhaseSelect } from "@/components/schools/SchoolPhaseSelect";
import { SearchHelperPill } from "@/components/ui/SearchHelperPill";
import { usePaginatedSchoolSearch } from "@/lib/hooks/usePaginatedSchoolSearch";
import {
  getSchoolPhaseLabel,
  isSchoolPhase,
} from "@/lib/schools/schoolPhase";
import { slugify } from "@/lib/slugify";
import { InlineSchoolWaitlist } from "./InlineSchoolWaitlist";
import { SchoolResultsAutoLoad } from "./SchoolResultsAutoLoad";
import { homepagePacks } from "@/data/packs";
import styles from "./SchoolSearchPanel.module.css";

const resultLimit = 12;

type SchoolSearchPanelProps = {
  initialQuery?: string;
  initialPhase?: string;
};

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
  initialQuery = "",
  initialPhase = "all",
}: SchoolSearchPanelProps) {
  const [isSchoolInputFocused, setIsSchoolInputFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const {
    query,
    phase,
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
    updatePhase,
  } = usePaginatedSchoolSearch({
    initialQuery,
    initialPhase,
    initialPanelOpen:
      initialQuery.trim().length >= 2 || initialPhase !== "all",
    phaseAllValue: "all",
    resultLimit,
    errorMessage:
      "We couldn't load the school list. Please refresh or contact Pexpacks.",
  });
  const searchActive = panelOpen;
  const selectedPhaseLabel = isSchoolPhase(phase) ? getSchoolPhaseLabel(phase) : "";

  useEffect(() => {
    if (!panelOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!searchRef.current?.contains(event.target as Node)) {
        setPanelOpen(false);
        setIsSchoolInputFocused(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [panelOpen, setPanelOpen]);

  return (
    <section
      className={`${styles.searchExperience} pex-school-search-focus-anchor`}
      aria-labelledby="school-search-heading"
    >
      <h2 id="school-search-heading" className="sr-only">
        Search by School, Grade or Region
      </h2>
      <div className={styles.searchFormWrapper}>
        <div
          ref={searchRef}
          className={`${heroStyles.heroSearch} ${styles.searchForm}`}
          role="search"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setPanelOpen(false);
              setIsSchoolInputFocused(false);
            }
          }}
          aria-controls="school-search-results"
          data-mobile-search-active={searchActive ? "true" : "false"}
        >
          <SchoolPhaseSelect
            id="schoolPhase"
            value={phase}
            onChange={updatePhase}
            className={styles.phaseField}
          />
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
              onFocus={() => {
                setIsSchoolInputFocused(true);
                setPanelOpen(true);
              }}
              onBlur={() => setIsSchoolInputFocused(false)}
              onChange={(event) => updateQuery(event.target.value)}
              placeholder="e.g. Westminster School"
              autoComplete="off"
            />
          </label>
          {panelOpen ? (
            <div
              className={heroStyles.heroResultsPanel}
              id="school-search-results"
              aria-live="polite"
              data-school-results-scroll
            >
              <button
                className={heroStyles.mobileResultsClose}
                type="button"
                aria-label="Close school search results"
                onClick={() => {
                  setPanelOpen(false);
                  setIsSchoolInputFocused(false);
                }}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
              {!hasSearched && isLoading ? (
                <p className={heroStyles.heroSearchState}>Loading schools...</p>
              ) : null}
              {error ? (
                <p className={heroStyles.searchError} role="alert">
                  {error}
                </p>
              ) : null}
              {panelOpen && !queryReady && !isLoading ? (
                <p className={`${heroStyles.heroSearchState} ${heroStyles.emptySearchDrawer}`}>
                  Type your school name to begin searching
                </p>
              ) : null}
              {!isLoading && queryReady && hasSearched && !error ? (
                <>
                  <div className={heroStyles.resultsCount}>
                    <strong>
                      {total === 1 ? "1 school found" : `${total} schools found`}
                    </strong>
                    {selectedPhaseLabel ? <span>{selectedPhaseLabel}</span> : null}
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
                            <div className={heroStyles.heroResultRow}>
                              {school.image ? (
                                <Image src={school.image} alt="" className={heroStyles.heroResultLogo} width={36} height={36} />
                              ) : null}
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
                            </div>
                            <div className={heroStyles.heroResultMeta}>
                              <div className={heroStyles.heroResultGrades}>
                                {school.grades.slice(0, 4).map((g) => (
                                  <Link
                                    key={g}
                                    href={`/schools/${school.slug}`}
                                    className={heroStyles.gradePill}
                                  >
                                    {g}
                                  </Link>
                                ))}
                                {school.grades.length > 4 ? (
                                  <span className={heroStyles.gradePillMore}>
                                    +{school.grades.length - 4} more
                                  </span>
                                ) : null}
                              </div>
                              {school.lowestPrice ? (
                                <span className={heroStyles.heroResultPrice}>
                                  From R{school.lowestPrice}
                                </span>
                              ) : null}
                              {school.phases.length > 0 ? (
                                <div className={heroStyles.heroResultBadges}>
                                  {school.phases.slice(0, 2).map((schoolPhase) => (
                                    <span key={schoolPhase}>
                                      {getSchoolPhaseLabel(schoolPhase)}
                                    </span>
                                  ))}
                                </div>
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
                      <div className={heroStyles.noResultsPacks}>
                        <Link href="/schools#school-grade-packs" className={heroStyles.noResultsPacksLabel}>
                          Browse standard packs instead
                        </Link>
                        <div className={heroStyles.noResultsPackGrid}>
                          {homepagePacks.map((pack) => (
                            <Link
                              key={pack.id}
                              href={pack.href}
                              className={heroStyles.noResultsPackCard}
                            >
                              <span className={heroStyles.noResultsPackName}>{pack.name}</span>
                              <span className={heroStyles.noResultsPackPrice}>{pack.priceLabel}</span>
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
                    className={heroStyles.loadMoreSentinel}
                  />
                  {hasMore && !isLoading ? (
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
