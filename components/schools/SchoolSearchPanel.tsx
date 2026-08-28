"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import heroStyles from "@/components/marketing/HeroSearch.module.css";

import { SearchHelperPill } from "@/components/ui/SearchHelperPill";
import { usePaginatedSchoolSearch } from "@/hooks/usePaginatedSchoolSearch";
import { IMAGE_BLUR_DATA_URL } from "@/lib/constants";
import { formatSchoolSearchLocation } from "@/lib/schools/searchPresentation";
import {
  trackSchoolNoResultsRecovery,
  trackSchoolResultSelected,
} from "@/lib/analytics";
import { SchoolLogoPlaceholder } from "./SchoolLogoPlaceholder";
import { SchoolResultsAutoLoad } from "./SchoolResultsAutoLoad";
import { SchoolsHowItWorks } from "./SchoolsHowItWorks";
import styles from "./SchoolSearchPanel.module.css";

const resultLimit = 12;

type SchoolSearchPanelProps = {
  initialQuery?: string;
  readQueryFromUrl?: boolean;
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
  readQueryFromUrl = false,
}: SchoolSearchPanelProps) {
  const [isSchoolInputFocused, setIsSchoolInputFocused] = useState(false);
  const [trendingSchools, setTrendingSchools] = useState<{ name: string; slug: string; image?: string | null }[]>([]);
  const [trendingVisible, setTrendingVisible] = useState(false);
  const trendingFetched = useRef(false);
  const urlQueryApplied = useRef(false);
  const searchRef = useRef<HTMLDivElement>(null);
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
    initialQuery,
    initialPanelOpen: initialQuery.trim().length >= 3,
    phaseAllValue: "all",
    resultLimit,
    searchSource: "schools",
    errorMessage:
      "We couldn't load the school list. Please refresh or contact Pexpacks.",
  });
  const searchActive = panelOpen;

  useEffect(() => {
    if (!readQueryFromUrl || urlQueryApplied.current) return;
    urlQueryApplied.current = true;
    const queryFromUrl = new URLSearchParams(window.location.search).get("q")?.trim();
    if (queryFromUrl) updateQuery(queryFromUrl);
  }, [readQueryFromUrl, updateQuery]);

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
      id="school-search"
      className={clsx(styles.searchExperience, "pex-school-search-focus-anchor")}
    >
      {searchActive && <div className={heroStyles.searchBackdrop} />}
      <div className={styles.searchFormWrapper}>
        <div
          ref={searchRef}
          className={heroStyles.heroSearch}
          role="search"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setPanelOpen(false);
              setIsSchoolInputFocused(false);
              setTrendingVisible(false);
            }
          }}
          aria-controls="school-search-results"
          data-mobile-search-active={searchActive ? "true" : "false"}
        >
          <label
            className={heroStyles.field}
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
                setTrendingVisible(true);
              }}
              onBlur={() => setIsSchoolInputFocused(false)}
              onChange={(event) => updateQuery(event.target.value)}
              placeholder="Type your school name..."
              autoComplete="off"
            />
          </label>
          {trendingVisible && query.length < 3 && trendingSchools.length > 0 ? (
            <div className={heroStyles.trendingRow}>
              <span className={heroStyles.trendingLabel}>Trending Near You</span>
              <div className={heroStyles.trendingTrack}>
                {trendingSchools.map((school, index) => (
                  <Link
                    key={school.slug}
                    href={`/schools/${school.slug}`}
                    className={heroStyles.trendingCard}
                    onClick={() =>
                      trackSchoolResultSelected({
                        source: "schools",
                        schoolSlug: school.slug,
                        position: index + 1,
                        placement: "trending",
                      })
                    }
                  >
                    {school.image ? (
                      <Image
                        src={school.image}
                        alt={`${school.name} logo`}
                        width={28}
                        height={28}
                        className={heroStyles.trendingCardLogo}
                      />
                    ) : (
                      <SchoolLogoPlaceholder
                        className={heroStyles.trendingCardLogo}
                        width={28}
                        height={28}
                        title={`${school.name} logo`}
                      />
                    )}
                    <span className={heroStyles.trendingCardName}>{school.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
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
                  setTrendingVisible(false);
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
                    <>
                      <div className={heroStyles.heroResultsList}>
                        {results.map((school, index) => (
                          <article className={heroStyles.heroResultCard} key={school.id}>
                            <div className={heroStyles.heroResultContent}>
                              <div className={heroStyles.heroResultRow}>
                                {school.image ? (
                                  <Image
                                    src={school.image}
                                    alt={`${school.name} logo`}
                                    className={heroStyles.heroResultLogo}
                                    width={36}
                                    height={36}
                                    placeholder="blur"
                                    blurDataURL={IMAGE_BLUR_DATA_URL}
                                  />
                                ) : (
                                  <SchoolLogoPlaceholder
                                    className={heroStyles.heroResultLogo}
                                    width={36}
                                    height={36}
                                    title={`${school.name} logo`}
                                  />
                                )}
                                <div className={heroStyles.heroResultSummary}>
                                  <h3>
                                    <Link
                                      href={`/schools/${school.slug}`}
                                      onClick={() =>
                                        trackSchoolResultSelected({
                                          source: "schools",
                                          schoolSlug: school.slug,
                                          position: index + 1,
                                          placement: "result",
                                        })
                                      }
                                    >
                                      <HighlightMatch text={school.name} query={query} />
                                    </Link>
                                  </h3>
                                  <p>{formatSchoolSearchLocation(school)}</p>
                                </div>
                              </div>
                              <div className={heroStyles.heroResultMeta}>
                                <div className={heroStyles.heroResultGrades}>
                                  {school.grades.slice(0, 4).map((g) => (
                                    <Link
                                      key={g}
                                      href={`/schools/${school.slug}`}
                                      className={heroStyles.gradePill}
                                      onClick={() =>
                                        trackSchoolResultSelected({
                                          source: "schools",
                                          schoolSlug: school.slug,
                                          position: index + 1,
                                          placement: "result",
                                        })
                                      }
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
                                <div className={heroStyles.heroResultBadges}>
                                  {school.hasOrderablePacks ? (
                                    <span className={heroStyles.yearPillBadge}>{school.customBadge || "2027 Packs"}</span>
                                  ) : (
                                    <span className={heroStyles.awaitingBadge}>{school.customBadge || "Awaiting Lists"}</span>
                                  )}
                                  {school.isPartner ? (
                                    <span className={heroStyles.partnerBadge}>★ Official Partner ★</span>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                            <Link
                              href={`/schools/${school.slug}`}
                              className={heroStyles.heroResultLink}
                              aria-label={`View ${school.name} packs in ${formatSchoolSearchLocation(school)}`}
                              onClick={() =>
                                trackSchoolResultSelected({
                                  source: "schools",
                                  schoolSlug: school.slug,
                                  position: index + 1,
                                  placement: "result",
                                })
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
                  ) : (
                    <div className={heroStyles.noResultsState}>
                      <p className={heroStyles.heroSearchState}>No matching schools found.</p>
                    </div>
                  )}
                  {results.length === 0 ? (
                    <div className={heroStyles.searchCatchall}>
                      <p className={heroStyles.searchCatchallEyebrow}>Edge case? Covered.</p>
                      <p className={heroStyles.searchCatchallText}>
                        Don&rsquo;t see your school? Upload your stationery list or send it to us on WhatsApp and we&rsquo;ll pack every item exactly as specified.
                      </p>
                      <div className={heroStyles.searchCatchallActions}>
                        <Link
                          href="/order"
                          className={heroStyles.searchCatchallUpload}
                          onClick={() =>
                            trackSchoolNoResultsRecovery({ source: "schools" })
                          }
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
        </div>
        <SchoolsHowItWorks className={styles.mobileHowItWorks} />
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
