import React from "react";
import { Check, School, ShieldCheck } from "lucide-react";
import styles from "./Partnership.module.css";

const SCHOOL_PROVIDES = [
  "Approved academic grade stationery lists and textbook specifications",
  "High-resolution school crest, badge, and institutional colour codes",
  "Designated school liaison (Principal, Bursar, or SGB representative)",
  "Distribution of the official ordering link to school parents",
  "Final partnership approval and agreement sign-off",
];

const PEXPACKS_MANAGES = [
  "Comprehensive list audit, brand vetting, and digital cataloguing",
  "Inventory reservation with Tier-1 certified educational manufacturers",
  "Tailored e-commerce portal with mobile responsiveness and SSL",
  "Secure payment gateway integration including Happy Pay BNPL split payment",
  "Warehouse pack assembly, barcode labelling, and custom school bag packaging",
  "Complete delivery logistics to school campus or parent residential addresses",
  "Dedicated parent customer service, returns, and pack query resolution",
  "Annual rebate calculation, itemised auditing, and direct fund remittance",
  "12-month managed digital infrastructure and continuous server maintenance",
];

export function ManagedPartnership() {
  return (
    <section className={styles.sectionAlt} aria-labelledby="managed-model-heading">
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Operational division of responsibility</p>
          <h2 id="managed-model-heading" className={styles.sectionTitle}>
            Zero Administrative Load for Your Academic Staff.
          </h2>
          <p className={styles.sectionLead}>
            We handle the heavy lifting of inventory, eCommerce, packaging, parent support,
            and logistics so your faculty and finance teams can focus 100% on education.
          </p>
        </div>

        <div className={styles.comparisonGrid}>
          {/* What School Provides */}
          <div className={`${styles.comparisonCard} ${styles.cardSchoolProvides}`}>
            <div className={`${styles.compHeader} ${styles.compHeaderSchool}`}>
              <div className={styles.compHeaderIcon}>
                <School size={22} />
              </div>
              <div>
                <h3 className={styles.compTitle}>What the School Provides</h3>
                <span style={{ fontSize: "12.5px", color: "var(--pex-muted)" }}>
                  Under 2 hours of total administrative time
                </span>
              </div>
            </div>
            <ul className={styles.compList} aria-label="Responsibilities provided by school">
              {SCHOOL_PROVIDES.map((item) => (
                <li key={item} className={styles.compItem}>
                  <Check size={18} className={styles.compCheck} style={{ color: "var(--pex-navy)" }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What Pexpacks Manages */}
          <div className={`${styles.comparisonCard} ${styles.cardPexManages}`}>
            <div className={`${styles.compHeader} ${styles.compHeaderPex}`}>
              <div className={styles.compHeaderIcon}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className={styles.compTitle}>What Pexpacks Manages</h3>
                <span style={{ fontSize: "12.5px", color: "var(--pex-keppel)", fontWeight: 700 }}>
                  End-to-end operational execution
                </span>
              </div>
            </div>
            <ul className={styles.compList} aria-label="Responsibilities managed by Pexpacks">
              {PEXPACKS_MANAGES.map((item) => (
                <li key={item} className={styles.compItem}>
                  <Check size={18} className={styles.compCheck} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
