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

export const featuredPacks: Pack[] = [];

