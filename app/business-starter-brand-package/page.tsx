import type { Metadata } from "next";
import { BrandPackageClaimForm } from "@/components/forms/BrandPackageClaimForm";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";
import { buildMetadata } from "@/lib/seo";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";

export const metadata: Metadata = buildMetadata(
  "Business Starter Brand Package | Pexpacks",
  "Claim the Pexpacks Business Starter Brand Package and submit your business details, branding preferences and reference files.",
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

const packageSteps = [
  "Submit your business and branding details.",
  "Upload existing logos, colour palettes or reference material if available.",
  "Pexpacks reviews the brief and confirms the next steps for your R3,999 package.",
];

export default function BusinessStarterBrandPackagePage() {
  return (
    <>
      <PageHero
        eyebrow="Pex your brand"
        title="Claim your brand package"
        text="Use this dedicated order form to send the information Pexpacks needs to prepare your logo, business cards, flyers, letterhead and starter website."
        panelText="Package value"
        panelTitle="Complete physical and digital branding for R3,999.00."
      />

      <section
        className={sectionStyles.brandPackageSection}
        aria-labelledby="brand-package-heading"
      >
        <div className={sectionStyles.inner}>
          <div className={sectionStyles.brandPackagePanel}>
            <div className={sectionStyles.brandPackageCopy}>
              <p className={sectionStyles.sectionEyebrow}>What's included</p>
              <h2 id="brand-package-heading">Everything in the package</h2>
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
    </>
  );
}
