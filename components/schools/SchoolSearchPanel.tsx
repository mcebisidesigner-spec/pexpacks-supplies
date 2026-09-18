"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

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
import { DEFAULT_PACKS_BADGE } from "@/lib/public-data/contracts";

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
  const matched = text.slice(matchIndex, matchIndex + query.length);
  const after = text.slice(matchIndex + query.length);

  return (
    <>
      {before}
      <mark className="bg-[#fef08a] text-inherit rounded-xs px-0.5 font-bold">
        {matched}
      </mark>
      {after}
    </>
  );
}

export function SchoolSearchPanel({
  initialQuery = "",
  readQueryFromUrl = false,
}: SchoolSearchPanelProps) {
  const searchRef = useRef<HTMLDivElement>(null);
  const [isSchoolInputFocused, setIsSchoolInputFocused] = useState(false);
  const [trendingSchools, setTrendingSchools] = useState<
    { name: string; slug: string; image?: string | null }[]
  >([]);
  const [trendingVisible, setTrendingVisible] = useState(false);
  const trendingFetched = useRef(false);
  const urlQueryApplied = useRef(false);

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
    const queryFromUrl = new URLSearchParams(window.location.search)
      .get("q")
      ?.trim();
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
        { timeout: 4000, maximumAge: 120000 },
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
      className="w-full max-w-[1120px] mt-6 flex flex-col pex-school-search-focus-anchor"
    >
      {searchActive && (
        <div className="fixed inset-0 bg-[#101c2b]/60 backdrop-blur-xs z-[90] lg:hidden animate-in fade-in duration-200" />
      )}
      <div className="relative order-1">
        <div
          ref={searchRef}
          className="relative w-full"
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
            className="min-w-0 grid content-center gap-1.5 sm:gap-2 p-0 bg-transparent"
            htmlFor="schoolQuery"
          >
            <span className="text-primary text-sm sm:text-base font-bold leading-tight pl-1">
              School Name
            </span>
            <div className="relative w-full flex items-center">
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
                        className="rounded-md object-cover shrink-0"
                      />
                    ) : (
                      <SchoolLogoPlaceholder
                        className="rounded-md shrink-0"
                        width={28}
                        height={28}
                        title={`${school.name} logo`}
                      />
                    )}
                    <span className="text-[#102a43] text-sm font-bold whitespace-nowrap">
                      {school.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
          {panelOpen ? (
            <div
              className="fixed lg:absolute inset-0 lg:inset-auto lg:top-[calc(100%+14px)] lg:left-0 lg:right-0 z-[100] bg-white lg:rounded-3xl shadow-2xl lg:border lg:border-border p-4 sm:p-6 flex flex-col max-h-screen lg:max-h-[72vh] overflow-y-auto overscroll-contain animate-in fade-in zoom-in-95 duration-200"
              id="school-search-results"
              aria-live="polite"
              data-school-results-scroll
            >
              <button
                className="lg:hidden absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-slate-100 transition-colors"
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
                  className="w-5 h-5 stroke-current stroke-2 stroke-linecap-round"
                >
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
              {!hasSearched && isLoading ? (
                <p className="m-0 py-8 text-center text-muted-foreground text-sm sm:text-base font-semibold">
                  Loading schools...
                </p>
              ) : null}
              {error ? (
                <p className="m-0 py-4 text-center text-red-600 text-sm font-semibold" role="alert">
                  {error}
                </p>
              ) : null}
              {!isLoading && queryReady && hasSearched && !error ? (
                <>
                  <div className="flex items-center justify-between py-2 border-b border-border/60 text-sm font-bold text-muted-foreground mb-4">
                    <strong>
                      {total === 1
                        ? "1 school found"
                        : `${total} schools found`}
                    </strong>
                    {total > 0 ? (
                      <span>
                        Showing {results.length} of {total}
                      </span>
                    ) : null}
                  </div>
                  {results.length > 0 ? (
                    <>
                      <div className="grid gap-3">
                        {results.map((school, index) => (
                          <article
                            className="p-4 rounded-2xl border border-border/80 hover:border-[#1a7a77] bg-card hover:bg-card/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md"
                            key={school.id}
                          >
                            <div className="min-w-0 flex-1 flex flex-col gap-3">
                              <div className="flex items-center gap-3.5 min-w-0">
                                {school.image ? (
                                  <Image
                                    src={school.image}
                                    alt={`${school.name} logo`}
                                    className="rounded-xl object-cover shrink-0"
                                    width={36}
                                    height={36}
                                    placeholder="blur"
                                    blurDataURL={IMAGE_BLUR_DATA_URL}
                                  />
                                ) : (
                                  <SchoolLogoPlaceholder
                                    className="rounded-xl shrink-0"
                                    width={36}
                                    height={36}
                                    title={`${school.name} logo`}
                                  />
                                )}
                                <div className="min-w-0 flex-1">
                                  <h3 className="m-0 text-base sm:text-lg font-bold text-[#102a43] leading-snug">
                                    <Link
                                      href={`/schools/${school.slug}`}
                                      className="hover:text-[var(--pex-keppel)] transition-colors"
                                      onClick={() =>
                                        trackSchoolResultSelected({
                                          source: "schools",
                                          schoolSlug: school.slug,
                                          position: index + 1,
                                          placement: "result",
                                        })
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
                                    {school.grades.slice(0, 4).map((g) => (
                                      <Link
                                        key={g}
                                        href={`/schools/${school.slug}`}
                                        className="px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-primary hover:text-white text-slate-800 text-xs font-bold no-underline transition-all"
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
                                      <span className="px-1.5 py-0.5 text-muted-foreground text-xs font-bold">
                                        +{school.grades.length - 4} more
                                      </span>
                                    ) : null}
                                  </div>
                                  <div className="flex md:hidden flex-wrap items-center gap-1.5">
                                    {school.grades.slice(0, 3).map((g) => (
                                      <Link
                                        key={g}
                                        href={`/schools/${school.slug}`}
                                        className="px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-primary hover:text-white text-slate-800 text-xs font-bold no-underline transition-all"
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
                        onLoadMore={() =>
                          fetchResults(results.length, "append")
                        }
                        className="h-10 flex items-center justify-center text-muted-foreground text-xs"
                      />
                      {hasMore && !isLoading ? (
                        <button
                          className="mt-4 w-full py-3 rounded-xl border border-border bg-slate-50 hover:bg-slate-100 text-sm font-bold text-[#102a43] transition-colors cursor-pointer"
                          type="button"
                          onClick={() => fetchResults(results.length, "append")}
                        >
                          Load more schools
                        </button>
                      ) : null}
                    </>
                  ) : (
                    <div className="py-10 text-center">
                      <p className="m-0 text-muted-foreground text-base font-medium">
                        No matching schools found.
                      </p>
                    </div>
                  )}
                  {results.length === 0 ? (
                    <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-[#f0f9f8] border border-[#d0ece8] text-center">
                      <p className="m-0 text-[#0f766e] text-xs font-bold uppercase tracking-wider">
                        Edge case? Covered.
                      </p>
                      <p className="mt-2 text-sm text-[#102a43]/80 leading-relaxed">
                        Don&rsquo;t see your school? Upload your stationery list
                        or send it to us on WhatsApp and we&rsquo;ll pack every
                        item exactly as specified.
                      </p>
                      <div className="mt-4">
                        <Link
                          href="/order"
                          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-white font-heading text-sm font-bold no-underline transition-all hover:scale-[1.02] active:scale-[0.98]"
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
        <SchoolsHowItWorks className="block lg:hidden max-w-full mt-3 !px-0" />
      </div>

      <SearchHelperPill
        storageKey="Pexpacks:gauteng-helper:schools"
        isInputFocused={isSchoolInputFocused}
        inputValue={query}
        className="order-2"
      />

      <a
        href="#browse-schools-heading"
        className="group order-3 mt-4 w-fit inline-flex items-center gap-2 px-4 py-2 border border-[var(--color-navy-border)] rounded-full bg-[var(--pex-bg)] text-[var(--pex-primary)] text-sm font-extrabold no-underline hover:border-[var(--pex-keppel)] hover:text-[var(--pex-keppel)] transition-all duration-200"
      >
        <span className="text-[var(--pex-text-muted)] font-semibold">
          Can&rsquo;t remember the exact name?
        </span>
        Browse all schools
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="w-4 h-4 text-[var(--pex-keppel)] group-hover:translate-y-0.5 transition-transform duration-150"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </a>
    </section>
  );
}
