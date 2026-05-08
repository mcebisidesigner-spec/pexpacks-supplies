import type { ReactNode } from "react";
import styles from "./Schools.module.css";

type SchoolsPageHeroProps = {
  children: ReactNode;
};

export function SchoolsPageHero({ children }: SchoolsPageHeroProps) {
  return (
    <section className={styles.schoolsHero}>
      <div className={styles.schoolsHeroInner}>
        <div className={styles.schoolsHeroCopy}>
          <p className={styles.schoolEyebrow}>School packs</p>
          <h1>Find Your School Pack</h1>
          <p>Search your child&apos;s school, choose the grade, and get the correct stationery pack.</p>
          <span>Prepared by school list. Packed with care. Ready for day one.</span>
        </div>
        {children}
      </div>
    </section>
  );
}
