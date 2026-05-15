export type StationeryItem = {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  specification?: string;
  category: "Core Essentials" | "Durables" | "Brand Upgrades";
  icon?:
    | "notebook"
    | "crayon"
    | "glue"
    | "scissors"
    | "pencil"
    | "pen"
    | "ruler"
    | "eraser"
    | "sharpener"
    | "highlighter"
    | "pad"
    | "calculator"
    | "file";
  unitPrice?: number;
};

export type GradePackTemplate = {
  id: string;
  grade: string;
  title: string;
  priceFrom: number;
  bestFor: string;
  summary: string;
  items: StationeryItem[];
};

export type PhasePack = {
  id: string;
  title: string;
  slug: string;
  eyebrow: string;
  phaseRange: string;
  description: string;
  heroBullets: string[];
  gradePacks: GradePackTemplate[];
};

// TODO: confirm final pricing before launch
const foundationItems: StationeryItem[] = [
  {
    id: "fp-1",
    name: "A4 Unruled Exercise Book",
    quantity: 4,
    specification: "72 page",
    category: "Core Essentials",
    icon: "notebook",
    unitPrice: 20,
  },
  {
    id: "fp-2",
    name: "Jumbo Wax Crayons",
    quantity: 1,
    specification: "12 Pack",
    category: "Core Essentials",
    icon: "crayon",
    unitPrice: 45,
  },
  {
    id: "fp-3",
    name: "Glue Stick",
    quantity: 2,
    specification: "40g",
    category: "Core Essentials",
    icon: "glue",
    unitPrice: 35,
  },
  {
    id: "fp-4",
    name: "Safety Scissors",
    quantity: 1,
    category: "Durables",
    icon: "scissors",
    unitPrice: 25,
  },
  {
    id: "fp-5",
    name: "A4 Blank Scrapbook",
    quantity: 2,
    category: "Core Essentials",
    icon: "notebook",
    unitPrice: 30,
  },
  {
    id: "fp-6",
    name: "HB Pencils (Beginner)",
    quantity: 4,
    category: "Core Essentials",
    icon: "pencil",
    unitPrice: 10,
  },
];

const primaryItems: StationeryItem[] = [
  {
    id: "ps-1",
    name: "A4 Feint & Margin Exercise Book",
    quantity: 8,
    specification: "72 page",
    category: "Core Essentials",
    icon: "notebook",
    unitPrice: 20,
  },
  {
    id: "ps-2",
    name: "Blue Ballpoint Pens",
    quantity: 4,
    category: "Core Essentials",
    icon: "pen",
    unitPrice: 15,
  },
  {
    id: "ps-3",
    name: "HB Pencils",
    quantity: 4,
    category: "Core Essentials",
    icon: "pencil",
    unitPrice: 10,
  },
  {
    id: "ps-4",
    name: "Ruler",
    quantity: 1,
    specification: "30cm Clear",
    category: "Durables",
    icon: "ruler",
    unitPrice: 12,
  },
  {
    id: "ps-5",
    name: "Eraser",
    quantity: 2,
    category: "Core Essentials",
    icon: "eraser",
    unitPrice: 10,
  },
  {
    id: "ps-6",
    name: "Metal Sharpener",
    quantity: 1,
    category: "Durables",
    icon: "sharpener",
    unitPrice: 25,
  },
  {
    id: "ps-7",
    name: "Glue Stick",
    quantity: 2,
    specification: "40g",
    category: "Core Essentials",
    icon: "glue",
    unitPrice: 35,
  },
];

const highSchoolItems: StationeryItem[] = [
  {
    id: "hs-1",
    name: "A4 Feint & Margin Exercise Book",
    quantity: 10,
    specification: "72 page",
    category: "Core Essentials",
    icon: "notebook",
    unitPrice: 20,
  },
  {
    id: "hs-2",
    name: "Blue Ballpoint Pens",
    quantity: 6,
    category: "Core Essentials",
    icon: "pen",
    unitPrice: 15,
  },
  {
    id: "hs-3",
    name: "HB Pencils",
    quantity: 4,
    category: "Core Essentials",
    icon: "pencil",
    unitPrice: 10,
  },
  {
    id: "hs-4",
    name: "Highlighters",
    quantity: 4,
    specification: "Assorted Colours",
    category: "Core Essentials",
    icon: "highlighter",
    unitPrice: 25,
  },
  {
    id: "hs-5",
    name: "A4 Exam Pad",
    quantity: 2,
    specification: "100 page punched",
    category: "Core Essentials",
    icon: "pad",
    unitPrice: 35,
  },
  {
    id: "hs-6",
    name: "Scientific Calculator",
    quantity: 1,
    category: "Durables",
    icon: "calculator",
    unitPrice: 350,
  },
  {
    id: "hs-7",
    name: "Ring Binder File",
    quantity: 2,
    category: "Durables",
    icon: "file",
    unitPrice: 45,
  },
];

export const phasePacks: PhasePack[] = [
  {
    id: "foundation-phase",
    title: "Foundation Phase Stationery Packs",
    slug: "foundation-phase",
    eyebrow: "Foundation Phase Packs",
    phaseRange: "Grade R to Grade 3",
    description:
      "Ready-packed stationery for Grade R to Grade 3 learners, prepared around common school stationery needs and easy to customise for your child.",
    heroBullets: [
      "Grade R to Grade 3 baseline combos",
      "Exercise books and creative basics",
      "Customise before checkout",
      "Delivery or collection options",
    ],
    gradePacks: [
      {
        id: "grade-r-pack",
        grade: "Grade R",
        title: "Grade R Baseline Pack",
        priceFrom: 659,
        bestFor: "Grade R learners",
        summary:
          "Essential creative tools and learning basics for the first year.",
        items: foundationItems,
      },
      {
        id: "grade-1-pack",
        grade: "Grade 1",
        title: "Grade 1 Baseline Pack",
        priceFrom: 659,
        bestFor: "Grade 1 learners",
        summary: "Writing basics and creative tools for Grade 1.",
        items: foundationItems,
      },
      {
        id: "grade-2-pack",
        grade: "Grade 2",
        title: "Grade 2 Baseline Pack",
        priceFrom: 659,
        bestFor: "Grade 2 learners",
        summary: "Standard curriculum tools for Grade 2.",
        items: foundationItems,
      },
      {
        id: "grade-3-pack",
        grade: "Grade 3",
        title: "Grade 3 Baseline Pack",
        priceFrom: 659,
        bestFor: "Grade 3 learners",
        summary: "Advanced foundation tools for Grade 3.",
        items: foundationItems,
      },
    ],
  },
  {
    id: "primary-school",
    title: "Primary School Stationery Packs",
    slug: "primary-school",
    eyebrow: "Primary School Packs",
    phaseRange: "Grade 4 to Grade 7",
    description:
      "Ready-packed stationery for Grade 4 to Grade 7 learners, including school essentials, exercise books and writing supplies.",
    heroBullets: [
      "Grade 4 to Grade 7 baseline combos",
      "Exercise books and writing basics",
      "Customise before checkout",
      "Delivery or collection options",
    ],
    gradePacks: [
      {
        id: "grade-4-pack",
        grade: "Grade 4",
        title: "Grade 4 Baseline Pack",
        priceFrom: 779,
        bestFor: "Grade 4 learners",
        summary: "Standard curriculum tools for Grade 4.",
        items: primaryItems,
      },
      {
        id: "grade-5-pack",
        grade: "Grade 5",
        title: "Grade 5 Baseline Pack",
        priceFrom: 779,
        bestFor: "Grade 5 learners",
        summary: "Standard curriculum tools for Grade 5.",
        items: primaryItems,
      },
      {
        id: "grade-6-pack",
        grade: "Grade 6",
        title: "Grade 6 Baseline Pack",
        priceFrom: 779,
        bestFor: "Grade 6 learners",
        summary: "Standard curriculum tools for Grade 6.",
        items: primaryItems,
      },
      {
        id: "grade-7-pack",
        grade: "Grade 7",
        title: "Grade 7 Baseline Pack",
        priceFrom: 779,
        bestFor: "Grade 7 learners",
        summary: "Standard curriculum tools for Grade 7.",
        items: primaryItems,
      },
    ],
  },
  {
    id: "high-school",
    title: "High School Stationery Packs",
    slug: "high-school",
    eyebrow: "High School Packs",
    phaseRange: "Grade 8 to Matric",
    description:
      "Ready-packed stationery for Grade 8 to Grade 12 learners, including exercise books, pens, files, calculator-ready items and exam basics.",
    heroBullets: [
      "Grade 8 to Matric baseline combos",
      "Subject books and exam basics",
      "Customise before checkout",
      "Delivery or collection options",
    ],
    gradePacks: [
      {
        id: "grade-8-pack",
        grade: "Grade 8",
        title: "Grade 8 Baseline Pack",
        priceFrom: 879,
        bestFor: "Grade 8 learners",
        summary: "Standard curriculum tools for Grade 8.",
        items: highSchoolItems,
      },
      {
        id: "grade-9-pack",
        grade: "Grade 9",
        title: "Grade 9 Baseline Pack",
        priceFrom: 879,
        bestFor: "Grade 9 learners",
        summary: "Standard curriculum tools for Grade 9.",
        items: highSchoolItems,
      },
      {
        id: "grade-10-pack",
        grade: "Grade 10",
        title: "Grade 10 Baseline Pack",
        priceFrom: 879,
        bestFor: "Grade 10 learners",
        summary: "Standard curriculum tools for Grade 10.",
        items: highSchoolItems,
      },
      {
        id: "grade-11-pack",
        grade: "Grade 11",
        title: "Grade 11 Baseline Pack",
        priceFrom: 879,
        bestFor: "Grade 11 learners",
        summary: "Standard curriculum tools for Grade 11.",
        items: highSchoolItems,
      },
      {
        id: "grade-12-pack",
        grade: "Grade 12",
        title: "Matric Baseline Pack",
        priceFrom: 879,
        bestFor: "Grade 12 / Matric learners",
        summary: "Standard curriculum tools for Matric.",
        items: highSchoolItems,
      },
    ],
  },
];
