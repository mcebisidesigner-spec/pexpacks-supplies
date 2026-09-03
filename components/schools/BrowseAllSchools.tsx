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
import styles from "./BrowseAllSchools.module.css";

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
      className={styles.directory}
      aria-labelledby="browse-schools-heading"
    >
      <div className={styles.directoryIntro}>
        <p className={styles.eyebrow}>Full directory</p>
        <h2 id="browse-schools-heading">Browse school directory</h2>
        <p className={styles.lead}>
          Explore the full list below &mdash; every school has grade-specific
          packs prepared to its official stationery list.
        </p>
      </div>

      <div className={styles.directoryControls}>
        <label className={styles.queryField} htmlFor="browse-schools-query">
          <span className={styles.fieldLabel}>Filter schools</span>
          <input
            id="browse-schools-query"
            type="search"
            value={query}
            placeholder="Search school or area..."
            onChange={(event) => handleQuery(event.target.value)}
            className={styles.queryInput}
          />
        </label>

        <label className={styles.regionField} htmlFor="browse-schools-region">
          <span className={styles.fieldLabel}>Area</span>
          <select
            id="browse-schools-region"
            value={region}
            onChange={(event) => handleRegion(event.target.value)}
            className={styles.regionSelect}
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
        className={styles.letterBar}
        role="group"
        aria-label="Filter by letter"
      >
        <button
          type="button"
          className={
            activeLetter === null ? styles.letterActive : styles.letterPill
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
                  ? styles.letterActive
                  : styles.letterPill
              }
              onClick={() => handleLetter(letter)}
            >
              {letter}
            </button>
          );
        })}
      </div>

      <p
        className={styles.countLine}
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
          <ul className={styles.list}>
            {displayed.map((school, index) => (
              <li key={school.id}>
                <Link
                  href={`/schools/${school.slug}`}
                  className={styles.row}
                  onClick={() =>
                    trackSchoolCardClicked({
                      schoolSlug: school.slug,
                      placement: "browse",
                      position: index + 1,
                    })
                  }
                >
                  <span className={styles.rowName}>{school.name}</span>
                  <span className={styles.rowRegion}>{school.region}</span>
                  <span className={styles.rowGrades}>
                    {school.grades.length > 0
                      ? `${school.grades[0]} to ${
                          school.grades[school.grades.length - 1]
                        }`
                      : "Multiple grades"}
                  </span>
                  {priceLabel(school) ? (
                    <span className={styles.rowPrice}>{priceLabel(school)}</span>
                  ) : null}
                  <span className={styles.rowCta}>View packs</span>
                </Link>
              </li>
            ))}
          </ul>

          {visibleCount < filtered.length && (
            <div className={styles.expandWrapper}>
              <button
                type="button"
                className={styles.expandButton}
                onClick={() => setVisibleCount((prev) => prev + 6)}
                aria-label="Expand to show 6 more schools"
              >
                <span className={styles.expandIconCircle}>
                  <ChevronDown size={18} />
                </span>
                <span>Show 6 more schools</span>
              </button>
            </div>
          )}

          {visibleCount > 4 && visibleCount >= filtered.length && (
            <div className={styles.expandWrapper}>
              <button
                type="button"
                className={styles.collapseButton}
                onClick={() => setVisibleCount(4)}
                aria-label="Collapse back to 4 schools"
              >
                <span className={styles.expandIconCircle}>
                  <ChevronUp size={18} />
                </span>
                <span>Show less</span>
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>No schools match that filter.</p>
          <p className={styles.emptyText}>
            Try a different letter or area, or search by school name above.
          </p>
        </div>
      )}
    </section>
  );
}
