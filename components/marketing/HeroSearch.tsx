"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePaginatedSchoolSearch } from "@/hooks/usePaginatedSchoolSearch";
import { SchoolResultsAutoLoad } from "@/components/schools/SchoolResultsAutoLoad";
import { SearchHelperPill } from "@/components/ui/SearchHelperPill";

import { IMAGE_BLUR_DATA_URL } from "@/lib/constants";
import { formatSchoolSearchLocation } from "@/lib/schools/searchPresentation";
import { SchoolLogoPlaceholder } from "@/components/schools/SchoolLogoPlaceholder";
import {
  trackSchoolNoResultsRecovery,
  trackSchoolResultSelected,
} from "@/lib/analytics";
import { DEFAULT_PACKS_BADGE } from "@/lib/public-data/contracts";
import { cn } from "@/lib/utils";

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
      <span className="bg-[#faecd0] text-inherit font-inherit px-1 py-0.5 rounded">
        {match}
      </span>
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
  const [trendingSchools, setTrendingSchools] = useState<
    { name: string; slug: string; image?: string | null }[]
  >([]);
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
    <div className="relative w-full max-w-[760px] mt-6 md:mt-[26px] flex flex-col min-w-0 pex-search-focus-anchor">
      {searchActive && (
        <div className="fixed inset-0 z-[119] lg:z-10 bg-white/80 backdrop-blur-sm transition-opacity duration-300" />
      )}
      <div
        ref={searchRef}
        role="search"
        data-mobile-search-active={searchActive ? "true" : "false"}
        className={cn(
          "relative z-11 w-full max-w-[760px] order-1 p-3.5 sm:p-4 md:pl-5 border border-primary/10 rounded-[28px] md:rounded-[34px] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,252,252,0.94))] bg-background shadow-[0_24px_58px_rgba(26,42,64,0.13),inset_0_1px_0_rgba(255,255,255,0.95)] flex flex-col min-w-0 transition-all duration-200",
          searchActive &&
            "max-lg:fixed max-lg:top-[max(4px,env(safe-area-inset-top))] max-lg:left-2.5 max-lg:right-2.5 max-lg:z-[1000] max-lg:w-auto max-lg:p-3.5 sm:max-lg:p-[18px] max-lg:rounded-3xl max-lg:shadow-[0_18px_42px_rgba(12,26,43,0.22)]"
        )}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setPanelOpen(false);
            setIsSchoolInputFocused(false);
            setTrendingVisible(false);
          }
        }}
      >
        <label
          className="min-w-0 grid content-center gap-1.5 sm:gap-2 p-0 bg-transparent"
          htmlFor="homeSchoolQuery"
        >
          <span className="text-primary text-sm sm:text-base font-bold leading-tight pl-1">
            School Name
          </span>
          <div className="relative w-full flex items-center">
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
              className={cn(
                "min-w-0 w-full min-h-[58px] md:min-h-[72px] border-2 border-border focus:border-[#1a7a77] rounded-xl md:rounded-[22px] outline-none bg-background text-[#102a43] text-lg md:text-2xl font-bold leading-tight px-4 sm:px-5 pr-11 transition-all duration-200 shadow-[inset_0_2px_4px_rgba(26,42,64,0.04)] focus:ring-4 focus:ring-[#1a7a77]/15 placeholder:text-foreground/40 placeholder:font-medium [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden",
                searchActive &&
                  "max-lg:min-h-[48px] max-lg:text-base max-lg:border-[#1a7a77] max-lg:rounded-2xl"
              )}
            />
            {query ? (
              <button
                type="button"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-7 h-7 border-none bg-transparent hover:bg-[#1e3a5f]/10 text-[#1e3a5f] cursor-pointer rounded-full z-10 transition-colors"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  updateQuery("");
                }}
                aria-label="Clear school name"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                  className="w-3.5 h-3.5 stroke-current stroke-[2.6] stroke-linecap-round"
                >
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            ) : null}
          </div>
        </label>

        {trendingVisible && query.length < 3 && trendingSchools.length > 0 ? (
          <div className="mt-3 min-w-0">
            <span className="block mb-2 px-1 text-muted-foreground text-xs font-extrabold uppercase tracking-wider">
              Trending Near You
            </span>
            <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 no-scrollbar">
              {trendingSchools.map((school, index) => (
                <Link
                  key={school.slug}
                  href={`/schools/${school.slug}`}
                  className="shrink-0 snap-start inline-flex items-center gap-2 py-2 px-3.5 rounded-2xl bg-background border border-border hover:border-[#1a7a77] transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer no-underline"
                  data-conversion-event="homepage_trending_school"
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
                      className="rounded-md object-cover shrink-0"
                    />
                  ) : (
                    <SchoolLogoPlaceholder
                      className="rounded-md object-cover shrink-0"
                      width={28}
                      height={28}
                      title={`${school.name} logo`}
                    />
                  )}
                  <span className="text-xs font-bold text-[#102a43] whitespace-nowrap">
                    {school.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {panelOpen ? (
          <div
            id="school-search-results"
            aria-live="polite"
            data-school-results-scroll
            className={cn(
              "absolute z-12 inset-x-0 top-[calc(100%+10px)] md:top-[calc(100%+12px)] w-full max-h-[min(70dvh,520px)] overflow-y-auto p-3 sm:p-4 border border-border/80 rounded-3xl bg-background shadow-[0_24px_58px_rgba(26,42,64,0.16)] [animation:schoolResultsIn_0.2s_ease-out_both]",
              searchActive &&
                "max-lg:fixed max-lg:top-[calc(max(4px,env(safe-area-inset-top))+80px)] max-lg:bottom-[max(10px,env(safe-area-inset-bottom))] max-lg:inset-x-2.5 max-lg:w-auto max-lg:max-h-none max-lg:p-4 max-lg:pt-3 max-lg:pb-5 max-lg:rounded-3xl max-lg:bg-white max-lg:shadow-[0_16px_48px_rgba(12,26,43,0.18)] max-lg:overscroll-contain"
            )}
          >
            <button
              className="sticky top-0 z-10 w-9 h-9 min-w-9 min-h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 shadow-sm flex lg:hidden items-center justify-center cursor-pointer mb-3"
              type="button"
              aria-label="Close school search results"
              onClick={() => {
                setPanelOpen(false);
                setIsSchoolInputFocused(false);
                setTrendingVisible(false);
              }}
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
                className="w-3.5 h-3.5 stroke-slate-900 stroke-[2.2] stroke-linecap-round fill-none"
              >
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
            {!hasSearched && isLoading ? (
              <p className="m-0 py-2.5 px-3 text-muted-foreground text-xs font-bold text-center">
                Loading schools...
              </p>
            ) : null}
            {error ? (
              <p
                className="m-0 rounded-lg py-3 px-3.5 bg-white/85 text-destructive text-sm font-extrabold leading-snug"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            {!isLoading && queryReady && hasSearched && !error ? (
              <>
                <div className="mb-3.5 px-1 flex items-center justify-between gap-4 text-muted-foreground font-bold text-xs sm:text-sm">
                  <strong className="text-primary font-extrabold text-sm sm:text-base">
                    {total === 1 ? "1 school found" : `${total} schools found`}
                  </strong>
                  {total > 0 ? (
                    <span className="text-muted-foreground text-xs sm:text-sm font-semibold">
                      Showing {results.length} of {total}
                    </span>
                  ) : null}
                </div>
                {results.length > 0 ? (
                  <>
                    <div className="grid gap-3 sm:gap-2.5">
                      {results.map((school, index) => (
                        <article
                          className="p-3.5 sm:p-4 md:px-4.5 rounded-2xl bg-[#f5f9fb] border border-slate-200/60 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] items-stretch md:items-center gap-3 md:gap-4"
                          key={school.id}
                        >
                          <div className="min-w-0 grid gap-2.5 md:gap-2">
                            <div className="flex items-start gap-3">
                              {school.image ? (
                                <Image
                                  src={school.image}
                                  alt={`${school.name} logo`}
                                  className="shrink-0 w-9 h-9 rounded-lg object-contain bg-background mt-0.5"
                                  width={36}
                                  height={36}
                                  placeholder="blur"
                                  blurDataURL={IMAGE_BLUR_DATA_URL}
                                />
                              ) : (
                                <SchoolLogoPlaceholder
                                  className="shrink-0 w-9 h-9 rounded-lg object-contain bg-background mt-0.5"
                                  width={36}
                                  height={36}
                                  title={`${school.name} logo`}
                                />
                              )}
                              <div className="min-w-0 grid gap-1">
                                <h3 className="m-0 text-primary font-bold text-base sm:text-lg md:text-xl leading-tight">
                                  <Link
                                    href={`/schools/${school.slug}`}
                                    className="text-inherit no-underline hover:text-primary/80"
                                    onClick={() =>
                                      handleSchoolSelected(
                                        school.slug,
                                        index + 1,
                                        "result",
                                      )
                                    }
                                  >
                                    <HighlightMatch
                                      text={school.name}
                                      query={query}
                                    />
                                  </Link>
                                </h3>
                                <p className="m-0 text-muted-foreground text-xs sm:text-sm font-semibold">
                                  {formatSchoolSearchLocation(school)}
                                </p>
                              </div>
                            </div>
                            <div className="min-w-0 flex flex-col md:flex-row md:items-center flex-wrap gap-2 sm:gap-2.5">
                              <div className="min-w-0 flex flex-wrap gap-1.5">
                                <div className="hidden md:flex flex-wrap items-center gap-1.5">
                                  {school.grades
                                    .slice(0, 4)
                                    .map((schoolGrade) => (
                                      <Link
                                        key={schoolGrade}
                                        href={`/schools/${school.slug}`}
                                        className="px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-primary hover:text-white text-slate-800 text-xs font-bold no-underline transition-all"
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
                                    <span className="px-1.5 py-0.5 text-muted-foreground text-xs font-bold">
                                      +{school.grades.length - 4} more
                                    </span>
                                  ) : null}
                                </div>
                                <div className="flex md:hidden flex-wrap items-center gap-1.5">
                                  {school.grades
                                    .slice(0, 3)
                                    .map((schoolGrade) => (
                                      <Link
                                        key={schoolGrade}
                                        href={`/schools/${school.slug}`}
                                        className="px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-primary hover:text-white text-slate-800 text-xs font-bold no-underline transition-all"
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
                                  {school.grades.length > 3 ? (
                                    <span className="px-1.5 py-0.5 text-muted-foreground text-xs font-bold">
                                      +{school.grades.length - 3} more
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="bg-[#faeedd] text-[#0f766e] border border-[#f0dfc6] py-1 px-3 rounded-full text-xs font-extrabold">
                                  {school.customBadge || DEFAULT_PACKS_BADGE}
                                </span>
                                {school.isPartner ? (
                                  <span className="bg-[#e0f5f2] text-[#0d9488] border border-teal-500/35 py-1 px-2.5 rounded-full text-xs font-extrabold">
                                    ★ Official Partner ★
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                          <Link
                            href={`/schools/${school.slug}`}
                            className="w-full md:w-auto min-h-[44px] md:min-h-[48px] px-5 rounded-full bg-primary hover:bg-primary/90 text-white font-heading text-sm md:text-[15px] font-extrabold no-underline inline-flex items-center justify-center whitespace-nowrap transition-all hover:scale-[1.02] active:scale-[0.98]"
                            aria-label={`View ${school.name} packs in ${formatSchoolSearchLocation(school)}`}
                            data-conversion-event="homepage_school_result"
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
                      className="w-full h-px pointer-events-none"
                    />
                    {hasMore && !isLoading ? (
                      <button
                        className="w-full mt-3 min-h-[44px] py-2.5 px-4 border-0 rounded-full bg-primary hover:bg-primary/90 text-white font-heading font-extrabold flex items-center justify-center transition-all cursor-pointer"
                        type="button"
                        onClick={() => fetchResults(results.length, "append")}
                      >
                        Load more schools
                      </button>
                    ) : null}
                  </>
                ) : (
                  <div className="min-h-[78px] py-6 px-3 grid place-items-center text-center">
                    <p className="m-0 py-2.5 px-3 text-muted-foreground text-xs font-bold text-center">
                      No matching schools found.
                    </p>
                  </div>
                )}
                {results.length === 0 ? (
                  <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-[rgba(255,111,89,0.05)] border border-[rgba(255,111,89,0.15)] text-left">
                    <p className="m-0 mb-1 text-[#ff6f59] font-heading text-xs font-extrabold tracking-wider uppercase">
                      Edge case? Covered.
                    </p>
                    <p className="m-0 mb-3.5 text-[#102a43] text-sm leading-relaxed font-semibold">
                      Don&rsquo;t see your school? Upload your stationery list or
                      send it to us on WhatsApp and we&rsquo;ll pack every item
                      exactly as specified.
                    </p>
                    <div className="flex justify-center">
                      <Link
                        href="/order"
                        className="inline-flex items-center min-h-[44px] sm:min-h-[48px] py-2.5 px-5 rounded-full bg-[#ff6f59] hover:bg-[#ff6f59]/90 text-white font-heading text-sm font-extrabold no-underline transition-all hover:scale-[1.02]"
                        data-conversion-event="homepage_upload_list"
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
          <p
            className="m-0 rounded-lg py-3 px-3.5 bg-white/85 text-destructive text-sm font-extrabold leading-snug"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </div>
      <SearchHelperPill
        storageKey="Pexpacks:gauteng-helper:home"
        isInputFocused={isSchoolInputFocused}
        inputValue={query}
        className="order-0 md:order-2 mb-2 md:mb-0"
      />
    </div>
  );
}
