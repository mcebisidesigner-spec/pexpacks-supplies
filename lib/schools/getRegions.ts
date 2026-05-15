import type { SchoolSearchRecord } from "./types";

export function getRegions(records: SchoolSearchRecord[]) {
  return Array.from(
    new Set(
      records.flatMap(
        (school) =>
          [school.region, school.city, school.province].filter(
            Boolean
          ) as string[]
      )
    )
  ).sort((a, b) => a.localeCompare(b));
}
