import type { Metadata } from "next";
import { PartnerForm } from "@/components/forms/PartnerForm";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { SchoolMockupDemo } from "@/components/marketing/SchoolMockupDemo";
import { SchoolPitchDeck } from "@/components/marketing/SchoolPitchDeck";
import { buildMetadata } from "@/lib/seo";
import heroStyles from "@/components/marketing/HeroBase.module.css";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";
import cardStyles from "@/components/marketing/MarketingCards.module.css";
import pageStyles from "./PartnerWithSchools.module.css";

const pitchStats = [
  { value: "R35k", label: "website and hosting package value" },
  { value: "0", label: "setup or monthly school website fees" },
  { value: "5%", label: "sample development-fund rebate model" },
];

const pitchFlow = [
  "See the offer",
  "Calculate partner value",
  "Preview the school website",
  "Apply for partnership",
];

const schoolBenefits = [
  "Custom domain connection (e.g., yourschool.co.za)",
  "Full website hosting and SSL certificate included free",
  "Dedicated Parent Portal for stationery ordering",
  "News, calendars, and prospectus download sections",
  "Development fund rebate on stationery sales",
  "Zero setup or ongoing maintenance fees",
];

const websiteFeatures = [
  {
    title: "School Brand Customisation",
    desc: "Designed around your official badge, colours, motto, and admissions message.",
  },
  {
    title: "Parent Portal Integration",
    desc: "Parents can choose a grade and order pre-packed stationery kits without manual school admin.",
  },
  {
    title: "Prospectus and Document Hub",
    desc: "Publish newsletters, policies, calendars, prospectus files, and stationery lists in one place.",
  },
  {
    title: "News and Events Board",
    desc: "Keep families updated on assemblies, term dates, school notices, and sports fixtures.",
  },
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

export const metadata: Metadata = buildMetadata(
  "Partner With Pexpacks | Free Website & Hosting for Schools",
  "Designate Pexpacks as your official school stationery partner and get a professional modern website built, hosted, and maintained completely free of charge.",
  "/partner-with-schools",
);

export default function PartnerWithSchoolsPage() {
  return (
    <>
      <PageHero
        eyebrow="Exclusive school partner program"
        title="A pitch deck schools can understand in minutes."
        text="Pexpacks builds your school a modern website and parent stationery portal at no setup cost. Walk through the offer, calculate the value, preview the experience, and apply when the partnership makes sense."
        panelText="Partner value snapshot"
        panelTitle="Website + parent ordering + rebate model"
      >
        <div className={sectionStyles.buttonRow}>
          <Button href="#pitch-deck" size="lg">
            Open the pitch deck
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
              eyebrow="Interactive Pitch"
              title="A guided presentation flow for future partners"
              text="Move through the offer like a sales deck: the promise, the website, the parent portal, the value calculator, and the launch plan."
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

      <section
        className={`${sectionStyles.section} ${pageStyles.sectionNoPaddingTop}`}
        id="interactive-demo"
      >
        <div className={sectionStyles.inner}>
          <SectionHeader
            eyebrow="Interactive Demo"
            title="Showcase the website your school could receive"
            text="Explore a responsive school website, parent stationery portal, and update desk built to show school partners the full value of working with Pexpacks."
          />
          <SchoolMockupDemo />
        </div>
      </section>

      <section className={sectionStyles.sectionCream}>
        <div className={sectionStyles.inner}>
          <SectionHeader
            eyebrow="Website Features"
            title="Built for modern schools"
            text="The website is designed to be useful immediately: families can find information, school teams can share updates, and parents can order stationery from the correct path."
          />
          <div className={cardStyles.infoGrid}>
            {websiteFeatures.map((feat) => (
              <article className={cardStyles.infoCard} key={feat.title}>
                <h3 className={pageStyles.featureCardTitle}>{feat.title}</h3>
                <p className={pageStyles.featureCardDesc}>{feat.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

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

      <section className={sectionStyles.sectionCream} id="how-it-works">
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

      <section className={sectionStyles.sectionCream} id="partner-form">
        <div className={sectionStyles.inner}>
          <SectionHeader
            eyebrow="Partnership Enquiry"
            title="Start your partnership today"
            text="Complete the form below and our team will get in touch to discuss the school website, grade packs, and launch path."
          />
          <PartnerForm />
        </div>
      </section>
    </>
  );
}
