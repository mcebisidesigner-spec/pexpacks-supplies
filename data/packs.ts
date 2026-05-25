export type MainCategory = {
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: "school" | "office" | "package";
};

export type Pack = {
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

export const mainCategories: MainCategory[] = [
  {
    title: "School Packs",
    description:
      "Stationery packs prepared according to school lists and grade requirements.",
    href: "/schools",
    cta: "Find Your School Pack",
    icon: "school",
  },
  {
    title: "Office Packs",
    description:
      "Practical office stationery packs for SMEs, home offices, and small businesses.",
    href: "/office",
    cta: "View Office Stationery",
    icon: "office",
  },
  {
    title: "Order a Pack",
    description:
      "Submit a stationery pack order enquiry and our team will confirm the details.",
    href: "/order",
    cta: "Start an Order Enquiry",
    icon: "package",
  },
];

export const trustBadges = [
  "Save time and money",
  "Packed for your school list",
  "Delivered or ready for collection",
];

export const schoolPackBenefits = [
  "Prepared according to school stationery lists",
  "Exercise books included per learner",
  "Grade-specific items checked before packing",
  "Delivery or collection options",
  "Parent prepayment options supported",
];

export const processSteps = [
  "Find your school",
  "Choose your grade",
  "Confirm your pack",
  "Order online",
  "Start school ready",
];

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
    cta: "Order This Pack",
    href: "/foundation-phase",
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
    cta: "Order This Pack",
    href: "/primary-school",
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
    cta: "Order This Pack",
    href: "/high-school",
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
