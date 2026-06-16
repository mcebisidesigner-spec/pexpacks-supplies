import type { Metadata } from "next";
import { BrandPackageClaimForm } from "@/components/forms/BrandPackageClaimForm";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";
import { buildMetadata } from "@/lib/seo";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";
import cardStyles from "@/components/marketing/MarketingCards.module.css";

export const metadata: Metadata = buildMetadata(
  "Branding Pack | Pexpacks",
  "Launch your business professionally for R5,500. CIPC registration, logo, business cards, flyers, letterhead and a 5-page website.",
  "/business-starter-brand-package"
);

export const dynamic = "force-static";

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

const CipcIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 12h6" />
    <path d="M12 9v6" />
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);

const brandPackageItems = [
  {
    title: "CIPC Registration",
    text: "Company registration handled so your business is legally recognised from day one.",
    Icon: CipcIcon,
  },
  {
    title: "Professional Logo Design",
    text: "A practical visual identity your customers can recognise quickly.",
    Icon: BrandIcon,
  },
  {
    title: "Custom Business Cards",
    text: "Digital business card design — printed copies charged separately.",
    Icon: CardIcon,
  },
  {
    title: "Marketing Flyers",
    text: "Digital flyer design — printed copies charged separately.",
    Icon: MegaphoneIcon,
  },
  {
    title: "Official Company Letterhead",
    text: "Digital letterhead template — printed copies charged separately.",
    Icon: DocumentIcon,
  },
  {
    title: "5-Page Website",
    text: "Hosted free for 12 months so the brand package has a live home.",
    Icon: WebsiteIcon,
  },
];

const packageSteps = [
  "Submit your business and branding details.",
  "Upload existing logos, colour palettes or reference material if available.",
  "Pexpacks reviews the brief and confirms the next steps for your R5,500 package.",
];

export default function BusinessStarterBrandPackagePage() {
  return (
    <>
      <PageHero
        eyebrow="Branding pack"
        title="Launch Your Business Professionally for R5,500"
        panelText="Package value"
        panelTitle="Complete physical and digital branding for R5,500.00."
      />

      <section
        className={sectionStyles.brandPackageSection}
        aria-labelledby="brand-package-heading"
      >
        <div className={sectionStyles.inner}>
          <div className={sectionStyles.brandPackagePanel}>
            <div className={sectionStyles.brandPackageCopy}>
              <p className={sectionStyles.sectionEyebrow}>What's included</p>
              <h2 id="brand-package-heading">Your complete branding kit</h2>
              <p>
                Launch with a professional identity. Pexpacks handles your
                company registration, visual branding and essential print and
                digital assets in one focused starter package.
              </p>
              <div className={sectionStyles.brandPackagePrice}>
                <span>Complete package</span>
                <strong>R5,500.00</strong>
              </div>
              <div className={sectionStyles.buttonRow}>
                <Button href="#claim-form" variant="white">
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

      <section className={sectionStyles.section} id="claim-form">
        <div className={sectionStyles.inner}>
          <div className={sectionStyles.packageClaimLayout}>
            <BrandPackageClaimForm />

            <aside className={sectionStyles.packageClaimSummary}>
              <p className={sectionStyles.sectionEyebrow}>What happens next</p>
              <h2>Send one clear brief</h2>
              <p>
                The form captures the practical details needed to confirm the
                package, understand your business, and start the branding work
                with fewer back-and-forth messages.
              </p>
              <ol>
                {packageSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </aside>
          </div>
        </div>
      </section>

      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <div className={sectionStyles.splitBand}>
            <div className={cardStyles.packCard}>
              <div className={cardStyles.packCardHead}>
                <p className={sectionStyles.sectionEyebrow}>What's included</p>
                <h2>Free .co.za domain</h2>
              </div>
              <div className={cardStyles.packCardBody}>
                <p className={cardStyles.packDescription}>
                  A .co.za domain for your business is registered for free as part of this package.
                </p>
              </div>
            </div>

            <div className={cardStyles.packCard}>
              <div className={cardStyles.packCardHead}>
                <p className={sectionStyles.sectionEyebrow}>Scope limits</p>
                <h2>What&rsquo;s not included</h2>
              </div>
              <div className={cardStyles.packCardBody}>
                <p className={cardStyles.packDescription}>
                  To keep the branding pack focused and affordable, the
                  following are quoted separately:
                </p>
                <ul style={{ margin: "16px 0", paddingLeft: "20px", lineHeight: "1.8" }}>
                  <li>E-commerce functionality on the website</li>
                  <li>Custom payment gateway or booking portal integration</li>
                  <li>Printing of business cards, flyers, and letterhead</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
