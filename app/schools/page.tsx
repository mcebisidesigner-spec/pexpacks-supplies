import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/PageHero";
import { SchoolSearch } from "@/components/schools/SchoolSearch";
import { buildMetadata } from "@/lib/seo";
import styles from "@/components/marketing/Marketing.module.css";

export const metadata: Metadata = buildMetadata(
  "Find Your School Pack",
  "Search Pexpacks Supplies school stationery packs by school, city and grade.",
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

  return (
    <>
      <PageHero
        eyebrow="Find your school"
        title="Find Your School Pack"
        text="Search by school, city or grade and choose the correct ready-packed stationery pack."
        panelText="School pack flow"
        panelTitle="Search. Select grade. Order."
      />
      <section className={styles.section}>
        <SchoolSearch
          initialQuery={firstValue(params.q) ?? ""}
          initialCity={firstValue(params.city) ?? "all"}
          initialGrade={firstValue(params.grade) ?? "all"}
        />
      </section>
    </>
  );
}
