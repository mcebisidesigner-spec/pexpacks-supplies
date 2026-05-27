export const schoolPhaseOptions = [
  { value: "high-schools", label: "High schools" },
  { value: "primary-schools", label: "Primary schools" },
  { value: "pre-schools", label: "Pre-schools" },
] as const;

export type SchoolPhase = (typeof schoolPhaseOptions)[number]["value"];

const highSchoolGrades = new Set(["grade 8", "grade 9", "grade 10", "grade 11", "grade 12"]);
const primarySchoolGrades = new Set([
  "grade r",
  "grade 1",
  "grade 2",
  "grade 3",
  "grade 4",
  "grade 5",
  "grade 6",
  "grade 7",
]);

const preSchoolNameMatchers = [
  "creche",
  "pre-school",
  "preschool",
  "pre school",
  "nursery",
  "playschool",
  "play school",
  "early childhood",
  "ecd",
  "kindergarten",
];

function normaliseGradeLabel(grade: string) {
  return grade.toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

export function getSchoolPhasesFromGrades(grades: string[], schoolName = ""): SchoolPhase[] {
  const phases = new Set<SchoolPhase>();
  const normalisedName = schoolName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  if (preSchoolNameMatchers.some((matcher) => normalisedName.includes(matcher))) {
    phases.add("pre-schools");
  }

  for (const grade of grades) {
    const normalised = normaliseGradeLabel(grade);

    if (highSchoolGrades.has(normalised)) {
      phases.add("high-schools");
      continue;
    }

    if (primarySchoolGrades.has(normalised)) {
      phases.add("primary-schools");
      continue;
    }

  }

  return schoolPhaseOptions
    .map((option) => option.value)
    .filter((phase) => phases.has(phase));
}

export function isSchoolPhase(value: string | undefined): value is SchoolPhase {
  return schoolPhaseOptions.some((option) => option.value === value);
}

export function getSchoolPhaseLabel(value: SchoolPhase) {
  return schoolPhaseOptions.find((option) => option.value === value)?.label ?? value;
}
