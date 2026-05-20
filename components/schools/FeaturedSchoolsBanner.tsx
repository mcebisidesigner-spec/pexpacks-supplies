"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import type { SchoolSearchRecord } from "@/lib/schools/types";
import styles from "./FeaturedSchools.module.css";

function gradeRangeLabel(grades: string[]) {
  if (grades.length === 0) {
    return "Grades available";
  }

  if (grades.length === 1) {
    return grades[0];
  }

  return `${grades[0]} to ${grades[grades.length - 1]}`;
}

type FeaturedSchoolsBannerProps = {
  schools: SchoolSearchRecord[];
};

export function FeaturedSchoolsBanner({ schools }: FeaturedSchoolsBannerProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    if (!scrollerRef.current) return;
    const { scrollLeft } = scrollerRef.current;
    const children = Array.from(scrollerRef.current.children) as HTMLElement[];

    let closestIndex = 0;
    let minDiff = Number.POSITIVE_INFINITY;

    children.forEach((child, index) => {
      const diff = Math.abs(child.offsetLeft - scrollLeft);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  }, []);

  const scrollTo = (index: number) => {
    if (!scrollerRef.current) return;
    const children = Array.from(scrollerRef.current.children) as HTMLElement[];
    const target = children[index];
    if (target) {
      scrollerRef.current.scrollTo({
        left: target.offsetLeft,
        behavior: "smooth",
      });
      setActiveIndex(index);
    }
  };

  return (
    <section
      className={styles.featuredSection}
      aria-labelledby="featured-schools-heading"
    >
      <div className={styles.featuredIntro}>
        <SectionHeader
          eyebrow="Quick start"
          title="Featured schools"
          text="Start with one of our highlighted school pack pages, or search for your school above."
          headingId="featured-schools-heading"
        />
      </div>
      <div>
        <div
          className={styles.featuredScroller}
          ref={scrollerRef}
          onScroll={handleScroll}
        >
          {schools.map((school) => (
            <Link
              href={`/schools/${school.slug}`}
              className={styles.featuredCard}
              key={school.id}
            >
              <div className={styles.featuredHeader}>
                <span className={styles.featuredIcon}>
                  {school.name.charAt(0)}
                </span>
                {school.isPartner && (
                  <span className={styles.partnerBadge}>
                    ★ Official Partner
                  </span>
                )}
              </div>
              <span className={styles.featuredMeta}>{school.region}</span>
              <h3>{school.name}</h3>
              <p>{gradeRangeLabel(school.grades)}</p>
              <strong>Stationery packs available</strong>
              <span className={styles.featuredCta}>View packs</span>
            </Link>
          ))}
        </div>
        <div className={styles.trackingBar} role="tablist" aria-label="Featured school slides">
          {schools.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Go to school ${i + 1}`}
              className={[
                styles.trackingDot,
                i === activeIndex ? styles.trackingDotActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => scrollTo(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
