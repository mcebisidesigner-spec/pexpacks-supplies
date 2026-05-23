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
  "PAIA Manual",
  "Read the Pexpacks PAIA manual overview for access requests, records, and information officer contact guidance.",
  "/paia-manual"
);

export const dynamic = "force-static";

const config: LegalDocumentConfig = {
  route: "/paia-manual",
  pageTitle: "PAIA Manual",
  metaDescription:
    "Read the Pexpacks PAIA manual overview for access requests, records, and information officer contact guidance.",
  heroEyebrow: "Pex your info",
  heroTitle: "Access to information guidance",
  heroText:
    "This page gives a practical PAIA-oriented overview of how to request access to records held by Pexpacks and how those requests are reviewed.",
  heroPanelTitle: `Effective ${EFFECTIVE_DATE}`,
  heroPanelText: "PAIA-oriented operational summary.",
  tocHeading: "PAIA contents",
  tocAriaLabel: "PAIA manual contents",
  summaryKicker: "PAIA summary",
  summaryTitle: "Use this route for formal record-access requests",
  summaryText:
    "If you need access to a record held by Pexpacks, submit a clear written request with enough detail for the information officer to identify the record and assess the legal basis for release.",
  highlights: [
    {
      title: "Request detail",
      content:
        "State the record you want, why you need it, and how you would like to receive it.",
    },
    {
      title: "Contact",
      content: (
        <>
          Email <a href={generalEmailHref}>{generalEmail}</a> or call{" "}
          <a href={phoneHref}>{phoneNumber}</a>.
        </>
      ),
      tone: "accent",
    },
    {
      title: "Important",
      content:
        "Some records may be refused, partially released, or delayed if the law protects them.",
      tone: "warning",
    },
  ],
  sections: [
    {
      id: "purpose",
      eyebrow: "1",
      title: "Purpose of this PAIA page",
      summary:
        "This page is a practical manual-style summary, not a substitute for the full legal process where one is required.",
      content: (
        <p>
          The Promotion of Access to Information Act gives requesters a route to
          ask for certain records. Pexpacks uses this page to explain the
          operational process, the expected request content, and the contact
          point for access-to-information matters.
        </p>
      ),
    },
    {
      id: "records",
      eyebrow: "2",
      title: "Types of records Pexpacks may hold",
      summary:
        "The business may hold corporate, customer, supplier, operational, website, and compliance records.",
      content: (
        <ul>
          <li>Company and compliance records.</li>
          <li>Customer enquiries, orders, and related communications.</li>
          <li>Supplier, partner, and school-partnership records.</li>
          <li>Website, hosting, and analytics-related operational records.</li>
          <li>Accounting, invoicing, and fulfilment records.</li>
        </ul>
      ),
    },
    {
      id: "request-process",
      eyebrow: "3",
      title: "How to make a request",
      summary:
        "A request should be specific, contactable, and narrow enough to identify the relevant record.",
      content: (
        <ol>
          <li>Send a written request to Pexpacks using the official contact details.</li>
          <li>Identify the record or category of records requested.</li>
          <li>Explain the format you prefer and the legal basis where relevant.</li>
          <li>Provide enough identity and contact information for follow-up.</li>
        </ol>
      ),
    },
    {
      id: "response-fees",
      eyebrow: "4",
      title: "Review, timing, and possible fees",
      summary:
        "Requests are reviewed against legal limits, confidentiality duties, and any applicable response or reproduction fees.",
      content: (
        <>
          <p>
            Pexpacks may need to verify identity, clarify the request, search
            for records, or assess whether access can legally be granted in
            full, in part, or at all.
          </p>
          <p>
            Where allowed by law, prescribed search, reproduction, or access
            fees may apply before records are released.
          </p>
        </>
      ),
    },
  ],
};

export default function PaiaManualPage() {
  return <LegalDocumentPage {...config} />;
}
