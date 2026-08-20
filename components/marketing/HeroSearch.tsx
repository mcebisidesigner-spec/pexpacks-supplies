"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePaginatedSchoolSearch } from "@/hooks/usePaginatedSchoolSearch";
import { SchoolResultsAutoLoad } from "@/components/schools/SchoolResultsAutoLoad";
import { SearchHelperPill } from "@/components/ui/SearchHelperPill";

import {
  getSchoolPhaseLabel,
} from "@/lib/schools/schoolPhase";
import { IMAGE_BLUR_DATA_URL } from "@/lib/constants";
import { formatSchoolSearchLocation } from "@/lib/schools/searchPresentation";
import { SchoolLogoPlaceholder } from "@/components/schools/SchoolLogoPlaceholder";
import {
  trackSchoolNoResultsRecovery,
  trackSchoolResultSelected,
} from "@/lib/analytics";
import clsx from "clsx";
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

type HeroSearchProps = {
  onResultClick?: () => void;
  source?: "home" | "tray";
};

export function HeroSearch({
  onResultClick,
  source = "home",
}: HeroSearchProps = {}) {
  const [isSchoolInputFocused, setIsSchoolInputFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [trendingSchools, setTrendingSchools] = useState<{ name: string; slug: string; image?: string | null }[]>([]);
  const [trendingVisible, setTrendingVisible] = useState(false);
  const trendingFetched = useRef(false);
  const {
    query,
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
  } = usePaginatedSchoolSearch({
    phaseAllValue: "",
    resultLimit,
    searchSource: source,
    errorMessage: "We couldn't search schools right now. Please try again.",
  });

  const searchActive = panelOpen;

  function handleSchoolSelected(
    schoolSlug: string,
    position: number,
    placement: "result" | "trending",
  ) {
    trackSchoolResultSelected({
      source,
      schoolSlug,
      position,
      placement,
    });
    onResultClick?.();
  }

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

  useEffect(() => {
    if (trendingFetched.current || query.length >= 3) return;
    trendingFetched.current = true;

    const fetchDefault = () => {
      fetch("/api/schools/search?limit=8")
        .then((r) => r.json())
        .then((data) => {
          if (data.results) {
            setTrendingSchools(data.results);
            setTrendingVisible(true);
          }
        })
        .catch(() => {});
    };

    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          fetch(`/api/schools/search?limit=8&lat=${latitude}&lng=${longitude}`)
            .then((r) => r.json())
            .then((data) => {
              if (data.results && data.results.length > 0) {
                setTrendingSchools(data.results);
                setTrendingVisible(true);
              } else {
                fetchDefault();
              }
            })
            .catch(fetchDefault);
        },
        fetchDefault,
        { timeout: 4000, maximumAge: 120000 }
      );
    } else {
      fetchDefault();
    }
  }, [query]);



  return (
    <div className={clsx(styles.heroSearchWrapper, "pex-search-focus-anchor")}>
      {searchActive && <div className={styles.searchBackdrop} />}
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
            setTrendingVisible(false);
          }
        }}
      >
        <label
          className={clsx(styles.field, styles.schoolSearchField)}
          htmlFor="homeSchoolQuery"
        >
          <span>School Name</span>
          <input
            id="homeSchoolQuery"
            name="schoolQuery"
            type="search"
            placeholder="Type your school name..."
            autoComplete="off"
            value={query}
            onFocus={() => {
              setIsSchoolInputFocused(true);
              setTrendingVisible(true);
            }}
            onBlur={() => setIsSchoolInputFocused(false)}
            onChange={(event) => updateQuery(event.target.value)}
          />
        </label>

        {trendingVisible && query.length < 3 && trendingSchools.length > 0 ? (
          <div className={styles.trendingRow}>
            <span className={styles.trendingLabel}>Trending Near You</span>
            <div className={styles.trendingTrack}>
              {trendingSchools.map((school, index) => (
                <Link
                  key={school.slug}
                  href={`/schools/${school.slug}`}
                  className={styles.trendingCard}
                  onClick={() =>
                    handleSchoolSelected(school.slug, index + 1, "trending")
                  }
                >
                  {school.image ? (
                    <Image
                      src={school.image}
                      alt={`${school.name} logo`}
                      width={28}
                      height={28}
                      className={styles.trendingCardLogo}
                    />
                  ) : (
                    <SchoolLogoPlaceholder
                      className={styles.trendingCardLogo}
                      width={28}
                      height={28}
                      title={`${school.name} logo`}
                    />
                  )}
                  <span className={styles.trendingCardName}>{school.name}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

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
                setTrendingVisible(false);
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
                  <>
                    <div className={styles.heroResultsList}>
                      {results.map((school, index) => (
                        <article className={styles.heroResultCard} key={school.id}>
                          <div className={styles.heroResultContent}>
                            <div className={styles.heroResultRow}>
                              {school.image ? (
                                <Image
                                  src={school.image}
                                  alt={`${school.name} logo`}
                                  className={styles.heroResultLogo}
                                  width={36}
                                  height={36}
                                  placeholder="blur"
                                  blurDataURL={IMAGE_BLUR_DATA_URL}
                                />
                              ) : (
                                <SchoolLogoPlaceholder
                                  className={styles.heroResultLogo}
                                  width={36}
                                  height={36}
                                  title={`${school.name} logo`}
                                />
                              )}
                              <div className={styles.heroResultSummary}>
                                <h3>
                                  <Link
                                    href={`/schools/${school.slug}`}
                                    onClick={() =>
                                      handleSchoolSelected(
                                        school.slug,
                                        index + 1,
                                        "result",
                                      )
                                    }
                                  >
                                    <HighlightMatch text={school.name} query={query} />
                                  </Link>
                                </h3>
                                <p>{formatSchoolSearchLocation(school)}</p>
                              </div>
                            </div>
                            <div className={styles.heroResultMeta}>
                              <div className={styles.heroResultGrades}>
                                {school.grades.slice(0, 4).map((schoolGrade) => (
                                  <Link
                                    key={schoolGrade}
                                    href={`/schools/${school.slug}`}
                                    className={styles.gradePill}
                                    onClick={() =>
                                      handleSchoolSelected(
                                        school.slug,
                                        index + 1,
                                        "result",
                                      )
                                    }
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
                              <div className={styles.heroResultBadges}>
                                {school.hasOrderablePacks ? (
                                  <span className={styles.yearPillBadge}>2027 Packs</span>
                                ) : (
                                  <span className={styles.awaitingBadge}>Awaiting Lists</span>
                                )}
                                {school.isPartner ? (
                                  <span className={styles.partnerBadge}>Official Partner</span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                          <Link
                            href={`/schools/${school.slug}`}
                            className={styles.heroResultLink}
                            aria-label={`View ${school.name} packs in ${formatSchoolSearchLocation(school)}`}
                            onClick={() =>
                              handleSchoolSelected(
                                school.slug,
                                index + 1,
                                "result",
                              )
                            }
                          >
                            View packs
                          </Link>
                        </article>
                      ))}
                    </div>
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
                ) : (
                  <div className={styles.noResultsState}>
                    <p className={styles.heroSearchState}>No matching schools found.</p>
                  </div>
                )}
                {results.length === 0 ? (
                  <div className={styles.searchCatchall}>
                    <p className={styles.searchCatchallEyebrow}>Edge case? Covered.</p>
                    <p className={styles.searchCatchallText}>
                      Don&rsquo;t see your school? Upload your stationery list or send it to us on WhatsApp and we&rsquo;ll pack every item exactly as specified.
                    </p>
                    <div className={styles.searchCatchallActions}>
                      <Link
                        href="/order"
                        className={styles.searchCatchallUpload}
                        onClick={() => {
                          trackSchoolNoResultsRecovery({ source });
                          onResultClick?.();
                        }}
                      >
                        Upload Your School List
                      </Link>
                    </div>
                  </div>
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
