"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { SchoolSearchRecord } from "@/lib/schools/types";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  trackSchoolCardClicked,
  trackSchoolDirectoryBrowse,
} from "@/lib/analytics";

const LETTERS = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i),
);

type BrowseAllSchoolsProps = {
  schools: SchoolSearchRecord[];
};

function priceLabel(school: SchoolSearchRecord) {
  if (school.lowestPrice != null && school.lowestPrice > 0) {
    return `From ${formatCurrency(school.lowestPrice)}`;
  }
  return null;
}

function formatCount(count: number): string {
  return count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function BrowseAllSchools({ schools }: BrowseAllSchoolsProps) {
  const [query, setQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [region, setRegion] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    setVisibleCount(4);
  }, [query, activeLetter, region]);

  const regions = useMemo(() => {
    const set = new Set<string>();
    for (const school of schools) {
      const reg = school.region?.trim();
      if (reg) set.add(reg);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [schools]);

  const filtered = useMemo(() => {
    let list = schools;
    if (activeLetter) {
      list = list.filter((s) =>
        s.name.trim().toUpperCase().startsWith(activeLetter),
      );
    }
    if (region) {
      list = list.filter(
        (s) => (s.region ?? "").trim().toLowerCase() === region.toLowerCase(),
      );
    }
    if (query.trim()) {
      const needle = query.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(needle) ||
          (s.region ?? "").toLowerCase().includes(needle) ||
          (s.metro ?? "").toLowerCase().includes(needle) ||
          (s.province ?? "").toLowerCase().includes(needle),
      );
    }
    return list;
  }, [schools, activeLetter, region, query]);

  const displayed = useMemo(() => {
    return filtered.slice(0, visibleCount);
  }, [filtered, visibleCount]);

  const remainingLetters = useMemo(() => {
    const present = new Set(
      schools.map((s) => s.name.trim().toUpperCase().charAt(0)),
    );
    return LETTERS.filter((letter) => present.has(letter));
  }, [schools]);

  function applyFilter(next: {
    letter?: string | null;
    region?: string;
    query?: string;
  }) {
    const letter = next.letter === undefined ? activeLetter : next.letter;
    const nextRegion = next.region === undefined ? region : next.region;
    const nextQuery = next.query === undefined ? query : next.query;

    let list = schools;
    if (letter) {
      list = list.filter((s) => s.name.trim().toUpperCase().startsWith(letter));
    }
    if (nextRegion) {
      list = list.filter(
        (s) =>
          (s.region ?? "").trim().toLowerCase() === nextRegion.toLowerCase(),
      );
    }
    if (nextQuery.trim()) {
      const needle = nextQuery.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(needle) ||
          (s.region ?? "").toLowerCase().includes(needle),
      );
    }
    trackSchoolDirectoryBrowse({
      filter:
        [
          letter ? `letter:${letter}` : "",
          nextRegion ? `region:${nextRegion}` : "",
          nextQuery.trim() ? `q:${nextQuery.trim()}` : "",
        ]
          .filter(Boolean)
          .join("|") || "all",
      visibleCount: list.length,
    });
  }

  function handleLetter(letter: string) {
    const next = activeLetter === letter ? null : letter;
    setActiveLetter(next);
    applyFilter({ letter: next });
  }

  function handleRegion(value: string) {
    setRegion(value);
    applyFilter({ region: value });
  }

  function handleQuery(value: string) {
    setQuery(value);
    applyFilter({ query: value });
  }

  return (
    <section
      className="w-full max-w-[var(--layout-max-width)] mx-auto px-4 md:px-8 pt-[clamp(40px,5vw,64px)]"
      aria-labelledby="browse-schools-heading"
    >
      <div className="max-w-[var(--layout-max-width)] mx-auto">
        <p className="m-0 mb-2 text-pex-keppel font-extrabold text-sm">
          Full directory
        </p>
        <h2
          id="browse-schools-heading"
          className="m-0 text-pex-navy font-heading font-extrabold text-[clamp(26px,3vw,38px)] leading-[1.1]"
        >
          Browse school directory
        </h2>
        <p className="mt-3 mb-0 max-w-[640px] text-pex-muted text-lg leading-relaxed">
          Explore the full list below &mdash; every school has grade-specific
          packs prepared to its official stationery list.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_260px] gap-4">
        <label className="block" htmlFor="browse-schools-query">
          <span className="block mb-2 text-pex-navy text-sm font-extrabold">
            Filter schools
          </span>
          <input
            id="browse-schools-query"
            type="search"
            value={query}
            placeholder="Search school or area..."
            onChange={(event) => handleQuery(event.target.value)}
            className="w-full h-[54px] px-4 border border-pex-border rounded-field bg-pex-bg text-pex-navy text-[15px] focus:outline-none focus:border-pex-keppel focus:ring-2 focus:ring-pex-keppel/15 transition-all duration-200"
          />
        </label>

        <label className="block" htmlFor="browse-schools-region">
          <span className="block mb-2 text-pex-navy text-sm font-extrabold">
            Area
          </span>
          <select
            id="browse-schools-region"
            value={region}
            onChange={(event) => handleRegion(event.target.value)}
            className="w-full h-[54px] px-4 border border-pex-border rounded-field bg-pex-bg text-pex-navy text-[15px] cursor-pointer focus:outline-none focus:border-pex-keppel focus:ring-2 focus:ring-pex-keppel/15 transition-all duration-200"
          >
            <option value="">All areas</option>
            {regions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        className="mt-4 flex flex-wrap gap-2 items-center"
        role="group"
        aria-label="Filter by letter"
      >
        <button
          type="button"
          className={
            activeLetter === null
              ? "min-w-[44px] h-[44px] px-3 rounded-full border border-pex-navy bg-pex-navy text-white text-sm font-extrabold shadow-sm cursor-pointer transition-all duration-150"
              : "min-w-[44px] h-[44px] px-3 rounded-full border border-pex-border bg-pex-bg text-pex-navy text-sm font-extrabold cursor-pointer hover:border-pex-keppel hover:text-pex-keppel disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-150"
          }
          onClick={() => {
            setActiveLetter(null);
            applyFilter({ letter: null });
          }}
        >
          All
        </button>
        {LETTERS.map((letter) => {
          const disabled = !remainingLetters.includes(letter);
          return (
            <button
              type="button"
              key={letter}
              disabled={disabled}
              aria-pressed={activeLetter === letter}
              aria-label={`Schools starting with ${letter}`}
              className={
                activeLetter === letter
                  ? "min-w-[44px] h-[44px] px-3 rounded-full border border-pex-navy bg-pex-navy text-white text-sm font-extrabold shadow-sm cursor-pointer transition-all duration-150"
                  : "min-w-[44px] h-[44px] px-3 rounded-full border border-pex-border bg-pex-bg text-pex-navy text-sm font-extrabold cursor-pointer hover:border-pex-keppel hover:text-pex-keppel disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-150"
              }
              onClick={() => handleLetter(letter)}
            >
              {letter}
            </button>
          );
        })}
      </div>

      <p
        className="my-5 mb-3 text-pex-muted font-extrabold text-sm"
        aria-live="polite"
        suppressHydrationWarning
      >
        {filtered.length === 0
          ? "0 schools"
          : filtered.length <= 4
            ? filtered.length === 1
              ? "1 school"
              : `${filtered.length} schools`
            : `Showing ${displayed.length} of ${formatCount(filtered.length)} schools`}
      </p>

      {filtered.length > 0 ? (
        <>
          <ul className="list-none m-0 p-0 grid grid-cols-1 lg:grid-cols-2 gap-3">
            {displayed.map((school, index) => (
              <li key={school.id}>
                <Link
                  href={`/schools/${school.slug}`}
                  className="group grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_auto] items-start md:items-center gap-2 md:gap-4 p-4 md:px-5 border border-pex-border rounded-card bg-card shadow-card hover:-translate-y-0.5 hover:border-pex-keppel/40 hover:shadow-lg transition-all duration-200 no-underline"
                  onClick={() =>
                    trackSchoolCardClicked({
                      schoolSlug: school.slug,
                      placement: "browse",
                      position: index + 1,
                    })
                  }
                >
                  <span className="text-pex-navy font-heading font-extrabold text-[17px] leading-[1.2]">
                    {school.name}
                  </span>
                  <span className="text-pex-muted text-sm font-semibold whitespace-normal md:whitespace-nowrap">
                    {school.region}
                  </span>
                  <span className="text-pex-keppel text-sm font-extrabold whitespace-normal md:whitespace-nowrap">
                    {school.grades.length > 0
                      ? `${school.grades[0]} to ${
                          school.grades[school.grades.length - 1]
                        }`
                      : "Multiple grades"}
                  </span>
                  {priceLabel(school) ? (
                    <span className="text-pex-keppel text-[15px] font-extrabold whitespace-normal md:whitespace-nowrap">
                      {priceLabel(school)}
                    </span>
                  ) : null}
                  <span className="col-span-full md:col-auto w-fit min-h-[40px] mt-2 md:mt-1 px-4 py-2 rounded-full bg-pex-coral group-hover:bg-pex-coral-hover !text-white text-sm font-extrabold leading-none inline-flex items-center shadow-[0_8px_18px_rgba(255,111,89,0.16)] group-hover:-translate-y-px transition-all duration-150">
                    View packs
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {visibleCount < filtered.length && (
            <div className="mt-[clamp(24px,4vw,36px)] flex justify-center items-center">
              <button
                type="button"
                className="group inline-flex items-center gap-3 min-h-[48px] px-7 py-3 rounded-full bg-card border border-pex-border text-pex-navy text-[15px] font-extrabold cursor-pointer shadow-[0_4px_14px_rgba(16,28,43,0.05)] hover:border-pex-keppel hover:text-pex-keppel hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 transition-all duration-200"
                onClick={() => setVisibleCount((prev) => prev + 6)}
                aria-label="Expand to show 6 more schools"
              >
                <span className="inline-flex items-center justify-center w-[26px] h-[26px] rounded-full bg-pex-keppel/10 text-pex-keppel group-hover:bg-pex-keppel group-hover:text-white transition-all duration-200">
                  <ChevronDown size={18} />
                </span>
                <span>Show 6 more schools</span>
              </button>
            </div>
          )}

          {visibleCount > 4 && visibleCount >= filtered.length && (
            <div className="mt-[clamp(24px,4vw,36px)] flex justify-center items-center">
              <button
                type="button"
                className="group inline-flex items-center gap-3 min-h-[48px] px-7 py-3 rounded-full bg-card border border-pex-border text-pex-navy text-[15px] font-extrabold cursor-pointer shadow-[0_4px_14px_rgba(16,28,43,0.05)] hover:border-pex-keppel hover:text-pex-keppel hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 transition-all duration-200"
                onClick={() => setVisibleCount(4)}
                aria-label="Collapse back to 4 schools"
              >
                <span className="inline-flex items-center justify-center w-[26px] h-[26px] rounded-full bg-pex-keppel/10 text-pex-keppel group-hover:bg-pex-keppel group-hover:text-white transition-all duration-200">
                  <ChevronUp size={18} />
                </span>
                <span>Show less</span>
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="p-6 text-center border border-dashed border-pex-border rounded-card bg-pex-bg-soft">
          <p className="m-0 text-pex-navy font-heading font-extrabold text-lg">
            No schools match that filter.
          </p>
          <p className="mt-2 mb-0 text-pex-muted">
            Try a different letter or area, or search by school name above.
          </p>
        </div>
      )}
    </section>
  );
}
