import { Button } from "@/components/ui/Button";
import { mostPopularPacksHref } from "@/data/packs";
import styles from "./Schools.module.css";

export function RequestSchoolCTA() {
  return (
    <section
      className={styles.requestCta}
      aria-labelledby="request-school-heading"
    >
      <div>
        <p>Need help?</p>
        <h2 id="request-school-heading">Can&apos;t find your school?</h2>
        <span className={styles.requestCtaText}>
          Send us the school name and grade and we&apos;ll prepare the correct
          stationery pack for you. We prioritise schools with the most parent
          requests — your request helps us add your school faster.
        </span>
      </div>
      <div className={styles.requestCtaActions}>
        <Button href="/add-your-school#school-request-form" variant="white">
          Request a School Pack
        </Button>
        <Button
          href={mostPopularPacksHref}
          variant="outline"
          className={styles.fallbackBtn}
        >
          Buy Standard Pack
        </Button>
      </div>
    </section>
  );
}
