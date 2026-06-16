type Pack = {
  id: string;
  name: string;
  category: "School" | "Pexpacks";
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
    title: "Business branding support",
    text: "Our branding package helps new businesses launch professionally with logo design, print materials, and a starter website.",
  },
];

export const featuredPacks: Pack[] = [];

export const homepagePacks: Pack[] = [];

export const mostPopularPacksHref = "/schools#school-grade-packs";
