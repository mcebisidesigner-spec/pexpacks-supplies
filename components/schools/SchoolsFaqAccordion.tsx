"use client";

import Link from "next/link";
import type { FAQ } from "@/data/faqs";
import homeStyles from "@/components/marketing/MarketingHome.module.css";

type SchoolsFaqAccordionProps = {
  faqs?: FAQ[];
  className?: string;
};

const DEFAULT_SCHOOLS_FAQS = [
  {
    id: "split-payments",
    question: "Can I split my pack payments?",
    answer:
      "Yes — split the total into 2 interest-free payments with Happy Pay. Pay 50% today, and the rest is auto-deducted 30 days later.",
    linkHref: "/checkout",
    linkLabel: "Split my pack in 2",
  },
  {
    id: "upcoming-year",
    question: "Are these lists for the upcoming academic year?",
    answer: "Yes, every list is updated directly from the school.",
    linkHref: "/schools",
    linkLabel: "Browse schools",
  },
  {
    id: "whole-pack",
    question: "Do I have to buy the whole pack?",
    answer:
      "No. Select your school, then use our system to add or remove items before checkout.",
    linkHref: "/schools",
    linkLabel: "Find your school",
  },
  {
    id: "high-quality",
    question: "Are the brands high quality?",
    answer:
      "Yes, we use teacher-approved brands like Croxley, BIC, Pritt, Staedtler, and Pilot.",
    linkHref: "/schools",
    linkLabel: "Browse packs",
  },
];

export function SchoolsFaqAccordion({
  faqs,
  className,
}: SchoolsFaqAccordionProps) {
  const itemsToRender =
    faqs && faqs.length > 0
      ? faqs.map((f) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
          linkHref: f.links?.[0]?.href ?? "/schools",
          linkLabel: f.links?.[0]?.label ?? "Find your school",
        }))
      : DEFAULT_SCHOOLS_FAQS;

  return (
    <section
      className={[homeStyles.accordionSection, className]
        .filter(Boolean)
        .join(" ")}
      aria-label="Frequently asked questions before ordering"
    >
      <div className={homeStyles.accordionInner}>
        {itemsToRender.map((item) => (
          <details
            key={item.id}
            className={homeStyles.accordionItem}
            name="schools-faq"
          >
            <summary className={homeStyles.accordionSummary}>
              {item.question}
            </summary>
            <div className={homeStyles.accordionAnswer}>
              <p>{item.answer}</p>
              {item.linkHref && item.linkLabel ? (
                <Link
                  href={item.linkHref}
                  className={homeStyles.accordionPill}
                  onClick={(e) => e.stopPropagation()}
                >
                  {item.linkLabel}
                </Link>
              ) : null}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
