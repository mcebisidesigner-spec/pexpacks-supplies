import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";
import { FaqMarquee } from "@/components/shared/FaqMarquee";
import { OfficeQuoteExperience } from "@/components/marketing/OfficeQuoteExperience";


import { officePacks } from "@/data/officePacks";
import { faqs } from "@/data/faqs";
import { buildMetadata } from "@/lib/seo";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";

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
    <div className={sectionStyles.officePortalContainer}>
      <PageHero
        eyebrow="Office procurement"
        title="Stop the Makro runs. Streamline your office procurement."
        panelText="Trusted by SMEs across South Africa"
        panelTitle="SARS-compliant invoices, next-day delivery &amp; zero admin"
      >
        <div className={sectionStyles.buttonRow}>
          <Button href="#office-pack-types" variant="primary">Shop Office Starter Packs</Button>
          <Button href="/office/upload-requisition-list" variant="white">
            Upload Requisition List
          </Button>
        </div>
      </PageHero>

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

      <OfficeQuoteExperience
        officePacks={officePacks}
        initialMessage={initialMessage}
      />

      <FaqMarquee
        faqs={faqs.filter((f) =>
          ["sme-office-packs", "custom-office-quote", "bulk-office-orders", "delivery-timing", "payment-flow"].includes(f.id)
        )}
      />
    </div>
  );
}
