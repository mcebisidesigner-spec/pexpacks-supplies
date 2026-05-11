import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { officePacks } from "@/data/officePacks";
import { buildMetadata } from "@/lib/seo";
import { formatCurrency } from "@/lib/formatCurrency";
import styles from "@/components/marketing/Marketing.module.css";

const businessUseCases = [
  "Home offices",
  "Freelancers",
  "Retail shops",
  "Construction companies",
  "Admin offices",
  "Small teams"
];

const officeBenefits = [
  "One practical order instead of many small purchases",
  "Monthly pack planning for recurring supplies",
  "Custom quotes for teams, shops and admin offices",
  "Delivery or collection options during the Gauteng pilot"
];

export const metadata: Metadata = buildMetadata(
  "Office Stationery Packs for SMEs | PexPacks",
  "Practical office stationery packs for SMEs, home offices, freelancers, admin teams, shops, and small businesses.",
  "/office-packs"
);

export default function OfficePacksPage() {
  return (
    <>
      <PageHero
        eyebrow="Office"
        title="Office supplies packed for busy SMEs"
        text="Pexpacks prepares practical stationery and office packs so your team can stay stocked without wasting time on small purchases."
        panelText="Core message"
        panelTitle="Office essentials packed and delivered, so your business keeps moving."
      >
        <div className={styles.buttonRow}>
          <Button href="/contact">Request a Quote</Button>
          <Button href="/order" variant="white">
            Order a Pack
          </Button>
        </div>
      </PageHero>

      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionHeader title="Office pack options" text="Ready-to-quote packs for small teams, home offices and recurring admin needs." />
          <div className={styles.officeGrid}>
            {officePacks.map((pack) => (
              <article className={styles.packCard} key={pack.id}>
                <div className={`${styles.packMedia} ${styles.packMediaBlue}`} aria-hidden="true">
                  <span>Office</span>
                </div>
                <div className={styles.packBody}>
                  <p className={styles.packMeta}>SME and office supplies</p>
                  <h3>{pack.name}</h3>
                  <p>{pack.description}</p>
                  <ul className={styles.packList}>
                    {pack.contents.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <div className={styles.packFooter}>
                    <span className={styles.priceLabel}>
                      {pack.priceFrom === 0 ? "Request quote" : `From ${formatCurrency(pack.priceFrom)}`}
                    </span>
                    <Button href={`/contact?type=office&pack=${pack.slug}`} size="sm">
                      Request Quote
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionCream}>
        <div className={styles.inner}>
          <div className={styles.splitBand}>
            <div>
              <p className={styles.eyebrow}>Monthly office support</p>
              <h2>Keep admin supplies predictable</h2>
              <p>
                Set up a recurring office pack for the basics your team uses every month, or request a custom pack when
                a project, shop or site needs practical supplies quickly.
              </p>
              <div className={styles.buttonRow}>
                <Button href="/contact">Start Monthly Pack</Button>
                <Button href="/contact?type=office" variant="white">
                  Custom Office Quote
                </Button>
              </div>
            </div>
            <ul className={styles.checkList}>
              {officeBenefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionHeader title="Built for practical business types" text="Pexpacks office packs are structured around real admin needs, not cluttered catalogue browsing." />
          <div className={styles.gridThree}>
            {businessUseCases.map((useCase) => (
              <article className={styles.infoCard} key={useCase}>
                <h3>{useCase}</h3>
                <p>Choose a pack, request a quote, and let Pexpacks prepare the essentials your team needs.</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
