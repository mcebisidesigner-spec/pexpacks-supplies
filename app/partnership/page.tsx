import type { Metadata } from "next";
import Link from "next/link";
import { PartnerForm } from "@/components/forms/PartnerForm";
import { InteractiveDemoSection } from "@/components/partnership/InteractiveDemoSection";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";
import { SectionHeader } from "@/components/marketing/SectionHeader";

import { buildMetadata } from "@/lib/seo";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";
import cardStyles from "@/components/marketing/MarketingCards.module.css";
import pageStyles from "./PartnerWithSchools.module.css";

const schoolBenefits = [
  "Custom domain connection (e.g., yourschool.co.za)",
  "Full website hosting and SSL certificate included free",
  "Dedicated Parent Portal for stationery ordering",
  "News, calendars, and prospectus download sections",
  "Development fund rebate on stationery sales",
  "Zero setup or ongoing maintenance fees",
];

const faqItems = [
  {
    q: "Is the website and hosting package really 100% free?",
    a: "Yes. There are absolutely zero setup costs, monthly maintenance fees, or hidden hosting charges. Pexpacks covers all development and operational costs out of our standard retail stationery margins. Your school will never receive an invoice from us.",
    links: [{ label: "Partnership terms", href: "/school-partnership-terms" }]
  },
  {
    q: "How does the 5% development-fund rebate work?",
    a: "Every time a parent orders a grade stationery pack through your school's customized portal, 5% of the total pack cost is automatically earmarked for your school. We transfer these accumulated fundraising rebates directly to your school's development fund annually.",
    links: [{ label: "Talk to our team", href: "/contact" }]
  },
  {
    q: "Who handles parent inquiries, payments, and order issues?",
    a: "Pexpacks handles 100% of the customer support workload. Parents can pay securely via credit card, instant EFT, or WhatsApp, and track their orders directly with us. We handle package assembly, delivery, and any refunds or returns, meaning zero support load for school staff.",
    links: [{ label: "Track an order", href: "/track-order" }, { label: "Contact us", href: "/contact" }]
  },
  {
    q: "Does this require complex IT setup or school admin workload?",
    a: "None at all. Our team does the heavy lifting. All you need to do is share your approved grade stationery lists. We will handle custom styling, domain connection (e.g., yourschool.co.za), product catalog upload, and deploy the entire system in days.",
    links: [{ label: "Start your enquiry", href: "/contact" }]
  },
  {
    q: "Are the parents' personal information and transactions secure?",
    a: "Security is our highest priority. The custom school portal is fully hosted with premium SSL encryption, and all checkout transactions are processed through 256-bit encrypted secure payment gateways. Our data handling is strictly POPIA and GDPR compliant.",
    links: [{ label: "Privacy policy", href: "/privacy-policy" }]
  }
];

export const metadata: Metadata = buildMetadata(
  "Partner With Pexpacks | Free Website & Hosting for Schools",
  "Designate Pexpacks as your official school stationery partner and get a professional modern website built, hosted, and maintained completely free of charge.",
  "/partnership",
);

export const dynamic = "force-static";

export default function PartnerWithSchoolsPage() {
  return (
    <>
      <PageHero
        eyebrow="School partnership programme"
        title="Your school&rsquo;s stationery admin is now free. For good."
        text="Pexpacks is a free administrative upgrade for your school — not a stationery supplier. We manage your grade lists, parent ordering, payment collection, and delivery. Your school pays nothing, and your staff does nothing."
        panelText="Your school's custom portal includes"
        panelTitle="Free website, hosting, SSL &amp; parent ordering portal"
      >
        <a href="#partner-form" className={pageStyles.executiveHeroCta}>
          Apply to Partner
        </a>
      </PageHero>

      <section className={pageStyles.tripleWinSection} aria-labelledby="triple-win-heading">
        <div className={sectionStyles.inner}>
          <SectionHeader
            eyebrow="Three stakeholders, one solution"
            title="A triple-win for your school community"
            text="Every decision at your school affects three groups. Our partnership delivers measurable value to each one."
            headingId="triple-win-heading"
          />
          <div className={pageStyles.tripleWinGrid}>
            <div className={pageStyles.tripleWinCard}>
              <div className={pageStyles.tripleWinIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <p className={pageStyles.tripleWinLabel}>For the Administration</p>
              <h3 className={pageStyles.tripleWinTitle}>You Will Never Receive an Invoice</h3>
              <p className={pageStyles.tripleWinText}>
                No setup costs, monthly fees, or hidden charges. Simply approve your grade lists, share one link in your newsletter, and we handle the rest — for free, forever.
              </p>
            </div>
            <div className={pageStyles.tripleWinCard}>
              <div className={pageStyles.tripleWinIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <p className={pageStyles.tripleWinLabel}>For the Teachers</p>
              <h3 className={pageStyles.tripleWinTitle}>No Admin Burden on Staff</h3>
              <p className={pageStyles.tripleWinText}>
                We collect and pack exactly what each teacher requires, using their approved lists and preferred brands. No bulk orders, no counting, no admin after the first Term 1 email.
              </p>
            </div>
            <div className={pageStyles.tripleWinCard}>
              <div className={pageStyles.tripleWinIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <p className={pageStyles.tripleWinLabel}>For the Parents</p>
              <h3 className={pageStyles.tripleWinTitle}>A Single Link for Everything</h3>
              <p className={pageStyles.tripleWinText}>
                Parents click one school-branded link, select their child&rsquo;s grade, and receive exactly what&rsquo;s on the official list — delivered to their door. No mall crawling, no guesswork.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={pageStyles.sgbHookSection} aria-labelledby="sgb-hook-heading">
        <div className={sectionStyles.inner}>
          <div className={pageStyles.sgbHookBanner}>
            <p className={pageStyles.sgbHookEyebrow}>Fundraising opportunity</p>
            <h2 id="sgb-hook-heading" className={pageStyles.sgbHookTitle}>
              Turn your stationery lists into a fundraising channel.
            </h2>
            <p className={pageStyles.sgbHookText}>
              Official Pexpacks partner schools can opt into our rebate program. For every pack a parent orders through your unique school link, a percentage of the sale is donated directly back into your school&rsquo;s fundraising trust.
            </p>
          </div>
        </div>
      </section>

      <section className={pageStyles.onboardingSection} aria-labelledby="onboarding-heading">
        <div className={sectionStyles.inner}>
          <SectionHeader
            eyebrow="Simple onboarding"
            title="Go live in 3 steps"
            text="No IT meetings. No lengthy setup. From list upload to live link in under 48 hours."
            headingId="onboarding-heading"
          />
          <div className={pageStyles.onboardingTimeline}>
            <div className={pageStyles.onboardingStep}>
              <div className={pageStyles.onboardingStepNumber} aria-hidden="true">1</div>
              <h3 className={pageStyles.onboardingStepTitle}>Send Your Lists</h3>
              <p className={pageStyles.onboardingStepText}>
                Upload your official grade requirements directly to our portal.
              </p>
            </div>
            <div className={pageStyles.onboardingConnector} aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
            <div className={pageStyles.onboardingStep}>
              <div className={pageStyles.onboardingStepNumber} aria-hidden="true">2</div>
              <h3 className={pageStyles.onboardingStepTitle}>We Digitize</h3>
              <p className={pageStyles.onboardingStepText}>
                Our team maps your items to our inventory within 48 hours.
              </p>
            </div>
            <div className={pageStyles.onboardingConnector} aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
            <div className={pageStyles.onboardingStep}>
              <div className={pageStyles.onboardingStepNumber} aria-hidden="true">3</div>
              <h3 className={pageStyles.onboardingStepTitle}>Share Your Link</h3>
              <p className={pageStyles.onboardingStepText}>
                We provide a custom URL (e.g., pexpacks.co.za/schools/your-school) to paste into your D6 Communicator or WhatsApp groups.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <SectionHeader
            eyebrow="Zero Cost Web Development"
            title="Professional web design and hosting, on us"
            text="We handle design, server management, security, updates, and the parent ordering path. Your school gets a premium online hub with less admin load."
          />
          <div className={sectionStyles.splitBand}>
            <div>
              <p className={sectionStyles.sectionEyebrow}>Fully Managed Package</p>
              <h2>Everything your school needs online</h2>
              <p>
                From domain routing to mobile responsiveness, the website package
                is built to feel like a professional school platform. The
                partnership asks that Pexpacks becomes the official stationery
                pack supplier for parents.
              </p>
              <div className={`${sectionStyles.buttonRow} ${pageStyles.buttonRowMargin}`}>
                <Button href="#partner-form">Apply for Partnership</Button>
              </div>
            </div>
            <ul className={sectionStyles.checkList}>
              {schoolBenefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <InteractiveDemoSection />

      <section className={sectionStyles.sectionAlt} id="partnership-faq">
        <div className={sectionStyles.inner}>
          <SectionHeader
            eyebrow="Common Questions"
            title="Partnership reassurance & trust details"
            text="Transparent answers to the questions school boards, principals, and administrative teams ask most."
          />
          <div className={pageStyles.faqGrid}>
            {faqItems.map((item, index) => (
              <details className={pageStyles.faqItem} key={index}>
                <summary className={pageStyles.faqQuestion}>
                  <span>{item.q}</span>
                  <span className={pageStyles.faqIcon}></span>
                </summary>
                <div className={pageStyles.faqAnswer}>
                  <p>{item.a}</p>
                  {item.links?.length ? (
                    <div className={pageStyles.faqLinks}>
                      {item.links.map((link: { label: string; href: string }) => (
                        <Link href={link.href} key={link.href}>
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </details>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "28px" }}>
            <Link
              href="/faq"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 22px",
                borderRadius: "var(--radius-pill)",
                background: "rgba(33, 158, 154, 0.1)",
                color: "var(--pex-keppel)",
                fontWeight: 800,
                fontSize: "15px",
                textDecoration: "none",
              }}
            >
              Read all FAQs &rarr;
            </Link>
          </div>
        </div>
      </section>

      <section className={sectionStyles.section} id="partner-form">
        <div className={sectionStyles.inner}>
          <SectionHeader
            eyebrow="Partnership Enquiry"
            title="Start your partnership today"
            text="Complete the form below and our team will get in touch to discuss the school website, grade packs, and launch path."
          />
          <PartnerForm />
        </div>
      </section>

      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <div className={sectionStyles.splitBand}>
            <div>
              <p className={sectionStyles.sectionEyebrow}>Explore more</p>
              <h2>Find school packs &amp; office supplies</h2>
              <p>
                Pexpacks prepares stationery for every grade and workplace. Search your school or browse our office range.
              </p>
              <div className={sectionStyles.buttonRow}>
                <Button href="/schools" variant="primary">Find School Packs</Button>
                <Button href="/office" variant="white">View Office Packs</Button>
              </div>
            </div>
            <div className={cardStyles.packCard}>
              <div className={cardStyles.packCardHead}>
                <h3 style={{ fontSize: "20px" }}>Visit our FAQ</h3>
              </div>
              <div className={cardStyles.packCardBody}>
                <p className={cardStyles.packDescription}>
                  Quick answers to common questions about partnerships, school packs, delivery, and payments.
                </p>
              </div>
              <div className={cardStyles.packCardButtonWrap}>
                <Link href="/faq" className={cardStyles.cardLink}>
                  Read all FAQs &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
