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
  "Small teams",
];

const officeBenefits = [
  "One practical order instead of many small purchases",
  "Monthly pack planning for recurring supplies",
  "Custom quotes for teams, shops and admin offices",
  "Delivery or collection options during the Gauteng pilot",
];

export const metadata: Metadata = buildMetadata(
  "Office Stationery Packs for SMEs | Pexpacks",
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
          <SectionHeader
            eyebrow="Office pack types"
            title="Office pack options"
            text="Ready-to-quote packs for small teams, home offices and recurring admin needs."
          />
          <div className={styles.officeGrid}>
            {officePacks.map((pack) => (
              <article className={styles.packCard} key={pack.id}>
                <div
                  className={`${styles.packMedia} ${styles.packMediaBlue}`}
                  aria-hidden="true"
                >
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
                      {pack.priceFrom === 0
                        ? "Request quote"
                        : `From ${formatCurrency(pack.priceFrom)}`}
                    </span>
                    <Button
                      href={`/contact?type=office&pack=${pack.slug}`}
                      size="sm"
                    >
                      Request Quote
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className={styles.sectionCream}
        aria-labelledby="brand-package-heading"
      >
        <div className={styles.inner}>
          <div
            className={styles.splitBand}
            style={{
              background: "var(--pex-primary)",
              color: "var(--pex-bg)",
              borderRadius: "var(--radius-section)",
              padding: "clamp(32px, 6vw, 64px)",
            }}
          >
            <div>
              <p
                className={styles.eyebrow}
                style={{ color: "var(--pex-accent)" }}
              >
                Special Offer
              </p>
              <h2
                id="brand-package-heading"
                style={{
                  color: "var(--pex-bg)",
                  fontSize: "clamp(32px, 4vw, 42px)",
                  marginBottom: "16px",
                }}
              >
                Business Starter Brand Package
              </h2>
              <p
                style={{
                  fontSize: "18px",
                  opacity: 0.9,
                  marginBottom: "24px",
                  maxWidth: "480px",
                  lineHeight: 1.5,
                }}
              >
                Launch your business with a professional identity. Get your
                complete physical and digital branding sorted in one
                comprehensive package for only <strong>R3,500.00</strong>.
              </p>
              <div className={styles.buttonRow}>
                <Button href="/contact?type=brand-package" variant="white">
                  Claim This Package
                </Button>
              </div>
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                padding: "32px",
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <h3
                style={{
                  color: "var(--pex-bg)",
                  marginBottom: "20px",
                  fontSize: "20px",
                }}
              >
                What's Included:
              </h3>
              <ul
                className={styles.checkList}
                style={
                  {
                    color: "var(--pex-bg)",
                    "--check-color": "var(--pex-accent)",
                  } as React.CSSProperties
                }
              >
                <li>Professional Logo Design</li>
                <li>Custom Business Cards</li>
                <li>Marketing Flyers</li>
                <li>Official Company Letterhead</li>
                <li>5-Page Website (Hosted free for 12 months)</li>
              </ul>
            </div>
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
                Set up a recurring office pack for the basics your team uses
                every month, or request a custom pack when a project, shop or
                site needs practical supplies quickly.
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
          <SectionHeader
            eyebrow="Business stationery"
            title="Built for practical business types"
            text="Pexpacks office packs are structured around real admin needs, not cluttered catalogue browsing."
          />
          <div className={styles.gridThree}>
            {businessUseCases.map((useCase) => (
              <article className={styles.infoCard} key={useCase}>
                <h3>{useCase}</h3>
                <p>
                  Choose a pack, request a quote, and let Pexpacks prepare the
                  essentials your team needs.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
