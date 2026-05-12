import styles from "./ComparisonMatrix.module.css";
import { SectionHeader } from "./SectionHeader";

const comparisonData = [
  {
    feature: "Finding the correct school list",
    retail: "Frustrating (hunting down PDFs)",
    pexpacks: "Instant (we have the exact list)",
  },
  {
    feature: "Sourcing specific items",
    retail: "Multiple store visits",
    pexpacks: "Everything packed in one box",
  },
  {
    feature: "Time spent",
    retail: "3-4 hours per child",
    pexpacks: "Under 2 minutes online",
  },
  {
    feature: "Stress level",
    retail: "High (sold out items, queues)",
    pexpacks: "Zero (delivered to your door)",
  },
  {
    feature: "Cost",
    retail: "Hidden costs (petrol, extra items)",
    pexpacks: "Transparent, upfront pricing",
  },
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.iconCheck} focusable="false" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12.5l3 3 5-6" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.iconCross} focusable="false" aria-hidden="true">
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
          title="PexPacks vs. Retail Shopping"
          text="See how much time and effort you save when we pack the stationery for you."
        />

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col" className={styles.featureCol}></th>
                <th scope="col" className={styles.retailCol}>Retail Shopping</th>
                <th scope="col" className={styles.pexpacksCol}>PexPacks</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, index) => (
                <tr key={index}>
                  <td className={styles.featureCell}>{row.feature}</td>
                  <td className={styles.retailCell}>
                    <div className={styles.cellContent}>
                      <CrossIcon />
                      <span>{row.retail}</span>
                    </div>
                  </td>
                  <td className={styles.pexpacksCell}>
                    <div className={styles.cellContent}>
                      <CheckIcon />
                      <span>{row.pexpacks}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
