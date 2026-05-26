import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";
import heroStyles from "@/components/marketing/HeroBase.module.css";
import styles from "./SchoolsPageHero.module.css";

type SchoolsPageHeroProps = {
  children: ReactNode;
};

const stats = [
  { value: "Growing", label: "School directory" },
  { value: "Stress-free", label: "Back-to-school" },
  { value: "Accurate", label: "Grade lists guaranteed" },
];

export function SchoolsPageHero({ children }: SchoolsPageHeroProps) {
  return (
    <PageHero
      eyebrow="Pex your pack"
      title="Find your pack in 30 seconds"
      text="Search your child's school, choose the grade, and get the correct stationery pack delivered before school opens."
      panelChildren={
        <div className={heroStyles.trustStats}>
          {stats.map((stat) => (
            <div key={stat.label} className={heroStyles.trustStat}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      }
    >
      {children}
      <div className={styles.heroActions}>
        <Button href="/schools#school-grade-packs" variant="secondary" size="md">
          Browse Standard Packs
        </Button>
      </div>
    </PageHero>
  );
}
