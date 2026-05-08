import type { ReactNode } from "react";
import styles from "./Schools.module.css";

type SchoolsPageHeroProps = {
  children: ReactNode;
};

export function SchoolsPageHero({ children }: SchoolsPageHeroProps) {
  return (
    <section className={styles.schoolsHero}>
      <div className={styles.schoolsHeroInner}>
        <div className={styles.schoolsHeroIntro}>
          <div className={styles.schoolsHeroCopy}>
            <p className={styles.schoolEyebrow}>School packs</p>
            <h1>Find Your School Pack</h1>
            <p>Search your child&apos;s school, choose the grade, and get the correct stationery pack.</p>
          </div>
          <aside className={styles.schoolsHeroPanel} aria-label="School pack flow">
            <p>School pack flow</p>
            <strong>Search. Select grade. Order.</strong>
          </aside>
        </div>
        <div className={styles.schoolsHeroSearch}>
          {children}
        </div>
      </div>
    </section>
  );
}
