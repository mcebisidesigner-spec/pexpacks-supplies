import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { WalletIcon } from "@/components/ui/icons";
import styles from "./LayByPromo.module.css";

export function LayByPromo() {
  return (
    <section className={styles.section} aria-labelledby="layby-promo">
      <div className={styles.inner}>
        <div className={styles.card}>
          <div className={styles.iconWrap} aria-hidden="true">
            <WalletIcon />
          </div>
          <div className={styles.body}>
            <p className={styles.eyebrow}>Pay over time</p>
            <h2 id="layby-promo" className={styles.title}>
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
              <Link href="/lay-by-terms" className={styles.textLink}>
                See full terms &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
