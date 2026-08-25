import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalDocumentPage,
  type LegalDocumentConfig,
} from "@/components/policy/LegalDocumentPage";

const careEmail = "care@pexpacks.co.za";
const careEmailHref = `mailto:${careEmail}`;
const canonicalUrl = "https://pexpacks.co.za/email-disclaimer";

export const dynamic = "force-static";

export const metadata: Metadata = {
  metadataBase: new URL("https://pexpacks.co.za"),
  title: "Email Legal Notice & Disclaimer | Pexpacks Supplies",
  description:
    "Official POPIA-compliant email legal notice, confidentiality terms, and electronic communication disclaimer for Pexpacks Supplies (Pty) Ltd.",
  alternates: {
    canonical: canonicalUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Email Legal Notice & Disclaimer | Pexpacks Supplies",
    description:
      "Official POPIA-compliant email legal notice, confidentiality terms, and electronic communication disclaimer for Pexpacks Supplies (Pty) Ltd.",
    url: canonicalUrl,
    siteName: "Pexpacks Supplies",
    locale: "en_ZA",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Email Legal Notice & Disclaimer | Pexpacks Supplies",
    description:
      "Official POPIA-compliant email legal notice, confidentiality terms, and electronic communication disclaimer for Pexpacks Supplies (Pty) Ltd.",
  },
};

const config: LegalDocumentConfig = {
  route: "/email-disclaimer",
  pageTitle: "Email Legal Notice & Disclaimer",
  metaDescription:
    "Official POPIA-compliant email legal notice, confidentiality terms, and electronic communication disclaimer for Pexpacks Supplies (Pty) Ltd.",
  heroEyebrow: "Electronic Communication Notice",
  heroTitle: "Email Legal Notice & Disclaimer",
  heroText:
    "This notice governs electronic communications, attachments, and data messages sent by or on behalf of Pexpacks Supplies.",
  heroPanelTitle: "POPIA & RICA aligned",
  heroPanelText: "Last updated: August 2026, Republic of South Africa",
  tocHeading: "Email Notice Contents",
  tocAriaLabel: "Email legal notice contents",
  summaryKicker: "Customer Care Routing",
  summaryTitle: "Questions about an email from Pexpacks?",
  summaryText:
    "Operational and customer-care inquiries are routed through the official Pexpacks care mailbox.",
  highlights: [
    {
      title: "Customer care email",
      content: <a href={careEmailHref}>{careEmail}</a>,
      tone: "accent",
    },
    {
      title: "Applies to all Pexpacks email",
      content:
        "This notice applies to emails, attachments, data messages, and electronic records sent by or for Pexpacks Supplies.",
      tone: "warning",
    },
  ],
  sections: [
    {
      id: "scope",
      eyebrow: "Section 1",
      title: "Scope & Application",
      summary:
        "The communications and parties covered by this email legal notice.",
      content: (
        <p>
          This email legal notice applies to all electronic communications,
          attachments, and data messages sent by or on behalf of{" "}
          <strong>Pexpacks Supplies (Pty) Ltd</strong> (&ldquo;Pexpacks
          Supplies&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or
          &ldquo;our&rdquo;), accessible via{" "}
          <a href="https://pexpacks.co.za">pexpacks.co.za</a>.
        </p>
      ),
    },
    {
      id: "confidentiality",
      eyebrow: "Section 2",
      title: "Confidentiality & Legal Privilege",
      summary:
        "How unintended recipients must handle confidential or privileged messages.",
      content: (
        <>
          <p>
            The contents of our emails, including any attachments, are
            confidential, legally privileged, and intended solely for the use of
            the named addressee(s). If you are not the intended recipient, you
            are notified that reading, disclosing, copying, distributing, or
            taking any action in reliance on the contents of this communication
            is strictly prohibited and may be unlawful.
          </p>
          <p>
            If you have received an email in error, please notify the sender
            immediately, permanently delete the email and all attachments from
            your systems, and destroy any printed copies.
          </p>
        </>
      ),
    },
    {
      id: "popia",
      eyebrow: "Section 3",
      title: "Protection of Personal Information Act (POPIA) Compliance",
      summary:
        "Personal information handling requirements for Pexpacks correspondence.",
      content: (
        <>
          <p>
            Pexpacks Supplies processes personal information, including names,
            contact details, delivery addresses, school affiliations, and order
            data, in accordance with the{" "}
            <strong>
              Protection of Personal Information Act, No. 4 of 2013 (POPIA)
            </strong>{" "}
            and our <Link href="/privacy-policy">Privacy Policy</Link>.
          </p>
          <ul>
            <li>
              Personal data shared in our correspondence is processed strictly
              for legitimate business purposes, including stationery pack
              fulfilment, customer support, supplier logistics, and invoicing.
            </li>
            <li>
              If you receive personal information belonging to another person,
              such as order manifests, learner data, or supplier details, in
              error, you must not process, share, or store that data. Report the
              disclosure to <a href={careEmailHref}>{careEmail}</a>{" "}
              immediately.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "authority",
      eyebrow: "Section 4",
      title: "Contracts & Authority",
      summary:
        "Limits on contractual or financial commitments made by email.",
      content: (
        <p>
          No employee, contractor, or agent of Pexpacks Supplies is authorised
          to conclude binding contracts or financial commitments via email
          unless expressly confirmed in writing by an authorised representative
          with a formal purchase order or agreement. Quotations, pricing
          schedules, and inventory availability sent via email are indicative
          and subject to final confirmation via our platform or direct
          commercial invoicing.
        </p>
      ),
    },
    {
      id: "rica",
      eyebrow: "Section 5",
      title: "Interception & Monitoring (RICA Notice)",
      summary:
        "Notice that Pexpacks communications may be monitored for lawful purposes.",
      content: (
        <p>
          In terms of the{" "}
          <strong>
            Regulation of Interception of Communications and Provision of
            Communication-related Information Act (RICA), No. 70 of 2002
          </strong>
          , all electronic communications sent to or from Pexpacks Supplies may
          be intercepted, monitored, filtered, and archived to protect system
          security and support regulatory compliance.
        </p>
      ),
    },
    {
      id: "security",
      eyebrow: "Section 6",
      title: "Security & Malware Notice",
      summary:
        "Security responsibilities for recipients of Pexpacks email.",
      content: (
        <p>
          While we use reasonable security measures to scan outgoing
          correspondence, electronic transmissions cannot be guaranteed to be
          secure or virus-free. The recipient is responsible for verifying all
          emails and attachments through updated anti-virus and security
          software. Pexpacks Supplies accepts no liability for loss or
          corruption of data resulting from transmission.
        </p>
      ),
    },
    {
      id: "company-details",
      eyebrow: "Section 7",
      title: "Corporate & Customer Care Details",
      summary:
        "Official business and inquiry details for Pexpacks Supplies.",
      content: (
        <ul>
          <li>
            <strong>Entity:</strong> Pexpacks Supplies (Pty) Ltd
          </li>
          <li>
            <strong>Jurisdiction:</strong> Republic of South Africa
          </li>
          <li>
            <strong>Website:</strong>{" "}
            <a href="https://pexpacks.co.za">pexpacks.co.za</a>
          </li>
          <li>
            <strong>Inquiries & Care:</strong>{" "}
            <a href={careEmailHref}>{careEmail}</a>
          </li>
        </ul>
      ),
    },
  ],
  extraContent: (
    <footer>
      <p>&copy; 2026 Pexpacks Supplies (Pty) Ltd. All rights reserved.</p>
      <p>
        <Link href="/privacy-policy">Privacy Policy</Link> |{" "}
        <Link href="/terms">Terms & Conditions</Link>
      </p>
    </footer>
  ),
};

export default function EmailDisclaimerPage() {
  return <LegalDocumentPage {...config} />;
}
