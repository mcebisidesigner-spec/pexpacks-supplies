"use client";

import Link from "next/link";
import homeStyles from "@/components/marketing/MarketingHome.module.css";

type SchoolsFaqAccordionProps = {
  className?: string;
};

export function SchoolsFaqAccordion({ className }: SchoolsFaqAccordionProps) {
  return (
    <section
      className={[homeStyles.accordionSection, className]
        .filter(Boolean)
        .join(" ")}
      aria-label="Frequently asked questions before ordering"
    >
      <div className={homeStyles.accordionInner}>
        <details className={homeStyles.accordionItem} name="schools-faq">
          <summary className={homeStyles.accordionSummary}>
            Can I split my pack payments?
          </summary>
          <div className={homeStyles.accordionAnswer}>
            <p>Yes &mdash; split the total into 2 interest-free payments with Happy Pay. Pay 50% today, and the rest is auto-deducted 30 days later.</p>
            <Link href="/checkout" className={homeStyles.accordionPill} onClick={(e) => e.stopPropagation()}>Split my pack in 2</Link>
          </div>
        </details>
        <details className={homeStyles.accordionItem} name="schools-faq">
          <summary className={homeStyles.accordionSummary}>
            Are these lists for the upcoming academic year?
          </summary>
          <div className={homeStyles.accordionAnswer}>
            <p>Yes, every list is updated directly from the school.</p>
            <Link href="/schools" className={homeStyles.accordionPill} onClick={(e) => e.stopPropagation()}>Browse schools</Link>
          </div>
        </details>
        <details className={homeStyles.accordionItem} name="schools-faq">
          <summary className={homeStyles.accordionSummary}>
            Do I have to buy the whole pack?
          </summary>
          <div className={homeStyles.accordionAnswer}>
            <p>No. Select your school, then use our system to add or remove items before checkout.</p>
            <Link href="/schools" className={homeStyles.accordionPill} onClick={(e: React.MouseEvent) => e.stopPropagation()}>Find your school</Link>
          </div>
        </details>
        <details className={homeStyles.accordionItem} name="schools-faq">
          <summary className={homeStyles.accordionSummary}>
            Are the brands high quality?
          </summary>
          <div className={homeStyles.accordionAnswer}>
            <p>Yes, we use teacher-approved brands like Croxley, BIC, Pritt, Staedtler, and Pilot.</p>
            <Link href="/schools" className={homeStyles.accordionPill} onClick={(e: React.MouseEvent) => e.stopPropagation()}>Browse packs</Link>
          </div>
        </details>
      </div>
    </section>
  );
}
