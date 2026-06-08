import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CTASection } from "@/components/marketing/CTASection";
import { FaqMarquee } from "@/components/shared/FaqMarquee";
import { OfficeQuoteExperience } from "@/components/marketing/OfficeQuoteExperience";
import { OfficeReconciliationConcierge } from "@/components/marketing/OfficeReconciliationConcierge";
import { officePacks } from "@/data/officePacks";
import { faqs } from "@/data/faqs";
import { buildMetadata } from "@/lib/seo";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";
import cardStyles from "@/components/marketing/MarketingCards.module.css";

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
  "/office",
);

export const dynamic = "force-static";

type OfficePacksPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OfficePacksPage({
  searchParams,
}: OfficePacksPageProps) {
  const params = searchParams ? await searchParams : {};
  const packParam = typeof params.pack === "string" ? params.pack : "";
  const initialMessage = packParam
    ? `I am interested in the ${packParam} pack.`
    : "";

  return (
    <>
      <section className={sectionStyles.b2bHero}>
        <div className={sectionStyles.b2bHeroInner}>
          <div className={sectionStyles.b2bHeroContent}>
            <h1 className={sectionStyles.b2bHeroTitle}>
              Office Supply Reconciliation. <br />
              Streamline your office procurement.
            </h1>
            <p className={sectionStyles.b2bHeroText}>
              Next-day delivery, automated tax invoices, and zero admin for growing SMEs.
            </p>
            <div className={sectionStyles.buttonRow}>
              <Button href="#contact-enquiry">Shop Office Starter Packs</Button>
              <Button href="#contact-enquiry" variant="outline">
                Upload Requisition List
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className={sectionStyles.accountingTrustBanner}>
        <div className={sectionStyles.accountingTrustInner}>
          <div className={sectionStyles.accountingTrustContent}>
            <div className={sectionStyles.accountingTrustIcon}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div className={sectionStyles.accountingTrustText}>
              <h3 className={sectionStyles.accountingTrustTitle}>SARS-Compliant Tax Invoices</h3>
              <p className={sectionStyles.accountingTrustDesc}>
                Instantly generated and emailed directly to your accounts department. Say goodbye to faded till slips.
              </p>
            </div>
          </div>
          <div className={sectionStyles.accountingTrustBadge}>
            SARS Compliant
          </div>
        </div>
      </section>

      <section
        className={sectionStyles.brandPackageSection}
        id="brand-packages"
        aria-labelledby="brand-package-heading"
      >
        <div className={sectionStyles.inner}>
          <div className={sectionStyles.brandPackagePanel}>
            <div className={sectionStyles.brandPackageCopy}>
              <p className={sectionStyles.sectionEyebrow}>Special Offer</p>
              <h2 id="brand-package-heading">Business Starter Brand Package</h2>
              <p>
                Launch with a professional identity. Pexpacks prepares your
                essential physical and digital branding in one focused starter
                package.
              </p>
              <div className={sectionStyles.brandPackagePrice}>
                <span>Complete package</span>
                <strong>R3,999.00</strong>
              </div>
              <div className={sectionStyles.buttonRow}>
                <Button href="/business-starter-brand-package" variant="white">
                  Claim This Package
                </Button>
              </div>
            </div>

            <div className={sectionStyles.brandPackageItems}>
              {brandPackageItems.map(({ title, text, Icon }, index) => (
                <details
                  className={sectionStyles.brandPackageItem}
                  key={title}
                  open={index === 0}
                >
                  <summary>
                    <span className={sectionStyles.brandPackageIcon}>
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

      <OfficeQuoteExperience
        officePacks={officePacks}
        officeBenefits={officeBenefits}
        initialMessage={initialMessage}
      />

      <OfficeReconciliationConcierge />

      <FaqMarquee
        faqs={faqs.filter((f) =>
          ["sme-office-packs", "custom-office-quote", "bulk-office-orders", "delivery-timing", "payment-flow"].includes(f.id)
        )}
      />

      <CTASection
        eyebrow="Ready to get started"
        title="Get your office stationery quote"
        text="Request a custom quote for your business or browse our standard packs for SMEs, home offices, and small teams."
        primaryHref="#contact-enquiry"
        primaryLabel="Request a Quote"
      />

      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <div className={sectionStyles.splitBand}>
            <div>
              <p className={sectionStyles.sectionEyebrow}>Need school stationery?</p>
              <h2>Back to school</h2>
              <p>
                Pexpacks prepares ready-packed stationery for every grade &mdash; Foundation Phase through to High School.
              </p>
              <div className={sectionStyles.buttonRow}>
                <Button href="/schools" variant="primary">Find a School Pack</Button>
                <Button href="/foundation-phase" variant="white">Browse Grade Packs</Button>
              </div>
            </div>
            <div className={cardStyles.packCard}>
              <div className={cardStyles.packCardHead}>
                <h3 style={{ fontSize: "20px" }}>Partner with Pexpacks</h3>
              </div>
              <div className={cardStyles.packCardBody}>
                <p className={cardStyles.packDescription}>
                  Schools can submit their stationery lists so parents order grade-specific packs. No admin, no hassle.
                </p>
              </div>
              <div className={cardStyles.packCardButtonWrap}>
                <Link href="/partnership" className={cardStyles.cardLink}>
                  Explore partnerships &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
