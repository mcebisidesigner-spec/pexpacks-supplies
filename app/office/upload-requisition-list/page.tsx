import type { Metadata } from "next";
import { OfficeUploadForm } from "./OfficeUploadForm";
import { PageHero } from "@/components/marketing/PageHero";
import { buildMetadata } from "@/lib/seo";
import styles from "./OfficeUploadPage.module.css";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";

export const metadata: Metadata = buildMetadata(
  "Upload Requisition List | Pexpacks B2B",
  "Upload your office's monthly requisition list (PDF, image, Excel spreadsheet, or word document) and we will send you a custom B2B invoice.",
  "/office/upload-requisition-list"
);

export const dynamic = "force-static";

export default function OfficeUploadRequisitionPage() {
  return (
    <div className={sectionStyles.officePortalContainer}>
      <PageHero
        eyebrow="Concierge Procurement"
        title="Monthly Requisitions, Simplified."
        text="Upload your office&apos;s stationery and supplies request list in any format. We&apos;ll check stock, compile a payable invoice, and deliver it straight to your desk the next day."
        panelChildren={<OfficeUploadForm />}
      >
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepIcon}>1</div>
            <div className={styles.stepContent}>
              <h3>Drop Your Requisition File</h3>
              <p>Upload a PDF, photo, Excel spreadsheet, or Word doc. Or simply paste the text list.</p>
            </div>
          </div>
          
          <div className={styles.step}>
            <div className={styles.stepIcon}>2</div>
            <div className={styles.stepContent}>
              <h3>Invoice Quote Sent in 2 Hours</h3>
              <p>Our B2B team reviews the list, creates a tax-compliant quote, and emails/WhatsApp&rsquo;s it to you.</p>
            </div>
          </div>
          
          <div className={styles.step}>
            <div className={styles.stepIcon}>3</div>
            <div className={styles.stepContent}>
              <h3>Next-Day Delivery</h3>
              <p>Approve the quote with one click, settle the payable link, and we deliver your items tomorrow.</p>
            </div>
          </div>
        </div>
      </PageHero>
    </div>
  );
}
