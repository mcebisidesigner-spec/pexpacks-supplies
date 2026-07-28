import { getSchoolIndex } from "@/data/schools";
import type { SchoolSearchRecord } from "./types";
import { getSchoolPhasesFromGrades } from "./schoolPhase";

type SchoolIndexRecord = {
  id: string;
  name: string;
  slug: string;
  city: string;
  metro: string;
  province: string;
  logo: string;
  isPartnerSchool: boolean;
  isFeatured?: boolean;
  lowestPrice?: number;
  grades: { id: string; grade: string; gradeSlug: string }[];
};

function toSearchRecord(school: SchoolIndexRecord): SchoolSearchRecord {
  const grades = school.grades.map((g) => g.grade);
  return {
    id: school.id,
    name: school.name,
    slug: school.slug,
    region: school.city,
    city: school.city,
    metro: school.metro,
    province: school.province,
    grades,
    phases: getSchoolPhasesFromGrades(grades, school.name),
    isFeatured: Boolean(school.isFeatured),
    isPartner: school.isPartnerSchool,
    image: school.logo,
    lowestPrice: school.lowestPrice,
  };
}

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
  const index = await getSchoolIndex();
  const target = normalize(targetCity);

  if (!target) {
    const fallback = await getDefaultSchools(limit);
    return { schools: fallback, matchedCity: "" };
  }

  // 1. Exact city match
  let matched = index.filter((s) => normalize(s.city) === target);

  // 2. Partial match
  if (matched.length === 0) {
    matched = index.filter(
      (s) =>
        normalize(s.city).includes(target) ||
        target.includes(normalize(s.city))
    );
  }

  // 3. Metro match
  if (matched.length === 0) {
    matched = index.filter((s) => normalize(s.metro) === target);
  }

  if (matched.length > 0) {
    const records = matched.map(toSearchRecord);
    const sorted = sortByGradeAndPartner(records);
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
  const index = await getSchoolIndex();
  const partners = index.filter((s) => s.isPartnerSchool);
  const records = partners.map(toSearchRecord);
  const sorted = sortByGradeAndPartner(records);
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
