import type { Metadata } from "next";
import Link from "next/link";
import {
  generalEmail,
  generalEmailHref,
  hasWhatsAppNumber,
  phoneHref,
  phoneNumber,
  whatsappNumber,
} from "@/data/contact";
import {
  LegalDocumentPage,
  legalStyles,
  type LegalDocumentConfig,
} from "@/components/policy/LegalDocumentPage";
import { buildMetadata, siteUrl } from "@/lib/seo";
import { EFFECTIVE_DATE } from "@/lib/constants";

export const metadata: Metadata = buildMetadata(
  "Happy Pay Terms | Pexpacks",
  "How Happy Pay Buy Now Pay Later (BNPL) works for Pexpacks orders, the detailed South African payment process, and the roles and responsibilities of Happy Pay and Pexpacks.",
  "/happy-pay-terms"
);

export const dynamic = "force-static";

const config: LegalDocumentConfig = {
  route: "/happy-pay-terms",
  pageTitle: "Happy Pay Terms",
  metaDescription:
    "How Happy Pay Buy Now Pay Later (BNPL) works for Pexpacks orders, the detailed South African payment process, and the roles and responsibilities of Happy Pay and Pexpacks.",
  heroEyebrow: "Buy Now Pay Later (BNPL) Terms & Disclosure",
  heroTitle: "Happy Pay Terms & Conditions",
  heroText:
    "These terms explain how the Happy Pay Buy Now Pay Later (BNPL) payment option works when you choose it for your Pexpacks order, the payment process in South African terms, and the separate legal roles of Happy Pay and Pexpacks.",
  heroPanelTitle: `Last Updated: ${EFFECTIVE_DATE}`,
  heroPanelText: "Republic of South Africa",
  tocHeading: "Happy Pay Terms Contents",
  tocAriaLabel: "Happy Pay terms table of contents",
  summaryKicker: "Key Summary",
  summaryTitle: "Who Does What in a Happy Pay Transaction",
  summaryText:
    "Happy Pay is the independent payment services provider that funds, processes, and legally administers your split-payment facility. Pexpacks is a referral consultant that offers you the Happy Pay option at checkout. The credit facility, approval decision, instalment collection, and all associated legal obligations are Happy Pay's responsibility.",
  highlights: [
    {
      title: "Happy Pay is the Payment Provider",
      content:
        "All BNPL lending, consumer credit, repayment collection, and associated regulatory compliance (including any requirements under the National Credit Act) are handled by Happy Pay as an independent company.",
      tone: "accent",
    },
    {
      title: "Pexpacks Acts as a Referral Consultant",
      content:
        "Pexpacks only refers you to Happy Pay as a payment alternative. Pexpacks does not lend money, extend credit, collect instalments, or approve BNPL facilities.",
      tone: "accent",
    },
    {
      title: "Pexpacks Is Not Liable for Happy Pay's Business Practices",
      content:
        "To the maximum extent permitted by South African law, Pexpacks is not responsible for Happy Pay's approvals, fees, collection conduct, or any failure to comply with consumer legislation.",
      tone: "warning",
    },
  ],
  sections: [
    {
      id: "what-is-happy-pay",
      eyebrow: "1",
      title: "What is Happy Pay BNPL?",
      summary:
        "An independent Buy Now Pay Later payment option offered to South African consumers.",
      content: (
        <>
          <p>
            Happy Pay is an independent Buy Now Pay Later (BNPL) payment provider. When you select
            Happy Pay at Pexpacks checkout, you do not enter into a credit agreement with Pexpacks.
            Instead, Happy Pay settles your order with Pexpacks and then collects the amount back
            from you in two equal, interest-free instalments.
          </p>
          <p>
            Happy Pay is a separate company from Pexpacks. Happy Pay operates its own BNPL facility,
            performs its own customer checks and approvals, sets its own terms, and is responsible
            for all consumer credit and collection obligations that apply to its service under
            South African law.
          </p>
        </>
      ),
    },
    {
      id: "how-it-works",
      eyebrow: "2",
      title: "How the Happy Pay Split Payment Works",
      summary:
        "Two equal instalments: 50% today and 50% in 30 days, with no interest.",
      content: (
        <>
          <h3>Two Equal, Interest-Free Instalments</h3>
          <p>
            The Happy Pay option splits your order total into 2 equal payments:
          </p>
          <ul>
            <li>
              <strong>Instalment 1 (50%):</strong> paid today when you approve your first payment.
            </li>
            <li>
              <strong>Instalment 2 (50%):</strong> taken automatically 30 days later from the same
              payment method you approved with Happy Pay.
            </li>
          </ul>
          <p>
            Happy Pay settles the full order amount with Pexpacks upfront, which is why your packs
            can be reserved and prepared for dispatch immediately. There is no interest and no
            hidden application fee.
          </p>
          <h3>Approval Takes Less Than 60 Seconds</h3>
          <p>
            Happy Pay performs a quick approval check at checkout. If approved, you will be
            redirected to Happy Pay's secure payment page to authorise your first instalment. Your
            pack is only reserved once that first payment is approved.
          </p>
        </>
      ),
    },
    {
      id: "sa-payment-process",
      eyebrow: "3",
      title: "The Detailed Payment Process in South African Terms",
      summary:
        "Step-by-step outline of a Happy Pay transaction, from checkout to final instalment.",
      content: (
        <>
          <ol>
            <li>
              <strong>Select Happy Pay at checkout.</strong> Choose the "Happy Pay" option on the
              Pexpacks checkout page for your pack order.
            </li>
            <li>
              <strong>Provide your details.</strong> Enter your full name, South African phone
              number, and email address so Happy Pay can process your request.
            </li>
            <li>
              <strong>Happy Pay performs its approval checks.</strong> Happy Pay runs its own
              verification and approval process. Approvals are at Happy Pay's sole discretion and
              may be refused without reasons being provided to Pexpacks.
            </li>
            <li>
              <strong>Redirect to Happy Pay's secure payment page.</strong> You are redirected to
              Happy Pay's platform to authorise the first instalment of 50% of your order total.
            </li>
            <li>
              <strong>Happy Pay settles your order.</strong> Once your first instalment is
              authorised, Happy Pay pays Pexpacks in full for the order, and Pexpacks begins
              preparing your packs for dispatch.
            </li>
            <li>
              <strong>Second instalment in 30 days.</strong> Happy Pay automatically collects the
              remaining 50% from the payment method you approved, 30 days after the first payment.
            </li>
            <li>
              <strong>Ongoing administration.</strong> All instalment scheduling, reminder
              notifications, repayment management, and any arrears or collection activity are
              handled directly by Happy Pay.
            </li>
          </ol>
          <p>
            Your contract for the split-payment facility is concluded solely between you and Happy
            Pay. Pexpacks is not a party to that facility agreement.
          </p>
        </>
      ),
    },
    {
      id: "legal-role-of-happy-pay",
      eyebrow: "4",
      title: "The Legal Role of Happy Pay",
      summary:
        "Happy Pay owns the credit facility and all related legal and regulatory obligations.",
      content: (
        <>
          <p>
            Happy Pay is the party that provides, funds, and administers the BNPL facility. This
            includes, but is not limited to:
          </p>
          <ul>
            <li>Deciding whether to approve or decline a BNPL facility.</li>
            <li>Setting and applying its own terms, conditions, and consumer disclosures.</li>
            <li>Collecting instalments and managing repayment schedules.</li>
            <li>
              Complying with any South African legislation that applies to its service, including
              consumer credit and financial services regulation where applicable.
            </li>
            <li>Resolving customer queries, complaints, and disputes about the facility.</li>
          </ul>
          <p>
            You should review Happy Pay's own terms and privacy notices for full details of the
            credit facility, because those documents govern your agreement with Happy Pay.
          </p>
        </>
      ),
    },
    {
      id: "pexpacks-role",
      eyebrow: "5",
      title: "Pexpacks as Referral Consultant",
      summary:
        "Pexpacks refers you to Happy Pay but does not provide or administer the credit facility.",
      content: (
        <>
          <p>
            Pexpacks acts purely as a referral consultant for the Happy Pay payment option. This
            means:
          </p>
          <ul>
            <li>Pexpacks does not lend money or extend credit to any customer.</li>
            <li>Pexpacks does not approve, decline, or influence Happy Pay decisions.</li>
            <li>
              Pexpacks does not collect instalments or manage repayment of your second payment.
            </li>
            <li>
              Pexpacks does not hold itself out as a credit provider, financial services provider,
              or agent of Happy Pay.
            </li>
          </ul>
          <p>
            Pexpacks&apos; role is limited to offering you the option and processing your stationery
            order. Once Happy Pay settles your order, Pexpacks&apos; obligations relate only to the
            goods and services Pexpacks supplies to you.
          </p>
        </>
      ),
    },
    {
      id: "limitation-of-liability",
      eyebrow: "6",
      title: "Limitation of Pexpacks' Liability",
      summary:
        "Pexpacks is not liable for Happy Pay's conduct, business practices, or compliance.",
      content: (
        <>
          <div className={legalStyles.noticeBlock}>
            <p>
              <strong>CPA Section 49 Conspicuous Notice:</strong>
            </p>
            <p>
              To the maximum extent permitted by the Consumer Protection Act 68 of 2008 and other
              applicable South African law, Pexpacks shall not be liable for the acts, omissions,
              approvals, fees, collection conduct, credit decisions, or business practices of Happy
              Pay. This includes any failure by Happy Pay to comply with consumer credit, financial
              services, or privacy legislation, and any loss or damage you may suffer as a result
              of Happy Pay&apos;s services.
            </p>
          </div>
          <p>
            If you have a complaint about your Happy Pay facility, its repayments, its approval
            decision, or its treatment of you, you should raise it directly with Happy Pay in the
            first instance, and thereafter with the applicable industry ombud, the National Credit
            Regulator (where the National Credit Act 34 of 2005 applies), or another appropriate
            regulator.
          </p>
        </>
      ),
    },
    {
      id: "data-and-privacy",
      eyebrow: "7",
      title: "Data Sharing and Privacy",
      summary:
        "Your details are shared with Happy Pay solely to set up the payment, under POPIA.",
      content: (
        <>
          <p>
            When you choose Happy Pay, Pexpacks shares the minimum personal information required
            (such as your name, contact details, and order value) with Happy Pay so that it can
            process your payment request. This processing is done in accordance with the Protection
            of Personal Information Act 4 of 2013 (POPIA).
          </p>
          <p>
            Your personal information held by Pexpacks is handled under our{" "}
            <Link href="/privacy-policy">Privacy Policy</Link>. Once your details are with Happy
            Pay, Happy Pay&apos;s own privacy notice applies to how it uses your information.
          </p>
        </>
      ),
    },
    {
      id: "order-terms",
      eyebrow: "8",
      title: "Your Pexpacks Order Still Applies",
      summary:
        "Happy Pay covers the payment method only; the sale of the packs remains governed by Pexpacks' terms.",
      content: (
        <>
          <p>
            Choosing Happy Pay does not change the terms that govern your stationery order. Your
            purchase of Pexpacks goods and services remains subject to our{" "}
            <Link href="/terms">Terms of Use</Link>,{" "}
            <Link href="/delivery-policy">Delivery Policy</Link>, and{" "}
            <Link href="/returns-refunds-policy">Returns &amp; Refunds Policy</Link>.
          </p>
          <p>
            Any refund that becomes due to you in respect of the goods themselves is processed back
            through the Happy Pay payment method you used, in accordance with the applicable
            refund arrangements between you, Pexpacks, and Happy Pay.
          </p>
        </>
      ),
    },
    {
      id: "complaints-contact",
      eyebrow: "9",
      title: "Complaints and Contact",
      summary:
        "How to escalate a Happy Pay issue and how to reach Pexpacks about your order.",
      content: (
        <>
          <p>
            For issues about your Happy Pay facility, instalments, or approvals, contact Happy Pay
            directly first. If the matter is not resolved, you may approach the applicable industry
            ombud or regulator for the financial service concerned.
          </p>
          <p>
            For questions about your Pexpacks order itself, contact Pexpacks using the details
            below.
          </p>
          <div className={legalStyles.contactPanel}>
            <p>
              <strong>Customer Support Email:</strong>{" "}
              <a href={generalEmailHref}>{generalEmail}</a>
            </p>
            <p>
              <strong>Telephone:</strong> <a href={phoneHref}>{phoneNumber}</a>
            </p>
            <p>
              <strong>WhatsApp Support:</strong>{" "}
              {hasWhatsAppNumber ? whatsappNumber : "Available on request"}
            </p>
            <p>
              <strong>Website:</strong> <a href={siteUrl}>{siteUrl}</a>
            </p>
          </div>
        </>
      ),
    },
  ],
  extraContent: (
    <article className={legalStyles.documentCard}>
      <div className={legalStyles.sectionHeader}>
        <p>Referral Disclosure</p>
        <h2>Important Disclosure</h2>
      </div>
      <div className={legalStyles.sectionBody}>
        <p>
          Happy Pay is an independent company and is not a division, subsidiary, or agent of
          Pexpacks. Pexpacks is not a credit provider and does not provide any BNPL facility.
          Pexpacks receives the full settled value of your order from Happy Pay and is not
          involved in the credit assessment, approval, or collection of your instalments.
        </p>
        <p>
          You are encouraged to read Happy Pay&apos;s own terms and conditions and privacy policy
          before approving your first instalment.
        </p>
      </div>
    </article>
  ),
};

export default function HappyPayTermsPage() {
  return <LegalDocumentPage {...config} />;
}
