import type { Metadata } from "next";
import Link from "next/link";
import {
  phoneHref,
  phoneNumber,
  ordersEmail,
  ordersEmailHref,
} from "@/data/contact";
import {
  LegalDocumentPage,
  legalStyles,
  type LegalDocumentConfig,
} from "@/components/policy/LegalDocumentPage";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(
  "Delivery Policy",
  "Pexpacks Supplies Delivery Policy — Clear fulfillment schedules, seasonal pre-order timelines, logistics partners (Paxi Couriers), tracking, and delivery scope across South Africa.",
  "/delivery-policy"
);

export const dynamic = "force-static";

const orderEmail = ordersEmail;
const orderEmailHref = ordersEmailHref;

const config: LegalDocumentConfig = {
  route: "/delivery-policy",
  pageTitle: "Delivery and Fulfillment Policy",
  metaDescription:
    "Pexpacks Supplies Delivery Policy — Clear fulfillment schedules, seasonal pre-order timelines, logistics partners (Paxi Couriers), tracking, and delivery scope across South Africa.",
  heroEyebrow: "Compliant Logistics & Delivery Policy",
  heroTitle: "Delivery & Fulfillment Policy",
  heroText:
    "This policy outlines how Pexpacks Supplies handles seasonal school pre-orders, year-round order fulfillment, carrier dispatch via Paxi Couriers and door-to-door couriers, tracking updates, and delivery timelines across South Africa.",
  heroPanelTitle: "Last Updated: October 2025",
  heroPanelText: "Applies to: All Online & Direct Orders | Merchant: Pexpacks Supplies",
  tocHeading: "Policy Contents",
  tocAriaLabel: "Delivery policy contents",
  summaryKicker: "At a Glance",
  summaryTitle: "Reliable Nationwide Delivery & School Handover",
  summaryText:
    "We keep delivery expectations completely straightforward and transparent. From annual seasonal school pre-orders dispatched straight to partner schools to year-round home and Paxi counter deliveries, you'll always know exactly when to expect your stationery pack.",
  highlights: [
    {
      title: "Real-Time SMS & Email Tracking",
      content:
        "Every order dispatched via our logistics partners includes automated SMS and email tracking links so you can follow your parcel step-by-step.",
      tone: "accent",
    },
    {
      title: "Nationwide South Africa Coverage",
      content:
        "We deliver to doorstep addresses, partner school campuses, and over 2,800 Paxi / PEP collection points nationwide.",
      tone: "warning",
    },
  ],
  sections: [
    {
      id: "fulfillment-schedules-lead-times",
      eyebrow: "1",
      title: "Fulfillment Schedules & Lead Times",
      summary:
        "We operate two distinct delivery streams to ensure your stationery arrives on time without confusion.",
      content: (
        <>
          <p>
            To provide clear expectations, Pexpacks Supplies categorizes fulfillment into two distinct operational delivery streams:
          </p>
          
          <h3>Stream A: Seasonal School Pre-Orders</h3>
          <p>
            Because school stationery demand follows the annual South African academic calendar, our seasonal pre-order model is structured as follows:
          </p>
          <ul>
            <li>
              <strong>Pre-Orders Open:</strong> October annually.
            </li>
            <li>
              <strong>Pre-Order Cut-Off Date:</strong> Mid-December annually (exact date published on product order pages).
            </li>
            <li>
              <strong>School Term Delivery Window:</strong> Pre-orders placed for partner schools are packed during December and delivered directly to the school campus during the <strong>first week of the school term in January</strong>, ensuring learners receive their complete stationery packs right inside their classrooms before lessons begin.
            </li>
          </ul>

          <h3>Stream B: Individual Year-Round Orders</h3>
          <p>
            For standard, non-pre-order purchases placed throughout the year:
          </p>
          <ul>
            <li>
              <strong>Order Processing Time:</strong> 24 to 48 hours (1–2 business days) to pick, quality check, and pack your items.
            </li>
            <li>
              <strong>Carrier Transit Time:</strong> 2 to 4 business days for doorstep courier delivery, or 3 to 5 business days for Paxi counter collection.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "logistics-partners-tracking",
      eyebrow: "2",
      title: "Nominated Logistics Partners & Order Tracking",
      summary:
        "Explicit courier details and automated tracking updates upon parcel dispatch.",
      content: (
        <>
          <p>
            Pexpacks Supplies partners with reputable, nationwide courier services to guarantee safe and trackable parcel delivery:
          </p>
          <ul>
            <li>
              <strong>Doorstep Couriers:</strong> Partnered door-to-door courier services for home and office deliveries.
            </li>
            <li>
              <strong>Counter Collection Partner:</strong> <strong>Paxi Couriers (PEP Store-to-Store)</strong> for flexible counter pick-up.
            </li>
          </ul>
          <p>
            <strong>Real-Time Tracking &amp; SMS Updates:</strong> As soon as your order is packed and handed over to our courier partner, you will automatically receive an <strong>SMS and email notification containing your unique tracking number</strong> and a direct link to track your shipment in real time. You can also trace your order anytime using our <Link href="/track-order">Order Tracking Portal</Link>.
          </p>
        </>
      ),
    },
    {
      id: "delivery-scope-addresses",
      eyebrow: "3",
      title: "Delivery Scope & Supported Addresses",
      summary:
        "Nationwide delivery coverage across South Africa.",
      content: (
        <>
          <p>
            Pexpacks Supplies delivers nationwide across the Republic of South Africa. We support delivery to:
          </p>
          <ul>
            <li><strong>Residential &amp; Commercial Addresses:</strong> Physical street addresses for direct doorstep delivery.</li>
            <li><strong>Partner School Campuses:</strong> Physical school addresses for bulk school term handover.</li>
            <li><strong>Paxi / PEP Collection Points:</strong> Over 2,800 PEP counter locations nationwide for easy pickup.</li>
          </ul>
          <p>
            <em>Please note:</em> We cannot deliver to P.O. Box addresses. Please ensure physical street or Paxi point details are correctly entered during checkout.
          </p>
        </>
      ),
    },
    {
      id: "delivery-delays-force-majeure",
      eyebrow: "4",
      title: "Delivery Delays & Force Majeure Protocol",
      summary:
        "Immediate customer notifications and updated timelines during unexpected delays.",
      content: (
        <>
          <p>
            While we maintain strict dispatch schedules, unexpected events such as extreme weather, regional transport disruptions, or high-volume seasonal carrier bottlenecks may occasionally impact delivery transit times.
          </p>
          <div className={legalStyles.noticeBlock}>
            <p>
              <strong>Our Delay Commitment:</strong>
            </p>
            <p>
              If an unexpected delay occurs, Pexpacks Supplies will notify affected customers <strong>immediately via email and SMS with an updated delivery timeline</strong>. If a delayed order cannot be fulfilled within a reasonable period, customers retain full rights under the CPA to request an updated dispatch schedule or receive a full 100% refund.
            </p>
          </div>
        </>
      ),
    },
    {
      id: "delivery-support-contact",
      eyebrow: "5",
      title: "Logistics & Delivery Support Contact",
      summary:
        "Direct contact channels for delivery queries or address updates.",
      content: (
        <>
          <p>
            If you need assistance with an ongoing delivery, tracking number, or address update, please contact our logistics support team:
          </p>
          <div className={legalStyles.contactPanel}>
            <p>
              <strong>Logistics Support Email:</strong> <a href={orderEmailHref}>{orderEmail}</a>
            </p>
            <p>
              <strong>Contact Number:</strong> <a href={phoneHref}>{phoneNumber}</a>
            </p>
            <p>
              <strong>Track Online:</strong> <Link href="/track-order">pexpacks.co.za/track-order</Link>
            </p>
          </div>
        </>
      ),
    },
  ],
};

export default function DeliveryPolicyPage() {
  return <LegalDocumentPage {...config} />;
}
