import Link from "next/link";
import type { ReactNode } from "react";
import { PageHero } from "@/components/marketing/PageHero";
import heroStyles from "@/components/marketing/HeroBase.module.css";

type SchoolsPageHeroProps = {
  children: ReactNode;
};

const stats = [
  { value: "500+", label: "Schools listed" },
  { value: "10 000+", label: "Packs delivered" },
  { value: "98%", label: "Satisfaction" },
];

export function SchoolsPageHero({ children }: SchoolsPageHeroProps) {
  return (
    <PageHero
      eyebrow="Start school ready"
      title="Find your school pack"
      text="Search your child's school, choose the grade, and get the correct stationery pack."
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
      <p className={heroStyles.gradeBrowse}>
        <Link href="/foundation-phase">Browse packs by grade &rarr;</Link>
      </p>
    </PageHero>
  );
}
