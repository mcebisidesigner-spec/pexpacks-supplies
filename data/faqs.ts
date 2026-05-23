export type FAQ = {
  id: string;
  question: string;
  answer: string;
  links?: {
    label: string;
    href: string;
  }[];
};

export const faqs: FAQ[] = [
  {
    id: "school-not-listed",
    question: "What if my child's school is not listed?",
    answer:
      "You can request the school and grade through the enquiry flow. Pexpacks will follow up and help prepare the closest correct stationery pack option.",
    links: [
      { label: "Search listed schools", href: "/schools" },
      { label: "Contact Pexpacks", href: "/contact" },
    ],
  },
  {
    id: "delivery-timing",
    question: "How long does delivery take?",
    answer:
      "Delivery timing depends on the school season, pack availability and delivery area. Pexpacks confirms delivery or collection details during order follow-up.",
    links: [
      { label: "Delivery policy", href: "/delivery-policy" },
      { label: "Track an order", href: "/track-order" },
    ],
  },
  {
    id: "exercise-books",
    question: "Are exercise books included?",
    answer:
      "Yes, where the school or grade stationery list requires exercise books, they are included in the relevant pack contents.",
    links: [
      { label: "Find your school pack", href: "/schools" },
      {
        label: "Learn about Pexcover",
        href: "/blog/what-is-pexcover-book-covering",
      },
    ],
  },
  {
    id: "stationery-quality",
    question: "Are the stationery brands good quality?",
    answer:
      "Pexpacks focuses on practical, school-ready stationery that matches the agreed list requirements and is packed clearly for learners.",
    links: [
      { label: "Returns and refunds", href: "/returns-refunds-policy" },
      { label: "Terms of use", href: "/terms" },
    ],
  },
  {
    id: "multiple-learners",
    question: "Can I order for more than one learner?",
    answer:
      "Yes. You can submit the learners' school, grade and pack details, and Pexpacks will follow up to confirm the combined order.",
    links: [
      { label: "Start an order", href: "/order" },
      { label: "Find school packs", href: "/schools" },
    ],
  },
  {
    id: "school-list-submission",
    question: "Can schools send Pexpacks their stationery lists?",
    answer:
      "Yes. Schools can use the partnership enquiry route to share grade lists so parents can order clearer, grade-specific stationery packs.",
    links: [
      { label: "School partnership", href: "/partnership" },
      { label: "School partnership terms", href: "/school-partnership-terms" },
    ],
  },
  {
    id: "sme-office-packs",
    question: "Do you supply SME office stationery packs?",
    answer:
      "Yes. Pexpacks supplies practical office stationery packs for SMEs, teachers, tutors and home-office buyers.",
    links: [
      { label: "Office packs", href: "/office" },
      { label: "Request a quote", href: "/office#contact-enquiry" },
    ],
  },
  {
    id: "custom-office-quote",
    question: "Can I request a custom office quote?",
    answer:
      "Yes. Use the office pack or contact enquiry route and include your business name, quantity and stationery requirements.",
    links: [
      { label: "Request a quote", href: "/office#contact-enquiry" },
      { label: "Office packs", href: "/office" },
    ],
  },
  {
    id: "payment-flow",
    question: "How does payment work?",
    answer:
      "The website currently captures an enquiry order. Pexpacks confirms availability, pricing, delivery details and payment instructions during follow-up.",
    links: [
      { label: "Start an order", href: "/order" },
      { label: "Terms of use", href: "/terms" },
    ],
  },
  {
    id: "list-updates",
    question: "Can items change if the school updates the list?",
    answer:
      "Yes. If the school updates its stationery list, Pexpacks can confirm the latest requirements before finalising the pack.",
    links: [
      { label: "Find your school", href: "/schools" },
      { label: "Contact support", href: "/contact" },
    ],
  },
];
