import React from "react";
import { Check } from "lucide-react";
import styles from "./Partnership.module.css";

const ADVANTAGES = [
  {
    number: "01",
    title: "Exact School-List Procurement",
    description:
      "Every grade stationery list is meticulously audited and digitised into an approved scholastic pack, guaranteeing full curriculum alignment and uniform classroom readiness.",
    points: [
      "Official teacher-approved grade specifications",
      "Department of Basic Education compliance checks",
      "Strict premium brand vetting with zero unapproved substitutions",
      "Parent convenience with exact curriculum parity",
    ],
  },
  {
    number: "02",
    title: "Managed Parent Fulfilment",
    description:
      "Eliminate manual paper order collection, cash handling, and frantic January stationery queues with an enterprise logistics ecosystem built around your school schedule.",
    points: [
      "Direct-to-learner or scheduled school-drop distribution",
      "Individually pre-labelled and sorted by grade & student",
      "Integrated Happy Pay BNPL interest-free split payment",
      "Optional durable Pexcover™ protective book covering",
    ],
  },
  {
    number: "03",
    title: "12-Month Digital Infrastructure Package",
    description:
      "Qualifying partner institutions receive an integrated digital presence featuring high-performance hosting, mobile optimization, and dedicated parent communication channels.",
    points: [
      "School-branded modern digital storefront",
      "Secure SSL infrastructure & reliable uptime",
      "Seamless integration with Pexpacks ordering systems",
      "Zero monthly maintenance or server administration fees",
    ],
  },
  {
    number: "04",
    title: "Institutional Development Rebate",
    description:
      "Turn routine annual stationery purchasing into an ongoing financial asset that reinvests directly into your school development fund, bursaries, or sports facilities.",
    points: [
      "Up to 3.0% rebate returned on qualifying completed sales",
      "Deterministic adoption thresholds with transparent accounting",
      "Annual settlement report provided directly to the Bursar / SGB",
      "Zero financial risk, inventory liability, or upfront capital",
    ],
  },
];

export function PartnershipBenefits() {
  return (
    <section className={styles.sectionAlt} aria-labelledby="advantages-title">
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>The institutional proposition</p>
          <h2 id="advantages-title" className={styles.sectionTitle}>
            One Partnership. Four Institutional Advantages.
          </h2>
          <p className={styles.sectionLead}>
            A comprehensive operational and financial model engineered specifically
            for leading South African educational institutions.
          </p>
        </div>

        <div className={styles.advantagesGrid}>
          {ADVANTAGES.map((adv) => (
            <div key={adv.number} className={adv.number === "04" ? `${styles.advantageCard} ${styles.advantageCardHighlight || ""}` : styles.advantageCard}>
              <div className={styles.advantageNumber}>ADVANTAGE {adv.number}</div>
              <h3 className={styles.advantageTitle}>{adv.title}</h3>
              <p className={styles.advantageDescription}>{adv.description}</p>
              <ul className={styles.advantageList} aria-label={`${adv.title} key highlights`}>
                {adv.points.map((point) => (
                  <li key={point} className={styles.advantageItem}>
                    <Check size={16} className={styles.advantageItemIcon} />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
