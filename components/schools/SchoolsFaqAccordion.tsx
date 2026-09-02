import type { FAQ } from "@/data/faqs";
import { FaqMarquee } from "@/components/shared/FaqMarquee";

type SchoolsFaqAccordionProps = {
  faqs?: FAQ[];
  className?: string;
};

const DEFAULT_SCHOOLS_FAQS: FAQ[] = [
  {
    id: "split-payments",
    category: "Payment",
    question: "Can I split my pack payments?",
    answer:
      "Yes — split the total into 2 interest-free payments with Happy Pay. Pay 50% today, and the rest is auto-deducted 30 days later.",
    links: [
      { href: "/happy-pay", label: "Learn about Happy Pay" },
      { href: "/checkout", label: "Split my pack in 2" },
    ],
  },
  {
    id: "upcoming-year",
    category: "School packs",
    question: "Are these lists for the upcoming academic year?",
    answer: "Yes, every list is updated directly from the school.",
    links: [
      { href: "/schools", label: "Browse schools" },
      { href: "/contact", label: "Contact Pexpacks" },
    ],
  },
  {
    id: "whole-pack",
    category: "School packs",
    question: "Do I have to buy the whole pack?",
    answer:
      "No. Select your school, then use our system to add or remove items before checkout.",
    links: [
      { href: "/schools", label: "Find your school" },
      { href: "/order", label: "Custom order" },
    ],
  },
  {
    id: "high-quality",
    category: "School packs",
    question: "Are the brands high quality?",
    answer:
      "Yes, we use teacher-approved brands like Croxley, BIC, Pritt, Staedtler, and Pilot.",
    links: [
      { href: "/schools", label: "Browse packs" },
      { href: "/returns-refunds-policy", label: "Returns and refunds" },
    ],
  },
];

export function SchoolsFaqAccordion({
  faqs,
  className,
}: SchoolsFaqAccordionProps) {
  const itemsToRender = faqs && faqs.length > 0 ? faqs : DEFAULT_SCHOOLS_FAQS;

  return (
    <div className={className}>
      <FaqMarquee
        faqs={itemsToRender}
        eyebrow="Quick answers"
        title="Frequently asked questions"
        seeAllHref="/faq"
      />
    </div>
  );
}
