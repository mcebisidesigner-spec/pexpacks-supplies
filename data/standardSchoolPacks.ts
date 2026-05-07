export type StandardSchoolPack = {
  id: string;
  grade: string;
  gradeSlug: string;
  phase: string;
  description: string;
  includes: string[];
  priceLabel: string;
};

const foundationIncludes = ["Exercise books", "Pencils", "Crayons", "Glue stick", "Safety scissors"];
const intermediateIncludes = ["Exercise books", "Pens", "Pencils", "Ruler", "Colour pencils", "Eraser"];
const seniorIncludes = ["Subject books", "Blue pens", "Pencils", "Highlighters", "Exam pad", "Files"];
const fetIncludes = ["Subject books", "Pens", "Exam pads", "Highlighters", "Files", "Mathematical set"];

export const standardSchoolPacks: StandardSchoolPack[] = [
  {
    id: "standard-grade-r",
    grade: "Grade R",
    gradeSlug: "grade-r",
    phase: "Foundation",
    description: "A ready starter combo for early learning, class activities and first school routines.",
    includes: foundationIncludes,
    priceLabel: "Request Grade R price"
  },
  ...Array.from({ length: 3 }, (_, index) => {
    const grade = index + 1;

    return {
      id: `standard-grade-${grade}`,
      grade: `Grade ${grade}`,
      gradeSlug: `grade-${grade}`,
      phase: "Foundation",
      description: "A primary school combo for writing, drawing, books and classroom basics.",
      includes: foundationIncludes,
      priceLabel: `Request Grade ${grade} price`
    };
  }),
  ...Array.from({ length: 4 }, (_, index) => {
    const grade = index + 4;

    return {
      id: `standard-grade-${grade}`,
      grade: `Grade ${grade}`,
      gradeSlug: `grade-${grade}`,
      phase: "Intermediate",
      description: "A practical learner combo for subject work, writing tools and daily school tasks.",
      includes: intermediateIncludes,
      priceLabel: `Request Grade ${grade} price`
    };
  }),
  ...Array.from({ length: 2 }, (_, index) => {
    const grade = index + 8;

    return {
      id: `standard-grade-${grade}`,
      grade: `Grade ${grade}`,
      gradeSlug: `grade-${grade}`,
      phase: "Senior",
      description: "A high school starter combo for notebooks, files, writing tools and study preparation.",
      includes: seniorIncludes,
      priceLabel: `Request Grade ${grade} price`
    };
  }),
  ...Array.from({ length: 3 }, (_, index) => {
    const grade = index + 10;

    return {
      id: `standard-grade-${grade}`,
      grade: `Grade ${grade}`,
      gradeSlug: `grade-${grade}`,
      phase: "FET",
      description: "A senior subject combo for exam preparation, written work and project admin.",
      includes: fetIncludes,
      priceLabel: `Request Grade ${grade} price`
    };
  })
];
