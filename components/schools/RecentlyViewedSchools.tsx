"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import pageStyles from "@/styles/Page.module.css";
import heroStyles from "@/components/marketing/HeroSearch.module.css";
import {
  RECENT_SCHOOL_VISITS_EVENT,
  STORAGE_KEY,
  type LastVisit,
} from "./ReturningParentBanner";
import styles from "./RecentlyViewedSchools.module.css";

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
      className={pageStyles.section}
      aria-labelledby="recent-schools-heading"
    >
      <div className={pageStyles.sectionInner}>
        <div className={styles.recentHeader}>
          <h2 id="recent-schools-heading">Recently viewed</h2>
          <p>Pick up where you left off</p>
        </div>

        <div className={styles.recentGrid}>
          {recentVisits.map((visit) => (
            <article
              className={`${heroStyles.heroResultCard} ${styles.recentCard}`}
              key={`${visit.schoolSlug}-${visit.gradeSlug}`}
            >
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => removeRecentVisit(visit)}
                aria-label={`Remove ${visit.schoolName} ${visit.grade} from recently viewed`}
              >
                <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
              <div className={heroStyles.heroResultContent}>
                <div className={heroStyles.heroResultSummary}>
                  <h3 className={styles.recentTitle}>
                    <Link href={`/schools/${visit.schoolSlug}/${visit.gradeSlug}`}>
                      {visit.schoolName}
                    </Link>
                  </h3>
                  <p>{visit.grade}</p>
                </div>
              </div>
              <Link
                href={`/schools/${visit.schoolSlug}/${visit.gradeSlug}`}
                className={heroStyles.heroResultLink}
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
