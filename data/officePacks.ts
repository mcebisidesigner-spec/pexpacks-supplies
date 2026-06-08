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
    id: "new-hire-setup",
    name: "The New Hire Desk Setup",
    slug: "new-hire-desk-setup",
    description: "Onboarding made instant. A complete desktop setup for new team members.",
    priceFrom: 349,
    contents: [
      "Notebook set",
      "Ballpoint pens",
      "Desk basics",
      "Highlighters",
      "Sticky notes",
    ],
  },
  {
    id: "boardroom-basics",
    name: "The Boardroom Basics",
    slug: "boardroom-basics",
    description: "Everything you need for successful meetings, workshops, and presentations.",
    priceFrom: 699,
    contents: [
      "Markers",
      "Flipchart paper",
      "Pens",
      "Folders",
    ],
  },
  {
    id: "monthly-admin-restock",
    name: "The Monthly Admin Restock",
    slug: "monthly-admin-restock",
    description: "Keep your office filing and printing running smoothly with a monthly replenishment.",
    priceFrom: 849,
    contents: [
      "Printer paper",
      "Lever arch files",
      "Plastic sleeves",
    ],
  },
];
