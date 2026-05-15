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
    id: "mbuso-dlamini",
    name: "Mbuso Dlamini",
    role: "Parent",
    context: "Grade 01 learner",
    quote:
      "Pexpacks made back-to-school preparation simple. Everything was packed clearly and ready before the first day of school.",
    avatar: "/images/avatars/mbuso.webp",
  },
  {
    id: "thandeka-mkize",
    name: "Thandeka Mkhize",
    role: "Teacher",
    context: "Primary school educator",
    quote:
      "When learners arrive with the correct stationery, teaching can begin immediately. Pexpacks helps remove that first-week stress.",
    avatar: "/images/avatars/thandeka.webp",
  },
  {
    id: "lisa-bomani",
    name: "Lisa Bomani",
    role: "Parent",
    context: "Grade 10 learner",
    quote:
      "Pexpacks is a game changer for parents. I was able to order everything my daughter needed for school from the comfort of my home and everything was packed clearly and ready before the first day of school.",
    avatar: "/images/avatars/lisa.webp",
  },
  {
    id: "ndoda-mabuz",
    name: "Ndoda Mabuza",
    role: "SME Owner",
    context: "Home office supplies",
    quote:
      "The office stationery pack helped me restock quickly without wasting time searching for individual items.",
    avatar: "/images/avatars/ndoda.webp",
  },
  {
    id: "mpoh-pitso",
    name: "Mpoh Pitso",
    role: "School Administrator",
    context: "School Support Team",
    quote:
      "A structured stationery pack system reduces confusion for parents and helps learners start the year prepared.",
    avatar: "/images/avatars/mpoh.webp",
  },
];
