import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { standardSchoolPacks } from "@/data/standardSchoolPacks";
import { buildMetadata } from "@/lib/seo";
import styles from "@/components/marketing/Marketing.module.css";

export const metadata: Metadata = buildMetadata(
  "Standard School Packs",
  "Browse standard per-grade school stationery combo packs from Grade R to Grade 12 while school-specific lists are prepared.",
  "/standard-school-packs"
);

export default function StandardSchoolPacksPage() {
  return (
    <>
      <PageHero
        eyebrow="Standard school packs"
        title="Per-grade stationery combos for quick ordering."
        text="Choose a standard Grade R to Grade 12 combo when your school-specific pack is not listed yet."
        panelText="Useful when"
        panelTitle="Your school is still being added to the Pexpacks database."
      >
        <div className={styles.buttonRow}>
          <Button href="/order">Order a Standard Pack</Button>
          <Button href="/add-your-school" variant="white">
            Add Your School
          </Button>
        </div>
      </PageHero>

      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionHeader
            eyebrow="Grade combos"
            title="Standard combos by grade"
            text="Each pack is a practical baseline. School-specific items can be confirmed before final packing."
          />
          <div className={styles.packGrid}>
            {standardSchoolPacks.map((pack) => (
              <article className={styles.packCard} key={pack.id}>
                <div className={[styles.packMedia, styles.packMediaBlue].join(" ")} aria-hidden="true">
                  <span>{pack.phase}</span>
                </div>
                <div className={styles.packBody}>
                  <p className={styles.packMeta}>{pack.priceLabel}</p>
                  <h3>{pack.grade} Standard Combo</h3>
                  <p>{pack.description}</p>
                  <ul className={styles.packList}>
                    {pack.includes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <div className={styles.packFooter}>
                    <span className={styles.priceLabel}>{pack.grade}</span>
                    <Button href={`/order?pack=${pack.gradeSlug}`} size="sm">
                      Order Pack
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.inner}>
          <div className={styles.splitBand}>
            <div>
              <p className={styles.eyebrow}>School-specific lists</p>
              <h2>Need your exact school stationery list?</h2>
              <p>
                If your school is not in the database yet, send us the school name, city and grade list. We can help
                prepare a school-specific pack path or recommend the closest standard combo.
              </p>
              <div className={styles.buttonRow}>
                <Button href="/add-your-school">Add Your School</Button>
                <Button href="/contact" variant="white">
                  Contact Us
                </Button>
              </div>
            </div>
            <ul className={styles.checkList}>
              <li>Grade R to Grade 12 baseline combos</li>
              <li>School list review support</li>
              <li>Delivery or collection options</li>
              <li>Final confirmation before packing</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
