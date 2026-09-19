"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import type { SchoolSearchRecord } from "@/lib/schools/types";
import { IMAGE_BLUR_DATA_URL } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatCurrency";
import { DEFAULT_PACKS_BADGE } from "@/lib/public-data/contracts";
import { trackSchoolCardClicked, trackSchoolImpression } from "@/lib/analytics";
import { SchoolLogoPlaceholder } from "./SchoolLogoPlaceholder";

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
      className="group/school min-h-[280px] p-5 border border-pex-border rounded-card bg-card shadow-card grid content-start gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl motion-reduce:hover:translate-y-0 text-left no-underline"
      key={school.id}
      onClick={() =>
        trackSchoolCardClicked({
          schoolSlug: school.slug,
          placement: "featured",
          position,
        })
      }
    >
      <div className="flex items-center justify-between mb-2">
        {school.image ? (
          <Image
            src={school.image}
            alt={`${school.name} logo`}
            className="w-[54px] h-[54px] rounded-[18px] object-contain bg-white"
            width={54}
            height={54}
            placeholder="blur"
            blurDataURL={IMAGE_BLUR_DATA_URL}
          />
        ) : (
          <SchoolLogoPlaceholder
            className="w-[54px] h-[54px] rounded-[18px] object-contain bg-white"
            title={`${school.name} logo`}
          />
        )}
        {school.isPartner && (
          <span className="bg-pex-keppel/10 text-pex-keppel py-1 px-2.5 rounded-full text-[11px] font-extrabold inline-flex items-center gap-1">★ Official Partner ★</span>
        )}
      </div>
      <span className="text-pex-keppel text-[11px] font-extrabold">{school.region}</span>
      <h3 className="m-0 text-pex-navy font-heading text-[24px] sm:text-[26px] font-extrabold leading-tight">{school.name}</h3>
      <p className="m-0 text-pex-muted font-extrabold text-sm">{gradeRangeLabel(school.grades)}</p>
      {price != null && price > 0 ? (
        <span className="text-pex-navy font-sans text-base font-extrabold leading-[1.2] mt-1 inline-flex items-baseline gap-1.5 before:content-[''] before:w-2 before:h-2 before:rounded-full before:bg-pex-keppel before:opacity-75 before:self-center">
          From {formatCurrency(price)}
        </span>
      ) : null}
      <span className="bg-amber-50 text-amber-900 border border-amber-200/80 py-1 px-3.5 rounded-full text-[12.5px] font-extrabold leading-[1.2] inline-flex items-center w-fit my-0.5 mb-1 tracking-[0.01em]">
        {schoolBadge(school) || DEFAULT_PACKS_BADGE}
      </span>
      <span className="w-fit min-h-[44px] mt-2.5 py-2 pr-2 pl-5 rounded-full bg-pex-coral !text-white inline-flex items-center justify-center gap-2.5 font-sans text-[15px] font-extrabold leading-none shadow-[0_10px_20px_rgba(255,111,89,0.18)] transition-all duration-300 group-hover/school:bg-pex-coral-hover group-hover/school:-translate-y-0.5 after:content-[''] after:w-7 after:h-7 after:rounded-full after:bg-white after:bg-[url('data:image/svg+xml,%3Csvg_viewBox=%270_0_24_24%27_xmlns=%27http://www.w3.org/2000/svg%27_fill=%27none%27_stroke=%27%23ff6f59%27_stroke-width=%272%27_stroke-linecap=%27round%27_stroke-linejoin=%27round%27%3E%3Cpath_d=%27M7_17_17_7M9_7h8v8%27/%3E%3C/svg%3E')] after:bg-center after:bg-no-repeat after:bg-[length:14px_14px] after:shrink-0 after:transition-transform after:duration-300 group-hover/school:after:scale-105">View packs</span>
    </Link>
  );
}

