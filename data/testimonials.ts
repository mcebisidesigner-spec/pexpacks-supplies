export type Testimonial = {
  id: string;
  name: string;
  role: string;
  schoolOrBusiness: string;
  quote: string;
  avatar: string;
};

export const testimonials: Testimonial[] = [
  {
    id: "sarah-nkosi",
    name: "Sarah Nkosi",
    role: "Parent of a Grade 3 learner",
    schoolOrBusiness: "Parktown Primary",
    quote:
      "Pexpacks made back-to-school shopping simple. Everything was packed and ready, and I did not have to run around looking for each item.",
    avatar: "/images/avatars/avatar-1.png"
  },
  {
    id: "school-admin",
    name: "Lebo Maseko",
    role: "School administrator",
    schoolOrBusiness: "Johannesburg Primary School",
    quote:
      "The pack process gives parents a clearer route. Fewer missing items means the first week of school starts with less admin pressure.",
    avatar: "/images/avatars/avatar-2.png"
  },
  {
    id: "office-owner",
    name: "Thabo Dlamini",
    role: "SME owner",
    schoolOrBusiness: "Small business in Gauteng",
    quote: "Our office supplies are now easier to manage. Pexpacks packs the essentials so we do not waste time shopping.",
    avatar: "/images/avatars/avatar-3.png"
  },
  {
    id: "nomsa-grade-seven",
    name: "Nomsa Khumalo",
    role: "Parent of a Grade 7 learner",
    schoolOrBusiness: "Germiston Primary",
    quote:
      "The grade pack helped us budget early and avoid the January rush. It was clear what we were ordering and what would be included.",
    avatar: "/images/avatars/avatar-4.png"
  },
  {
    id: "zanele-office",
    name: "Zanele Mokoena",
    role: "Office manager",
    schoolOrBusiness: "Pretoria admin team",
    quote:
      "Having a ready office pack keeps small things from becoming disruptions. The team knows what to expect and when to reorder.",
    avatar: "/images/avatars/avatar-5.png"
  }
];
