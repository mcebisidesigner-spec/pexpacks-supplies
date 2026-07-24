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
  "Delivery Policy",
  "Pexpacks Delivery Policy — Official delivery, courier dispatch, school handover, and risk-allocation rules pursuant to Section 19 of the Consumer Protection Act (CPA 68 of 2008).",
  "/delivery-policy"
);

export const dynamic = "force-static";

const config: LegalDocumentConfig = {
  route: "/delivery-policy",
  pageTitle: "Delivery & Fulfillment Policy",
  metaDescription:
    "Pexpacks Delivery Policy — Official delivery, courier dispatch, school handover, and risk-allocation rules pursuant to Section 19 of the Consumer Protection Act (CPA 68 of 2008).",
  heroEyebrow: "Statutory Delivery Rules (CPA Section 19)",
  heroTitle: "Delivery, Fulfillment, and School Handover Terms",
  heroText:
    "This policy outlines how Pexpacks manages doorstep courier delivery, school collection points, dispatch lead times, and statutory risk allocation under South African law.",
  heroPanelTitle: `Effective ${EFFECTIVE_DATE}`,
  heroPanelText: "CPA Section 19 Aligned — Republic of South Africa",
  tocHeading: "Delivery Policy Contents",
  tocAriaLabel: "Delivery policy contents",
  summaryKicker: "Delivery & Risk Notice",
  summaryTitle: "Clear Fulfillment Schedules and Passing of Risk",
  summaryText:
    "Pexpacks coordinates fulfillment via doorstep courier delivery or designated school handover points. Delivery timelines are communicated prior to dispatch, and risk of loss or damage passes upon delivery in compliance with Section 19 of the Consumer Protection Act.",
  highlights: [
    {
      title: "Risk Allocation (CPA s19)",
      content:
        "Risk of loss or damage to goods passes to the customer upon delivery at the specified address or handover at an agreed school collection point.",
      tone: "accent",
    },
    {
      title: "Tracking Support",
      content: (
        <>
          Use our <Link href="/track-order">Order Tracking Portal</Link> or contact support if you have questions regarding your dispatch status.
        </>
      ),
      tone: "warning",
    },
  ],
  sections: [
    {
      id: "statutory-delivery-rules",
      eyebrow: "1",
      title: "Statutory Supplier Delivery Duties (CPA Section 19)",
      summary:
        "Legal framework governing delivery obligations, agreed times, and risk of loss.",
      content: (
        <>
          <p>
            In terms of Section 19 of the Consumer Protection Act (CPA 68 of 2008), Pexpacks is responsible for delivering stationery goods on the agreed date, within the agreed time frame, or within a reasonable time after order completion and payment confirmation.
          </p>
          <h3>Passing of Risk (Section 19(2))</h3>
          <p>
            Goods remain at Pexpacks' risk until the customer, an authorized representative, or a designated school handover official has accepted delivery or collection. Once delivered or handed over, risk of loss or damage passes to the customer.
          </p>
        </>
      ),
    },
    {
      id: "delivery-channels",
      eyebrow: "2",
      title: "Fulfillment Channels and Logistics Options",
      summary:
        "Available fulfillment methods across South Africa.",
      content: (
        <>
          <h3>1. School Handover &amp; Collection Points</h3>
          <p>
            Where Pexpacks operates an official school partnership campaign, stationery packs may be delivered in bulk to a designated school collection point for organized handover prior to the opening of the school term in January.
          </p>
          <h3>2. Doorstep Courier Delivery</h3>
          <p>
            For individual orders or non-partner school packs, delivery is conducted via contracted courier services directly to the customer's specified physical address. Standard doorstep delivery fees apply as quoted at checkout.
          </p>
        </>
      ),
    },
    {
      id: "delays-and-remedies",
      eyebrow: "3",
      title: "Delivery Delays and Consumer Remedies",
      summary:
        "Statutory rights under CPA Section 19(2) if delivery is unreasonably delayed.",
      content: (
        <>
          <p>
            If Pexpacks fails to deliver the goods on the agreed date or within a reasonable period, the customer is entitled, in terms of CPA Section 19(2)(a), to give notice demanding delivery within a reasonable time, or cancel the order without penalty and receive a full refund of payments made for the undelivered items.
          </p>
        </>
      ),
    },
  ],
};

export default function DeliveryPolicyPage() {
  return <LegalDocumentPage {...config} />;
}
