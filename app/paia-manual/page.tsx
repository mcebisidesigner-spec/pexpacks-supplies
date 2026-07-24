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
  "PAIA Manual",
  "Pexpacks Statutory PAIA Manual — Access to Information Manual prepared in terms of Section 51 of the Promotion of Access to Information Act (PAIA 2 of 2000).",
  "/paia-manual"
);

export const dynamic = "force-static";

const config: LegalDocumentConfig = {
  route: "/paia-manual",
  pageTitle: "PAIA Manual (Section 51)",
  metaDescription:
    "Pexpacks Statutory PAIA Manual — Access to Information Manual prepared in terms of Section 51 of the Promotion of Access to Information Act (PAIA 2 of 2000).",
  heroEyebrow: "Section 51 Statutory Manual (PAIA 2 of 2000)",
  heroTitle: "Promotion of Access to Information Act Manual",
  heroText:
    "This statutory manual sets out the procedures for requesting access to records held by Pexpacks Supplies in terms of the Promotion of Access to Information Act and POPIA.",
  heroPanelTitle: `Effective ${EFFECTIVE_DATE}`,
  heroPanelText: "PAIA Section 51 Manual — Republic of South Africa",
  tocHeading: "PAIA Manual Contents",
  tocAriaLabel: "PAIA manual contents",
  summaryKicker: "Information Officer Details",
  summaryTitle: "Submitting a Formal Access Request under PAIA",
  summaryText:
    "To request access to records held by Pexpacks Supplies, submit a completed prescribed Form 2 to our Information Officer. Requesters must demonstrate that the record is required for the exercise or protection of any rights.",
  highlights: [
    {
      title: "Prescribed Form 2 Required",
      content:
        "Access requests must be submitted using Form 2 prescribed by the Information Regulator under the PAIA regulations.",
      tone: "accent",
    },
    {
      title: "Information Officer Routing",
      content: (
        <>
          Direct PAIA requests to <a href="mailto:privacy@pexpacks.co.za">privacy@pexpacks.co.za</a> or <a href={generalEmailHref}>{generalEmail}</a>.
        </>
      ),
      tone: "warning",
    },
  ],
  sections: [
    {
      id: "company-details",
      eyebrow: "1",
      title: "Company Details & Information Officer (Section 51(1)(a))",
      summary:
        "Statutory details of Pexpacks Supplies and designated Information Officer.",
      content: (
        <>
          <h3>Statutory Body Details</h3>
          <ul>
            <li><strong>Private Body Name:</strong> Pexpacks Supplies (Pty) Ltd / Pexpacks Trading</li>
            <li><strong>Registration Number:</strong> Available on written request / formal invoices</li>
            <li><strong>Trading Names:</strong> Pexpacks / Pexcover</li>
            <li><strong>Designated Information Officer:</strong> Information Officer, Pexpacks Supplies</li>
            <li><strong>Email Contact:</strong> <a href="mailto:privacy@pexpacks.co.za">privacy@pexpacks.co.za</a> / <a href={generalEmailHref}>{generalEmail}</a></li>
            <li><strong>Telephone Contact:</strong> <a href={phoneHref}>{phoneNumber}</a></li>
            <li><strong>Official Website:</strong> <a href={siteUrl}>{siteUrl}</a></li>
          </ul>
        </>
      ),
    },
    {
      id: "guide-to-paia",
      eyebrow: "2",
      title: "The South African Information Regulator's Guide (Section 51(1)(b))",
      summary:
        "Guide on how to exercise rights under PAIA published by the Information Regulator.",
      content: (
        <>
          <p>
            The Information Regulator has compiled a comprehensive guide in terms of Section 10 of PAIA containing information to assist any person wishing to exercise any right contemplated in PAIA or POPIA.
          </p>
          <p>
            The Guide is available in all official South African languages on the Information Regulator's website: <a href="https://inforegulator.org.za/" target="_blank" rel="noopener noreferrer">inforegulator.org.za</a>.
          </p>
        </>
      ),
    },
    {
      id: "categories-of-records",
      eyebrow: "3",
      title: "Categories of Records Held by Pexpacks (Section 51(1)(d))",
      summary:
        "Classification of company, commercial, customer, and compliance records.",
      content: (
        <>
          <h3>1. Corporate &amp; Statutory Records</h3>
          <p>Incorporation documents, founding agreements, director records, and resolutions.</p>
          <h3>2. Financial &amp; Tax Records</h3>
          <p>Audited annual financial statements, tax assessment records, SARS filings, banking records, and supplier invoices.</p>
          <h3>3. Commercial &amp; Customer Records</h3>
          <p>Stationery order records, Lay-by contracts, school partnership agreements, Pexcover™ service logs, and customer correspondence.</p>
          <h3>4. Personal Information &amp; POPIA Processing</h3>
          <p>Personal information processed regarding parents, legal guardians, learners, and suppliers as detailed in our <a href="/privacy-policy">Privacy Policy</a>.</p>
        </>
      ),
    },
    {
      id: "request-procedure",
      eyebrow: "4",
      title: "Access Request Procedure & Fees (Section 53 & 54)",
      summary:
        "Prescribed application procedure, Form 2 requirements, and statutory grounds for refusal.",
      content: (
        <>
          <h3>How to Apply</h3>
          <ol>
            <li>Complete the prescribed <strong>Form 2 (Request for Access to Record of Private Body)</strong>.</li>
            <li>Submit the completed Form 2 to <a href="mailto:privacy@pexpacks.co.za">privacy@pexpacks.co.za</a>.</li>
            <li>Provide sufficient detail to enable the Information Officer to identify the record and the requester.</li>
            <li>State the specific right being exercised or protected and explain why the record is required.</li>
          </ol>
          <h3>Prescribed Fees &amp; Statutory Refusal</h3>
          <p>
            In terms of Section 54 of PAIA, a prescribed request fee may be payable prior to processing the request. Pexpacks may refuse access to records based on statutory grounds set out in Chapter 4 of PAIA (including protection of third-party privacy, commercial confidentiality, or legal privilege).
          </p>
        </>
      ),
    },
  ],
};

export default function PaiaManualPage() {
  return <LegalDocumentPage {...config} />;
}
