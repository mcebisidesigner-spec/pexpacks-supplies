import type { Metadata } from "next";
import { BrandPackageClaimForm } from "@/components/forms/BrandPackageClaimForm";
import { PageHero } from "@/components/marketing/PageHero";
import { buildMetadata } from "@/lib/seo";
import styles from "@/components/marketing/Marketing.module.css";

export const metadata: Metadata = buildMetadata(
  "Business Starter Brand Package | Pexpacks",
  "Claim the Pexpacks Business Starter Brand Package and submit your business details, branding preferences and reference files.",
  "/business-starter-brand-package"
);

const packageSteps = [
  "Submit your business and branding details.",
  "Upload existing logos, colour palettes or reference material if available.",
  "Pexpacks reviews the brief and confirms the next steps for your R3,999 package.",
];

export default function BusinessStarterBrandPackagePage() {
  return (
    <>
      <PageHero
        eyebrow="Business Starter Brand Package"
        title="Claim your brand package"
        text="Use this dedicated order form to send the information Pexpacks needs to prepare your logo, business cards, flyers, letterhead and starter website."
        panelText="Package value"
        panelTitle="Complete physical and digital branding for R3,999.00."
      />

      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.packageClaimLayout}>
            <BrandPackageClaimForm />

            <aside className={styles.packageClaimSummary}>
              <p className={styles.sectionEyebrow}>What happens next</p>
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
