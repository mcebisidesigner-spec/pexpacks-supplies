"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePaginatedSchoolSearch } from "@/lib/hooks/usePaginatedSchoolSearch";
import { InlineSchoolWaitlist } from "@/components/schools/InlineSchoolWaitlist";
import { SchoolPhaseSelect } from "@/components/schools/SchoolPhaseSelect";
import { SchoolResultsAutoLoad } from "@/components/schools/SchoolResultsAutoLoad";
import { SearchHelperPill } from "@/components/ui/SearchHelperPill";
import { homepagePacks } from "@/data/packs";
import {
  getSchoolPhaseLabel,
  isSchoolPhase,
} from "@/lib/schools/schoolPhase";
import { slugify } from "@/lib/slugify";
import styles from "./HeroSearch.module.css";

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
    phaseAllValue: "",
    resultLimit,
    errorMessage: "We couldn't search schools right now. Please try again.",
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
    <div className={`${styles.heroSearchWrapper} pex-search-focus-anchor`}>
      <div
        ref={searchRef}
        className={styles.heroSearch}
        role="search"
        aria-controls="school-search-results"
        data-mobile-search-active={searchActive ? "true" : "false"}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setPanelOpen(false);
            setIsSchoolInputFocused(false);
          }
        }}
      >
        <SchoolPhaseSelect
          id="homeSchoolPhase"
          value={phase}
          onChange={updatePhase}
        />
        <label
          className={`${styles.field} ${styles.schoolSearchField}`}
          htmlFor="homeSchoolQuery"
        >
          <span>School Name</span>
          <input
            id="homeSchoolQuery"
            name="schoolQuery"
            type="search"
            placeholder="e.g. Westminster School"
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
            <button
              className={styles.mobileResultsClose}
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
                <p className={styles.heroSearchState}>Loading schools...</p>
              ) : null}
              {error ? (
                <p className={styles.searchError} role="alert">
                  {error}
                </p>
              ) : null}
              {panelOpen && !queryReady && !isLoading ? (
                <p className={`${styles.heroSearchState} ${styles.emptySearchDrawer}`}>
                  Type your school name to begin searching
                </p>
              ) : null}
            {!isLoading && queryReady && hasSearched && !error ? (
              <>
                <div className={styles.resultsCount}>
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
                            {school.phases.length > 0 ? (
                              <div className={styles.heroResultBadges}>
                                {school.phases.slice(0, 2).map((schoolPhase) => (
                                  <span key={schoolPhase}>
                                    {getSchoolPhaseLabel(schoolPhase)}
                                  </span>
                                ))}
                              </div>
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
                      <Link href="/schools#school-grade-packs" className={styles.noResultsPacksLabel}>
                        Browse standard packs instead
                      </Link>
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
        {error ? (
          <p className={styles.searchError} role="alert">
            {error}
          </p>
        ) : null}
      </div>
      <SearchHelperPill
        storageKey="Pexpacks:gauteng-helper:home"
        isInputFocused={isSchoolInputFocused}
        inputValue={query}
        className={styles.searchHelper}
      />
    </div>
  );
}
