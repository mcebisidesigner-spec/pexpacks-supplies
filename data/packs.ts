type Pack = {
  id: string;
  name: string;
  category: "School" | "Office" | "Pexpacks";
  subcategory?: string;
  description: string;
  bestFor: string;
  includes: string[];
  benefits?: string[];
  priceLabel: string;
  cta: string;
  href: string;
};

export const orderingWorksSteps = [
  {
    title: "Find your school",
    text: "Search your child's school and select the required grade.",
  },
  {
    title: "Review the pack",
    text: "All items perfectly match your official school stationery list.",
  },
  {
    title: "Delivered ready",
    text: "Skip the queues and receive a complete, ready-to-go box.",
  },
];

export const whyChoosePexpacks = [
  {
    title: "Ready-packed stationery",
    text: "We prepare complete stationery packs so you do not need to buy items one by one.",
  },
  {
    title: "School-list accuracy",
    text: "School packs are prepared according to official stationery lists and grade requirements — guaranteed.",
  },
  {
    title: "Exercise books included",
    text: "Where required by the school, correct exercise books are packed ready for learners.",
  },
  {
    title: "SME office support",
    text: "Office packs provide practical stationery for small businesses without wasting time.",
  },
];

export const featuredPacks: Pack[] = [
  {
    id: "foundation-phase-pack",
    name: "Foundation Phase Pack",
    category: "School",
    subcategory: "Foundation",
    description:
      "For Grade R-3 learners who need creative and foundation learning stationery, exercise books, pencils, glue, crayons, and classroom basics.",
    bestFor: "Grade R to Grade 3 learners",
    includes: [
      "Exercise books",
      "Wax crayons",
      "Glue stick",
      "Safety scissors",
      "Scrapbook",
    ],
    priceLabel: "From R 659",
    cta: "Foundation packs",
    href: "/foundation-phase#grades",
  },
  {
    id: "primary-school-pack",
    name: "Primary School Pack",
    category: "School",
    subcategory: "Primary",
    description:
      "For Grade 4-7 learners who need complete school stationery, exercise books, writing tools, files, and subject-ready supplies.",
    bestFor: "Grade 4 to Grade 7 learners",
    includes: [
      "Exercise books",
      "Pens",
      "Pencils",
      "Ruler",
      "Eraser",
      "Sharpener",
    ],
    priceLabel: "From R 779",
    cta: "Primary-school packs",
    href: "/primary-school#grades",
  },
  {
    id: "high-school-pack",
    name: "High School Pack",
    category: "School",
    subcategory: "High School",
    description:
      "For Grade 8-12 learners who need pens, exercise books, files, calculator-ready items, exam basics, and study stationery.",
    bestFor: "Grade 8 to Matric learners",
    includes: [
      "Subject books",
      "Pens",
      "Pencils",
      "Highlighters",
      "Files",
      "Exam pad",
    ],
    priceLabel: "From R 879",
    cta: "High-school packs",
    href: "/high-school#grades",
  },
  {
    id: "office-stationery-pack",
    name: "Office Stationery Pack",
    category: "Office",
    subcategory: "Office",
    description:
      "For SMEs and home offices that need reliable stationery, admin supplies, files, paper, pens, and monthly restock support.",
    bestFor: "SMEs and home offices",
    includes: [
      "Notebooks",
      "Pens",
      "Sticky notes",
      "Folders",
      "Correction tape",
      "Desk basics",
    ],
    priceLabel: "Request quote",
    cta: "Order This Pack",
    href: "/office",
  },
];

export const homepagePacks = featuredPacks.filter((pack) =>
  ["foundation-phase-pack", "primary-school-pack", "high-school-pack"].includes(
    pack.id
  )
);

export const mostPopularPacksHref = "/schools#school-grade-packs";
