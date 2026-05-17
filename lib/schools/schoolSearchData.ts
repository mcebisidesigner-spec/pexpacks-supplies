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

/** Singleton search index — built once, reused across all requests */
const searchIndex = new SchoolSearchIndex(searchableSchools);

export function getSchoolSearchOptions() {
  return {
    grades: getGrades(searchableSchools),
    regions: getRegions(searchableSchools),
  };
}

export function getPopularSchoolCities(limit = 8) {
  const cityCounts = new Map<string, number>();

  for (const school of searchableSchools) {
    if (!school.city) {
      continue;
    }

    cityCounts.set(school.city, (cityCounts.get(school.city) ?? 0) + 1);
  }

  return Array.from(cityCounts.entries())
    .sort(([cityA, countA], [cityB, countB]) => {
      if (countA !== countB) {
        return countB - countA;
      }

      return cityA.localeCompare(cityB);
    })
    .slice(0, limit)
    .map(([city]) => city);
}

export function getFeaturedSchoolRecords() {
  return getFeaturedSchools(searchableSchools, 4);
}

export function searchSchoolRecords(
  filters: SchoolSearchFilters,
  limit = 12,
  offset = 0
) {
  return searchIndex.search(filters, limit, offset);
}
