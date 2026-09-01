/** Client-safe constants for the Website Content admin module. */

export const FAQ_CATEGORIES = [
  "School packs",
  "Orders",
  "Delivery",
  "Payment",
  "Schools",
  "Happy Pay (BNPL)",
] as const;

export const TESTIMONIAL_RATINGS = [5, 4, 3, 2, 1] as const;

/**
 * Public pages whose hero "eyebrow" text is editable from the
 * Eyebrows & Banners tab. Safe to import in client components.
 */
export const PAGE_HERO_SECTIONS = [
  { key: "homepage.hero", label: "Homepage", route: "/" },
  { key: "schools.hero", label: "Schools", route: "/schools" },
  { key: "track-order.hero", label: "Track order", route: "/track-order" },
  {
    key: "add-your-school.hero",
    label: "Add your school",
    route: "/add-your-school",
  },
  { key: "faq.hero", label: "FAQ", route: "/faq" },
  { key: "partnership.hero", label: "Partnership", route: "/partnership" },
] as const;
