import type { Metadata } from "next";
import Link from "next/link";
import { PartnerForm } from "@/components/forms/PartnerForm";
import { InteractiveDemoSection } from "@/components/partnership/InteractiveDemoSection";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { SchoolPitchDeck } from "@/components/marketing/SchoolPitchDeck";
import { buildMetadata } from "@/lib/seo";
import heroStyles from "@/components/marketing/HeroBase.module.css";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";
import cardStyles from "@/components/marketing/MarketingCards.module.css";
import pageStyles from "./PartnerWithSchools.module.css";

const pitchStats = [
  { value: "R35,000+", label: "Annual website & hosting package value (R0 cost)" },
  { value: "R0.00", label: "Setup, licensing, or monthly maintenance fees" },
  { value: "5% Cash Back", label: "Rebate on every stationery pack reinvested in your school" },
];

const pitchFlow = [
  "Partnership Offer",
  "Economic Value Calculator",
  "Interactive Website Preview",
  "Launch Roadmap",
];

const schoolBenefits = [
  "Custom domain connection (e.g., yourschool.co.za)",
  "Full website hosting and SSL certificate included free",
  "Dedicated Parent Portal for stationery ordering",
  "News, calendars, and prospectus download sections",
  "Development fund rebate on stationery sales",
  "Zero setup or ongoing maintenance fees",
];

const mutualBenefits = [
  {
    title: "For Your School",
    list: [
      "Modern, secure web presence to support enrolment confidence.",
      "No server subscription or maintenance workload.",
      "Stationery admin handled through the Pexpacks workflow.",
      "Annual development-fund rebate model on pack sales.",
    ],
  },
  {
    title: "For Your Parents",
    list: [
      "Correct stationery items packed from official grade lists.",
      "Less retail-store hopping and fewer January queues.",
      "Secure payment options including card, instant EFT, and WhatsApp support.",
      "Home delivery or organised bulk drop-off at school.",
    ],
  },
];

const launchSteps = [
  {
    title: "1. Submit Request",
    desc: "Share school details and the best contact person for the partnership conversation.",
  },
  {
    title: "2. Share Stationery Lists",
    desc: "Send approved grade lists so Pexpacks can digitise and prepare pack options.",
  },
  {
    title: "3. Website and Store Setup",
    desc: "We design the school website, connect the parent portal, and prepare launch content.",
  },
  {
    title: "4. Launch and Earn Rebates",
    desc: "Parents order from the approved path and your school gains measurable partner value.",
  },
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
        title="Partnership with real benefits"
        text="Pexpacks works with schools to simplify stationery ordering, reduce parent stress, and help learners start the year prepared with the right supplies."
        panelText="Partner value snapshot"
        panelTitle="Website + parent ordering + rebate model"
      >
        <div className={sectionStyles.buttonRow}>
          <Button href="#pitch-deck" size="lg">
            Open benefits presentation
          </Button>
          <Button href="#interactive-demo" variant="white" size="lg">
            Preview demo website
          </Button>
        </div>
      </PageHero>

      <section
        className={pageStyles.pitchStatsSection}
        aria-label="Partnership highlights"
      >
        <div className={pageStyles.pitchStats}>
          {pitchStats.map((stat) => (
            <div key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={sectionStyles.sectionAlt} id="pitch-deck">
        <div className={sectionStyles.inner}>
          <div className={pageStyles.flowIntro}>
            <SectionHeader
              eyebrow="Interactive Proposal"
              title="Explore the benefits of our School Partner Program"
              text="Walk through the four core pillars of our partnership: the zero-cost managed website, the seamless parent ordering portal, your projected fund earnings, and our simplified launch roadmap."
            />
            <ol className={pageStyles.pitchFlow}>
              {pitchFlow.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>
          <SchoolPitchDeck />
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

      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <SectionHeader
            eyebrow="The Mutual Benefit"
            title="A partnership that works for everyone"
            text="Pexpacks reduces stationery admin for schools while giving parents a simpler, more reliable back-to-school experience."
          />
          <div className={cardStyles.infoGrid}>
            {mutualBenefits.map((benefit) => (
              <div
                key={benefit.title}
                className={`${heroStyles.heroPanel} ${pageStyles.benefitPanel}`}
              >
                <h3 className={pageStyles.benefitTitle}>{benefit.title}</h3>
                <ul className={sectionStyles.checkList}>
                  {benefit.list.map((item) => (
                    <li key={item} className={pageStyles.benefitListItem}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={sectionStyles.section} id="how-it-works">
        <div className={sectionStyles.inner}>
          <SectionHeader
            eyebrow="Simple setup"
            title="Launch in four clear steps"
            text="The flow is intentionally simple so your team can evaluate the offer, approve the setup, and launch without a heavy IT project."
          />
          <div className={sectionStyles.packageClaimLayout}>
            <div className={sectionStyles.packageClaimSummary}>
              <ol className={pageStyles.stepsGrid}>
                {launchSteps.map((step) => (
                  <li className={pageStyles.stepItem} key={step.title}>
                    <h4 className={pageStyles.stepTitle}>{step.title}</h4>
                    <p className={pageStyles.stepDesc}>{step.desc}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

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
