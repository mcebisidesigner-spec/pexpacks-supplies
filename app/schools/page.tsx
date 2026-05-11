import type { Metadata } from "next";
import { FeaturedSchoolsBanner } from "@/components/schools/FeaturedSchoolsBanner";
import { RequestSchoolCTA } from "@/components/schools/RequestSchoolCTA";
import { SchoolSearchPanel } from "@/components/schools/SchoolSearchPanel";
import { SchoolsPageHero } from "@/components/schools/SchoolsPageHero";
import { buildMetadata } from "@/lib/seo";
import { getFeaturedSchoolRecords, getSchoolSearchOptions } from "@/lib/schools/schoolSearchData";
import styles from "@/components/schools/Schools.module.css";

export const metadata: Metadata = buildMetadata(
  "Find Your School Stationery Pack | Pexpacks",
  "Search for your school and grade to order a ready-packed stationery pack prepared according to the school stationery list.",
  "/schools"
);

type SchoolsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SchoolsPage({ searchParams }: SchoolsPageProps) {
  const params = searchParams ? await searchParams : {};
  const { grades, regions } = getSchoolSearchOptions();
  const featuredSchools = getFeaturedSchoolRecords();

  return (
    <>
      <SchoolsPageHero>
        <SchoolSearchPanel
          grades={grades}
          regions={regions}
          initialQuery={firstValue(params.q) ?? ""}
          initialRegion={firstValue(params.region) ?? firstValue(params.city) ?? "all"}
          initialGrade={firstValue(params.grade) ?? "all"}
        />
      </SchoolsPageHero>
      <FeaturedSchoolsBanner schools={featuredSchools} />
      <RequestSchoolCTA />
      <section className={styles.supportSection} aria-labelledby="school-support-heading">
        <div>
          <p>School-ready support</p>
          <h2 id="school-support-heading">Search first, then choose the correct pack</h2>
          <span>
            Pexpacks keeps the school list searchable so parents do not need to scroll through hundreds of schools.
            Search by school name, grade or region, open the school page, and continue with the correct grade pack.
          </span>
        </div>
      </section>
    </>
  );
}
