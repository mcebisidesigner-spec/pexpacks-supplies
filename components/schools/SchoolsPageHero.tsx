import type { ReactNode } from "react";
import { PageHero } from "@/components/marketing/PageHero";

type SchoolsPageHeroProps = {
  children: ReactNode;
};

export function SchoolsPageHero({ children }: SchoolsPageHeroProps) {
  return (
    <PageHero
      eyebrow="School packs"
      title="Find Your School Pack"
      text="Search your child's school, choose the grade, and get the correct stationery pack."
      panelText="School pack flow"
      panelTitle="Search. Select grade. Order."
    >
      {children}
    </PageHero>
  );
}
