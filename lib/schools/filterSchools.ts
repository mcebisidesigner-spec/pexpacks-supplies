import { normaliseFilterValue, normaliseSchoolQuery } from "./normaliseSchoolQuery";
import type { SchoolSearchFilters, SchoolSearchRecord } from "./types";

function includesFilter(source: string | undefined, value: string) {
  return normaliseSchoolQuery(source).includes(normaliseSchoolQuery(value));
}

export function filterSchools(records: SchoolSearchRecord[], filters: SchoolSearchFilters) {
  const query = normaliseSchoolQuery(filters.query);
  const grade = normaliseFilterValue(filters.grade);
  const region = normaliseFilterValue(filters.region);

  return records
    .filter((school) => {
      const matchesQuery = !query || normaliseSchoolQuery(school.name).includes(query);
      const matchesGrade = !grade || school.grades.some((item) => item.toLowerCase() === grade.toLowerCase());
      const matchesRegion =
        !region ||
        includesFilter(school.region, region) ||
        includesFilter(school.city, region) ||
        includesFilter(school.province, region);

      return matchesQuery && matchesGrade && matchesRegion;
    })
    .sort((a, b) => {
      const aPriority = Number(Boolean(a.isFeatured)) * 2 + Number(Boolean(a.isPartner));
      const bPriority = Number(Boolean(b.isFeatured)) * 2 + Number(Boolean(b.isPartner));

      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      return a.name.localeCompare(b.name);
    });
}
