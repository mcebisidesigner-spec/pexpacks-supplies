"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  RECENT_SCHOOL_VISITS_EVENT,
  STORAGE_KEY,
  type LastVisit,
} from "./schoolVisitTracker";

const RECENT_VISIT_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

function normaliseVisits(raw: string | null): LastVisit[] {
  if (!raw) return [];

  const parsed = JSON.parse(raw);
  const visits: LastVisit[] = Array.isArray(parsed) ? parsed : [parsed];

  return visits.filter(
    (visit) => Date.now() - visit.timestamp < RECENT_VISIT_MAX_AGE
  );
}

export function RecentlyViewedSchools() {
  const [recentVisits, setRecentVisits] = useState<LastVisit[]>([]);

  useEffect(() => {
    function loadRecentVisits() {
      try {
        setRecentVisits(normaliseVisits(localStorage.getItem(STORAGE_KEY)));
      } catch {
        setRecentVisits([]);
      }
    }

    loadRecentVisits();
    window.addEventListener("storage", loadRecentVisits);
    window.addEventListener(RECENT_SCHOOL_VISITS_EVENT, loadRecentVisits);

    return () => {
      window.removeEventListener("storage", loadRecentVisits);
      window.removeEventListener(RECENT_SCHOOL_VISITS_EVENT, loadRecentVisits);
    };
  }, []);

  if (recentVisits.length === 0) {
    return null;
  }

  function removeRecentVisit(visitToRemove: LastVisit) {
    const nextVisits = recentVisits.filter(
      (visit) =>
        visit.schoolSlug !== visitToRemove.schoolSlug ||
        visit.gradeSlug !== visitToRemove.gradeSlug
    );

    setRecentVisits(nextVisits);

    try {
      if (nextVisits.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextVisits));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }

      window.dispatchEvent(new Event(RECENT_SCHOOL_VISITS_EVENT));
    } catch {
      // localStorage may be unavailable
    }
  }

  return (
    <section
      className="py-8 sm:py-10"
      aria-labelledby="recent-schools-heading"
    >
      <div className="w-full max-w-[var(--layout-max-width)] mx-auto px-4 md:px-8">
        <div className="mb-5">
          <h2
            id="recent-schools-heading"
            className="m-0 text-pex-navy text-xl leading-tight font-heading font-extrabold"
          >
            Recently viewed
          </h2>
          <p className="mt-1 mb-0 text-pex-muted text-sm font-bold">
            Pick up where you left off
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3">
          {recentVisits.map((visit) => (
            <article
              className="relative pr-14 sm:pr-[58px] p-4 bg-card border border-pex-border rounded-card shadow-card hover:border-pex-keppel/40 hover:shadow-lg transition-all flex flex-col justify-between"
              key={`${visit.schoolSlug}-${visit.gradeSlug}`}
            >
              <button
                type="button"
                className="absolute top-3 right-3 w-[34px] h-[34px] border border-pex-border rounded-full bg-pex-bg text-pex-muted grid place-items-center cursor-pointer hover:bg-pex-bg-soft hover:text-pex-coral hover:-translate-y-px hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-pex-keppel transition-all"
                onClick={() => removeRecentVisit(visit)}
                aria-label={`Remove ${visit.schoolName} ${visit.grade} from recently viewed`}
              >
                <svg
                  viewBox="0 0 24 24"
                  focusable="false"
                  aria-hidden="true"
                  className="w-[17px] h-[17px] fill-none stroke-current stroke-2 stroke-linecap-round"
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
              <div>
                <div className="mb-2.5">
                  <h3 className="m-0 text-base sm:text-lg font-bold text-pex-navy leading-snug">
                    <Link
                      href={`/schools/${visit.schoolSlug}`}
                      className="hover:text-pex-keppel transition-colors"
                    >
                      {visit.schoolName}
                    </Link>
                  </h3>
                  <p className="m-0 mt-0.5 text-xs sm:text-sm text-pex-muted font-semibold">
                    {visit.grade}
                  </p>
                </div>
              </div>
              <Link
                href={`/schools/${visit.schoolSlug}`}
                className="inline-flex items-center justify-center w-full min-h-[38px] px-4 rounded-full bg-pex-navy hover:bg-pex-navy/90 !text-white font-heading text-xs sm:text-sm font-extrabold no-underline transition-all mt-2"
              >
                View pack
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

