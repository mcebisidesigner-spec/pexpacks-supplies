import { schools, type GradePack, type School } from "@/data/schools";

export function getSchoolBySlug(slug: string) {
  return schools.find((school) => school.slug === slug);
}

export function getGradeBySlug(schoolSlug: string, gradeSlug: string) {
  const school = getSchoolBySlug(schoolSlug);

  if (!school) {
    return undefined;
  }

  return school.grades.find((grade) => grade.gradeSlug === gradeSlug);
}

export function filterSchools(query: string, city: string, grade: string) {
  const normalizedQuery = query.trim().toLowerCase();

  return schools.filter((school) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      school.name.toLowerCase().includes(normalizedQuery) ||
      school.city.toLowerCase().includes(normalizedQuery);
    const matchesCity = city === "all" || school.city === city;
    const matchesGrade = grade === "all" || school.grades.some((item) => item.grade === grade);

    return matchesQuery && matchesCity && matchesGrade;
  });
}

export function normalizeSchoolSearchValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\bschool\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolveSchoolSearch(value: string): { school?: School; ambiguous: boolean } {
  const normalizedValue = normalizeSchoolSearchValue(value);

  if (!normalizedValue) {
    return { ambiguous: false };
  }

  const exactMatch = schools.find((school) => normalizeSchoolSearchValue(school.name) === normalizedValue);

  if (exactMatch) {
    return { school: exactMatch, ambiguous: false };
  }

  const partialMatches = schools.filter((school) => {
    const normalizedSchoolName = normalizeSchoolSearchValue(school.name);

    return normalizedSchoolName.includes(normalizedValue) || normalizedValue.includes(normalizedSchoolName);
  });

  if (partialMatches.length === 1) {
    return { school: partialMatches[0], ambiguous: false };
  }

  return { ambiguous: partialMatches.length > 1 };
}

export function getGradeBySearchValue(school: School, value: string): GradePack | undefined {
  const normalizedGrade = value.trim().toLowerCase();

  return school.grades.find(
    (grade) => grade.grade.toLowerCase() === normalizedGrade || grade.gradeSlug.toLowerCase() === normalizedGrade
  );
}
