export type Testimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatar: string;
};

export const testimonials: Testimonial[] = [
  {
    id: "sarah-nkosi",
    name: "Sarah Nkosi",
    role: "Parent",
    quote:
      "Pexpacks made back-to-school shopping simple. Everything was packed and ready, and I did not have to run around looking for each item.",
    avatar: "/images/avatars/avatar-1.png"
  },
  {
    id: "school-admin",
    name: "Lebo Maseko",
    role: "Teacher",
    quote:
      "When learners arrive with the right stationery, teaching starts faster. Pexpacks helps make the first day smoother.",
    avatar: "/images/avatars/avatar-2.png"
  },
  {
    id: "office-owner",
    name: "Thabo Dlamini",
    role: "SME Owner",
    quote: "Our office supplies are now easier to manage. Pexpacks packs the essentials so we do not waste time shopping.",
    avatar: "/images/avatars/avatar-3.png"
  }
];
