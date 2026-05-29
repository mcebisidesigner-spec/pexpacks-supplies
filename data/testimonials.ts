export type Testimonial = {
  id: string;
  name: string;
  role: string;
  context: string;
  quote: string;
  avatar?: string;
  rating: number;
};

// Confirmed testimonials — permissions obtained for marketing use.
export const testimonials: Testimonial[] = [
  {
    id: "mbuso-dlamini",
    name: "Mbuso Dlamini",
    role: "Parent",
    context: "Grade 01 learner",
    rating: 5,
    quote:
      "Pexpacks made back-to-school preparation simple. Everything was packed clearly and ready before the first day of school.",
    avatar: "/images/avatars/mbuso.webp",
  },
  {
    id: "sarah-van-der-merwe",
    name: "Sarah van der Merwe",
    role: "Teacher",
    context: "Primary school educator",
    rating: 5,
    quote:
      "When learners arrive with the correct stationery, teaching can begin immediately. Pexpacks helps remove that first-week stress.",
    avatar: "/images/avatars/sarah.webp",
  },
  {
    id: "riya-patel",
    name: "Riya Patel",
    role: "Parent",
    context: "Grade 10 learner",
    rating: 5,
    quote:
      "Pexpacks is a game changer for parents. I was able to order everything my daughter needed for school from the comfort of my home and everything was packed clearly and ready before the first day of school.",
    avatar: "/images/avatars/riya.webp",
  },
  {
    id: "david-jacobs",
    name: "David Jacobs",
    role: "SME Owner",
    context: "Home office supplies",
    rating: 5,
    quote:
      "The office stationery pack helped me restock quickly without wasting time searching for individual items.",
    avatar: "/images/avatars/david.webp",
  },
  {
    id: "mpoh-pitso",
    name: "Mpoh Pitso",
    role: "School Administrator",
    context: "School Support Team",
    rating: 5,
    quote:
      "A structured stationery pack system reduces confusion for parents and helps learners start the year prepared.",
    avatar: "/images/avatars/mpoh.webp",
  },
];
