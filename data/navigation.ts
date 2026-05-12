export type NavLink = {
  label: string;
  href: string;
};

export const mainNavLinks: NavLink[] = [
  { label: "Schools", href: "/schools" },
  { label: "Office", href: "/office-packs" },
  { label: "Partner", href: "/partner-with-schools" },
  { label: "Success Stories", href: "/success-stories" },
  { label: "Resources", href: "/blog" },
  { label: "Contact", href: "/contact" }
];

export const footerNavLinks: NavLink[] = [
  { label: "Schools", href: "/schools" },
  { label: "Office", href: "/office-packs" },
  { label: "Partner", href: "/partner-with-schools" },
  { label: "Resources", href: "/blog" },
  { label: "Contact", href: "/contact" }
];

export const footerLinks: NavLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Cookie Notice", href: "/cookie-notice" },
  { label: "Delivery Policy", href: "/delivery-policy" }
];
