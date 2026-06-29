export type FAQ = {
  id: string;
  category: "School packs" | "Orders" | "Delivery" | "Payment" | "Schools" | "Savings Plan";
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
    category: "School packs",
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
    category: "Delivery",
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
    category: "School packs",
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
    category: "School packs",
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
    category: "Orders",
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
    category: "Schools",
    question: "Can schools send Pexpacks their stationery lists?",
    answer:
      "Yes. Schools can use the partnership enquiry route to share grade lists so parents can order clearer, grade-specific stationery packs.",
    links: [
      { label: "School partnership", href: "/partnership" },
      { label: "School partnership terms", href: "/school-partnership-terms" },
    ],
  },

  {
    id: "payment-flow",
    category: "Payment",
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
    category: "School packs",
    question: "Can items change if the school updates the list?",
    answer:
      "Yes. If the school updates its stationery list, Pexpacks can confirm the latest requirements before finalising the pack.",
    links: [
      { label: "Find your school", href: "/schools" },
      { label: "Contact support", href: "/contact" },
    ],
  },
  {
    id: "find-grade-pack",
    category: "School packs",
    question: "How do I find the correct grade pack?",
    answer:
      "Search for your school, choose the learner's grade, and review the pack details before submitting your order enquiry. If anything is unclear, Pexpacks can confirm the list before the order is finalised.",
    links: [
      { label: "Find your school", href: "/schools" },
      { label: "Start an order", href: "/order" },
    ],
  },
  {
    id: "customise-pack",
    category: "Orders",
    question: "Can I customise a school pack?",
    answer:
      "Yes. If you only need selected items or want to adjust the pack, submit the enquiry with the details you need and Pexpacks will confirm availability and pricing.",
    links: [
      { label: "Custom order", href: "/order" },
      { label: "Contact support", href: "/contact" },
    ],
  },
  {
    id: "delivery-areas",
    category: "Delivery",
    question: "Which areas do you deliver to?",
    answer:
      "Delivery depends on the school, area, order size, and seasonal availability. Pexpacks confirms the best delivery or collection option during order follow-up.",
    links: [
      { label: "Delivery policy", href: "/delivery-policy" },
      { label: "Contact Pexpacks", href: "/contact" },
    ],
  },
  {
    id: "order-changes",
    category: "Orders",
    question: "Can I change an order after submitting it?",
    answer:
      "If the order has not yet been finalised or packed, Pexpacks can usually help update learner details, grade selection, quantities, or contact information.",
    links: [
      { label: "Contact support", href: "/contact" },
      { label: "Returns and refunds", href: "/returns-refunds-policy" },
    ],
  },
  {
    id: "payment-before-packing",
    category: "Payment",
    question: "Do I pay before the pack is prepared?",
    answer:
      "Pexpacks confirms the order details, availability, delivery path, and payment instructions before finalising the pack preparation.",
    links: [
      { label: "Terms of use", href: "/terms" },
      { label: "Start an order", href: "/order" },
    ],
  },
  {
    id: "proof-of-payment",
    category: "Payment",
    question: "Where do I send proof of payment?",
    answer:
      "Use the payment instructions provided during order follow-up. Include the learner or order reference where possible so the payment can be matched quickly.",
    links: [
      { label: "Track an order", href: "/track-order" },
      { label: "Contact support", href: "/contact" },
    ],
  },
  {
    id: "book-covering-service",
    category: "School packs",
    question: "Can books be covered before delivery?",
    answer:
      "Where Pexcover is available, Pexpacks can help with book-covering support so learners receive neater, school-ready books.",
    links: [
      {
        label: "Learn about Pexcover",
        href: "/blog/what-is-pexcover-book-covering",
      },
      { label: "Find your pack", href: "/schools" },
    ],
  },
  {
    id: "savings-plan-basics",
    category: "Savings Plan",
    question: "What is the Pexpacks Savings Plan?",
    answer:
      "The Savings Plan is a non-interest-bearing programme that lets you contribute money toward a future stationery pack order over time. Once your saved amount matches the order value, Pexpacks will pack and dispatch the order. It gives you more flexibility than paying the full amount upfront.",
    links: [
      { label: "Savings plan terms", href: "/terms#savings-plan-terms" },
      { label: "Contact us", href: "/contact?topic=savings-plan" },
    ],
  },
  {
    id: "savings-plan-vs-layby",
    category: "Savings Plan",
    question: "How is this different from lay-by?",
    answer:
      "Unlike a traditional lay-by, goods in the Savings Plan are not reserved or packed until the balance is fully settled. This keeps things flexible: you can change your order, pause contributions, or request a full refund at any time before value match.",
    links: [
      { label: "Savings plan terms", href: "/terms#savings-plan-terms" },
    ],
  },
  {
    id: "savings-plan-start",
    category: "Savings Plan",
    question: "How do I start saving?",
    answer:
      "You can register interest during checkout or by contacting Pexpacks. Once enrolled, you will receive instructions on how to make deposits and track your savings balance.",
    links: [
      { label: "Contact us", href: "/contact?topic=savings-plan" },
    ],
  },
  {
    id: "savings-plan-refund",
    category: "Savings Plan",
    question: "Can I get my money back?",
    answer:
      "Yes. You can request a full refund of all deposits at any time before the order is value-matched or fulfilled. Refunds are processed within 14 business days to the original payment method where possible.",
    links: [
      { label: "Savings plan terms", href: "/terms#savings-plan-terms" },
    ],
  },
  {
    id: "savings-plan-value-match",
    category: "Savings Plan",
    question: "What happens when I reach the full order value?",
    answer:
      "Once your deposits match or exceed the order amount (value match), Pexpacks will contact you to confirm the order and begin packing and delivery. You can also choose to pay the outstanding balance early to speed things up.",
    links: [
      { label: "Delivery policy", href: "/delivery-policy" },
    ],
  },
  {
    id: "savings-plan-price-change",
    category: "Savings Plan",
    question: "What if the price changes while I am saving?",
    answer:
      "Prices are not locked in while you save. If the price changes before your order is settled, Pexpacks will notify you. You can then choose to pay the difference or receive a full refund of your deposits.",
    links: [
      { label: "Savings plan terms", href: "/terms#savings-plan-terms" },
    ],
  },
  {
    id: "school-rebate",
    category: "Schools",
    question: "How does the school partnership benefit schools?",
    answer:
      "The partnership model can reduce stationery admin for schools, give parents a clearer ordering path, and create a managed online experience around school lists and pack orders.",
    links: [
      { label: "School partnership", href: "/partnership" },
      { label: "Partnership terms", href: "/school-partnership-terms" },
    ],
  },
];
