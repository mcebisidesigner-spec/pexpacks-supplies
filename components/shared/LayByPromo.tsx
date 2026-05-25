import Link from "next/link";
import { Button } from "@/components/ui/Button";
import styles from "./LayByPromo.module.css";

export function LayByPromo() {
  return (
    <section className={styles.section} aria-labelledby="layby-promo-heading">
      <div className={styles.inner}>
        <div className={styles.card}>
          <div className={styles.iconWrap} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <div className={styles.body}>
            <p className={styles.eyebrow}>New — Lay-by available</p>
            <h2 id="layby-promo-heading" className={styles.title}>
              Reserve your pack now, pay over time
            </h2>
            <p className={styles.text}>
              Beat the January rush. Spread the cost with <strong>0% interest</strong>, zero fees, and CPA-compliant terms. Secure your child&rsquo;s exact school pack today.
            </p>
            <div className={styles.pills}>
              <span>0% interest</span>
              <span>No admin fees</span>
              <span>CPA compliant</span>
              <span>Secure payments</span>
            </div>
            <div className={styles.actions}>
              <Button href="/lay-by" variant="primary" size="md">
                Learn About Lay-by
              </Button>
              <Link href="/lay-by" className={styles.textLink}>
                See full terms &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
