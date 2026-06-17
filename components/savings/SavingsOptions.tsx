import { Button } from "@/components/ui/Button";
import styles from "./SavingsOptions.module.css";

export function SavingsOptions() {
  return (
    <section className={styles.section} aria-labelledby="savings-options-heading">
      <div className={styles.inner}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Short on 1 October?</p>
          <h2 id="savings-options-heading" className={styles.heading}>
            You still have options
          </h2>
          <p className={styles.intro}>
            If your saved amount is less than your target pack price, PexPacks will give you
            a resolution window until 15 October. You can pay the balance, customise your
            pack down to your saved amount, or request a refund according to the plan terms.
          </p>
        </div>
        <div className={styles.grid}>
          <div className={styles.card}>
            <span className={`${styles.cardIcon} ${styles.cardIconTeal}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3v18" />
                <path d="M17 7.5c-.8-1.2-2.2-2-4.4-2-2.4 0-4.1 1.1-4.1 2.8 0 4 9 1.8 9 6.2 0 1.9-1.8 3.2-4.6 3.2-2.1 0-3.9-.8-4.9-2.2" />
              </svg>
            </span>
            <div className={styles.cardTitle}>Pay the Balance</div>
            <p className={styles.cardText}>
              Settle the remaining amount and keep your full pack.
            </p>
            <div className={styles.cardAction}>
              <Button href="/contact?topic=savings-plan" variant="primary" size="sm">
                Settle Balance
              </Button>
            </div>
          </div>
          <div className={styles.card}>
            <span className={`${styles.cardIcon} ${styles.cardIconNavy}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </span>
            <div className={styles.cardTitle}>Customise to Saved Value</div>
            <p className={styles.cardText}>
              Use the customisation tray to remove items and match the amount you saved.
            </p>
            <div className={styles.cardAction}>
              <Button href="/contact?topic=savings-plan" variant="outline" size="sm">
                Customise Pack
              </Button>
            </div>
          </div>
          <div className={styles.card}>
            <span className={`${styles.cardIcon} ${styles.cardIconCoral}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
            <div className={styles.cardTitle}>Cancel &amp; Refund</div>
            <p className={styles.cardText}>
              Cancel the plan and receive the refundable balance according to the Savings Plan terms.
            </p>
            <div className={styles.cardAction}>
              <Button href="/contact?topic=savings-plan" variant="outline" size="sm">
                Request Refund
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
