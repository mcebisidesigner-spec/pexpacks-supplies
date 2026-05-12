import Link from "next/link";
import type { SchoolSearchRecord } from "@/lib/schools/types";
import styles from "./Schools.module.css";

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
  return (
    <section className={styles.featuredSection} aria-labelledby="featured-schools-heading">
      <div className={styles.sectionIntro}>
        <p>Quick start</p>
        <h2 id="featured-schools-heading">Featured schools</h2>
        <span>Start with one of our highlighted school pack pages, or search for your school above.</span>
      </div>
      <div className={styles.featuredScroller}>
        {schools.map((school) => (
          <Link href={`/schools/${school.slug}`} className={styles.featuredCard} key={school.id}>
            <div className={styles.featuredHeader}>
              <span className={styles.featuredIcon}>{school.name.charAt(0)}</span>
              {school.isPartner && <span className={styles.partnerBadge}>★ Official Partner</span>}
            </div>
            <span className={styles.featuredMeta}>{school.region}</span>
            <h3>{school.name}</h3>
            <p>{gradeRangeLabel(school.grades)}</p>
            <strong>Stationery packs available</strong>
            <span className={styles.featuredCta}>View packs</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
