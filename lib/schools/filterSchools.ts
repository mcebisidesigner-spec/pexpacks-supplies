import {
  normaliseFilterValue,
  normaliseSchoolQuery,
} from "./normaliseSchoolQuery";
import type { SchoolSearchFilters, SchoolSearchRecord } from "./types";

type PreparedSchoolSearchFields = {
  name: string;
  region: string;
  city: string;
  province: string;
  grades: string[];
  priority: number;
};

type FilterSchoolsOptions = {
  preserveOrder?: boolean;
};

const preparedSchoolSearchFields = new Map<string, PreparedSchoolSearchFields>();

function getPreparedFields(school: SchoolSearchRecord) {
  const cached = preparedSchoolSearchFields.get(school.id);

  if (cached) {
    return cached;
  }

  const fields: PreparedSchoolSearchFields = {
    name: normaliseSchoolQuery(school.name),
    region: normaliseSchoolQuery(school.region),
    city: normaliseSchoolQuery(school.city),
    province: normaliseSchoolQuery(school.province),
    grades: school.grades.map((grade) =>
      normaliseFilterValue(grade).toLowerCase()
    ),
    priority:
      Number(Boolean(school.isFeatured)) * 2 +
      Number(Boolean(school.isPartner)),
  };

  preparedSchoolSearchFields.set(school.id, fields);
  return fields;
}

function compareSchoolsForDisplay(
  a: SchoolSearchRecord,
  b: SchoolSearchRecord
) {
  const aFields = getPreparedFields(a);
  const bFields = getPreparedFields(b);

  if (aFields.priority !== bFields.priority) {
    return bFields.priority - aFields.priority;
  }

  return a.name.localeCompare(b.name);
}

export function filterSchools(
  records: SchoolSearchRecord[],
  filters: SchoolSearchFilters,
  options: FilterSchoolsOptions = {}
) {
  const query = normaliseSchoolQuery(filters.query);
  const grade = normaliseFilterValue(filters.grade).toLowerCase();
  const region = normaliseSchoolQuery(normaliseFilterValue(filters.region));

  const filtered = records.filter((school) => {
    const fields = getPreparedFields(school);
    const matchesQuery = !query || fields.name.includes(query);
    const matchesGrade = !grade || fields.grades.includes(grade);
    const matchesRegion =
      !region ||
      fields.region.includes(region) ||
      fields.city.includes(region) ||
      fields.province.includes(region);

    return matchesQuery && matchesGrade && matchesRegion;
  });

  return options.preserveOrder
    ? filtered
    : filtered.sort(compareSchoolsForDisplay);
}
