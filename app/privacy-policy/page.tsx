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
import { buildMetadata } from "@/lib/seo";
import { EFFECTIVE_DATE } from "@/lib/constants";

export const metadata: Metadata = buildMetadata(
  "Privacy Policy",
  "Pexpacks Supplies Privacy Policy — Official privacy notice detailing our processing of personal information under the Protection of Personal Information Act (POPIA 4 of 2013).",
  "/privacy-policy"
);

export const dynamic = "force-static";

const config: LegalDocumentConfig = {
  route: "/privacy-policy",
  pageTitle: "Privacy Policy",
  metaDescription:
    "Pexpacks Supplies Privacy Policy — Official privacy notice detailing our processing of personal information under the Protection of Personal Information Act (POPIA 4 of 2013).",
  heroEyebrow: "Statutory Privacy Notice (POPIA 4 of 2013)",
  heroTitle: "How Pexpacks protects and manages your personal information",
  heroText:
    "This privacy policy sets out how Pexpacks Supplies collects, processes, protects, and retains personal information in strict compliance with South African privacy laws.",
  heroPanelTitle: "POPIA & PAIA Aligned",
  heroPanelText: `Last Updated: ${EFFECTIVE_DATE}, Republic of South Africa`,
  tocHeading: "Privacy Policy Contents",
  tocAriaLabel: "Privacy policy table of contents",
  summaryKicker: "Information Officer Contact",
  summaryTitle: "Need help exercising your POPIA rights?",
  summaryText: "",
  highlights: [
    {
      title: "Information Officer Routing",
      content: (
        <>
          Direct POPIA queries, access requests, or objections to{" "}
          <a href={generalEmailHref}>{generalEmail}</a> or call{" "}
          <a href={phoneHref}>{phoneNumber}</a>. Requests are attended to by the
          designated Information Officer.
        </>
      ),
      tone: "accent",
    },
    {
      title: "Data Subject Guarantee",
      content:
        "Pexpacks will never sell, rent, or trade your personal information or learner data to third parties for commercial gain.",
      tone: "warning",
    },
  ],
  sections: [
    {
      id: "business-details",
      eyebrow: "Responsible Party",
      title: "Pexpacks Supplies Statutory Details",
      summary:
        "The official contact details of the Responsible Party and Information Officer.",
      content: (
        <>
          <h3>Responsible Party Details</h3>
          <ul>
            <li>
              <strong>Responsible Party:</strong> Pexpacks Supplies (Pty) Ltd / Pexpacks Trading
            </li>
            <li>
              <strong>Trading Names:</strong> Pexpacks / Pexcover
            </li>
            <li>
              <strong>Last Updated:</strong> October 2025
            </li>
            <li>
              <strong>Jurisdiction:</strong> Republic of South Africa
            </li>
            <li>
              <strong>Website:</strong> www.pexpacks.co.za
            </li>
            <li>
              <strong>General Enquiries:</strong>{" "}
              <a href={generalEmailHref}>{generalEmail}</a>
            </li>
            <li>
              <strong>Privacy & POPIA Office:</strong>{" "}
              <a href="mailto:privacy@pexpacks.co.za">privacy@pexpacks.co.za</a>
            </li>
            <li>
              <strong>Telephone:</strong>{" "}
              <a href={phoneHref}>{phoneNumber}</a>
            </li>
            <li>
              <strong>Information Officer:</strong> Designated Information Officer, Pexpacks Supplies
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "scope-legislative-framework",
      eyebrow: "1 — 3",
      title: "Scope and Legislative Framework",
      summary:
        "Governing South African statutory privacy laws and the scope of application.",
      content: (
        <>
          <p>
            Pexpacks Supplies is committed to safeguarding personal information in accordance with South African law. This Privacy Policy is formulated pursuant to:
          </p>
          <ul>
            <li>
              <strong>Protection of Personal Information Act, 4 of 2013 (POPIA)</strong>
            </li>
            <li>
              <strong>Promotion of Access to Information Act, 2 of 2000 (PAIA)</strong>
            </li>
            <li>
              <strong>Electronic Communications and Transactions Act, 25 of 2002 (ECTA)</strong>
            </li>
            <li>
              <strong>Consumer Protection Act, 68 of 2008 (CPA)</strong>
            </li>
          </ul>
          <p>
            This policy applies to all personal information collected via our website, web app, checkout workflows, quote request forms, contact channels, social media channels, delivery dispatch workflows, and customer support platforms.
          </p>
          <p>
            It applies to all data subjects interacting with Pexpacks, including parents, legal guardians, learners (via parent/guardian consent), school administrators, corporate SME procurement clients, suppliers, and website visitors.
          </p>
        </>
      ),
    },
    {
      id: "popia-conditions",
      eyebrow: "4",
      title: "Eight Conditions for Lawful Processing",
      summary:
        "Pexpacks adheres strictly to the 8 statutory conditions prescribed by POPIA.",
      content: (
        <>
          <p>
            In accordance with Chapter 3 of POPIA, Pexpacks processes personal information subject to the following 8 conditions:
          </p>
          <ol>
            <li>
              <strong>Accountability:</strong> We ensure that all processing measures comply with POPIA under the oversight of our Information Officer.
            </li>
            <li>
              <strong>Processing Limitation:</strong> We process data lawfully, minimally, and transparently based on explicit consent, contractual necessity, or legal duty.
            </li>
            <li>
              <strong>Purpose Specification:</strong> Personal information is collected for explicit, defined, and lawful business operations (e.g. stationery pack order fulfillment, Pexcover services, invoicing).
            </li>
            <li>
              <strong>Further Processing Limitation:</strong> Subsequent data processing is strictly compatible with the original collection purpose.
            </li>
            <li>
              <strong>Information Quality:</strong> We take reasonable steps to ensure data is accurate, complete, and updated.
            </li>
            <li>
              <strong>Openness:</strong> We maintain complete transparency regarding why and how data is collected and processed.
            </li>
            <li>
              <strong>Security Safeguards:</strong> We enforce technical and organizational safeguards to prevent loss, damage, or unauthorized access.
            </li>
            <li>
              <strong>Data Subject Participation:</strong> Data subjects may access, correct, or request deletion of their personal information at any time.
            </li>
          </ol>
        </>
      ),
    },
    {
      id: "information-we-collect",
      eyebrow: "5",
      title: "Categories of Personal Information Collected",
      summary:
        "Detailed categories of personal information collected across user interactions.",
      content: (
        <>
          <h3>1. Customer & Parent/Guardian Data</h3>
          <p>
            Full name, email address, mobile contact number, physical and delivery addresses, preferred contact method (WhatsApp, Phone, Email), payment confirmation status, and billing details.
          </p>
          <h3>2. Learner & School Pack Data</h3>
          <p>
            Where necessary to assemble school stationery packs or perform Pexcover book-covering services, we collect limited learner-related details (learner full name, school name, grade, stationery subject options, and bag-tag instructions).
          </p>
          <p>
            <em>POPIA Special Notice on Children (Sections 26–35):</em> Learner information is categorized under POPIA as information relating to children. Pexpacks processes children's information strictly with the consent of a competent parent or legal guardian, or pursuant to an authorized school procurement agreement, solely for order assembly, tagging, and fulfillment.
          </p>
          <h3>3. Corporate & School Partner Information</h3>
          <p>
            School/institution name, official registration details, procurement representative details, institutional billing address, and quotation histories.
          </p>
          <h3>4. Technical & Metadata</h3>
          <p>
            IP addresses, browser type, device identifiers, session cookies, and form audit logs required to secure checkout transactions and audit form submissions.
          </p>
        </>
      ),
    },
    {
      id: "how-we-use-information",
      eyebrow: "6",
      title: "Purpose and Lawful Basis for Processing",
      summary:
        "The statutory bases under POPIA for processing customer and learner information.",
      content: (
        <>
          <p>Pexpacks processes personal information for the following specific purposes:</p>
          <ul>
            <li>To assemble, pack, custom-label, and fulfill school stationery orders</li>
            <li>To execute Pexcover book-covering and custom protective book services</li>
            <li>To coordinate doorstep courier delivery or school-handover distribution</li>
            <li>To process online payment confirmations via authorized payment gateways (Paystack)</li>
            <li>To communicate order status updates, delivery schedules, and Lay-by installment reminders</li>
            <li>To respond to customer enquiries, quotations, and support requests</li>
            <li>To comply with statutory accounting, tax (SARS), and regulatory record-keeping duties</li>
          </ul>
          <p>
            <strong>Lawful Basis:</strong> Processing is conducted pursuant to Section 11(1) of POPIA: (a) with data subject consent; (b) for the performance of a contract; (c) to comply with an obligation imposed by law; or (d) to pursue legitimate business interests.
          </p>
        </>
      ),
    },
    {
      id: "sharing-operators-transfers",
      eyebrow: "7 — 9",
      title: "Data Sharing, Operators, and Transborder Transfers",
      summary:
        "How data is shared with operators, couriers, and international cloud infrastructure.",
      content: (
        <>
          <h3>Authorized Operators</h3>
          <p>
            Pexpacks engages vetted third-party service providers (&ldquo;Operators&rdquo;) to perform essential operational services. Operators process data strictly under written operator agreements pursuant to Section 20 & 21 of POPIA:
          </p>
          <ul>
            <li><strong>Payment Gateways:</strong> Paystack (Pty) Ltd for secure payment processing.</li>
            <li><strong>Logistics Partners:</strong> Contracted courier services for doorstep delivery.</li>
            <li><strong>Infrastructure & Hosting:</strong> Vercel Inc. and Supabase Inc. for secure cloud hosting, web app operation, and database maintenance.</li>
          </ul>
          <h3>Transborder Data Transfers (POPIA Section 72)</h3>
          <p>
            Where cloud hosting or database infrastructure is hosted outside South Africa, Pexpacks ensures compliance with Section 72 of POPIA. Transfers occur only to recipients bound by laws, binding corporate rules, or agreements providing an adequate level of data protection substantially similar to POPIA.
          </p>
          <p>
            <strong>Commercial Selling Guarantee:</strong> Pexpacks will never sell, trade, or rent personal information to third parties for independent commercial marketing.
          </p>
        </>
      ),
    },
    {
      id: "security-retention-breach",
      eyebrow: "10 — 12",
      title: "Security Safeguards, Retention, and Breach Protocol",
      summary:
        "Technical safeguards, data retention schedules, and statutory breach procedures.",
      content: (
        <>
          <h3>Technical & Organizational Security (POPIA Section 19)</h3>
          <p>
            We enforce strict security safeguards including SSL/TLS encryption, secure database access tokens, restricted administrative controls, and regular vulnerability checks to prevent unauthorized access, loss, or damage to personal data.
          </p>
          <h3>Data Retention (POPIA Section 14)</h3>
          <p>
            Personal information is retained only for as long as necessary to achieve the collection purpose or satisfy legal retention periods. Transactional records and tax invoices are retained for 5 years as required by the Tax Administration Act 28 of 2011 and Companies Act 71 of 2008.
          </p>
          <h3>Data Breach Notification Protocol (POPIA Section 22)</h3>
          <p>
            In the event of a reasonable belief that personal information has been accessed or acquired by an unauthorized person, Pexpacks will notify the <strong>Information Regulator</strong> and affected data subjects as soon as reasonably possible, detailing the nature of the breach, potential consequences, and corrective measures taken.
          </p>
        </>
      ),
    },
    {
      id: "data-subject-rights",
      eyebrow: "13",
      title: "Data Subject Statutory Rights and Complaint Process",
      summary:
        "Your statutory rights to access, correct, object, or lodge complaints.",
      content: (
        <>
          <p>Under POPIA, data subjects enjoy statutory rights to:</p>
          <ul>
            <li><strong>Right of Access (Section 23):</strong> Request confirmation of whether we hold personal information and request a record thereof.</li>
            <li><strong>Right to Correction/Deletion (Section 24):</strong> Request the correction, destruction, or deletion of inaccurate, irrelevant, or excessive personal information (using prescribed Form 2).</li>
            <li><strong>Right to Object (Section 11(3)):</strong> Object on reasonable grounds to processing based on legitimate interest.</li>
            <li><strong>Direct Marketing Opt-Out (Section 69):</strong> Unsubscribe from direct electronic marketing communications at any time.</li>
          </ul>
          <h3>Submitting a Privacy Request</h3>
          <p>
            To submit an access, correction, or objection request, please contact our Information Officer at <a href="mailto:privacy@pexpacks.co.za">privacy@pexpacks.co.za</a> or <a href={generalEmailHref}>{generalEmail}</a>.
          </p>
          <h3>Lodging a Complaint with the Information Regulator</h3>
          <p>
            If you are unsatisfied with how Pexpacks handles your privacy request, you have the statutory right to lodge a complaint with the <strong>Information Regulator of South Africa</strong>:
          </p>
          <ul>
            <li><strong>Website:</strong> <a href="https://inforegulator.org.za/" target="_blank" rel="noopener noreferrer">inforegulator.org.za</a></li>
            <li><strong>POPIA Complaints Email:</strong> <a href="mailto:POPIAComplaints@inforegulator.org.za">POPIAComplaints@inforegulator.org.za</a></li>
            <li><strong>General Enquiries Email:</strong> <a href="mailto:enquiries@inforegulator.org.za">enquiries@inforegulator.org.za</a></li>
          </ul>
        </>
      ),
    },
  ],
};

export default function PrivacyPolicyPage() {
  return <LegalDocumentPage {...config} />;
}
