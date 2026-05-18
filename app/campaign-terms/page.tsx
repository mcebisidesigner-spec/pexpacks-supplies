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

const effectiveDate = "18 May 2026";

export const metadata: Metadata = buildMetadata(
  "Campaign Terms",
  "Read the Pexpacks campaign terms for promotions, discounts, qualifying schools, and offer limits.",
  "/campaign-terms"
);

const config: LegalDocumentConfig = {
  route: "/campaign-terms",
  pageTitle: "Campaign Terms",
  metaDescription:
    "Read the Pexpacks campaign terms for promotions, discounts, qualifying schools, and offer limits.",
  heroEyebrow: "Campaign Terms",
  heroTitle: "Rules for promotions and campaign offers",
  heroText:
    "These terms explain how limited-time campaigns, school promotions, launch offers, and discount mechanics are generally managed across the Pexpacks platform.",
  heroPanelTitle: `Effective ${effectiveDate}`,
  heroPanelText: "Offer eligibility, limits, and fair-use conditions.",
  tocHeading: "Campaign contents",
  tocAriaLabel: "Campaign terms contents",
  summaryKicker: "Offer summary",
  summaryTitle: "Promotions can change by date, area, school, and stock",
  summaryText:
    "Every campaign depends on availability and the published rules for that offer. Customers should check dates, eligibility, exclusions, and any minimum requirements before relying on a promotion.",
  highlights: [
    {
      title: "Offer limits",
      content:
        "Campaigns may end early, be paused, or change if stock, budget, fraud risk, or operational capacity requires it.",
      tone: "warning",
    },
    {
      title: "Support",
      content: (
        <>
          Email <a href={generalEmailHref}>{generalEmail}</a> or call{" "}
          <a href={phoneHref}>{phoneNumber}</a> if a campaign question needs
          review.
        </>
      ),
      tone: "accent",
    },
    {
      title: "Check before ordering",
      content:
        "Review the applicable dates, exclusions, and order conditions before final checkout or payment.",
    },
  ],
  sections: [
    {
      id: "eligibility",
      eyebrow: "1",
      title: "Eligibility and qualifying conditions",
      summary:
        "Campaigns may be restricted by geography, qualifying schools, order type, or launch period.",
      content: (
        <ul>
          <li>Some offers apply only to selected schools, grades, or regions.</li>
          <li>Some offers require minimum order values or qualifying pack types.</li>
          <li>Promotions may be limited to one use per customer, school, or account.</li>
          <li>Expired or withdrawn offers cannot be honoured automatically.</li>
        </ul>
      ),
    },
    {
      id: "discount-rules",
      eyebrow: "2",
      title: "Discounts, bundles, and exclusions",
      summary:
        "Campaign value must be read together with any exclusions, combinations, or bundle rules.",
      content: (
        <ul>
          <li>Offers may exclude custom work, courier add-ons, or special-order items.</li>
          <li>Unless stated otherwise, one campaign cannot be stacked with every other discount.</li>
          <li>Coupon or code use may depend on entering the correct code before checkout.</li>
          <li>Displayed savings may be based on a defined comparison method or campaign mechanic.</li>
        </ul>
      ),
    },
    {
      id: "fair-use-fraud",
      eyebrow: "3",
      title: "Fair use and misuse prevention",
      summary:
        "Pexpacks may suspend or reject campaign use where abuse, automation, or manipulation is suspected.",
      content: (
        <>
          <p>
            Promotions are intended for legitimate customer use. Orders,
            accounts, or code patterns that appear abusive, automated,
            duplicated, or fraudulent may be reviewed, adjusted, or cancelled.
          </p>
          <p>
            Pexpacks may also reverse a discount that was clearly applied in
            error before the order is accepted.
          </p>
        </>
      ),
    },
    {
      id: "changes-disputes",
      eyebrow: "4",
      title: "Changes, interruption, and dispute handling",
      summary:
        "Operational issues, supplier changes, or errors may require an offer to be revised or withdrawn.",
      content: (
        <p>
          Pexpacks may update campaign wording, timing, stock allocation, or
          operational handling where a genuine business or system need exists.
          If a dispute arises, the customer should contact Pexpacks directly so
          the relevant campaign rules and order facts can be reviewed.
        </p>
      ),
    },
  ],
};

export default function CampaignTermsPage() {
  return <LegalDocumentPage {...config} />;
}
