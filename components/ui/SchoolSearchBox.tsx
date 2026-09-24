"use client";

import { ChevronDown, MoveHorizontal, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
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
import {
  getRecentSchoolVisits,
  saveSchoolVisit,
  RECENT_SCHOOL_VISITS_EVENT,
} from "@/components/schools/schoolVisitTracker";
import {
  rankHybridSchools,
  type HybridSchoolItem,
} from "@/lib/schools/hybridSchoolRanking";
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

const RECENT_CHIP_CLASSES =
  "shrink-0 snap-start inline-flex items-center gap-2.5 " +
  "py-2 px-3.5 sm:px-4 rounded-2xl " +
  "bg-teal-50/70 border-2 border-pex-keppel/50 ring-1 ring-pex-keppel/20 " +
  "text-pex-navy font-bold text-xs sm:text-[13px] " +
  "shadow-[0_2px_8px_rgba(26,122,119,0.08)] " +
  "hover:!border-pex-keppel hover:bg-teal-50 hover:shadow-[0_4px_14px_rgba(26,122,119,0.18)] " +
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
    HybridSchoolItem[]
  >([]);
  const [hasRecentVisits, setHasRecentVisits] = useState(false);
  const rawServerSchoolsRef = useRef<HybridSchoolItem[]>([]);
  const trendingFetched = useRef(false);
  const urlQueryApplied = useRef(false);
  const trendingStripRef = useRef<HTMLDivElement>(null);
  const trendingProgressRef = useRef<HTMLDivElement>(null);
  const chipDragRef = useRef<{ pointerId: number; startX: number; startScrollLeft: number } | null>(null);
  const progressDragRef = useRef<number | null>(null);
  const chipDragMovedRef = useRef(false);
  const [trendingProgress, setTrendingProgress] = useState(0);

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

  const applyHybridRanking = useCallback((serverResults: HybridSchoolItem[]) => {
    const recents = getRecentSchoolVisits();
    const { rankedSchools, hasRecent } = rankHybridSchools(
      serverResults,
      recents,
      8,
    );
    setTrendingSchools(rankedSchools);
    setHasRecentVisits(hasRecent);
  }, []);

  /* Fetch trending schools on mount and rank using edge IP + behavioral recents */
  useEffect(() => {
    if (trendingFetched.current) return;
    trendingFetched.current = true;

    void fetch("/api/schools/search?limit=8")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data?.results) && data.results.length > 0) {
          rawServerSchoolsRef.current = data.results;
          applyHybridRanking(data.results);
        }
      })
      .catch(() => {});
  }, [applyHybridRanking]);

  /* Re-rank reactively whenever localStorage visits are updated */
  useEffect(() => {
    function handleVisitsUpdate() {
      if (rawServerSchoolsRef.current.length > 0) {
        applyHybridRanking(rawServerSchoolsRef.current);
      }
    }

    window.addEventListener(RECENT_SCHOOL_VISITS_EVENT, handleVisitsUpdate);
    window.addEventListener("storage", handleVisitsUpdate);
    return () => {
      window.removeEventListener(RECENT_SCHOOL_VISITS_EVENT, handleVisitsUpdate);
      window.removeEventListener("storage", handleVisitsUpdate);
    };
  }, [applyHybridRanking]);

  const searchActive = panelOpen;

  function updateTrendingProgress() {
    const strip = trendingStripRef.current;
    if (!strip) return;

    const maxScroll = strip.scrollWidth - strip.clientWidth;
    setTrendingProgress(
      maxScroll > 0 ? Math.min(1, Math.max(0, strip.scrollLeft / maxScroll)) : 1,
    );
  }

  function seekTrendingProgress(clientX: number) {
    const strip = trendingStripRef.current;
    const track = trendingProgressRef.current;
    if (!strip || !track) return;

    const maxScroll = strip.scrollWidth - strip.clientWidth;
    if (maxScroll <= 0) {
      strip.scrollLeft = 0;
      return;
    }

    const bounds = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - bounds.left) / bounds.width));
    strip.scrollLeft = ratio * maxScroll;
  }

  function handleChipPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const strip = event.currentTarget;
    chipDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: strip.scrollLeft,
    };
    chipDragMovedRef.current = false;
    strip.setPointerCapture(event.pointerId);
  }

  function handleChipPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = chipDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const strip = event.currentTarget;
    const deltaX = event.clientX - drag.startX;
    if (Math.abs(deltaX) > 4) chipDragMovedRef.current = true;
    strip.scrollLeft = drag.startScrollLeft - deltaX;
  }

  function handleChipPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (chipDragRef.current?.pointerId === event.pointerId) {
      chipDragRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      window.setTimeout(() => {
        chipDragMovedRef.current = false;
      }, 0);
    }
  }

  function handleProgressPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    progressDragRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    seekTrendingProgress(event.clientX);
  }

  function handleProgressPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (progressDragRef.current === event.pointerId) {
      seekTrendingProgress(event.clientX);
    }
  }

  function handleProgressPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (progressDragRef.current === event.pointerId) {
      progressDragRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    }
  }

  function handleTrendingWheel(event: ReactWheelEvent<HTMLDivElement>) {
    const strip = event.currentTarget;
    const maxScroll = strip.scrollWidth - strip.clientWidth;
    if (maxScroll <= 0 || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

    event.preventDefault();
    strip.scrollLeft += event.deltaY;
  }

  useEffect(() => {
    const strip = trendingStripRef.current;
    if (!strip) return;

    updateTrendingProgress();
    strip.addEventListener("scroll", updateTrendingProgress, { passive: true });

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateTrendingProgress)
        : null;
    observer?.observe(strip);

    return () => {
      strip.removeEventListener("scroll", updateTrendingProgress);
      observer?.disconnect();
    };
  }, [trendingSchools.length, query.length < 3]);

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

  function handleSchoolSelected(
    schoolSlug: string,
    position: number,
    placement: "result" | "trending",
    meta?: {
      name?: string;
      image?: string | null;
      city?: string;
      grade?: string;
    },
  ) {
    if (meta?.name) {
      saveSchoolVisit({
        schoolName: meta.name,
        schoolSlug,
        image: meta.image,
        city: meta.city,
        grade: meta.grade,
        gradeSlug: meta.grade
          ? meta.grade.toLowerCase().replace(/\s+/g, "-")
          : undefined,
      });
    }
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
          }}
          aria-hidden="true"
        />,
        document.body,
      )}


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
        {query.length < 3 && trendingSchools.length > 0 ? (
          <div className="mt-3 min-w-0">
            <span className="block mb-1.5 px-1 text-pex-navy/50 text-xs font-extrabold uppercase tracking-wider">
              {hasRecentVisits ? "Trending & Recent For You" : "Trending Schools Near You"}
            </span>
            <div className="relative">
              <div
                id={source + "-trending-school-strip"}
                ref={trendingStripRef}
                className="flex gap-2 overflow-x-auto snap-x snap-mandatory pt-2.5 pb-3 px-1.5 -mx-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing select-none touch-pan-x"
                onWheel={handleTrendingWheel}
                onPointerDown={handleChipPointerDown}
                onPointerMove={handleChipPointerMove}
                onPointerUp={handleChipPointerUp}
                onPointerCancel={handleChipPointerUp}
                onPointerLeave={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    return;
                  }
                  chipDragRef.current = null;
                }}
              >
                {trendingSchools.map((school, index) => {
                  const isRecent = Boolean(school.isRecent);
                  return (
                    <Link
                      key={school.slug}
                      href={"/schools/" + school.slug}
                      className={isRecent ? RECENT_CHIP_CLASSES : CHIP_CLASSES}
                      data-conversion-event={
                        source + (isRecent ? "_recent_school" : "_trending_school")
                      }
                    onClick={(event) => {
                      if (chipDragMovedRef.current) {
                        event.preventDefault();
                        chipDragMovedRef.current = false;
                        return;
                      }
                      saveSchoolVisit({
                        schoolName: school.name,
                        schoolSlug: school.slug,
                        image: school.image,
                        city: school.city,
                      });
                      handleSchoolSelected(school.slug, index + 1, "trending");
                    }}
                  >
                    {school.image ? (
                      <Image
                        src={school.image}
                        alt={school.name + " logo"}
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
                        title={school.name + " logo"}
                      />
                    )}
                    <span className="text-xs font-bold text-pex-navy whitespace-nowrap">
                      {school.name}
                    </span>
                    {isRecent ? (
                      <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-pex-keppel/15 text-pex-keppel text-[9px] font-extrabold uppercase tracking-wider">
                        Recent
                      </span>
                    ) : null}
                  </Link>
                );
              })}
              </div>
              <div
                ref={trendingProgressRef}
                role="scrollbar"
                tabIndex={0}
                aria-controls={source + "-trending-school-strip"}
                aria-label="Browse trending schools"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(trendingProgress * 100)}
                title="Drag to browse trending schools"
                className="relative h-2 mx-1.5 mt-0.5 overflow-visible rounded-full bg-pex-keppel/20 cursor-ew-resize touch-none select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pex-keppel/40"
                onPointerDown={handleProgressPointerDown}
                onPointerMove={handleProgressPointerMove}
                onPointerUp={handleProgressPointerUp}
                onPointerCancel={handleProgressPointerUp}
                onKeyDown={(event) => {
                  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                  event.preventDefault();
                  const strip = trendingStripRef.current;
                  if (!strip) return;
                  strip.scrollBy({
                    left: (event.key === "ArrowRight" ? 1 : -1) * strip.clientWidth * 0.75,
                    behavior: "smooth",
                  });
                }}
              >
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-pex-keppel transition-[width] duration-100 ease-out"
                  style={{ width: (Math.max(0.08, trendingProgress) * 100) + "%" }}
                />
                <span
                  className="pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-pex-keppel shadow-[0_1px_4px_rgba(15,37,55,0.22)] transition-[left] duration-100 ease-out"
                  style={{ left: (Math.max(0.08, trendingProgress) * 100) + "%" }}
                />
              </div>
              <div className="hidden lg:flex items-center justify-end gap-1 px-1 mt-1 text-[10px] font-medium text-pex-navy/45">
                <MoveHorizontal size={12} strokeWidth={2} aria-hidden="true" />
                <span>Drag to browse</span>
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
                                          { name: school.name, image: school.image, city: school.city },
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
                                          "result", { name: school.name, image: school.image, city: school.city, grade: g },
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
                                          "result", { name: school.name, image: school.image, city: school.city, grade: g },
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
                                "result", { name: school.name, image: school.image, city: school.city },
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