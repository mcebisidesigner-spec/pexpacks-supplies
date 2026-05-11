export type Testimonial = {
  id: string;
  name: string;
  role: string;
  context: string;
  quote: string;
  avatar?: string;
};

// TODO: Replace with confirmed real testimonials and written permission before public marketing use.
export const testimonials: Testimonial[] = [
  {
    id: "sarah-nkosi",
    name: "Sarah Nkosi",
    role: "Parent",
    context: "Grade 3 learner",
    quote:
      "Pexpacks made back-to-school preparation simple. Everything was packed clearly and ready before the first day of school.",
    avatar: "/images/avatars/avatar-1.png"
  },
  {
    id: "lebo-maseko",
    name: "Lebo Maseko",
    role: "Teacher",
    context: "Primary school educator",
    quote:
      "When learners arrive with the correct stationery, teaching can begin immediately. Pexpacks helps remove that first-week stress.",
    avatar: "/images/avatars/avatar-2.png"
  },
  {
    id: "zanele-khumalo",
    name: "Zanele Khumalo",
    role: "Parent",
    context: "Grade 7 learner",
    quote:
      "I did not have to run around comparing stationery lists and shops. The pack was simple to understand and easy to order.",
    avatar: "/images/avatars/avatar-3.png"
  },
  {
    id: "thabo-dlamini",
    name: "Thabo Dlamini",
    role: "SME Owner",
    context: "Home office supplies",
    quote:
      "The office stationery pack helped me restock quickly without wasting time searching for individual items.",
    avatar: "/images/avatars/avatar-4.png"
  },
  {
    id: "mpho-sithole",
    name: "Mpho Sithole",
    role: "School Administrator",
    context: "School support team",
    quote:
      "A structured stationery pack system reduces confusion for parents and helps learners start the year prepared.",
    avatar: "/images/avatars/avatar-5.png"
  }
];
