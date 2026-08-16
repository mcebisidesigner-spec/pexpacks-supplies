import type { SchoolSearchRecord } from "./types";
import { getFeaturedSchoolRecords, searchSchoolRecords } from "./schoolSearchData";

function gradeRank(grade: string) {
  if (/grade\s*r/i.test(grade)) return 0;
  const n = Number(grade.match(/\d+/)?.[0]);
  return Number.isFinite(n) ? n : 99;
}

function sortByGradeAndPartner(schools: SchoolSearchRecord[]) {
  return schools.sort((a, b) => {
    if (a.isPartner !== b.isPartner) return a.isPartner ? -1 : 1;
    const aMin = a.grades.length
      ? gradeRank(a.grades.sort((x, y) => gradeRank(x) - gradeRank(y))[0])
      : 99;
    const bMin = b.grades.length
      ? gradeRank(b.grades.sort((x, y) => gradeRank(x) - gradeRank(y))[0])
      : 99;
    return aMin - bMin;
  });
}

function uniqueBySlug(schools: SchoolSearchRecord[]) {
  const seen = new Set<string>();
  return schools.filter((s) => {
    if (seen.has(s.slug)) return false;
    seen.add(s.slug);
    return true;
  });
}

function normalize(s: string) {
  return s.trim().toLowerCase();
}

/**
 * Match a target city/area against the school index.
 * Strategy:
 *  1. Exact city match (case-insensitive)
 *  2. Partial city match (target is contained in city or vice versa)
 *  3. Metro match
 *  4. Fall back to partnered schools across Gauteng
 */
export async function getSchoolsByCity(
  targetCity: string,
  limit = 6
): Promise<{ schools: SchoolSearchRecord[]; matchedCity: string }> {
  const target = normalize(targetCity);

  if (!target) {
    const fallback = await getDefaultSchools(limit);
    return { schools: fallback, matchedCity: "" };
  }

  const { results: matched } = await searchSchoolRecords(
    { region: targetCity },
    limit,
  );

  if (matched.length > 0) {
    const sorted = sortByGradeAndPartner(matched);
    const resolvedCity = sorted[0]?.city ?? targetCity;
    return {
      schools: uniqueBySlug(sorted).slice(0, limit),
      matchedCity: resolvedCity,
    };
  }

  // 4. Fall back to partnered Gauteng schools
  const fallback = await getDefaultSchools(limit);
  return { schools: fallback, matchedCity: "" };
}

/**
 * Top partnered schools across Gauteng — used as the default fallback.
 * Ordered by partner status, then by earliest grade available.
 */
export async function getDefaultSchools(
  limit = 6
): Promise<SchoolSearchRecord[]> {
  const schools = await getFeaturedSchoolRecords(limit);
  const partners = schools.filter((school) => school.isPartner);
  const sorted = sortByGradeAndPartner(partners.length ? partners : schools);
  return uniqueBySlug(sorted).slice(0, limit);
}

/**
 * Partnered schools for a given city — used as the initial SSR set
 * when the page loads with a known city context (e.g. Gauteng).
 */
export async function getPartneredSchools(
  limit = 6
): Promise<SchoolSearchRecord[]> {
  return getDefaultSchools(limit);
}
