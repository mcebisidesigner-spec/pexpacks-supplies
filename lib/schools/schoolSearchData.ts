import { getSchoolIndex } from "@/data/schools";
import { SchoolSearchIndex } from "./SearchIndex";
import { getFeaturedSchools } from "./getFeaturedSchools";
import { getGrades } from "./getGrades";
import { getRegions } from "./getRegions";
import type { SchoolSearchFilters, SchoolSearchRecord } from "./types";

function gradeRank(grade: string) {
  if (/grade\s*r/i.test(grade)) {
    return 0;
  }

  const number = Number(grade.match(/\d+/)?.[0]);
  return Number.isFinite(number) ? number : 99;
}

export const searchableSchools: SchoolSearchRecord[] = getSchoolIndex().map(
  (school) => ({
    id: school.id,
    name: school.name,
    slug: school.slug,
    region: school.city,
    city: school.city,
    province: school.province,
    grades: school.grades
      .map((g) => g.grade)
      .sort((a, b) => gradeRank(a) - gradeRank(b)),
    isFeatured: Boolean("isFeatured" in school && school.isFeatured),
    isPartner: school.isPartnerSchool,
    image: school.logo,
    lowestPrice: school.lowestPrice,
  })
);

/** Lazy singleton search index — built on first use */
let searchIndex: SchoolSearchIndex | null = null;
function getSearchIndex() {
  if (!searchIndex) {
    searchIndex = new SchoolSearchIndex(searchableSchools);
  }
  return searchIndex;
}

export function getSchoolSearchOptions() {
  return {
    grades: getGrades(searchableSchools),
    regions: getRegions(searchableSchools),
  };
}

export function getFeaturedSchoolRecords() {
  return getFeaturedSchools(searchableSchools, 4);
}

export function searchSchoolRecords(
  filters: SchoolSearchFilters,
  limit = 12,
  offset = 0
) {
  return getSearchIndex().search(filters, limit, offset);
}
