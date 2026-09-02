export type FAQ = {
  id: string;
  category:
    | "School packs"
    | "Orders"
    | "Delivery"
    | "Payment"
    | "Schools"
    | "Happy Pay (BNPL)"
    | string;
  question: string;
  answer: string;
  target_page?: "all" | "homepage" | "schools" | string;
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
    id: "track-order-how",
    category: "Orders",
    question: "How do I track my stationery order status?",
    answer:
      "Enter your Order Reference, Customer Email, or Unique Customer ID in the tracking form above to view your live order status, packing stage, and delivery updates instantly.",
    links: [
      { label: "Track an order", href: "/track-order" },
      { label: "Contact support", href: "/contact" },
    ],
  },
  {
    id: "track-order-status-meaning",
    category: "Orders",
    question: "What do the different order tracking statuses mean?",
    answer:
      "Order Placed means your order was received. Processing & Packed means items are being assembled. Handed to Courier means your pack is in transit. Out for Delivery means it is arriving today. Delivered means receipt is confirmed.",
    links: [{ label: "Contact support", href: "/contact" }],
  },
  {
    id: "track-order-missing-ref",
    category: "Orders",
    question: "What if I cannot find my order reference or customer ID?",
    answer:
      "Check your order confirmation email or SMS receipt for your Order Reference or Unique Customer ID. If you still cannot locate your details, contact Pexpacks support with your buyer email or proof of payment.",
    links: [{ label: "Contact support", href: "/contact" }],
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
    id: "happypay-basics",
    category: "Happy Pay (BNPL)",
    question: "What is Happy Pay Buy Now, Pay Later (BNPL)?",
    answer:
      "Happy Pay allows you to split your school stationery pack purchase into equal, zero-interest instalments over time while your learner gets their stationery delivered upfront.",
    links: [{ label: "Learn about Happy Pay", href: "/happy-pay" }],
  },
  {
    id: "happypay-interest",
    category: "Happy Pay (BNPL)",
    question: "Are there any interest or hidden fees?",
    answer:
      "No. Happy Pay is 100% interest-free with zero hidden fees when instalments are paid on schedule.",
    links: [{ label: "Happy Pay terms", href: "/happy-pay-terms" }],
  },
  {
    id: "happypay-eligibility",
    category: "Happy Pay (BNPL)",
    question: "Who is eligible to use Happy Pay?",
    answer:
      "Any South African resident over 18 with a valid ID, South African mobile number, and debit or credit card can select Happy Pay at checkout.",
    links: [{ label: "Find your school pack", href: "/schools" }],
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
