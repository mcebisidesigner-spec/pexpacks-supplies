"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import type { SchoolSearchRecord } from "@/lib/schools/types";
import { IMAGE_BLUR_DATA_URL } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatCurrency";
import { DEFAULT_PACKS_BADGE } from "@/lib/public-data/seasons";
import { trackSchoolCardClicked, trackSchoolImpression } from "@/lib/analytics";
import { SchoolLogoPlaceholder } from "./SchoolLogoPlaceholder";
import styles from "./FeaturedSchools.module.css";
import cardStyles from "./FeaturedSchoolCard.module.css";

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

type FeaturedSchoolCardProps = {
  school: SchoolSearchRecord;
  position: number;
};

export function FeaturedSchoolCard({
  school,
  position,
}: FeaturedSchoolCardProps) {
  const price = school.lowestPrice;

  useEffect(() => {
    trackSchoolImpression({ schoolSlug: school.slug, placement: "featured" });
  }, [school.slug]);

  return (
    <Link
      href={`/schools/${school.slug}`}
      className={styles.featuredCard}
      key={school.id}
      onClick={() =>
        trackSchoolCardClicked({
          schoolSlug: school.slug,
          placement: "featured",
          position,
        })
      }
    >
      <div className={styles.featuredHeader}>
        {school.image ? (
          <Image
            src={school.image}
            alt={`${school.name} logo`}
            className={styles.featuredLogo}
            width={54}
            height={54}
            placeholder="blur"
            blurDataURL={IMAGE_BLUR_DATA_URL}
          />
        ) : (
          <SchoolLogoPlaceholder
            className={styles.featuredLogo}
            title={`${school.name} logo`}
          />
        )}
        {school.isPartner && (
          <span className={styles.partnerBadge}>★ Official Partner ★</span>
        )}
      </div>
      <span className={styles.featuredMeta}>{school.region}</span>
      <h3>{school.name}</h3>
      <p>{gradeRangeLabel(school.grades)}</p>
      {price != null && price > 0 ? (
        <span className={cardStyles.priceAnchor}>
          From {formatCurrency(price)}
        </span>
      ) : null}
      <span className={styles.yearPillBadge}>
        {schoolBadge(school) || DEFAULT_PACKS_BADGE}
      </span>
      <span className={styles.featuredCta}>View packs</span>
    </Link>
  );
}
