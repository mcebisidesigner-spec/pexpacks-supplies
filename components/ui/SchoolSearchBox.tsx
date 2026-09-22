"use client";

import { ChevronDown, MapPin, ShieldCheck, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePaginatedSchoolSearch } from "@/hooks/usePaginatedSchoolSearch";
import { SchoolResultsAutoLoad } from "@/components/schools/SchoolResultsAutoLoad";
import { SearchHelperPill } from "@/components/ui/SearchHelperPill";
import { SchoolLogoPlaceholder } from "@/components/schools/SchoolLogoPlaceholder";
import { formatSchoolSearchLocation } from "@/lib/schools/searchPresentation";
import {
  trackSchoolNoResultsRecovery,
  trackSchoolResultSelected,
} from "@/lib/analytics";
import { DEFAULT_PACKS_BADGE } from "@/lib/public-data/contracts";
import { cn } from "@/lib/utils";

/* --- Utility ------------------------------------------------------------- */

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-[#faeedd] text-inherit rounded-xs px-1 font-bold border border-[#f0dfc6]">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

/* --- Types --------------------------------------------------------------- */

export type SchoolSearchSource = "home" | "tray" | "schools";

export type SchoolSearchBoxProps = {
  /** Which surface this box lives on - controls analytics and search options. */
  source?: SchoolSearchSource;
  /** Called when a result is selected (e.g. close the tray). */
  onResultClick?: () => void;
  /** Show the browse-all-schools link below the card. */
  showBrowseLink?: boolean;
  /** Pre-populate the query from the URL `?q=` param (schools page). */
  readQueryFromUrl?: boolean;
  /** Extra className applied to the outermost wrapper. */
  className?: string;
};

const resultLimit = 12;

/* Shared search-card shell classes */
const CARD_CLASSES =
  "relative z-[1201] w-full p-4 sm:p-5 " +
  "border border-pex-keppel/15 " +
  "rounded-[28px] md:rounded-[34px] " +
  "bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,252,252,0.94))] " +
  "shadow-[0_24px_58px_rgba(26,42,64,0.13),inset_0_1px_0_rgba(255,255,255,0.95)] " +
  "flex flex-col min-w-0 transition-all duration-200";

const INPUT_CLASSES =
  "min-w-0 w-full min-h-[64px] sm:min-h-[70px] " +
  "border-2 border-slate-200/90 hover:border-pex-keppel/60 focus:border-pex-keppel " +
  "rounded-2xl md:rounded-[22px] outline-none " +
  "bg-white text-pex-navy " +
  "text-lg sm:text-xl font-bold leading-tight " +
  "px-5 sm:px-6 pr-12 " +
  "transition-all duration-200 " +
  "shadow-[0_2px_8px_rgba(26,42,64,0.04),inset_0_1px_2px_rgba(26,42,64,0.02)] " +
  "focus:ring-4 focus:ring-pex-keppel/15 " +
  "placeholder:text-pex-navy/40 placeholder:text-base sm:placeholder:text-lg placeholder:font-normal " +
  "[&::-webkit-search-cancel-button]:hidden " +
  "[&::-webkit-search-decoration]:hidden " +
  "[&::-webkit-search-results-button]:hidden " +
  "[&::-webkit-search-results-decoration]:hidden";

const CHIP_CLASSES =
  "shrink-0 snap-start inline-flex items-center gap-2.5 " +
  "py-2 px-3.5 sm:px-4 rounded-2xl " +
  "bg-white border-2 border-slate-200/90 " +
  "text-pex-navy font-bold text-xs sm:text-[13px] " +
  "shadow-[0_2px_6px_rgba(26,42,64,0.04)] " +
  "hover:!border-pex-keppel hover:text-pex-navy hover:bg-white hover:shadow-[0_4px_14px_rgba(26,122,119,0.18)] " +
  "transition-all duration-200 hover:-translate-y-0.5 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pex-keppel/40 focus-visible:!border-pex-keppel " +
  "cursor-pointer no-underline select-none";

/* Section */

export function SchoolSearchBox({
  source = "home",
  onResultClick,
  showBrowseLink = false,
  readQueryFromUrl = false,
  className,
}: SchoolSearchBoxProps) {
  const [mounted, setMounted] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [trendingSchools, setTrendingSchools] = useState<
    { name: string; slug: string; image?: string | null }[]
  >([]);
  const [trendingVisible, setTrendingVisible] = useState(false);
  const trendingFetched = useRef(false);
  const urlQueryApplied = useRef(false);
  const [locationPromptOpen, setLocationPromptOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    phaseAllValue: source === "schools" ? "all" : "",
    resultLimit,
    searchSource: source,
    errorMessage:
      source === "schools"
        ? "We couldn't load the school list. Please refresh or contact Pexpacks."
        : "We couldn't search schools right now. Please try again.",
  });

  const locationStorageKey = `Pexpacks:location-consent:${source}`;

  const fetchDefaultSchools = useCallback(() => {
    void fetch(`/api/schools/search?limit=8`)
      .then((response) => response.json())
      .then((data) => {
        if (data.results) {
          setTrendingSchools(data.results);
          setTrendingVisible(true);
        }
      })
      .catch(() => {});
  }, []);

  const fetchNearbySchools = useCallback(() => {
    if (!("geolocation" in navigator)) {
      fetchDefaultSchools();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        void fetch(`/api/schools/search?limit=8&lat=${latitude}&lng=${longitude}`)
          .then((response) => response.json())
          .then((data) => {
            if (data.results?.length > 0) {
              setTrendingSchools(data.results);
              setTrendingVisible(true);
            } else {
              fetchDefaultSchools();
            }
          })
          .catch(fetchDefaultSchools);
      },
      () => fetchDefaultSchools(),
      { timeout: 4000, maximumAge: 120000 },
    );
  }, [fetchDefaultSchools]);

  const handleLocationAllow = () => {
    window.sessionStorage.setItem(locationStorageKey, "allowed");
    setLocationPromptOpen(false);
    fetchNearbySchools();
  };

  const handleLocationSkip = () => {
    window.sessionStorage.setItem(locationStorageKey, "skipped");
    setLocationPromptOpen(false);
    fetchDefaultSchools();
  };

  const searchActive = panelOpen;

  /* Sync from URL ?q= on schools page */
  useEffect(() => {
    if (!readQueryFromUrl || urlQueryApplied.current) return;
    urlQueryApplied.current = true;
    const q = new URLSearchParams(window.location.search).get("q")?.trim();
    if (q) updateQuery(q);
  }, [readQueryFromUrl, updateQuery]);

  /* Click-outside to close */
  useEffect(() => {
    if (!panelOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (!searchRef.current?.contains(e.target as Node)) {
        setPanelOpen(false);
        setIsInputFocused(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [panelOpen, setPanelOpen]);

  /* Ask first, then request browser location permission only after clear consent. */
  useEffect(() => {
    if (trendingFetched.current || query.length >= 3) return;
    trendingFetched.current = true;

    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      fetchDefaultSchools();
      return;
    }

    let cancelled = false;
    const resolveLocationAccess = async () => {
      try {
        const permission = await navigator.permissions?.query({
          name: "geolocation",
        });
        if (cancelled) return;

        const alreadyHandled = window.sessionStorage.getItem(locationStorageKey);
        if (permission?.state === "granted") {
          fetchNearbySchools();
        } else if (permission?.state === "denied" || alreadyHandled) {
          fetchDefaultSchools();
        } else {
          setLocationPromptOpen(true);
        }
      } catch {
        if (!window.sessionStorage.getItem(locationStorageKey)) {
          setLocationPromptOpen(true);
        } else {
          fetchDefaultSchools();
        }
      }
    };

    void resolveLocationAccess();
    return () => {
      cancelled = true;
    };
  }, [fetchDefaultSchools, fetchNearbySchools, locationStorageKey, query]);
  function handleSchoolSelected(
    schoolSlug: string,
    position: number,
    placement: "result" | "trending",
  ) {
    trackSchoolResultSelected({ source, schoolSlug, position, placement });
    onResultClick?.();
  }

  /* Tray context: compact input on mobile when active */
  const inputMobileActive =
    searchActive
      ? "max-lg:min-h-[48px] max-lg:text-base max-lg:border-pex-keppel max-lg:rounded-2xl"
      : "";

  /* Helper-pill storage key per surface */
  const helperStorageKey =
    source === "schools"
      ? "Pexpacks:gauteng-helper:schools"
      : source === "tray"
        ? "Pexpacks:gauteng-helper:tray"
        : "Pexpacks:gauteng-helper:home";

  /* Input id must be unique per surface so label htmlFor works */
  const inputId =
    source === "schools"
      ? "schoolQuery"
      : source === "tray"
        ? "traySchoolQuery"
        : "homeSchoolQuery";

  return (
    <div
      className={cn(
        "relative z-0 w-full max-w-[760px] mt-6 md:mt-[26px] flex flex-col min-w-0",
        source === "schools" && "max-w-[1120px] mt-6",
        searchActive && "relative z-[1200]",
        className,
      )}
    >
      {/* Full-screen backdrop overlay for homepage and schools directory */}
      {mounted && searchActive && source !== "tray" && createPortal(
        <div
          className="fixed inset-0 z-[1100] bg-slate-950/65 backdrop-blur-[3px] transition-opacity duration-300 animate-in fade-in cursor-pointer"
          onClick={() => {
            setPanelOpen(false);
            setIsInputFocused(false);
            setTrendingVisible(false);
          }}
          aria-hidden="true"
        />,
        document.body,
      )}

      {mounted && locationPromptOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-[1500] flex items-center justify-center bg-pex-navy/45 p-4 backdrop-blur-sm"
              role="presentation"
            >
              <section
                className="w-full max-w-md overflow-hidden rounded-3xl border border-white/80 bg-white shadow-[0_24px_80px_rgba(15,35,58,0.28)]"
                role="dialog"
                aria-modal="true"
                aria-labelledby="location-permission-title"
                aria-describedby="location-permission-description"
              >
                <div className="flex items-start justify-between gap-4 bg-pex-navy px-5 py-4 text-white sm:px-6">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-pex-keppel text-white shadow-sm">
                      <MapPin className="size-5" strokeWidth={2.4} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="m-0 text-xs font-bold uppercase tracking-[0.08em] text-teal-100">
                        Find schools faster
                      </p>
                      <p className="m-0 mt-1 text-sm font-semibold text-white">
                        Use your location
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLocationSkip}
                    className="grid size-9 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    aria-label="Close location prompt"
                  >
                    <X className="size-4" strokeWidth={2.4} aria-hidden="true" />
                  </button>
                </div>

                <div className="space-y-5 p-5 sm:p-6">
                  <div>
                    <h2
                      id="location-permission-title"
                      className="m-0 text-xl font-extrabold tracking-tight text-pex-navy sm:text-2xl"
                    >
                      Find your nearest school
                    </h2>
                    <p
                      id="location-permission-description"
                      className="m-0 mt-2 text-sm leading-relaxed text-slate-600"
                    >
                      Allowing location helps us sort nearby schools first and improve your search accuracy. You can still search for any school manually.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border border-pex-keppel/20 bg-pex-keppel/5 p-3.5">
                    <ShieldCheck className="mt-0.5 size-5 shrink-0 text-pex-keppel" strokeWidth={2.2} aria-hidden="true" />
                    <p className="m-0 text-xs font-medium leading-relaxed text-pex-navy">
                      This is optional. Your location is used to improve nearby school results and is not needed to use search.
                    </p>
                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-[1fr_auto]">
                    <button
                      type="button"
                      onClick={handleLocationAllow}
                      className="inline-flex h-11 items-center justify-center rounded-xl bg-pex-coral px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(255,111,89,0.22)] transition-all duration-150 hover:-translate-y-px hover:bg-pex-coral-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pex-coral focus-visible:ring-offset-2 active:translate-y-0"
                    >
                      Allow location
                    </button>
                    <button
                      type="button"
                      onClick={handleLocationSkip}
                      className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-pex-navy transition-all duration-150 hover:border-pex-keppel hover:text-pex-keppel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pex-keppel focus-visible:ring-offset-2 active:scale-[0.99]"
                    >
                      Not now
                    </button>
                  </div>
                </div>
              </section>
            </div>,
            document.body,
          )
        : null}

      {/* Search card */}
      <div
        ref={searchRef}
        role="search"
        data-mobile-search-active={searchActive ? "true" : "false"}
        className={cn(
          CARD_CLASSES,
          "order-1",
          searchActive &&
            "max-lg:fixed max-lg:top-[max(4px,env(safe-area-inset-top))] max-lg:left-2.5 max-lg:right-2.5 max-lg:z-[1205] max-lg:w-auto max-lg:p-3.5 sm:max-lg:p-[18px] max-lg:rounded-3xl max-lg:shadow-[0_18px_42px_rgba(12,26,43,0.22)]",
        )}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setPanelOpen(false);
            setIsInputFocused(false);
            setTrendingVisible(false);
          }
        }}
      >
        {/* Label + Input */}
        <label
          className="min-w-0 grid content-center gap-1.5 sm:gap-2 p-0 bg-transparent"
          htmlFor={inputId}
        >
          <span className="text-pex-navy text-sm sm:text-base font-bold leading-tight pl-1">
            School Name
          </span>
          <div className="relative w-full flex items-center">
            <input
              id={inputId}
              name="schoolQuery"
              type="search"
              placeholder="Type your school name..."
              autoComplete="off"
              value={query}
              onFocus={() => {
                setIsInputFocused(true);
                setTrendingVisible(true);
              }}
              onBlur={() => setIsInputFocused(false)}
              onChange={(e) => updateQuery(e.target.value)}
              className={cn(INPUT_CLASSES, inputMobileActive)}
            />
            {query ? (
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-8 h-8 border-none bg-transparent hover:bg-pex-navy/10 text-pex-navy cursor-pointer rounded-full z-10 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateQuery("");
                }}
                aria-label="Clear school name"
              >
                <X className="size-3.5" strokeWidth={2.6} aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </label>

        {/* Trending chips */}
        {trendingVisible && query.length < 3 && trendingSchools.length > 0 ? (
          <div className="mt-3 min-w-0">
            <span className="block mb-1.5 px-1 text-pex-navy/50 text-xs font-extrabold uppercase tracking-wider">
              Trending Near You
            </span>
            {/* Scrollable chip strip with vertical padding to prevent hover border clipping */}
            <div className="relative">
              <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pt-2.5 pb-3 px-1.5 -mx-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {trendingSchools.map((school, index) => (
                  <Link
                    key={school.slug}
                    href={`/schools/${school.slug}`}
                    className={CHIP_CLASSES}
                    data-conversion-event={`${source}_trending_school`}
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
                        className="rounded-md object-cover shrink-0 aspect-square"
                        style={{ aspectRatio: "1 / 1" }}
                      />
                    ) : (
                      <SchoolLogoPlaceholder
                        className="rounded-md object-cover shrink-0"
                        width={28}
                        height={28}
                        title={`${school.name} logo`}
                      />
                    )}
                    <span className="text-xs font-bold text-pex-navy whitespace-nowrap">
                      {school.name}
                    </span>
                  </Link>
                ))}
              </div>
              {/* Teal scroll indicator bar */}
              <div
                className="h-[3px] rounded-full bg-pex-keppel/30 mt-0.5 overflow-hidden"
                aria-hidden="true"
              >
                <div className="h-full w-[42%] bg-pex-keppel rounded-full" />
              </div>
            </div>
          </div>
        ) : null}

        {/* Results panel */}
        {panelOpen ? (
          <div
            id={`${source}-school-search-results`}
            aria-live="polite"
            data-school-results-scroll
            className={cn(
              "absolute z-[1210] inset-x-0 top-[calc(100%+10px)] md:top-[calc(100%+12px)] w-full max-h-[min(70dvh,520px)] overflow-y-auto p-3 sm:p-4 border border-pex-border/80 rounded-3xl bg-white md:bg-[linear-gradient(180deg,#ffffff,#f9fcfc)] shadow-[0_24px_58px_rgba(26,42,64,0.18)] [animation:schoolResultsIn_0.2s_ease-out_both] [scrollbar-color:var(--pex-keppel)_#f1f5f9] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-pex-keppel [&::-webkit-scrollbar-thumb]:rounded-full",
              searchActive &&
                "max-lg:fixed max-lg:top-[calc(max(4px,env(safe-area-inset-top))+80px)] max-lg:bottom-[max(10px,env(safe-area-inset-bottom))] max-lg:inset-x-2.5 max-lg:z-[1210] max-lg:w-auto max-lg:max-h-none max-lg:p-4 max-lg:pt-3 max-lg:pb-5 max-lg:rounded-3xl max-lg:shadow-[0_16px_48px_rgba(12,26,43,0.18)] max-lg:overscroll-contain",
            )}
          >
            {/* Mobile close button */}
            <button
              className="sticky top-0 z-10 w-9 h-9 min-w-9 min-h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 shadow-sm flex lg:hidden items-center justify-center cursor-pointer mb-3"
              type="button"
              aria-label="Close school search results"
              onClick={() => {
                setPanelOpen(false);
                setIsInputFocused(false);
                setTrendingVisible(false);
              }}
            >
              <X className="size-3.5 text-slate-900" strokeWidth={2.2} aria-hidden="true" />
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
                  <strong className="text-pex-navy font-extrabold text-sm sm:text-base">
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
                          key={school.id}
                          className="p-3.5 sm:p-4 md:px-4.5 rounded-2xl bg-white border-2 border-slate-200/80 shadow-[0_2px_8px_rgba(26,42,64,0.04)] grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] items-stretch md:items-center gap-3 md:gap-4 hover:border-pex-keppel transition-all"
                        >
                          <div className="min-w-0 grid gap-2.5 md:gap-2">
                            <div className="flex items-start gap-3">
                              {school.image ? (
                                <Image
                                  src={school.image}
                                  alt={`${school.name} logo`}
                                  className="shrink-0 w-9 h-9 rounded-lg object-contain bg-pex-bg mt-0.5 aspect-square"
                                  style={{ aspectRatio: "1 / 1" }}
                                  width={36}
                                  height={36}
                                />
                              ) : (
                                <SchoolLogoPlaceholder
                                  className="shrink-0 w-9 h-9 rounded-lg object-contain bg-pex-bg mt-0.5"
                                  width={36}
                                  height={36}
                                  title={`${school.name} logo`}
                                />
                              )}
                              <div className="min-w-0 grid gap-1">
                                <h3 className="m-0 text-pex-navy font-bold text-base sm:text-lg md:text-xl leading-tight">
                                  <Link
                                    href={`/schools/${school.slug}`}
                                    className="text-inherit no-underline hover:text-pex-keppel transition-colors"
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

                            {/* Grade + badge tags */}
                            <div className="min-w-0 flex flex-col md:flex-row md:items-center flex-wrap gap-2 sm:gap-2.5">
                              <div className="min-w-0 flex flex-wrap gap-1.5">
                                {/* Desktop: 4 grades */}
                                <div className="hidden md:flex flex-wrap items-center gap-1.5">
                                  {school.grades.slice(0, 4).map((g) => (
                                    <Link
                                      key={g}
                                      href={`/schools/${school.slug}`}
                                      className="px-2.5 py-0.5 rounded-full bg-transparent !text-pex-navy hover:!text-pex-keppel text-xs font-bold no-underline transition-all"
                                      onClick={() =>
                                        handleSchoolSelected(
                                          school.slug,
                                          index + 1,
                                          "result",
                                        )
                                      }
                                    >
                                      {g}
                                    </Link>
                                  ))}
                                  {school.grades.length > 4 && (
                                    <span className="px-1.5 py-0.5 text-muted-foreground text-xs font-bold">
                                      +{school.grades.length - 4} more
                                    </span>
                                  )}
                                </div>
                                {/* Mobile: 3 grades */}
                                <div className="flex md:hidden flex-wrap items-center gap-1.5">
                                  {school.grades.slice(0, 3).map((g) => (
                                    <Link
                                      key={g}
                                      href={`/schools/${school.slug}`}
                                      className="px-2.5 py-0.5 rounded-full bg-transparent !text-pex-navy hover:!text-pex-keppel text-xs font-bold no-underline transition-all"
                                      onClick={() =>
                                        handleSchoolSelected(
                                          school.slug,
                                          index + 1,
                                          "result",
                                        )
                                      }
                                    >
                                      {g}
                                    </Link>
                                  ))}
                                  {school.grades.length > 3 && (
                                    <span className="px-1.5 py-0.5 text-muted-foreground text-xs font-bold">
                                      +{school.grades.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="bg-[#faeedd] text-[#0f766e] border border-[#f0dfc6] py-1 px-3 rounded-full text-xs font-extrabold whitespace-nowrap">
                                  {school.customBadge || DEFAULT_PACKS_BADGE}
                                </span>
                                {school.isPartner && (
                                  <span className="bg-[#e0f5f2] text-[#0d9488] border border-teal-500/35 py-1 px-2.5 rounded-full text-xs font-extrabold inline-flex items-center gap-1 whitespace-nowrap">
                                    ★ Official Partner ★
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <Link
                            href={`/schools/${school.slug}`}
                            className="w-full md:w-auto min-h-[44px] md:min-h-[48px] px-5 rounded-full bg-pex-navy hover:bg-pex-navy/90 !text-white font-heading text-sm md:text-[15px] font-extrabold no-underline inline-flex items-center justify-center whitespace-nowrap transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                            aria-label={`View ${school.name} packs in ${formatSchoolSearchLocation(school)}`}
                            data-conversion-event={`${source}_school_result`}
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
                  <>
                    <div className="min-h-[78px] py-6 px-3 grid place-items-center text-center">
                      <p className="m-0 py-2.5 px-3 text-muted-foreground text-xs font-bold text-center">
                        No matching schools found.
                      </p>
                    </div>
                    <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-[rgba(255,111,89,0.05)] border border-[rgba(255,111,89,0.15)] text-left">
                      <p className="m-0 mb-1 text-pex-coral font-heading text-xs font-extrabold tracking-wider uppercase">
                        Edge case? Covered.
                      </p>
                      <p className="m-0 mb-3.5 text-pex-navy text-sm leading-relaxed font-semibold">
                        Don&rsquo;t see your school? Upload your stationery list
                        or send it to us on WhatsApp and we&rsquo;ll pack every
                        item exactly as specified.
                      </p>
                      <div className="flex justify-center">
                        <Link
                          href="/order"
                          className="inline-flex items-center min-h-[44px] sm:min-h-[48px] py-2.5 px-5 rounded-full bg-pex-coral hover:bg-pex-coral/90 !text-white font-heading text-sm font-extrabold no-underline transition-all hover:scale-[1.02]"
                          data-conversion-event={`${source}_upload_list`}
                          onClick={() => {
                            trackSchoolNoResultsRecovery({ source });
                            onResultClick?.();
                          }}
                        >
                          Upload Your School List
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Gauteng helper pill */}
      <SearchHelperPill
        storageKey={helperStorageKey}
        isInputFocused={isInputFocused}
        inputValue={query}
        className={cn(
          "order-0 md:order-2 mb-2 md:mb-0",
          source === "schools" && "order-2",
        )}
      />

{/* Section */}
      {showBrowseLink && (
        <a
          href="#browse-schools-heading"
          className="group order-3 mt-4 w-fit inline-flex items-center gap-2 px-4 py-2 border border-pex-navy/10 rounded-full bg-pex-bg text-pex-navy text-sm font-extrabold no-underline hover:border-pex-keppel hover:text-pex-keppel transition-all duration-200"
        >
          <span className="text-pex-navy/50 font-semibold">
            Can&rsquo;t remember the exact name?
          </span>
          Browse all schools
          <ChevronDown className="size-4 text-pex-keppel transition-transform duration-150 group-hover:translate-y-0.5" aria-hidden="true" />
        </a>
      )}
    </div>
  );
}