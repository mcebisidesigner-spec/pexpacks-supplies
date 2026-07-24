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
  "Campaign Terms",
  "Pexpacks Campaign & Promotional Terms — Official statutory terms regulating promotions, discounts, promotional offers under CPA Section 36, and school campaign rules.",
  "/campaign-terms"
);

export const dynamic = "force-static";

const config: LegalDocumentConfig = {
  route: "/campaign-terms",
  pageTitle: "Campaign & Promotional Terms",
  metaDescription:
    "Pexpacks Campaign & Promotional Terms — Official statutory terms regulating promotions, discounts, promotional offers under CPA Section 36, and school campaign rules.",
  heroEyebrow: "Statutory Promotional Offers (CPA Section 36)",
  heroTitle: "Promotional Campaign Terms & Conditions",
  heroText:
    "These terms regulate all promotional campaigns, discount coupons, school bundle offers, and seasonal launch deals offered by Pexpacks Supplies in terms of the Consumer Protection Act.",
  heroPanelTitle: `Effective ${EFFECTIVE_DATE}`,
  heroPanelText: "CPA Section 36 Compliant — Republic of South Africa",
  tocHeading: "Campaign Terms Contents",
  tocAriaLabel: "Campaign terms contents",
  summaryKicker: "Promotions & CPA Section 36",
  summaryTitle: "Fair, Transparent Promotional Rules",
  summaryText:
    "Pexpacks conducts promotional offers and campaigns in strict compliance with Section 36 of the Consumer Protection Act. Every campaign specifies clear start/end dates, eligibility criteria, qualifying school lists, and stock availability terms.",
  highlights: [
    {
      title: "CPA Section 36 Disclosures",
      content:
        "Full details regarding nature of prize/offer, qualifying criteria, and campaign duration are disclosed prior to participation.",
      tone: "accent",
    },
    {
      title: "Stock Availability Limits",
      content:
        "Promotional discounts apply while stock lasts or until the advertised campaign expiry date.",
      tone: "warning",
    },
  ],
  sections: [
    {
      id: "eligibility",
      eyebrow: "1",
      title: "Promotional Offer Eligibility & CPA Section 36",
      summary:
        "Statutory requirements for promotional offers under CPA Section 36.",
      content: (
        <>
          <p>
            In accordance with Section 36 of the Consumer Protection Act (CPA 68 of 2008), every promotional offer, discount code, or campaign voucher issued by Pexpacks discloses:
          </p>
          <ul>
            <li>The exact nature and value of the promotional offer or discount;</li>
            <li>The specific qualifying school, grade, product category, or order minimum;</li>
            <li>The commencement and closing dates of the promotional period;</li>
            <li>The channel through which the offer may be redeemed.</li>
          </ul>
        </>
      ),
    },
    {
      id: "discount-rules",
      eyebrow: "2",
      title: "Discount Code Stacking & Exclusion Rules",
      summary:
        "Stacking rules, custom item exclusions, and coupon validity.",
      content: (
        <>
          <p>
            Unless explicitly stated otherwise in writing:
          </p>
          <ul>
            <li>Promotional codes cannot be combined or stacked with other concurrent discounts;</li>
            <li>Discounts apply to eligible stationery pack items and exclude courier fees or customized Pexcover™ labour;</li>
            <li>Coupon codes are non-transferable and cannot be exchanged for cash.</li>
          </ul>
        </>
      ),
    },
    {
      id: "governing-law",
      eyebrow: "3",
      title: "Governing Law & Enquiries",
      summary:
        "South African jurisdiction and campaign support contact details.",
      content: (
        <>
          <p>
            Campaign terms are governed by the laws of the <strong>Republic of South Africa</strong>. For campaign enquiries:
          </p>
          <ul>
            <li><strong>Campaign Email:</strong> <a href={generalEmailHref}>{generalEmail}</a></li>
            <li><strong>Telephone:</strong> <a href={phoneHref}>{phoneNumber}</a></li>
            <li><strong>Official Website:</strong> <a href={siteUrl}>{siteUrl}</a></li>
          </ul>
        </>
      ),
    },
  ],
};

export default function CampaignTermsPage() {
  return <LegalDocumentPage {...config} />;
}
