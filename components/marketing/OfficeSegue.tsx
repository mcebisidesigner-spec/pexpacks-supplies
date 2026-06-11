import Link from "next/link";
import styles from "./OfficeSegue.module.css";

export function OfficeSegue() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.panel}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>Office packs</p>
            <h2>Stocking the Office? <span className={styles.highlight}>We do that too.</span></h2>
            <p className={styles.lead}>
              Streamlined SME stationery procurement with tax invoices and clear follow-ups.
            </p>
            <Link href="/office#brand-packages" className={styles.cta}>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={styles.ctaIcon}>
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              View Office Starter Packs
            </Link>
          </div>
          <div className={styles.visual} aria-hidden="true">
            <div className={styles.visualGrid}>
              {["Files & Folders", "Notebooks & Pads", "Writing Tools", "Paper Reams"].map((item) => (
                <span key={item} className={styles.visualChip}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
