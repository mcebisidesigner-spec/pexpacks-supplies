import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { FAQAccordion } from "@/components/marketing/FAQAccordion";
import { HeroSearch } from "@/components/marketing/HeroSearch";
import { PackCard } from "@/components/marketing/PackCard";
import { PageHero } from "@/components/marketing/PageHero";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { SchoolSearch } from "@/components/schools/SchoolSearch";
import { faqs } from "@/data/faqs";
import { featuredPacks, schoolPackBenefits } from "@/data/packs";
import { buildMetadata } from "@/lib/seo";
import styles from "@/components/marketing/Marketing.module.css";

const gradeCategories = [
  "Grade R packs",
  "Foundation Phase packs",
  "Intermediate Phase packs",
  "Senior Phase packs",
  "High School packs",
  "Matric packs",
  "Exam packs",
  "Teacher packs",
  "Classroom packs",
  "Sponsored learner packs"
];

export const metadata: Metadata = buildMetadata(
  "School Stationery Packs",
  "Find your school, choose your grade and order a ready-packed stationery kit prepared around school requirements.",
  "/school"
);

export default function SchoolPage() {
  const schoolPacks = featuredPacks.filter((pack) => pack.category === "School");

  return (
    <>
      <PageHero
        eyebrow="School"
        title="School stationery packs made simple"
        text="Find your school, choose your grade, and order a ready-packed stationery kit prepared around school requirements."
        panelText="Core flow"
        panelTitle="Find your school. Choose your grade. Order your pack."
      >
        <HeroSearch />
      </PageHero>

      <section className={styles.section}>
        <SchoolSearch />
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.inner}>
          <SectionHeader
            title="Grade and classroom pack categories"
            text="Pexpacks can structure packs for parents, teachers, schools, sponsors and school administrators."
          />
          <div className={styles.infoGrid}>
            {gradeCategories.map((category) => (
              <article className={styles.infoCard} key={category}>
                <h3>{category}</h3>
                <p>Prepared around the stationery, learner support or classroom requirement for this category.</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionHeader title="School packs parents can understand quickly" text="Sample pack structures for common school needs." />
          <div className={styles.packGrid}>
            {schoolPacks.map((pack) => (
              <PackCard pack={pack} key={pack.id} />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionCream}>
        <div className={styles.inner}>
          <div className={styles.splitBand}>
            <div>
              <p className={styles.eyebrow}>Parents and schools</p>
              <h2>Less stationery stress before school starts</h2>
              <p>
                Parents get one clear order path, while schools can reduce repeated stationery questions and help
                families understand what each grade requires.
              </p>
              <div className={styles.buttonRow}>
                <Button href="/order">Order a Pack</Button>
                <Button href="/partner" variant="white">
                  Partner Your School
                </Button>
              </div>
            </div>
            <ul className={styles.checkList}>
              {schoolPackBenefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
              <li>Prepayment planning for back-to-school periods</li>
              <li>Sponsor learner and classroom pack options</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.darkBand}>
            <div>
              <p className={styles.eyebrow}>Partner schools</p>
              <h2>Give your school a digital advantage</h2>
              <p>
                Pexpacks partners with schools to simplify stationery ordering, support parent communication and provide
                free standardised school website hosting for approved partner schools.
              </p>
              <p>
                Pexpacks provides and manages the website platform, while schools approve their official content and
                communication.
              </p>
              <div className={styles.buttonRow}>
                <Button href="/partner" variant="white">
                  Partner Your School
                </Button>
                <Button href="/partner#sponsor" variant="outline">
                  Sponsor a Learner
                </Button>
              </div>
            </div>
            <ul className={styles.checkList}>
              <li>School stationery list pages</li>
              <li>Parent order links</li>
              <li>Sponsor visibility pages</li>
              <li>Improved communication</li>
              <li>Community support channel</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.inner}>
          <SectionHeader title="School pack FAQs" text="Clear answers for parents, school administrators and sponsors." />
          <FAQAccordion items={faqs.slice(0, 5)} />
        </div>
      </section>
    </>
  );
}
