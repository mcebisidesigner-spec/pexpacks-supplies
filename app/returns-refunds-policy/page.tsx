import type { Metadata } from "next";
import Link from "next/link";
import {
  legalEmail as generalEmail,
  legalEmailHref as generalEmailHref,
  phoneHref,
  phoneNumber,
} from "@/data/contact";
import {
  LegalDocumentPage,
  legalStyles,
  type LegalDocumentConfig,
} from "@/components/policy/LegalDocumentPage";
import { buildMetadata } from "@/lib/seo";
import { EFFECTIVE_DATE } from "@/lib/constants";

export const metadata: Metadata = buildMetadata(
  "Returns & Refunds Policy",
  "Pexpacks Returns & Refunds Policy — Official consumer protection guidelines governing product returns, CPA Section 56 statutory warranties, ECTA cooling-off rights, and customized item exclusions.",
  "/returns-refunds-policy"
);

export const dynamic = "force-static";

const config: LegalDocumentConfig = {
  route: "/returns-refunds-policy",
  pageTitle: "Returns & Refunds Policy",
  metaDescription:
    "Pexpacks Returns & Refunds Policy — Official consumer protection guidelines governing product returns, CPA Section 56 statutory warranties, ECTA cooling-off rights, and customized item exclusions.",
  heroEyebrow: "Statutory Consumer Protections (CPA 68 of 2008 & ECTA 25 of 2002)",
  heroTitle: "Returns, Refunds, and Statutory Warranty Rights",
  heroText:
    "This policy outlines your legal rights regarding returns, exchanges, refunds, and statutory warranties when purchasing school stationery packs and services from Pexpacks.",
  heroPanelTitle: `Effective ${EFFECTIVE_DATE}`,
  heroPanelText: "CPA & ECTA Aligned — South Africa",
  tocHeading: "Returns Policy Contents",
  tocAriaLabel: "Returns and refunds policy contents",
  summaryKicker: "Key Consumer Summary",
  summaryTitle: "Defects vs. Customized Work Returns",
  summaryText:
    "All stationery products enjoy a 6-month statutory warranty against defects under CPA Section 56. However, personalized learner labels, customized school pack collations, and Pexcover™ book-covering services are legally restricted from change-of-mind returns once processing has commenced.",
  highlights: [
    {
      title: "6-Month CPA Warranty",
      content:
        "Defective, damaged, or unsafe goods qualify for repair, replacement, or refund under Section 56 of the Consumer Protection Act.",
      tone: "accent",
    },
    {
      title: "7-Day ECTA Cooling-Off Right",
      content:
        "Non-customized online orders carry a 7-day statutory cooling-off period under ECTA Section 44.",
      tone: "warning",
    },
  ],
  sections: [
    {
      id: "statutory-warranties",
      eyebrow: "1",
      title: "Statutory Warranty of Quality (CPA Section 55 & 56)",
      summary:
        "Your statutory 6-month consumer rights regarding defective or substandard stationery goods.",
      content: (
        <>
          <p>
            In accordance with Sections 55 and 56 of the Consumer Protection Act (CPA 68 of 2008), all stationery products supplied by Pexpacks carry an implied statutory warranty that the goods are reasonably suitable for the purposes for which they are generally intended, of good quality, in working order, and free of defects.
          </p>
          <h3>Statutory 6-Month Remedy</h3>
          <p>
            If goods supplied by Pexpacks fail to comply with these statutory requirements within <strong>6 months</strong> after delivery, the consumer is entitled to return the goods at Pexpacks' risk and expense. The consumer may elect to:
          </p>
          <ul>
            <li>Have the defective item repaired;</li>
            <li>Have the defective item replaced with a new matching item; or</li>
            <li>Receive a full refund of the price paid for the defective item.</li>
          </ul>
          <p>
            <em>Exclusion:</em> This statutory warranty does not apply to defect caused by normal wear and tear, intentional damage, misuse, neglect, or failure to follow product care instructions after delivery.
          </p>
        </>
      ),
    },
    {
      id: "cooling-off-rights",
      eyebrow: "2",
      title: "ECTA 7-Day Online Cooling-Off Rights (Section 44)",
      summary:
        "Unconditional cancellation rights for non-customised electronic purchases.",
      content: (
        <>
          <p>
            In terms of Section 44 of the Electronic Communications and Transactions Act (ECTA 25 of 2002), a consumer is entitled to cancel any online purchase of standard, non-customised stationery goods without reason and without penalty within <strong>7 days</strong> after receipt of the goods.
          </p>
          <h3>Cooling-Off Execution &amp; Return Costs</h3>
          <ul>
            <li>The consumer must notify Pexpacks in writing within the 7-day period.</li>
            <li>Goods must be returned unused, unopened, and in their original packaging.</li>
            <li>In terms of ECTA Section 44(2), the direct cost of returning the goods via courier shall be borne by the consumer.</li>
            <li>Pexpacks will process the refund within 30 days of receiving the returned goods.</li>
          </ul>
        </>
      ),
    },
    {
      id: "customised-exclusions",
      eyebrow: "3",
      title: "Customised Goods & Pexcover™ Exclusions",
      summary:
        "Statutory restrictions on change-of-mind returns for personalized and labor-based work.",
      content: (
        <>
          <p>
            In accordance with Section 42(2)(f) of ECTA and Section 20(3)(a) of the CPA, statutory change-of-mind cooling-off rights do not apply to goods that are made to the consumer's specifications, clearly personalized, or assembled to custom order.
          </p>
          <div className={legalStyles.noticeBlock}>
            <p>
              <strong>Custom &amp; Pexcover™ Restrictions:</strong>
            </p>
            <ul>
              <li><strong>Pexcover™ Book-Covering:</strong> Books that have been plastic-wrapped, fitted with protective covers, or custom-cut to individual learner specifications.</li>
              <li><strong>Personalized Learner Labelling:</strong> Stationery items or books bearing customized learner names, grade labels, or custom school identification.</li>
              <li><strong>Special-Order List Assembly:</strong> Grade-specific stationery packs that have undergone custom collation once fulfillment has commenced.</li>
            </ul>
            <p>
              Customised work cannot be returned or refunded merely due to a change of mind or grade transfer, unless the items themselves are defective under CPA Section 56.
            </p>
          </div>
        </>
      ),
    },
    {
      id: "claim-procedure",
      eyebrow: "4",
      title: "Step-by-Step Return Claim Procedure",
      summary:
        "How to log a return or defect claim with our customer support team.",
      content: (
        <>
          <ol>
            <li>
              <strong>Log a Claim:</strong> Email <a href={generalEmailHref}>{generalEmail}</a> or call <a href={phoneHref}>{phoneNumber}</a> within 48 hours of delivery for transit damage/shortages, or within the statutory warranty period for defects.
            </li>
            <li>
              <strong>Provide Details:</strong> Include your order reference number, description of the issue, and clear photograph/video evidence of damaged or incorrect items.
            </li>
            <li>
              <strong>Assessment &amp; Authorization:</strong> Pexpacks will review the claim within 2 business days and issue return shipping instructions or dispatch a replacement courier.
            </li>
            <li>
              <strong>Refund Settlement:</strong> Refunds are processed to the original payment method within 14 business days of claim approval.
            </li>
          </ol>
        </>
      ),
    },
  ],
};

export default function ReturnsRefundsPolicyPage() {
  return <LegalDocumentPage {...config} />;
}
