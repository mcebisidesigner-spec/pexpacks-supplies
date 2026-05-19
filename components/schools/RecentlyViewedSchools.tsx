"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import pageStyles from "@/styles/Page.module.css";
import heroStyles from "@/components/marketing/HeroSearch.module.css";
import type { LastVisit } from "./ReturningParentBanner";

const STORAGE_KEY = "pexpacks:recent-school-visits";

export function RecentlyViewedSchools() {
  const [recentVisits, setRecentVisits] = useState<LastVisit[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const visits: LastVisit[] = Array.isArray(parsed) ? parsed : [parsed];
      
      // Filter out visits older than 30 days
      const validVisits = visits.filter(
        (visit) => Date.now() - visit.timestamp < 30 * 24 * 60 * 60 * 1000
      );
      
      setRecentVisits(validVisits);
    } catch {
      // ignore
    }
  }, []);

  if (recentVisits.length === 0) {
    return null;
  }

  return (
    <section className={pageStyles.section} aria-labelledby="recent-schools-heading">
      <div className={pageStyles.sectionInner}>
        <div style={{ marginBottom: "24px" }}>
          <h2 id="recent-schools-heading" style={{ margin: 0, fontSize: "20px", color: "var(--pex-primary)" }}>
            Recently viewed
          </h2>
          <p style={{ margin: "4px 0 0", color: "var(--pex-text-muted)", fontSize: "14px", fontWeight: 700 }}>
            Pick up where you left off
          </p>
        </div>
        
        <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {recentVisits.map((visit) => (
            <article className={heroStyles.heroResultCard} key={`${visit.schoolSlug}-${visit.gradeSlug}`}>
              <div className={heroStyles.heroResultContent}>
                <div className={heroStyles.heroResultSummary}>
                  <h3 style={{ fontSize: "18px" }}>
                    <Link href={`/schools/${visit.schoolSlug}/${visit.gradeSlug}`}>
                      {visit.schoolName}
                    </Link>
                  </h3>
                  <p>Grade {visit.grade}</p>
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
