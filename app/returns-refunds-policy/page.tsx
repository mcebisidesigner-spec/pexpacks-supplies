import type { Metadata } from "next";
import Link from "next/link";
import {
  generalEmail,
  generalEmailHref,
  phoneHref,
  phoneNumber,
} from "@/data/contact";
import {
  LegalDocumentPage,
  type LegalDocumentConfig,
} from "@/components/policy/LegalDocumentPage";
import { buildMetadata } from "@/lib/seo";
import { EFFECTIVE_DATE } from "@/lib/constants";



export const metadata: Metadata = buildMetadata(
  "Returns & Refunds Policy",
  "Read the Pexpacks returns and refunds policy for school packs, custom work, and CPA-aligned remedies.",
  "/returns-refunds-policy"
);

export const dynamic = "force-static";

const config: LegalDocumentConfig = {
  route: "/returns-refunds-policy",
  pageTitle: "Returns & Refunds Policy",
  metaDescription:
    "Read the Pexpacks returns and refunds policy for school packs, custom work, and CPA-aligned remedies.",
  heroEyebrow: "Pex your returns",
  heroTitle: "How returns, refunds, and cancellations are handled",
  heroText:
    "This page explains when goods can be returned, when customised items may be restricted, and how refunds or replacements are assessed under South African consumer protections.",
  heroPanelTitle: `Effective ${EFFECTIVE_DATE}`,
  heroPanelText: "CPA aligned and operationally practical.",
  tocHeading: "Returns contents",
  tocAriaLabel: "Returns and refunds policy contents",
  summaryKicker: "Before you request a return",
  summaryTitle: "Customised work usually carries narrower return rights",
  summaryText:
    "Standard issues like defects, damage, or incorrect supply can be reviewed quickly, but personalised, labelled, covered, or learner-specific items may not qualify for a change-of-mind return once work has started.",
  highlights: [
    {
      title: "Fast reporting matters",
      content:
        "Report missing, incorrect, or damaged items as soon as possible after delivery or collection.",
      tone: "warning",
    },
    {
      title: "Need help?",
      content: (
        <>
          Email <a href={generalEmailHref}>{generalEmail}</a> or call{" "}
          <a href={phoneHref}>{phoneNumber}</a>.
        </>
      ),
      tone: "accent",
    },
    {
      title: "Related pages",
      content: (
        <>
          See the <Link href="/terms">Terms of Use</Link> and{" "}
          <Link href="/delivery-policy">Delivery Policy</Link> for connected
          process detail.
        </>
      ),
    },
  ],
  sections: [
    {
      id: "eligible-returns",
      eyebrow: "1",
      title: "When a return or refund may be considered",
      summary:
        "Returns are generally reviewed where goods are defective, damaged, incorrect, or not supplied as described.",
      content: (
        <ul>
          <li>Goods supplied in error.</li>
          <li>Defective or damaged goods present before customer use.</li>
          <li>Missing items or materially incorrect pack contents.</li>
          <li>Order issues that qualify under the Consumer Protection Act.</li>
        </ul>
      ),
    },
    {
      id: "customised-items",
      eyebrow: "2",
      title: "Custom, personalised, and labour-based services",
      summary:
        "School-specific assembly, labelling, Pexcover, and similar work may be limited once fulfilment has begun.",
      content: (
        <>
          <p>
            Some Pexpacks orders are assembled to a specific learner, grade,
            school, or instruction set. Covered books, labelled goods, custom
            stationery selections, and special-order items may not qualify for
            a simple change-of-mind return.
          </p>
          <p>
            Where the law gives a mandatory remedy, Pexpacks will still assess
            the matter under the relevant legal standard.
          </p>
        </>
      ),
    },
    {
      id: "return-process",
      eyebrow: "3",
      title: "How to request support",
      summary:
        "A clear report helps the team verify the issue and offer the right remedy.",
      content: (
        <ol>
          <li>Contact Pexpacks with your order details and a short explanation.</li>
          <li>Include photos where damage, shortage, or incorrect supply is visible.</li>
          <li>Wait for confirmation before sending goods back where collection or inspection is needed.</li>
          <li>Keep the goods unused where possible until the review is complete.</li>
        </ol>
      ),
    },
    {
      id: "refund-outcomes",
      eyebrow: "4",
      title: "Possible outcomes after review",
      summary:
        "Depending on the issue, Pexpacks may replace, repair, exchange, credit, or refund the affected item or order portion.",
      content: (
        <ul>
          <li>Replacement of the affected item or pack component.</li>
          <li>Correction of a missing or incorrectly packed item.</li>
          <li>Repair, exchange, store credit, partial refund, or full refund where appropriate.</li>
          <li>Declining the return where misuse, alteration, or non-qualifying change-of-mind issues apply.</li>
        </ul>
      ),
    },
  ],
};

export default function ReturnsRefundsPolicyPage() {
  return <LegalDocumentPage {...config} />;
}
