import { getSchoolIndex } from "@/data/schools";
import { filterSchools } from "./filterSchools";
import { getFeaturedSchools } from "./getFeaturedSchools";
import { getGrades } from "./getGrades";
import { getRegions } from "./getRegions";
import { paginateSchools } from "./paginateSchools";
import type { SchoolSearchFilters } from "./types";

function gradeRank(grade: string) {
  if (/grade\s*r/i.test(grade)) {
    return 0;
  }

  const number = Number(grade.match(/\d+/)?.[0]);
  return Number.isFinite(number) ? number : 99;
}

export const searchableSchools = getSchoolIndex().map((school) => ({
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
}));

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
  return paginateSchools(
    filterSchools(searchableSchools, filters),
    limit,
    offset
  );
}
