import type { ReactNode } from "react";
import styles from "./SchoolsPageHero.module.css";

type SchoolsPageHeroProps = {
  children: ReactNode;
};

export function SchoolsPageHero({ children }: SchoolsPageHeroProps) {
  return (
    <section className={styles.schoolsHero}>
      <div className={styles.schoolsHeroInner}>
        <h1 className={styles.schoolsHeroTitle}>Find your pack</h1>
        {children}
      </div>
    </section>
  );
}
