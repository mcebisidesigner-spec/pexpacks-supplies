import { getSchoolIndex } from "@/data/schools";
import { SchoolSearchIndex } from "./SearchIndex";
import { getFeaturedSchools } from "./getFeaturedSchools";
import { getGrades } from "./getGrades";
import { getRegions } from "./getRegions";
import { getSchoolPhasesFromGrades } from "./schoolPhase";
import type { SchoolSearchFilters, SchoolSearchRecord } from "./types";

function gradeRank(grade: string) {
  if (/grade\s*r/i.test(grade)) {
    return 0;
  }

  const number = Number(grade.match(/\d+/)?.[0]);
  return Number.isFinite(number) ? number : 99;
}

let searchableSchoolsPromise: Promise<SchoolSearchRecord[]> | null = null;

async function getSearchableSchools(): Promise<SchoolSearchRecord[]> {
  if (!searchableSchoolsPromise) {
    searchableSchoolsPromise = getSchoolIndex().then((index) =>
      index.map(
        (school): SchoolSearchRecord => ({
          id: school.id,
          name: school.name,
          slug: school.slug,
          region: school.city,
          city: school.city,
          metro: school.metro,
          province: school.province,
          grades: school.grades
            .map((g) => g.grade)
            .sort((a, b) => gradeRank(a) - gradeRank(b)),
          phases: getSchoolPhasesFromGrades(
            school.grades.map((g) => g.grade),
            school.name
          ),
          isFeatured: Boolean("isFeatured" in school && school.isFeatured),
          isPartner: school.isPartnerSchool,
          image: school.logo,
          lowestPrice: school.lowestPrice,
        })
      )
    );
  }
  return searchableSchoolsPromise;
}

/** Lazy singleton search index — built on first use */
let searchIndex: SchoolSearchIndex | null = null;
async function getSearchIndex() {
  if (!searchIndex) {
    searchIndex = new SchoolSearchIndex(await getSearchableSchools());
  }
  return searchIndex;
}

export async function getSchoolSearchOptions() {
  const schools = await getSearchableSchools();
  return {
    grades: getGrades(schools),
    regions: getRegions(schools),
  };
}

export async function getFeaturedSchoolRecords() {
  const schools = await getSearchableSchools();
  return getFeaturedSchools(schools, 4);
}

export async function searchSchoolRecords(
  filters: SchoolSearchFilters,
  limit = 12,
  offset = 0
) {
  const index = await getSearchIndex();
  return index.search(filters, limit, offset);
}
