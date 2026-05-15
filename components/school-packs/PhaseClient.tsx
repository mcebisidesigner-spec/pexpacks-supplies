"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { PackCustomizer } from "@/components/order/PackCustomizer";
import { AddMySchoolBanner } from "@/components/sections/AddMySchoolBanner";
import type { PhasePack, GradePackTemplate } from "@/data/phasePacks";
import styles from "./PhaseClient.module.css";
import { formatCurrency } from "@/lib/formatCurrency";

type PhaseClientProps = {
  phaseData: PhasePack;
};

const phaseFaqs: Record<string, { q: string, a: string }[]> = {
  "foundation-phase": [
    { q: "Are art supplies included?", a: "Yes, our Baseline packs include standard art tools like jumbo crayons, scissors, and glue. You can also customise to add paints or other specific items." },
    { q: "Do the packs align with the CAPS curriculum?", a: "Yes, our Foundation Phase packs are designed around standard CAPS requirements for Grade R to 3." }
  ],
  "primary-school": [
    { q: "Can I swap the type of pens/pencils?", a: "Absolutely! When you click 'Customise This Pack', you can swap items, change quantities, or remove things you already have." },
    { q: "Do these packs have enough books for the year?", a: "The packs are designed as a solid starter for the year. However, every school is different, so we recommend checking against your specific booklist and adjusting quantities if needed." }
  ],
  "high-school": [
    { q: "Do these packs include a scientific calculator?", a: "Yes, our high school baseline packs include a standard scientific calculator. You can remove it during customisation if you already have one." },
    { q: "Can I add specific subject items like Accounting books?", a: "Yes, the customiser allows you to add specific books and items required for your chosen subjects." }
  ]
};

export function PhaseClient({ phaseData }: PhaseClientProps) {
  const [selectedCustomPack, setSelectedCustomPack] = useState<GradePackTemplate | null>(null);

  const handleCustomise = (pack: GradePackTemplate) => {
    setSelectedCustomPack(pack);
    setTimeout(() => {
      document.getElementById("pack-customizer")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const faqs = phaseFaqs[phaseData.slug] || [];

  return (
    <div className={styles.phaseContainer} data-phase={phaseData.slug}>
      <div className={styles.trustBadges}>
        <div className={styles.trustBadge}>
          <span className={styles.trustIcon}>✓</span> 100% Curriculum Aligned
        </div>
        <div className={styles.trustBadge}>
          <span className={styles.trustIcon}>✓</span> Quality Brands
        </div>
        <div className={styles.trustBadge}>
          <span className={styles.trustIcon}>✓</span> Fast Nationwide Delivery
        </div>
      </div>
      <section className={styles.cardsSection}>
        <div className="inner">
          <div className={styles.cardsGrid}>
            {phaseData.gradePacks.map((pack) => (
              <article key={pack.id} className={styles.gradeCard}>
                <div className={styles.cardHeader}>
                  <p className={styles.gradeBadge}>{pack.grade}</p>
                  <h3>{pack.title}</h3>
                  <p className={styles.bestFor}>Best for: {pack.bestFor}</p>
                  <p className={styles.priceFrom}>From {formatCurrency(pack.priceFrom)}</p>
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.summary}>{pack.summary}</p>
                  <div className={styles.itemList}>
                    <strong>Includes:</strong>
                    <ul>
                      {pack.items.slice(0, 5).map((item) => (
                        <li key={item.id}>{item.name}</li>
                      ))}
                      {pack.items.length > 5 && (
                        <li className={styles.moreItems}>+ {pack.items.length - 5} more items</li>
                      )}
                    </ul>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <Button href={`/order?phase=${phaseData.slug}&grade=${encodeURIComponent(pack.grade)}&type=standard`} size="sm">
                    Buy Standard Pack
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleCustomise(pack)}>
                    Customise This Pack
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {selectedCustomPack && (
        <section className={styles.customizerSection}>
          <div className="inner">
            <PackCustomizer 
              phaseSlug={phaseData.slug} 
              gradePack={selectedCustomPack} 
              onCancel={() => setSelectedCustomPack(null)}
            />
          </div>
        </section>
      )}

      <section className={styles.bannerSection}>
        <div className="inner">
          <AddMySchoolBanner />
        </div>
      </section>

      {faqs.length > 0 && (
        <section className={styles.faqSection}>
          <div className="inner">
            <h2 className="heading-secondary">Common Questions</h2>
            <div className={styles.faqGrid}>
              {faqs.map((faq, i) => (
                <div key={i} className={styles.faqItem}>
                  <h4>{faq.q}</h4>
                  <p>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {!selectedCustomPack && (
        <div className={styles.stickyBanner}>
          <p>Did you know? You can customise any pack before checking out.</p>
          <Button size="sm" onClick={() => {
            const firstPack = phaseData.gradePacks[0];
            if (firstPack) handleCustomise(firstPack);
          }}>
            Customise a Pack
          </Button>
        </div>
      )}
    </div>
  );
}
