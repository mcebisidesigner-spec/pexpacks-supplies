import Image from "next/image";
import Link from "next/link";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import type { SchoolSearchRecord } from "@/lib/schools/types";
import { IMAGE_BLUR_DATA_URL } from "@/lib/constants";
import { SchoolLogoPlaceholder } from "./SchoolLogoPlaceholder";
import { DEFAULT_PACKS_BADGE } from "@/lib/public-data/seasons";
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

function schoolBadge(school: SchoolSearchRecord) {
  if (school.customBadge) return school.customBadge;
  if ("custom_badge" in school && typeof school.custom_badge === "string") {
    return school.custom_badge;
  }
  return null;
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
                <SchoolLogoPlaceholder
                  className={styles.featuredLogo}
                  title={`${school.name} logo`}
                />
              )}
              {school.isPartner && (
                <span className={styles.partnerBadge}>
                  ★ Official Partner ★
                </span>
              )}
            </div>
            <span className={styles.featuredMeta}>{school.region}</span>
            <h3>{school.name}</h3>
            <p>{gradeRangeLabel(school.grades)}</p>
            <span className={styles.yearPillBadge}>{schoolBadge(school) || DEFAULT_PACKS_BADGE}</span>
            <span className={styles.featuredCta}>View packs</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
