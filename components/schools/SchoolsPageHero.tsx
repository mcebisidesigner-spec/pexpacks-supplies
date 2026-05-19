import type { ReactNode } from "react";
import { PageHero } from "@/components/marketing/PageHero";

type SchoolsPageHeroProps = {
  children: ReactNode;
};

export function SchoolsPageHero({ children }: SchoolsPageHeroProps) {
  return (
    <PageHero
      eyebrow="Start school ready"
      title="Find your school pack"
      text="Search your child's school, choose the grade, and get the correct stationery pack."
      panelText="School pack flow"
      panelTitle="Search. Select grade. Order."
    >
      {children}
    </PageHero>
  );
}
