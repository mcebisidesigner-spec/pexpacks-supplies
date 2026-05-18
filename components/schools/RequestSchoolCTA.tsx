import { InlineSchoolWaitlist } from "./InlineSchoolWaitlist";
import styles from "./RequestSchoolCTA.module.css";

export function RequestSchoolCTA() {
  return (
    <section className={styles.requestCta} aria-labelledby="request-school-heading">
      <div className={styles.copy}>
        <p className={styles.eyebrow}>Need help?</p>
        <h2 id="request-school-heading">Can't find your school?</h2>
        <span>
          We prioritise schools with the most parent requests. Add the school
          name once and we will notify you as soon as the correct stationery
          pack is ready.
        </span>
      </div>
      <InlineSchoolWaitlist
        source="schools-cta"
        className={styles.waitlistCard}
        showFallback
      />
    </section>
  );
}
