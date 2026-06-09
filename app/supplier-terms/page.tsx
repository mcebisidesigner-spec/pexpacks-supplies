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
import { buildMetadata } from "@/lib/seo";
import { EFFECTIVE_DATE } from "@/lib/constants";



export const metadata: Metadata = buildMetadata(
  "Supplier Terms",
  "Read the Pexpacks supplier terms for onboarding, quality standards, delivery expectations, and invoicing.",
  "/supplier-terms"
);

export const dynamic = "force-static";

const config: LegalDocumentConfig = {
  route: "/supplier-terms",
  pageTitle: "Supplier Terms",
  metaDescription:
    "Read the Pexpacks supplier terms for onboarding, quality standards, delivery expectations, and invoicing.",
  heroEyebrow: "Supplier terms",
  heroTitle: "Commercial expectations for suppliers",
  heroText:
    "These terms outline the working standards Pexpacks expects from suppliers, service providers, and production partners who support fulfilment or brand delivery.",
  heroPanelTitle: `Effective ${EFFECTIVE_DATE}`,
  heroPanelText: "Operational, quality, and invoicing expectations.",
  tocHeading: "Supplier contents",
  tocAriaLabel: "Supplier terms contents",
  summaryKicker: "Supplier overview",
  summaryTitle: "Supply quality and timing matter directly to customer trust",
  summaryText:
    "Pexpacks depends on accurate stock, dependable delivery, and quality consistency. Suppliers should treat order readiness, product accuracy, and communication as core commercial obligations.",
  highlights: [
    {
      title: "Quality first",
      content:
        "Goods that are incorrect, damaged, substituted without approval, or late may be rejected or escalated.",
      tone: "warning",
    },
    {
      title: "Supplier contact",
      content: (
        <>
          Email <a href={generalEmailHref}>{generalEmail}</a> or call{" "}
          <a href={phoneHref}>{phoneNumber}</a> for supplier coordination.
        </>
      ),
      tone: "accent",
    },
    {
      title: "Confidentiality",
      content:
        "Customer, school, pricing, and fulfilment information should not be reused outside the supplier relationship.",
    },
  ],
  sections: [
    {
      id: "supplier-onboarding",
      eyebrow: "1",
      title: "Onboarding and compliance",
      summary:
        "Suppliers should be properly authorised, contactable, and able to meet agreed trading requirements.",
      content: (
        <ul>
          <li>Provide accurate company, banking, and invoicing details.</li>
          <li>Disclose relevant registration, VAT, or compliance information where applicable.</li>
          <li>Maintain lawful sourcing and product rights for supplied goods.</li>
          <li>Notify Pexpacks promptly if capacity or compliance changes materially.</li>
        </ul>
      ),
    },
    {
      id: "purchase-orders-pricing",
      eyebrow: "2",
      title: "Pricing, quotes, and purchase instructions",
      summary:
        "Quoted prices and approved purchase instructions should remain clear, traceable, and commercially reliable.",
      content: (
        <ul>
          <li>Pricing should be quoted in writing and state any exclusions clearly.</li>
          <li>No substitution or major change should happen without approval.</li>
          <li>Lead times should be realistic and updated if risk emerges.</li>
          <li>Urgent or peak-season constraints must be flagged early.</li>
        </ul>
      ),
    },
    {
      id: "quality-delivery",
      eyebrow: "3",
      title: "Quality, packaging, and delivery standards",
      summary:
        "Products should arrive fit for purpose, correctly packed, and aligned with the confirmed order specification.",
      content: (
        <ul>
          <li>Deliver the correct quantity, specification, and condition.</li>
          <li>Use packaging suitable for handling and onward fulfilment.</li>
          <li>Mark cartons or consignments clearly where sorting is required.</li>
          <li>Communicate shortages or delays before the committed date where possible.</li>
        </ul>
      ),
    },
    {
      id: "invoicing-confidentiality",
      eyebrow: "4",
      title: "Invoicing, confidentiality, and conduct",
      summary:
        "Invoices must be accurate and suppliers should protect confidential commercial or customer information.",
      content: (
        <>
          <p>
            Suppliers should issue accurate invoices linked to the relevant
            order or commercial reference. Incorrect or unsupported invoices
            may be delayed until clarified.
          </p>
          <p>
            Confidential pricing, customer information, school details, and
            operational processes should not be disclosed or reused outside the
            supplier relationship without permission.
          </p>
        </>
      ),
    },
  ],
};

export default function SupplierTermsPage() {
  return <LegalDocumentPage {...config} />;
}
