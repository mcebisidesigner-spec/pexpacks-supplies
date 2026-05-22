import {
  getSchoolBySlug as getSchoolRecordBySlug,
} from "@/data/schools";

export async function getSchoolBySlug(slug: string) {
  return getSchoolRecordBySlug(slug);
}

export async function getGradeBySlug(schoolSlug: string, gradeSlug: string) {
  const school = await getSchoolBySlug(schoolSlug);

  if (!school) {
    return undefined;
  }

  return school.grades.find((grade) => grade.gradeSlug === gradeSlug);
}
