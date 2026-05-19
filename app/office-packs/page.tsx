import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { officePacks } from "@/data/officePacks";
import { buildMetadata } from "@/lib/seo";
import { formatCurrency } from "@/lib/formatCurrency";
import { PexpacksEnquiryForm } from "@/components/forms/PexpacksEnquiryForm";
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

const BrandIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3l2.5 5.1 5.6.8-4.1 4 1 5.6-5-2.7-5 2.7 1-5.6-4.1-4 5.6-.8L12 3z" />
  </svg>
);

const CardIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <path d="M3 10h18" />
    <path d="M7 15h4" />
  </svg>
);

const MegaphoneIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 14h3l9 4V6L7 10H4v4z" />
    <path d="M7 14l1 5h3" />
    <path d="M19 9c1 .7 1.5 1.7 1.5 3s-.5 2.3-1.5 3" />
  </svg>
);

const DocumentIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 3h7l4 4v14H7V3z" />
    <path d="M14 3v5h4" />
    <path d="M10 13h5" />
    <path d="M10 17h4" />
  </svg>
);

const WebsiteIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 9h18" />
    <path d="M8 14h3" />
    <path d="M14 14h2" />
  </svg>
);

const brandPackageItems = [
  {
    title: "Professional Logo Design",
    text: "A practical visual identity your customers can recognise quickly.",
    Icon: BrandIcon,
  },
  {
    title: "Custom Business Cards",
    text: "Printed cards for owners, staff, sales teams and customer handouts.",
    Icon: CardIcon,
  },
  {
    title: "Marketing Flyers",
    text: "Simple promotional flyers for launches, offers and local campaigns.",
    Icon: MegaphoneIcon,
  },
  {
    title: "Official Company Letterhead",
    text: "A clean document style for quotes, invoices, proposals and notices.",
    Icon: DocumentIcon,
  },
  {
    title: "5-Page Website",
    text: "Hosted free for 12 months so the brand package has a live home.",
    Icon: WebsiteIcon,
  },
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
          <Button href="#request-quote">
            Request a Quote
          </Button>
          <Button
            href="#request-quote"
            variant="white"
          >
            Order a Pack
          </Button>
        </div>
      </PageHero>

      <section
        className={styles.brandPackageSection}
        aria-labelledby="brand-package-heading"
      >
        <div className={styles.inner}>
          <div className={styles.brandPackagePanel}>
            <div className={styles.brandPackageCopy}>
              <p className={styles.sectionEyebrow}>Special Offer</p>
              <h2 id="brand-package-heading">
                Business Starter Brand Package
              </h2>
              <p>
                Launch with a professional identity. Pexpacks prepares your
                essential physical and digital branding in one focused starter
                package.
              </p>
              <div className={styles.brandPackagePrice}>
                <span>Complete package</span>
                <strong>R3,500.00</strong>
              </div>
              <div className={styles.buttonRow}>
                <Button href="#request-quote" variant="white">
                  Claim This Package
                </Button>
              </div>
            </div>

            <div className={styles.brandPackageItems}>
              {brandPackageItems.map(({ title, text, Icon }, index) => (
                <details
                  className={styles.brandPackageItem}
                  key={title}
                  open={index === 0}
                >
                  <summary>
                    <span className={styles.brandPackageIcon}>
                      <Icon />
                    </span>
                    <strong>{title}</strong>
                  </summary>
                  <p>{text}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

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
                      href="#request-quote"
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

      <section className={styles.sectionCream}>
        <div className={styles.inner}>
          <div className={styles.splitBand}>
            <div>
              <p className={styles.sectionEyebrow}>Monthly office support</p>
              <h2>Keep admin supplies predictable</h2>
              <p>
                Set up a recurring office pack for the basics your team uses
                every month, or request a custom pack when a project, shop or
                site needs practical supplies quickly.
              </p>
              <div className={styles.buttonRow}>
                <Button href="#request-quote">
                  Start Monthly Pack
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
                <h3 style={{ margin: 0 }}>{useCase}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="request-quote" className={styles.sectionCream}>
        <div className={styles.inner}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <PexpacksEnquiryForm
              mode="contact"
              title="Get a custom office quote"
              submitLabel="Request Quote"
              initialEnquiryType="Office pack"
            />
          </div>
        </div>
      </section>
    </>
  );
}
