import type { Metadata } from "next";
import { FeaturedSchoolsBanner } from "@/components/schools/FeaturedSchoolsBanner";

import { RecentlyViewedSchools } from "@/components/schools/RecentlyViewedSchools";
import { SchoolSearchPanel } from "@/components/schools/SchoolSearchPanel";
import { SchoolsFaqAccordion } from "@/components/schools/SchoolsFaqAccordion";
import { SchoolsHowItWorks } from "@/components/schools/SchoolsHowItWorks";
import { BrowseAllSchools } from "@/components/schools/BrowseAllSchools";
import { SchoolsTrustSection } from "@/components/marketing/SchoolsTrustSection";
import { ConciergeSection } from "@/components/marketing/ConciergeSection";
import { PageHero } from "@/components/marketing/PageHero";
import { buildMetadata } from "@/lib/seo";
import { HappyPayBanner } from "@/components/bnpl/HappyPayBanner";
import { HappyPaySteps } from "@/components/bnpl/HappyPaySteps";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";
import {
  getFeaturedSchoolRecords,
  getAllPublicSchoolRecords,
} from "@/lib/schools/schoolSearchData";
import { getWebsiteContent, getFaqs, getTestimonials } from "@/lib/cms";
import { getActivePublicSeason } from "@/lib/public-data/seasons";
import heroStyles from "@/components/marketing/HeroBase.module.css";
import homeStyles from "@/components/marketing/MarketingHome.module.css";

export const metadata: Metadata = buildMetadata(
  "Find Your School Stationery Pack | Pexpacks",
  "Find your child's school and grade to order a ready-packed stationery kit, prepared exactly to their official school stationery list and delivered to your door.",
  "/schools",
);

export const revalidate = 300;

export default async function SchoolsPage() {
  const [
    featuredSchools,
    allSchools,
    content,
    schoolsFaqs,
    testimonials,
    season,
  ] = await Promise.all([
    getFeaturedSchoolRecords(),
    getAllPublicSchoolRecords(),
    getWebsiteContent(),
    getFaqs("schools"),
    getTestimonials(),
    getActivePublicSeason(),
  ]);
  const hero = content["schools.hero"];
  const heroEyebrow =
    typeof hero.eyebrow === "string" && hero.eyebrow
      ? hero.eyebrow
      : "Pack finder";
  const heroTitle =
    typeof hero.title === "string" && hero.title
      ? hero.title
      : "Find your pack";

  return (
    <>
      <div id="schools-search">
        <PageHero
          eyebrow={heroEyebrow}
          title={heroTitle}
          panelTitle="Your school&rsquo;s exact list, packed for you"
          panelText={`Packed to your school&rsquo;s official list and delivered for ${season.academicYear}.`}
          panelClassName={heroStyles.heroPanelSearchAligned}
        >
          <SchoolSearchPanel readQueryFromUrl />
        </PageHero>
      </div>

      <RecentlyViewedSchools />

      <SchoolsHowItWorks className={homeStyles.schoolsHowItWorksDesktop} />

      {featuredSchools.length > 0 && (
        <FeaturedSchoolsBanner schools={featuredSchools} />
      )}

      <SchoolsTrustSection testimonials={testimonials} />

      {allSchools.length > 0 && <BrowseAllSchools schools={allSchools} />}

      <ConciergeSection />

      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <HappyPayBanner variant="schoolPage" />
          <div style={{ marginTop: 20 }}>
            <HappyPaySteps />
          </div>
        </div>
      </section>

      <SchoolsFaqAccordion
        faqs={schoolsFaqs}
        className={homeStyles.schoolsAccordionBeforeRating}
      />
    </>
  );
}
