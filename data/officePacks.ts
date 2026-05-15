export type OfficePack = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceFrom: number;
  contents: string[];
};

export const officePacks: OfficePack[] = [
  {
    id: "home-office-starter",
    name: "Home Office Starter Pack",
    slug: "home-office-starter-pack",
    description: "A tidy pack for one desk, tutor setup or home office.",
    priceFrom: 449,
    contents: [
      "Notebook set",
      "Ballpoint pens",
      "Pencils",
      "Sticky notes",
      "Correction tape",
      "Filing basics",
    ],
  },
  {
    id: "small-business-monthly",
    name: "Small Business Monthly Pack",
    slug: "small-business-monthly-pack",
    description:
      "A monthly refill pack for small teams that need consistent stationery basics.",
    priceFrom: 899,
    contents: [
      "Pens",
      "Notebooks",
      "Sticky notes",
      "Folders",
      "Markers",
      "Desk basics",
    ],
  },
  {
    id: "bulk-office-supply",
    name: "Construction Admin Pack",
    slug: "construction-admin-pack",
    description:
      "A quote-based admin pack for site files, job cards, markers and office basics.",
    priceFrom: 0,
    contents: [
      "Job-card books",
      "Pens",
      "Markers",
      "Files",
      "Labels",
      "Clipboards",
    ],
  },
  {
    id: "retail-shop-admin",
    name: "Retail Shop Admin Pack",
    slug: "retail-shop-admin-pack",
    description:
      "Stationery and counter basics for small shops that need simple monthly replenishment.",
    priceFrom: 0,
    contents: [
      "Receipt books",
      "Pens",
      "Labels",
      "Price tags",
      "Tape",
      "Notebooks",
    ],
  },
  {
    id: "printer-paper-filing",
    name: "Printer Paper and Filing Pack",
    slug: "printer-paper-filing-pack",
    description:
      "Paper, folders and filing essentials for admin teams, tutors and small offices.",
    priceFrom: 0,
    contents: [
      "Printer paper",
      "Lever arch files",
      "Dividers",
      "Labels",
      "Plastic sleeves",
      "Sticky notes",
    ],
  },
];
