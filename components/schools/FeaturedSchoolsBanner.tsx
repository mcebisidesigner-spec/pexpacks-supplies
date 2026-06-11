import Image from "next/image";
import Link from "next/link";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import type { SchoolSearchRecord } from "@/lib/schools/types";
import { IMAGE_BLUR_DATA_URL } from "@/lib/constants";
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
  return (
    <section
      className={styles.featuredSection}
      aria-labelledby="featured-schools-heading"
    >
      <div className={styles.featuredIntro}>
        <SectionHeader
          eyebrow="Most popular"
          title="Popular schools"
          text="Start with one of our popular school pack pages, or search for your school above."
          headingId="featured-schools-heading"
        />
      </div>
      <div className={styles.featuredGrid}>
        {schools.map((school) => (
          <Link
            href={`/schools/${school.slug}`}
            className={styles.featuredCard}
            key={school.id}
          >
            <div className={styles.featuredHeader}>
              {school.image ? (
                <Image src={school.image} alt={`${school.name} logo`} className={styles.featuredLogo} width={54} height={54} placeholder="blur" blurDataURL={IMAGE_BLUR_DATA_URL} />
              ) : (
                <span className={styles.featuredIcon}>
                  {school.name.charAt(0)}
                </span>
              )}
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
    </section>
  );
}
