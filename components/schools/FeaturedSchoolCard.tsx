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
      className="group/school min-h-[280px] p-5 border border-[#1a2a40]/10 rounded-[24px] bg-white shadow-[0_12px_32px_rgba(26,42,64,0.06)] grid content-start gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(26,42,64,0.12)] motion-reduce:hover:translate-y-0 text-left no-underline"
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
          <span className="bg-[#219e9a]/12 text-[#156966] py-1 px-2.5 rounded-full text-[11px] font-extrabold inline-flex items-center gap-1">★ Official Partner ★</span>
        )}
      </div>
      <span className="text-[#156966] text-[11px] font-extrabold">{school.region}</span>
      <h3 className="m-0 text-[#156966] text-[26px] font-extrabold leading-none">{school.name}</h3>
      <p className="m-0 text-[var(--pex-text-muted,#4d5a5d)] font-extrabold text-sm">{gradeRangeLabel(school.grades)}</p>
      {price != null && price > 0 ? (
        <span className="text-[#156966] font-sans text-base font-extrabold leading-[1.2] mt-1 inline-flex items-baseline gap-1.5 before:content-[''] before:w-2 before:h-2 before:rounded-full before:bg-[#156966] before:opacity-55 before:self-center">
          From {formatCurrency(price)}
        </span>
      ) : null}
      <span className="bg-[#f5ede0] text-[#156966] border border-[#e4d7bf] py-1 px-3.5 rounded-full text-[12.5px] font-extrabold leading-[1.2] inline-flex items-center w-fit my-0.5 mb-1 tracking-[0.01em]">
        {schoolBadge(school) || DEFAULT_PACKS_BADGE}
      </span>
      <span className="w-fit min-h-[44px] mt-2.5 py-2 pr-2 pl-5 rounded-full bg-[var(--pex-coral,#ff6f59)] text-white inline-flex items-center justify-center gap-2.5 font-sans text-[15px] font-extrabold leading-none shadow-[0_10px_20px_rgba(255,111,89,0.18)] transition-all duration-300 group-hover/school:bg-[#e85e4b] group-hover/school:-translate-y-0.5 after:content-[''] after:w-7 after:h-7 after:rounded-full after:bg-white after:bg-[url('data:image/svg+xml,%3Csvg_viewBox=%270_0_24_24%27_xmlns=%27http://www.w3.org/2000/svg%27_fill=%27none%27_stroke=%27%23ff6f59%27_stroke-width=%272%27_stroke-linecap=%27round%27_stroke-linejoin=%27round%27%3E%3Cpath_d=%27M7_17_17_7M9_7h8v8%27/%3E%3C/svg%3E')] after:bg-center after:bg-no-repeat after:bg-[length:14px_14px] after:shrink-0 after:transition-transform after:duration-300 group-hover/school:after:scale-105">View packs</span>
    </Link>
  );
}

