export type FAQ = {
  id: string;
  question: string;
  answer: string;
};

export const faqs: FAQ[] = [
  {
    id: "school-list-accuracy",
    question: "Are school packs aligned to official stationery lists?",
    answer: "Yes. Pexpacks structures school packs around the approved stationery requirements for the relevant school and grade."
  },
  {
    id: "pack-contents",
    question: "What is usually included in a school pack?",
    answer: "Typical packs include exercise books, pens, pencils, rulers, colour pencils, glue sticks, erasers and other required classroom basics."
  },
  {
    id: "missing-school",
    question: "Can I order if my school is not listed yet?",
    answer: "Yes. Use the order or contact form and include the school name and grade. Pexpacks can follow up on availability or onboarding."
  },
  {
    id: "delivery-timing",
    question: "How does delivery work?",
    answer: "Delivery options can include school delivery, home delivery, office delivery or collection, depending on the order and school-season plan."
  },
  {
    id: "payment-prepayment",
    question: "Can parents prepay before school starts?",
    answer: "The order flow supports payment preference capture. Final payment instructions are confirmed during order follow-up."
  },
  {
    id: "office-packs",
    question: "Do you supply small businesses and home offices?",
    answer: "Yes. Pexpacks supplies curated office packs for SMEs, teachers, tutors and home-office buyers."
  },
  {
    id: "school-partnerships",
    question: "How can a school partner with Pexpacks?",
    answer: "Schools can use the partnership enquiry form to share school details, role information and stationery list requirements."
  }
];
