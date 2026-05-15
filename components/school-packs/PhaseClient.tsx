"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ItemIcon } from "@/components/ui/ItemIcon";
import { PackCustomizer } from "@/components/order/PackCustomizer";
import { AddMySchoolBanner } from "@/components/sections/AddMySchoolBanner";
import type { PhasePack, GradePackTemplate } from "@/data/phasePacks";
import { formatCurrency } from "@/lib/formatCurrency";
import styles from "./PhaseClient.module.css";

type PhaseClientProps = {
  phaseData: PhasePack;
};

const phaseFaqs: Record<string, { q: string; a: string }[]> = {
  "foundation-phase": [
    {
      q: "Are art supplies included?",
      a: "Yes, our Baseline packs include standard art tools like jumbo crayons, scissors, and glue. You can also customise to add paints or other specific items.",
    },
    {
      q: "Do the packs align with the CAPS curriculum?",
      a: "Yes, our Foundation Phase packs are designed around standard CAPS requirements for Grade R to 3.",
    },
  ],
  "primary-school": [
    {
      q: "Can I swap the type of pens or pencils?",
      a: "Absolutely. When you click Customise this pack, you can swap items, change quantities, or remove things you already have.",
    },
    {
      q: "Do these packs have enough books for the year?",
      a: "The packs are designed as a solid starter for the year. Every school is different, so we recommend checking against your specific booklist and adjusting quantities if needed.",
    },
  ],
  "high-school": [
    {
      q: "Do these packs include a scientific calculator?",
      a: "Yes, our high school baseline packs include a standard scientific calculator. You can remove it during customisation if you already have one.",
    },
    {
      q: "Can I add specific subject items like Accounting books?",
      a: "Yes, the customiser allows you to add specific books and items required for your chosen subjects.",
    },
  ],
};

function buildStandardOrderHref(phaseSlug: string, pack: GradePackTemplate) {
  const params = new URLSearchParams({
    phase: phaseSlug,
    pack: pack.id,
    grade: pack.grade,
    type: "standard",
  });

  return `/order?${params.toString()}`;
}

export function PhaseClient({ phaseData }: PhaseClientProps) {
  const [selectedCustomPack, setSelectedCustomPack] = useState<GradePackTemplate | null>(null);
  const faqs = phaseFaqs[phaseData.slug] || [];

  const handleCustomise = (pack: GradePackTemplate) => {
    setSelectedCustomPack(pack);
    window.setTimeout(() => {
      document.getElementById("pack-customizer")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  return (
    <div className={styles.phaseContainer} data-phase={phaseData.slug}>
      <section className={styles.trustSection} aria-label="Pack benefits">
        <div className={styles.sectionInner}>
          <div className={styles.trustBadges}>
            <span>100% curriculum aligned</span>
            <span>Quality stationery brands</span>
            <span>Delivery or collection options</span>
          </div>
        </div>
      </section>

      <section className={styles.cardsSection} aria-label={`${phaseData.phaseRange} pack options`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <p>{phaseData.phaseRange}</p>
            <h2>Choose your standard pack</h2>
          </div>

          <div className={styles.cardsGrid}>
            {phaseData.gradePacks.map((pack) => (
              <article key={pack.id} className={styles.gradeCard}>
                <div className={styles.cardMedia}>
                  <span>{pack.grade}</span>
                </div>

                <div className={styles.cardBody}>
                  <p className={styles.bestFor}>Best for: {pack.bestFor}</p>
                  <h3>{pack.title}</h3>
                  <p className={styles.summary}>{pack.summary}</p>

                  <ul className={styles.itemList} aria-label={`${pack.title} includes`}>
                    {pack.items.slice(0, 5).map((item) => (
                      <li key={item.id}>
                        <ItemIcon name={item.icon} size={16} className={styles.itemIcon} />
                        {item.name}
                      </li>
                    ))}
                    {pack.items.length > 5 ? (
                      <li className={styles.moreItems}>+ {pack.items.length - 5} more essentials</li>
                    ) : null}
                  </ul>
                </div>

                <div className={styles.cardFooter}>
                  <p className={styles.priceFrom}>From {formatCurrency(pack.priceFrom)}</p>
                  <div className={styles.cardActions}>
                    <Button href={buildStandardOrderHref(phaseData.slug, pack)} size="sm">
                      Buy standard pack
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleCustomise(pack)}>
                      Customise this pack
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {selectedCustomPack ? (
        <section className={styles.customizerSection}>
          <div className={styles.sectionInner}>
            <PackCustomizer
              phaseSlug={phaseData.slug}
              gradePack={selectedCustomPack}
              onCancel={() => setSelectedCustomPack(null)}
            />
          </div>
        </section>
      ) : null}

      <section className={styles.bannerSection}>
        <div className={styles.sectionInner}>
          <AddMySchoolBanner />
        </div>
      </section>

      {faqs.length > 0 ? (
        <section className={styles.faqSection}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <p>Support</p>
              <h2>Common questions</h2>
            </div>
            <div className={styles.faqGrid}>
              {faqs.map((faq) => (
                <div key={faq.q} className={styles.faqItem}>
                  <h3>{faq.q}</h3>
                  <p>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

    </div>
  );
}
