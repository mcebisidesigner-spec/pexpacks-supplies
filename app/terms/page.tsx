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
  "Terms of Use",
  "Read the Pexpacks Supplies terms of use for school stationery packs, office packs, Pexcover services, online ordering, delivery, and customer support.",
  "/terms"
);

export const dynamic = "force-static";

const config: LegalDocumentConfig = {
  route: "/terms",
  pageTitle: "Terms of Use",
  metaDescription:
    "Read the Pexpacks Supplies terms of use for school stationery packs, office packs, Pexcover services, online ordering, delivery, and customer support.",
  heroEyebrow: "Terms of Use",
  heroTitle: "Clear terms for ordering and using Pexpacks online",
  heroText:
    "These terms explain how Pexpacks handles quotes, orders, payments, school packs, Pexcover services, delivery, cancellations, and your use of the website and web app.",
  heroPanelTitle: `Effective ${EFFECTIVE_DATE}`,
  heroPanelText: "South Africa",
  tocHeading: "Terms contents",
  tocAriaLabel: "Terms of use table of contents",
  summaryKicker: "Quick legal overview",
  summaryTitle: "Before you order",
  summaryText:
    "Review your school, grade, items, contact details, and delivery information carefully before submitting an order or making payment. Customised school packs, Pexcover work, and special orders may carry limited cancellation or return rights once processing has started.",
  highlights: [
    {
      title: "Policies to read",
      content: (
        <>
          <Link href="/privacy-policy">Privacy Policy</Link>,{" "}
          <Link href="/cookie-notice">Cookie Notice</Link>, and{" "}
          <Link href="/delivery-policy">Delivery Policy</Link>.
        </>
      ),
    },
    {
      title: "Need help?",
      content: (
        <>
          Email <a href={generalEmailHref}>{generalEmail}</a> or call{" "}
          <a href={phoneHref}>{phoneNumber}</a>.
        </>
      ),
      tone: "accent",
    },
    {
      title: "Form confirmation",
      content:
        "Use clear consent wording before checkout, quote, contact, Pexcover, and school-order submissions.",
    },
  ],
  sections: [
    {
      id: "business-details",
      eyebrow: "Business details",
      title: "Pexpacks Supplies",
      summary:
        "The supplier details and core legal information for this website and web app.",
      content: (
        <>
          <h3>Key details</h3>
          <ul>
            <li>
              <strong>Effective date:</strong> {EFFECTIVE_DATE}
            </li>
            <li>
              <strong>Last updated:</strong> {EFFECTIVE_DATE}
            </li>
            <li>
              <strong>Website:</strong>{" "}
              <a href={siteUrl}>{siteUrl.replace(/^https?:\/\//, "www.")}</a>
            </li>
            <li>
              <strong>Trading name:</strong> Pexpacks / Pexcover
            </li>
            <li>
              <strong>Country of operation:</strong> South Africa
            </li>
            <li>
              <strong>Contact email:</strong>{" "}
              <a href={generalEmailHref}>{generalEmail}</a>
            </li>
            <li>
              <strong>Contact number:</strong>{" "}
              <a href={phoneHref}>{phoneNumber}</a>
            </li>
            <li>
              <strong>WhatsApp:</strong>{" "}
              {hasWhatsAppNumber ? whatsappNumber : "Available on request"}
            </li>
            <li>
              <strong>Business address:</strong> Shared on request or on formal
              invoices and service documents.
            </li>
            <li>
              <strong>Registration and VAT:</strong> Shared where applicable on
              quotations, invoices, or request.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "introduction",
      eyebrow: "1 - 4",
      title: "Introduction, scope and legal capacity",
      summary:
        "These terms apply whenever you browse, enquire, order, pay, or interact with Pexpacks online.",
      content: (
        <>
          <p>
            These Terms of Use govern your access to and use of the Pexpacks
            Supplies website, web app, online ordering flows, quote request
            forms, contact forms, communication channels, digital services, and
            related services.
          </p>
          <p>
            By using this website, requesting a quote, placing an order, making a
            payment, creating an account where available, or communicating with
            Pexpacks through an approved channel, you agree to these Terms.
          </p>
          <p>
            These Terms should be read together with our{" "}
            <Link href="/privacy-policy">Privacy Policy</Link>,{" "}
            <Link href="/cookie-notice">Cookie Notice</Link>,{" "}
            <Link href="/delivery-policy">Delivery Policy</Link>, any published
            returns or refund terms, and any quotation, invoice, order
            confirmation, school-specific stationery list, campaign term, or
            service agreement issued by Pexpacks.
          </p>
          <ul>
            <li>
              You must be at least 18, or act with parent or guardian consent.
            </li>
            <li>
              You may place orders for a school, business, or organisation only
              if you are authorised to do so.
            </li>
            <li>
              Children may not place orders, create accounts, or submit personal
              information without proper adult or school authority.
            </li>
            <li>
              You may use the website and web app only for lawful purposes.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "services",
      eyebrow: "5 - 9",
      title: "Products and services we offer",
      summary:
        "Pexpacks serves schools, parents, learners, SMEs, offices, and households through organised supply and support services.",
      content: (
        <>
          <p>Pexpacks may provide products and services including:</p>
          <ul>
            <li>School stationery packs and grade-specific stationery packs</li>
            <li>Custom school supply lists and parent-selected item bundles</li>
            <li>
              Pexcover book covering, labelling, sorting, and pack preparation
            </li>
            <li>
              Office stationery packs, SME packs, and convenience packs
            </li>
            <li>Bulk supply solutions for schools and offices</li>
            <li>
              Online quote requests, online order submissions, and order
              management support
            </li>
            <li>
              School partnership programmes and related digital service offers
            </li>
            <li>
              Business support packs, branding support, and standard website or
              web app packages where offered
            </li>
          </ul>
          <p>
            Product descriptions, images, pricing, pack contents, quantities,
            availability, school lists, and service details are provided as
            accurately as reasonably possible, but some details may change
            because of supplier updates, school changes, seasonality, or stock
            movement.
          </p>
          <ul>
            <li>Images may be illustrative only and packaging may differ.</li>
            <li>
              Brands may vary unless a specific brand is confirmed in writing.
            </li>
            <li>
              School stationery requirements may change if the school updates its
              list.
            </li>
            <li>
              Pexpacks may offer substitutes, revised quotations, delays, partial
              refunds, or full refunds for unavailable items where appropriate.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "school-and-pexcover",
      eyebrow: "10 - 14",
      title: "School packs, Pexcover, and custom fulfilment",
      summary:
        "School-specific orders rely on accurate learner, grade, and school information, and some services are customised once work begins.",
      content: (
        <>
          <h3>School stationery packs</h3>
          <p>
            School packs may be assembled according to grade requirements,
            school-provided lists, standard pack categories, customer-selected
            items, or bulk school arrangements. Customers must review the school
            name, learner grade, pack type, quantities, and delivery details
            before final confirmation.
          </p>
          <ul>
            <li>
              Schools may update their stationery requirements from time to time.
            </li>
            <li>
              Pexpacks may rely on information supplied by schools, parents, or
              authorised representatives.
            </li>
            <li>
              Pexpacks is not responsible for inaccurate third-party stationery
              lists.
            </li>
            <li>
              Specially assembled school packs may be treated as customised
              orders.
            </li>
          </ul>
          <h3>Pexcover services</h3>
          <p>
            Pexcover services may include covering, labelling, sorting, and pack
            preparation. Customers must provide accurate book quantities, sizes,
            learner details, and labelling instructions.
          </p>
          <ul>
            <li>
              Books may need to be delivered to, collected from, or dropped off
              at an agreed location.
            </li>
            <li>
              Delays caused by late book submission, missing books, inaccurate
              instructions, or school list changes are outside Pexpacks&apos;
              control.
            </li>
            <li>
              Once labour-based or customised work has started, cancellation
              rights may be limited except where law requires otherwise.
            </li>
            <li>
              Customers must ensure books are properly identified and handed over
              in good condition.
            </li>
          </ul>
          <h3>SME packs and business support services</h3>
          <p>
            Where Pexpacks provides office packs, branding services, business
            setup support, or a standard website or web app package, the exact
            scope, revisions, exclusions, ownership terms, and timelines must be
            confirmed in a written quotation, invoice, or service agreement.
          </p>
        </>
      ),
    },
    {
      id: "quotes-orders",
      eyebrow: "15 - 18",
      title: "Quotes, orders, and order corrections",
      summary:
        "Quotes are invitations to contract. Orders are accepted only when Pexpacks confirms them or starts fulfilment.",
      content: (
        <>
          <p>
            Quotes may depend on stock availability, supplier pricing, delivery
            area, quantity changes, school list changes, customer approval,
            payment confirmation, and any expiry date shown on the quote.
          </p>
          <p>
            Orders may be placed through the website, web app, email, WhatsApp,
            telephone, a school campaign form, quote acceptance, invoice payment,
            or another approved Pexpacks channel.
          </p>
          <ul>
            <li>
              An order is accepted only once Pexpacks confirms acceptance or
              begins fulfilment.
            </li>
            <li>
              Pexpacks may correct obvious pricing, typographical, calculation,
              or system errors before accepting an order.
            </li>
            <li>
              Pexpacks may decline or cancel an order if payment is missing,
              stock is unavailable, delivery is not possible, information is
              inaccurate, or the order appears fraudulent or unlawful.
            </li>
            <li>
              Customers must review their selection, quantities, delivery
              information, and payment details before final submission.
            </li>
          </ul>
          <p>
            Pexpacks will make reasonable efforts to notify customers if an order
            cannot be fulfilled or needs to be revised.
          </p>
        </>
      ),
    },
    {
      id: "pricing-payment",
      eyebrow: "19 - 22",
      title: "Pricing, payment, and transaction security",
      summary:
        "Prices are quoted in rand, order pricing may change before acceptance, and online payment security is handled through reasonable safeguards.",
      content: (
        <>
          <p>
            Unless stated otherwise, all prices are shown in South African Rand.
            Prices may include or exclude VAT depending on Pexpacks&apos; VAT
            status and the way the price is displayed.
          </p>
          <ul>
            <li>
              Quoted or displayed prices may exclude delivery, labour,
              customisation, urgent processing, or third-party service fees.
            </li>
            <li>
              Once a paid order is accepted, Pexpacks will not increase the price
              unless the customer requests a change, the original quote contained
              an obvious error, or the order requirements change.
            </li>
            <li>
              Orders are usually processed only after payment is received or
              approved, unless written account terms apply.
            </li>
            <li>
              Customers must use the correct payment reference to avoid
              fulfilment delays.
            </li>
          </ul>
          <p>
            Accepted payment methods may include EFT, online card payment,
            payment gateways, instant EFT, bank deposit, or other approved
            methods.
          </p>
          <p>
            Where online payment is offered, Pexpacks uses reasonable security
            measures and reputable payment service providers. Pexpacks does not
            intend to store full card details on its own systems unless this is
            done through a secure, compliant, authorised provider.
          </p>
        </>
      ),
    },
    {
      id: "delivery-collection",
      eyebrow: "23 - 27",
      title: "Delivery, collection, and school handover",
      summary:
        "Delivery and collection depend on location, school arrangements, stock, and seasonal demand.",
      content: (
        <>
          <p>
            Delivery and collection options may vary based on customer location,
            school partnerships, courier availability, order size, payment
            confirmation, operational capacity, and school calendar timing.
          </p>
          <ul>
            <li>
              Delivery times are estimates unless expressly guaranteed in
              writing.
            </li>
            <li>
              Delays can result from incorrect delivery details, customer
              unavailability, courier issues, weather, supplier delays, strikes,
              school list changes, public holidays, or other events beyond
              reasonable control.
            </li>
            <li>
              Risk in goods may pass on delivery to the customer, agreed school
              collection point, authorised recipient, or customer collection,
              depending on the chosen fulfilment method.
            </li>
          </ul>
          <h3>School collection points</h3>
          <p>
            If Pexpacks delivers to a school collection point, the school may
            help with distribution but is not the seller unless expressly stated
            otherwise.
          </p>
          <ul>
            <li>Collection windows may be limited.</li>
            <li>
              Pexpacks may require proof of identity, order number, or payment
              confirmation.
            </li>
            <li>
              Items left uncollected after reasonable notice may be handled
              according to the applicable school or fulfilment arrangement.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "returns-cancellations",
      eyebrow: "28 - 32",
      title: "Returns, refunds, cooling-off, and cancellations",
      summary:
        "Customer rights are respected under South African law, but customised or already-started services may carry limited cancellation rights.",
      content: (
        <>
          <p>
            Pexpacks handles returns, refunds, exchanges, and cancellations in
            line with applicable South African law, including the Consumer
            Protection Act and Electronic Communications and Transactions Act
            where relevant.
          </p>
          <ul>
            <li>
              Consumers may have remedies where goods are defective, unsafe, not
              as described, supplied in error, or damaged before delivery.
            </li>
            <li>
              Returned goods may be inspected before a refund, replacement,
              repair, or exchange is approved.
            </li>
            <li>
              A return may be refused where goods were misused, altered, opened,
              written on, labelled, consumed, or damaged after delivery, unless
              they were defective.
            </li>
            <li>
              Custom, personalised, labelled, specially ordered, covered,
              printed, or learner-specific items may not be returnable merely
              because the customer changed their mind.
            </li>
          </ul>
          <p>
            Where an online transaction qualifies for a statutory cooling-off
            right, a consumer may have limited rights to cancel within the period
            allowed by law. This may not apply to customised goods, services
            already started with consent, specially ordered items, or other
            excluded categories.
          </p>
          <p>
            Customers should report missing, incorrect, or damaged items as soon
            as reasonably possible after delivery or collection so the issue can
            be investigated promptly.
          </p>
        </>
      ),
    },
    {
      id: "promotions-partnerships",
      eyebrow: "33 - 35",
      title: "Promotions, school partnerships, and digital offers",
      summary:
        "Special offers, school campaigns, and digital partnership packages are subject to separate written scope and eligibility terms.",
      content: (
        <>
          <p>
            Pexpacks may run promotions, discounts, coupons, bundles, launch
            offers, school campaigns, or limited-time deals. These may be subject
            to stock availability, start and end dates, school or area
            restrictions, minimum order values, exclusions, and separate campaign
            rules.
          </p>
          <p>
            Where Pexpacks offers a free or discounted website, web app, domain,
            or digital service to partner schools, the scope must be confirmed in
            a written school partnership agreement.
          </p>
          <ul>
            <li>Eligibility may be limited to qualifying partner schools.</li>
            <li>
              Hosting periods, page limits, premium integrations, maintenance,
              renewals, and advanced development may be billed separately.
            </li>
            <li>
              Schools must provide accurate content, approvals, logos, images,
              and permissions.
            </li>
            <li>
              Any school, parent, learner, or order data will be handled only for
              the agreed purpose and in line with applicable privacy law.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "accounts-content-ip",
      eyebrow: "36 - 39",
      title: "Accounts, user content, and intellectual property",
      summary:
        "Users remain responsible for account security, lawful submissions, and respecting Pexpacks content and brand rights.",
      content: (
        <>
          <h3>User accounts</h3>
          <ul>
            <li>
              Where accounts are available, you must provide accurate
              registration details and keep login credentials secure.
            </li>
            <li>
              You are responsible for activity performed through your account
              unless caused by Pexpacks&apos; proven negligence or unlawful
              conduct.
            </li>
            <li>
              Pexpacks may suspend or remove accounts that are inactive,
              duplicated, compromised, fraudulent, or abusive.
            </li>
          </ul>
          <h3>User-submitted content</h3>
          <p>
            If you submit stationery lists, messages, testimonials, files, logos,
            or other content, you confirm that you are entitled to do so, that
            the content is lawful and accurate, and that it does not infringe
            third-party rights or contain harmful code.
          </p>
          <h3>Intellectual property</h3>
          <p>
            Unless stated otherwise, all site content, designs, text, graphics,
            logos, pack concepts, interfaces, source code, documents, and
            marketing material belong to Pexpacks or its licensors. You may not
            copy, reproduce, scrape, reverse-engineer, or exploit them without
            prior written consent.
          </p>
        </>
      ),
    },
    {
      id: "privacy-third-parties",
      eyebrow: "40 - 42",
      title: "Privacy, direct marketing, and third-party services",
      summary:
        "Personal information is processed under POPIA-aligned practices, and third-party services have their own terms and privacy rules.",
      content: (
        <>
          <p>
            Pexpacks processes personal information in accordance with its{" "}
            <Link href="/privacy-policy">Privacy Policy</Link> and applicable
            South African privacy law, including POPIA.
          </p>
          <ul>
            <li>
              Personal information may be processed for fulfilment, delivery,
              payment, customer support, legal compliance, and service
              improvement.
            </li>
            <li>
              Learner-related information is handled carefully and only for
              lawful, relevant operational purposes.
            </li>
            <li>
              Marketing messages may be sent where permitted by law and should
              include an opt-out option where required.
            </li>
          </ul>
          <p>
            This website and web app may link to or integrate with third-party
            providers such as payment gateways, couriers, Google Maps, WhatsApp,
            hosting providers, analytics tools, social platforms, design or
            printing partners, and school or supplier websites.
          </p>
          <p>
            Pexpacks is not responsible for the content, uptime, security,
            privacy practices, or terms of those third-party platforms.
          </p>
        </>
      ),
    },
    {
      id: "availability-liability",
      eyebrow: "43 - 44",
      title: "Availability, disclaimers, liability, and force majeure",
      summary:
        "The platform is provided on an available basis, with consumer rights preserved where the law does not allow exclusion.",
      content: (
        <>
          <p>
            Pexpacks aims to keep the website and web app available, accurate,
            and secure, but does not guarantee uninterrupted or error-free
            access. Services may be affected by maintenance, hosting issues,
            internet failures, technical bugs, security incidents, or other
            provider-side disruptions.
          </p>
          <ul>
            <li>
              Pexpacks may correct website or system errors and revise affected
              orders before acceptance or fulfilment where lawful and reasonable.
            </li>
            <li>
              Nothing in these Terms excludes rights or remedies that cannot
              legally be excluded under South African law.
            </li>
            <li>
              To the maximum extent permitted by law, Pexpacks is not liable for
              indirect or consequential loss, including loss caused by customer
              error, third-party services, or events beyond reasonable control.
            </li>
            <li>
              Any direct liability relating to an order may, where lawful, be
              limited to the amount paid for the affected product or service.
            </li>
          </ul>
          <p>
            Pexpacks will also not be liable for delay or non-performance caused
            by force majeure events such as power failures, transport disruption,
            unrest, cyber incidents beyond reasonable control, supplier
            shortages, school closures, severe weather, or government
            restrictions.
          </p>
        </>
      ),
    },
    {
      id: "complaints-law",
      eyebrow: "45",
      title: "Complaints, updates, governing law, and contact",
      summary:
        "Customers can raise issues directly with Pexpacks, and disputes are governed by South African law.",
      content: (
        <>
          <p>
            For complaints, support, returns, order queries, or legal notices,
            please contact Pexpacks using the details below and include your full
            name, contact details, order or invoice number, a description of the
            issue, and any supporting documents or images.
          </p>
          <div className={legalStyles.contactPanel}>
            <p>
              <strong>Email:</strong>{" "}
              <a href={generalEmailHref}>{generalEmail}</a>
            </p>
            <p>
              <strong>Phone:</strong> <a href={phoneHref}>{phoneNumber}</a>
            </p>
            <p>
              <strong>WhatsApp:</strong>{" "}
              {hasWhatsAppNumber ? whatsappNumber : "Available on request"}
            </p>
            <p>
              <strong>Website:</strong> <a href={siteUrl}>{siteUrl}</a>
            </p>
          </div>
          <p>
            Pexpacks may update these Terms from time to time to reflect legal,
            operational, commercial, or platform changes. The latest published
            version will apply to future use of the website and web app, while
            confirmed orders will generally remain subject to the terms in force
            when the order was accepted unless the law requires otherwise.
          </p>
          <p>
            These Terms are governed by the laws of the Republic of South Africa.
            Before formal legal action is started, the parties should try to
            resolve disputes in good faith. Customers may also approach relevant
            South African consumer bodies where applicable.
          </p>
        </>
      ),
    },
  ],
  extraContent: (
    <article className={legalStyles.documentCard}>
      <div className={legalStyles.sectionHeader}>
        <p>Recommended form language</p>
        <h2>Consent wording for forms and checkout</h2>
        <span>
          The original legal draft included explicit acceptance wording for order
          and enquiry submissions.
        </span>
      </div>
      <div className={legalStyles.sectionBody}>
        <div className={legalStyles.noticeBlock}>
          <p>
            <strong>General form checkbox</strong>
          </p>
          <p>
            I confirm that I have read and agree to the Pexpacks Terms of Use and
            Privacy Policy.
          </p>
        </div>
        <div className={legalStyles.noticeBlock}>
          <p>
            <strong>Checkout checkbox</strong>
          </p>
          <p>
            By placing this order, I confirm that the order details are correct
            and that I agree to the Pexpacks Terms of Use, Privacy Policy,
            Delivery Policy, and Returns and Refunds Policy.
          </p>
        </div>
        <p className={legalStyles.legalNote}>
          Important legal note: this page is a strong operational draft for
          publication, but it should still be reviewed by a South African legal
          professional once final payment, courier, partnership, refund,
          registration, and VAT details are fully settled.
        </p>
      </div>
    </article>
  ),
};

export default function TermsPage() {
  return <LegalDocumentPage {...config} />;
}
