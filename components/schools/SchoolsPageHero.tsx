import type { ReactNode } from "react";
import { PageHero } from "@/components/marketing/PageHero";
import heroStyles from "@/components/marketing/HeroBase.module.css";

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
      eyebrow="Search by school"
      title="Find your pack in 30 seconds"
      text="No queues. No confusion. No missing items."
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
    </PageHero>
  );
}
