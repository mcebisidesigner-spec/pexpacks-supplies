import styles from "./ComparisonMatrix.module.css";
import { SectionHeader } from "./SectionHeader";

const comparisonData = [
  {
    feature: "Finding the correct school list",
    retail: "Frustrating (hunting down PDFs)",
    Pexpacks: "Instant (we have the exact list)",
  },
  {
    feature: "Sourcing specific items",
    retail: "Multiple store visits",
    Pexpacks: "Everything packed in one box",
  },
  {
    feature: "Time spent",
    retail: "3-4 hours per child",
    Pexpacks: "Under 2 minutes online",
  },
  {
    feature: "Stress level",
    retail: "High (sold out items, queues)",
    Pexpacks: "Zero (delivered to your door)",
  },
  {
    feature: "Cost",
    retail: "Hidden costs (petrol, extra items)",
    Pexpacks: "Transparent, upfront pricing",
  },
];

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className={styles.iconCheck}
      focusable="false"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12.5l3 3 5-6" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className={styles.iconCross}
      focusable="false"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  );
}

export function ComparisonMatrix() {
  return (
    <section className={styles.comparisonSection}>
      <div className={styles.inner}>
        <SectionHeader
          eyebrow="The Smart Choice"
          title="Pexpacks vs. Retail Shopping"
          text="See how much time and effort you save when we pack the stationery for you."
        />

        <div className={styles.cardsGrid}>
          {comparisonData.map((row, index) => (
            <div className={styles.featureCard} key={index}>
              <h3 className={styles.featureTitle}>{row.feature}</h3>
              <div className={styles.compareContainer}>
                <div className={`${styles.compareItem} ${styles.retailItem}`}>
                  <span className={styles.itemLabel}>Retail</span>
                  <div className={styles.itemContent}>
                    <CrossIcon />
                    <span>{row.retail}</span>
                  </div>
                </div>
                <div className={styles.vsBadge}>VS</div>
                <div className={`${styles.compareItem} ${styles.PexpacksItem}`}>
                  <span className={styles.itemLabel}>Pexpacks</span>
                  <div className={styles.itemContent}>
                    <CheckIcon />
                    <span>{row.Pexpacks}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
