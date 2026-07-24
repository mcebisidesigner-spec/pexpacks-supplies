import type { Metadata } from "next";
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
import { buildMetadata, siteUrl } from "@/lib/seo";
import { EFFECTIVE_DATE } from "@/lib/constants";

export const metadata: Metadata = buildMetadata(
  "Supplier Terms",
  "Pexpacks Supplier Terms & Conditions — Commercial and legal terms governing vendor onboarding, product quality warranties under CPA, POPIA operator compliance, and delivery standards.",
  "/supplier-terms"
);

export const dynamic = "force-static";

const config: LegalDocumentConfig = {
  route: "/supplier-terms",
  pageTitle: "Supplier Terms & Commercial Standards",
  metaDescription:
    "Pexpacks Supplier Terms & Conditions — Commercial and legal terms governing vendor onboarding, product quality warranties under CPA, POPIA operator compliance, and delivery standards.",
  heroEyebrow: "Commercial Procurement Standards",
  heroTitle: "Supplier & Vendor Terms of Supply",
  heroText:
    "These terms establish the mandatory legal and commercial requirements governing all suppliers, manufacturers, distributors, and logistics partners supplying goods or services to Pexpacks Supplies.",
  heroPanelTitle: `Effective ${EFFECTIVE_DATE}`,
  heroPanelText: "CPA & POPIA Aligned — Republic of South Africa",
  tocHeading: "Supplier Terms Contents",
  tocAriaLabel: "Supplier terms contents",
  summaryKicker: "Procurement Notice",
  summaryTitle: "Quality Assurances and Supply Chain Reliability",
  summaryText:
    "Pexpacks requires all suppliers to deliver high-quality stationery products complying with South African safety standards, CPA merchantability warranties, agreed delivery lead times, and POPIA operator safeguards.",
  highlights: [
    {
      title: "CPA Merchantability Guarantee",
      content:
        "Suppliers warrant that all supplied goods are free of defects, authentic, and compliant with Section 55 of the Consumer Protection Act.",
      tone: "accent",
    },
    {
      title: "POPIA Operator Duty",
      content:
        "Suppliers handling customer delivery data are bound by strict statutory operator obligations under Sections 20 & 21 of POPIA.",
      tone: "warning",
    },
  ],
  sections: [
    {
      id: "supplier-onboarding",
      eyebrow: "1",
      title: "Vendor Onboarding & Legal Compliance",
      summary:
        "Requirements for supplier registration, SARS compliance, and lawful sourcing.",
      content: (
        <>
          <p>Suppliers supplying Pexpacks must:</p>
          <ul>
            <li>Be duly registered corporate entities or legal traders in South Africa;</li>
            <li>Provide accurate CIPC details, SARS VAT registration certificates (where applicable), and verified banking details;</li>
            <li>Warrant that all products are lawfully sourced, genuine, and free from third-party IP infringement.</li>
          </ul>
        </>
      ),
    },
    {
      id: "quality-warranties",
      eyebrow: "2",
      title: "Product Quality & CPA Warranties (CPA Section 55)",
      summary:
        "Statutory quality requirements and supplier indemnity for defective stock.",
      content: (
        <>
          <p>
            Suppliers warrant that all stationery products, paper goods, and materials supplied to Pexpacks comply with Section 55 of the CPA, are of good quality, free of defects, and suitable for educational use.
          </p>
          <p>
            Suppliers shall indemnify Pexpacks against all claims, losses, or costs arising from defective, unsafe, or sub-standard goods supplied.
          </p>
        </>
      ),
    },
    {
      id: "delivery-lead-times",
      eyebrow: "3",
      title: "Delivery Timelines, Packaging, & Stock Rejection",
      summary:
        "Delivery schedules, peak season deadlines, and stock rejection procedures.",
      content: (
        <>
          <p>
            Timely delivery is essential for peak school preparation (October to January). Goods delivered after agreed purchase order dates or containing unapproved brand substitutions may be rejected at the supplier's expense.
          </p>
        </>
      ),
    },
    {
      id: "popia-confidentiality",
      eyebrow: "4",
      title: "Confidentiality & POPIA Operator Agreement",
      summary:
        "Statutory non-disclosure duties and POPIA Section 21 operator safeguards.",
      content: (
        <>
          <p>
            Suppliers receiving delivery addresses or customer details act as POPIA Operators and must maintain strict confidentiality, enforce technical security safeguards, and process data solely for fulfilling Pexpacks purchase orders.
          </p>
        </>
      ),
    },
    {
      id: "governing-law",
      eyebrow: "5",
      title: "Governing Law & Contact",
      summary:
        "South African legal jurisdiction and procurement contact details.",
      content: (
        <>
          <p>
            Supplier terms are governed by the laws of the <strong>Republic of South Africa</strong>. For vendor management or procurement enquiries:
          </p>
          <ul>
            <li><strong>Procurement Email:</strong> <a href={generalEmailHref}>{generalEmail}</a></li>
            <li><strong>Telephone:</strong> <a href={phoneHref}>{phoneNumber}</a></li>
            <li><strong>Official Website:</strong> <a href={siteUrl}>{siteUrl}</a></li>
          </ul>
        </>
      ),
    },
  ],
};

export default function SupplierTermsPage() {
  return <LegalDocumentPage {...config} />;
}
