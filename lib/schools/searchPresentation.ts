import type { SchoolSearchRecord } from "./types";

export function formatSchoolSearchLocation(school: SchoolSearchRecord) {
  const values = [
    school.city || school.region,
    school.metro ? `City of ${school.metro}` : "",
    school.province || "",
  ]
    .map((value) => value.trim())
    .filter(Boolean);

  const uniqueValues = values.filter(
    (value, index) =>
      values.findIndex(
        (candidate) => candidate.toLowerCase() === value.toLowerCase(),
      ) === index,
  );

  return uniqueValues.join(" · ") || "Location not listed";
}
