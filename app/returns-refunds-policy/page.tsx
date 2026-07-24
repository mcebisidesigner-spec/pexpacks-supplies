import type { Metadata } from "next";
import Link from "next/link";
import {
  phoneHref,
  phoneNumber,
} from "@/data/contact";
import {
  LegalDocumentPage,
  legalStyles,
  type LegalDocumentConfig,
} from "@/components/policy/LegalDocumentPage";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(
  "Refund & Return Policy",
  "Pexpacks Supplies Refund and Return Policy — Clear, CPA-aligned guidelines on pre-order cancellations, 14-day standard returns, damaged items, and Paystack refund timelines.",
  "/returns-refunds-policy"
);

export const dynamic = "force-static";

const supportEmail = "support@pexpacks.co.za";
const supportEmailHref = `mailto:${supportEmail}`;

const config: LegalDocumentConfig = {
  route: "/returns-refunds-policy",
  pageTitle: "Refund and Return Policy",
  metaDescription:
    "Pexpacks Supplies Refund and Return Policy — Clear, CPA-aligned guidelines on pre-order cancellations, 14-day standard returns, damaged items, and Paystack refund timelines.",
  heroEyebrow: "Paystack & CPA Compliant Merchant Policy",
  heroTitle: "Refund and Return Policy",
  heroText:
    "At Pexpacks Supplies, we strive to deliver high-quality, grade-specific stationery packs and educational supplies across South Africa. This policy outlines your rights and our exact procedures regarding order cancellations, returns, and refunds.",
  heroPanelTitle: "Effective Date: July 2026",
  heroPanelText: "Applies to: All Online & Direct Orders | Merchant: Pexpacks Supplies",
  tocHeading: "Policy Contents",
  tocAriaLabel: "Refund and Return policy contents",
  summaryKicker: "At a Glance",
  summaryTitle: "Fair, Transparent Refunds & Returns",
  summaryText:
    "We want your ordering experience to be completely worry-free. Whether you need to cancel a pre-order before school dispatch or request a replacement for a damaged item, our clear rules protect your purchase every step of the way.",
  highlights: [
    {
      title: "100% Pre-Order Refund Window",
      content:
        "Full refunds are available for pre-orders cancelled up to 14 days before scheduled school delivery or dispatch.",
      tone: "accent",
    },
    {
      title: "Paystack Secure Processing",
      content:
        "Refunds are credited back directly to your original payment method (Credit Card, Debit Card, or EFT) via Paystack within 3 to 7 business days.",
      tone: "warning",
    },
  ],
  sections: [
    {
      id: "pre-orders-cancellations",
      eyebrow: "1",
      title: "Pre-Orders & Order Cancellations",
      summary:
        "How pre-order cancellations work before inventory purchasing and pack assembly.",
      content: (
        <>
          <p>
            Because Pexpacks operates primarily on a pre-order model aligned with the annual South African school calendar, inventory purchasing and customized kit assembly are scheduled based on customer demand.
          </p>
          <ul>
            <li>
              <strong>Pre-Order Cancellation Window:</strong> You may cancel your pre-order for a <strong>100% full refund</strong> up to <strong>14 calendar days</strong> prior to the start of scheduled school deliveries or parcel dispatch.
            </li>
            <li>
              <strong>Late Cancellations:</strong> Cancellations requested within 14 calendar days of scheduled school dispatch may incur a <strong>10% administrative and repacking fee</strong> if kit assembly has already commenced.
            </li>
            <li>
              <strong>How to Cancel:</strong> To cancel an unfulfilled pre-order, simply email <a href={supportEmailHref}>{supportEmail}</a> with your order reference number and contact details.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "standard-returns",
      eyebrow: "2",
      title: "Standard Returns (Change of Mind)",
      summary:
        "Return parameters for unused, intact stationery items within 14 days of receipt.",
      content: (
        <>
          <p>
            If you are not fully satisfied with your stationery purchase after receiving it, you may request a standard return under the following conditions:
          </p>
          <ul>
            <li>
              <strong>Return Window:</strong> Return requests must be logged within <strong>14 calendar days</strong> of receiving your package.
            </li>
            <li>
              <strong>Item Condition:</strong> Items must be unused, unopened, complete in their original packaging, and in resaleable condition. Individual stationery items removed from sealed grade packs cannot be returned individually.
            </li>
            <li>
              <strong>Return Shipping Costs:</strong> For change-of-mind returns, the customer is responsible for return shipping or courier costs back to Pexpacks Supplies.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "damaged-defective-incorrect",
      eyebrow: "3",
      title: "Damaged, Defective, or Incorrect Items",
      summary:
        "Full replacement or 100% refund guarantee at zero extra cost for defective or damaged items.",
      content: (
        <>
          <p>
            We take extreme care in assembling and packaging each grade kit. However, if you receive a damaged product, manufacturing defect, or incorrect item:
          </p>
          <ul>
            <li>
              <strong>Notification Period:</strong> Please notify us within <strong>7 calendar days</strong> of receiving your order by emailing <a href={supportEmailHref}>{supportEmail}</a>. Please attach clear photos of the issue and your order confirmation.
            </li>
            <li>
              <strong>Resolution:</strong> Upon verification, Pexpacks will arrange a replacement, exchange, or 100% full refund at <strong>zero additional cost</strong> to you. We will cover all associated collection and re-delivery courier fees.
            </li>
          </ul>

          <div className={legalStyles.noticeBlock}>
            <p>
              <strong>Summary of Terms &amp; Conditions Matrix:</strong>
            </p>
            <table className={legalStyles.summaryTable}>
              <thead>
                <tr>
                  <th>Scenario</th>
                  <th>Timeframe</th>
                  <th>Refund / Action</th>
                  <th>Courier Fee</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Pre-Order Cancellation</strong></td>
                  <td>Up to 14 days before dispatch</td>
                  <td>100% Full Refund</td>
                  <td>N/A</td>
                </tr>
                <tr>
                  <td><strong>Standard Return (Unopened)</strong></td>
                  <td>Within 14 days of receipt</td>
                  <td>Full Item Refund</td>
                  <td>Customer Pays</td>
                </tr>
                <tr>
                  <td><strong>Damaged / Incorrect Item</strong></td>
                  <td>Within 7 days of receipt</td>
                  <td>Replacement or 100% Refund</td>
                  <td>Pexpacks Pays</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: "non-returnable-items",
      eyebrow: "4",
      title: "Non-Returnable Items",
      summary:
        "Customized and opened items excluded from standard change-of-mind returns.",
      content: (
        <>
          <p>
            The following items are excluded from standard change-of-mind returns unless they arrive damaged or defective:
          </p>
          <ul>
            <li>Custom-personalized items (e.g. printed bag tags, custom-labeled stationery packs, or custom-cut Pexcover™ book covers).</li>
            <li>Opened or partially used stationery items, unsealed glue sticks, or used markers.</li>
          </ul>
        </>
      ),
    },
    {
      id: "refund-processing-timelines",
      eyebrow: "5",
      title: "Refund Processing & Timelines via Paystack",
      summary:
        "Secure payment reversal back to original payment methods.",
      content: (
        <>
          <p>
            All approved refunds are processed back through our primary payment processor (Paystack) to the original payment method used during checkout (Credit Card, Debit Card, or Instant EFT) to prevent fraud.
          </p>
          <ul>
            <li>
              <strong>Processing Timeline:</strong> Once a refund or return is approved, refunds are initiated within <strong>2 business days</strong>.
            </li>
            <li>
              <strong>Bank Settlement:</strong> Depending on your banking institution, funds typically reflect in your account within <strong>3 to 7 business days</strong> after initiation.
            </li>
            <li>
              <strong>Notification:</strong> You will receive an automated email confirmation from Paystack and Pexpacks as soon as your refund has been initiated.
            </li>
          </ul>

          <div className={legalStyles.contactPanel}>
            <p>
              <strong>Need to Log a Return or Cancel an Order?</strong>
            </p>
            <p>
              <strong>Support Email:</strong> <a href={supportEmailHref}>{supportEmail}</a>
            </p>
            <p>
              <strong>Contact Number:</strong> <a href={phoneHref}>{phoneNumber}</a>
            </p>
          </div>
        </>
      ),
    },
  ],
};

export default function ReturnsRefundsPolicyPage() {
  return <LegalDocumentPage {...config} />;
}
