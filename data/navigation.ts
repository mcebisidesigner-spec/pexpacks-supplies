export type NavLink = {
  label: string;
  href: string;
};

export const mainNavLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "School", href: "/school" },
  { label: "Office", href: "/office" },
  { label: "Copex", href: "/copex" },
  { label: "Contact", href: "/contact" }
];

export const footerNavLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "School", href: "/school" },
  { label: "Office", href: "/office" },
  { label: "Copex", href: "/copex" },
  { label: "Contact", href: "/contact" }
];

export const footerLinks: NavLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Cookie Notice", href: "/cookie-notice" },
  { label: "Delivery Policy", href: "/delivery-policy" }
];
