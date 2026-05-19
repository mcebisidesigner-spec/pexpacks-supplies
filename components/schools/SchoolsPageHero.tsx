import type { ReactNode } from "react";
import { PageHero } from "@/components/marketing/PageHero";

type SchoolsPageHeroProps = {
  children: ReactNode;
};

export function SchoolsPageHero({ children }: SchoolsPageHeroProps) {
  const month = new Date().getMonth(); // 0-indexed (0 = Jan, 11 = Dec)
  let seasonalEyebrow = "School packs";

  if (month === 10 || month === 11 || month === 0) {
    // Nov (10), Dec (11), Jan (0)
    seasonalEyebrow = "Back-to-school season — Order early, skip the rush";
  } else if (month >= 3 && month <= 5) {
    // Apr (3), May (4), Jun (5)
    seasonalEyebrow = "Mid-year top-up — Replace what's worn out";
  } else if (month >= 6 && month <= 8) {
    // Jul (6), Aug (7), Sep (8)
    seasonalEyebrow = "Term 3 prep — Get ahead for the final stretch";
  }

  return (
    <PageHero
      eyebrow={seasonalEyebrow}
      title="Find your school pack"
      text="Search your child's school, choose the grade, and get the correct stationery pack."
      panelText="School pack flow"
      panelTitle="Search. Select grade. Order."
    >
      {children}
    </PageHero>
  );
}
