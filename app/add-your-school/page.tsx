import type { Metadata } from "next";
import { AddSchoolForm } from "@/components/forms/AddSchoolForm";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { mostPopularPacksHref } from "@/data/packs";
import { standardSchoolPacks } from "@/data/standardSchoolPacks";
import { buildMetadata } from "@/lib/seo";
import styles from "@/components/marketing/Marketing.module.css";

export const metadata: Metadata = buildMetadata(
  "Add Your School",
  "Submit your school details so Pexpacks can prepare a school stationery pack page for your grade lists.",
  "/add-your-school"
);

export default function AddYourSchoolPage() {
  return (
    <>
      <PageHero
        eyebrow="Add your school"
        title="Can’t find your school? Send us the details."
        text="Share the school name, location and grade list information. Pexpacks will review it and help prepare the correct stationery pack path."
        panelText="Need a pack today?"
        panelTitle="Use a standard grade combo while your school list is being reviewed."
      >
        <div className={styles.buttonRow}>
          <Button href={mostPopularPacksHref}>Buy Standard Pack</Button>
          <Button href="/contact" variant="white">
            Contact Us
          </Button>
        </div>
      </PageHero>

      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.infoGrid}>
            <article className={styles.formCard} id="school-request-form">
              <p className={styles.eyebrow}>School request</p>
              <h2>Submit school details</h2>
              <AddSchoolForm />
            </article>

            <article className={styles.infoCard}>
              <SectionHeader
                eyebrow="Review process"
                title="What happens next?"
                text="Pexpacks checks whether the school can be added and whether a standard pack can help while the official list is prepared."
              />
              <ul className={styles.checkList}>
                <li>We confirm the school name and location.</li>
                <li>We review the grade or stationery list requirement.</li>
                <li>We recommend a school-specific or standard grade pack.</li>
                <li>We help you move to an order or enquiry path.</li>
              </ul>
              <div className={styles.buttonRow}>
                <Button href={mostPopularPacksHref} variant="white">
                  Buy Standard Pack
                </Button>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.inner}>
          <SectionHeader
            eyebrow="Grade packs"
            title="Standard grade combo packs"
            text="Use these per-grade combos when a school-specific pack has not been added yet."
          />
          <div className={styles.packGrid}>
            {standardSchoolPacks.slice(0, 6).map((pack) => (
              <article className={styles.packCard} key={pack.id}>
                <div
                  className={[styles.packMedia, styles.packMediaBlue].join(" ")}
                  aria-hidden="true"
                >
                  <span>{pack.phase}</span>
                </div>
                <div className={styles.packBody}>
                  <p className={styles.packMeta}>{pack.priceLabel}</p>
                  <h3>{pack.grade} Combo Pack</h3>
                  <p>{pack.description}</p>
                  <ul className={styles.packList}>
                    {pack.includes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <div className={styles.packFooter}>
                    <Button href={mostPopularPacksHref} size="sm">
                      Buy Standard Pack
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
