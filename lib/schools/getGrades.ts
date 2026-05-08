import type { SchoolSearchRecord } from "./types";

function gradeRank(grade: string) {
  if (/grade\s*r/i.test(grade)) {
    return 0;
  }

  const number = Number(grade.match(/\d+/)?.[0]);
  return Number.isFinite(number) ? number : 99;
}

export function getGrades(records: SchoolSearchRecord[]) {
  return Array.from(new Set(records.flatMap((school) => school.grades))).sort((a, b) => gradeRank(a) - gradeRank(b));
}
