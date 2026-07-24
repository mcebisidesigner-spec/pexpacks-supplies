import type { Metadata } from "next";
import {
  legalEmail as generalEmail,
  legalEmailHref as generalEmailHref,
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
  "School Partnership Terms",
  "Pexpacks School Partnership Terms & Conditions — Official statutory terms governing educational institution partnerships, stationery list collation, bulk fulfillment, and POPIA learner data protection.",
  "/school-partnership-terms"
);

export const dynamic = "force-static";

const config: LegalDocumentConfig = {
  route: "/school-partnership-terms",
  pageTitle: "School Partnership Terms",
  metaDescription:
    "Pexpacks School Partnership Terms & Conditions — Official statutory terms governing educational institution partnerships, stationery list collation, bulk fulfillment, and POPIA learner data protection.",
  heroEyebrow: "Institutional Collaboration Framework",
  heroTitle: "School Partnership Terms and Operating Framework",
  heroText:
    "This document establishes the official terms regulating institutional collaborations between Pexpacks Supplies and South African schools, governing stationery list curation, campaign fulfillment, and POPIA learner privacy.",
  heroPanelTitle: `Last Updated: ${EFFECTIVE_DATE}`,
  heroPanelText: "POPIA & CPA Compliant — Republic of South Africa",
  tocHeading: "Partnership Terms Contents",
  tocAriaLabel: "School partnership terms contents",
  summaryKicker: "Institutional Governance",
  summaryTitle: "Formalizing School Stationery Campaigns",
  summaryText:
    "Pexpacks partners with primary and secondary schools to streamline stationery procurement for parents. Each partnership is governed by these standard terms, supplemented by written campaign proposals and school authorizations.",
  highlights: [
    {
      title: "POPIA Learner Data Protection",
      content:
        "All learner lists, grade data, and parent contact details supplied by partner schools are processed strictly under written operator duties pursuant to POPIA.",
      tone: "accent",
    },
    {
      title: "Intellectual Property Rights",
      content:
        "Schools grant Pexpacks a non-exclusive license to display official school crests and stationery lists solely for parent ordering portals.",
      tone: "warning",
    },
  ],
  sections: [
    {
      id: "scope-of-partnership",
      eyebrow: "1",
      title: "Scope of School Partnership Arrangements",
      summary:
        "Framework governing school-approved stationery supply rollouts, Pexcover™, and digital portals.",
      content: (
        <>
          <p>
            Pexpacks collaborates with partner schools to offer tailored stationery pack solutions, including:
          </p>
          <ul>
            <li>Official school stationery list digital curation and online parent ordering portals</li>
            <li>Bulk school pack assembly, class-by-class sorting, and school handover logistics</li>
            <li>Pexcover™ book-covering and personalized learner name-labelling programs</li>
            <li>School fundraising rebates, promotional packages, or digital school assets where agreed</li>
          </ul>
        </>
      ),
    },
    {
      id: "school-duties",
      eyebrow: "2",
      title: "Partner School Duties & List Accuracy",
      summary:
        "School obligations regarding stationery list validation, authority, and logos.",
      content: (
        <>
          <p>Partner schools agree to:</p>
          <ul>
            <li>Provide final, approved grade stationery lists prior to the end of June each year;</li>
            <li>Designate authorized school representatives for campaign sign-off and handover coordination;</li>
            <li>Grant Pexpacks permission to utilize the school name and logo for parent ordering portals;</li>
            <li>Notify Pexpacks promptly of any changes to subject lists, book requirements, or school calendars.</li>
          </ul>
        </>
      ),
    },
    {
      id: "pexpacks-duties",
      eyebrow: "3",
      title: "Pexpacks Fulfillment & Quality Assurances",
      summary:
        "Pexpacks operational standards for partner school campaigns.",
      content: (
        <>
          <p>Pexpacks undertakes to:</p>
          <ul>
            <li>Source high-quality stationery items matching approved school specifications;</li>
            <li>Package and label stationery packs according to learner grade and school distribution instructions;</li>
            <li>Deliver bulk orders to designated school collection points or coordinate doorstep delivery prior to term opening;</li>
            <li>Provide transparent pricing, Lay-by options, and dedicated customer support to parents.</li>
          </ul>
        </>
      ),
    },
    {
      id: "popia-compliance",
      eyebrow: "4",
      title: "POPIA Operator Obligations & Learner Data Privacy",
      summary:
        "Statutory data operator duties under Sections 20 & 21 of POPIA.",
      content: (
        <>
          <p>
            Where a school provides learner or parent contact lists to Pexpacks, Pexpacks acts as an <strong>Operator</strong> under Section 20 of the Protection of Personal Information Act (POPIA 4 of 2013).
          </p>
          <ul>
            <li>Pexpacks shall process learner information strictly for stationery pack fulfillment and delivery;</li>
            <li>Pexpacks enforces strict technical and organizational safeguards (POPIA Section 19);</li>
            <li>Pexpacks will never sell, lease, or monetize learner or parent data to third parties.</li>
          </ul>
        </>
      ),
    },
    {
      id: "governing-law",
      eyebrow: "5",
      title: "Governing Law & Contact",
      summary:
        "South African legal jurisdiction and partnership support contact details.",
      content: (
        <>
          <p>
            School partnership agreements are governed by the laws of the <strong>Republic of South Africa</strong>. For institutional enquiries or to formalize a school partnership, contact our Institutional Team:
          </p>
          <ul>
            <li><strong>Institutional Email:</strong> <a href={generalEmailHref}>{generalEmail}</a></li>
            <li><strong>Telephone:</strong> <a href={phoneHref}>{phoneNumber}</a></li>
            <li><strong>Official Website:</strong> <a href={siteUrl}>{siteUrl}</a></li>
          </ul>
        </>
      ),
    },
  ],
};

export default function SchoolPartnershipTermsPage() {
  return <LegalDocumentPage {...config} />;
}
