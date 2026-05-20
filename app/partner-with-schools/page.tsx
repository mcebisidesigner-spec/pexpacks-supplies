import type { Metadata } from "next";
import { PartnerForm } from "@/components/forms/PartnerForm";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { SchoolMockupDemo } from "@/components/marketing/SchoolMockupDemo";
import { buildMetadata } from "@/lib/seo";
import marketingStyles from "@/components/marketing/Marketing.module.css";
import pageStyles from "./PartnerWithSchools.module.css";

const schoolBenefits = [
  "Custom domain connection (e.g., yourschool.co.za)",
  "Full website hosting and SSL certificate included free",
  "Dedicated Parent Portal for stationery ordering",
  "News, calendars, and prospectus download sections",
  "Development fund rebate (percentage of stationery sales)",
  "Zero setup or ongoing maintenance fees",
];

const websiteFeatures = [
  {
    title: "School Brand Customization",
    desc: "Designed using your school's official badge, colours, and motto for a professional presence.",
  },
  {
    title: "Parent Portal Integration",
    desc: "Parents can select their child's grade and purchase pre-packed stationery kits in under 3 clicks.",
  },
  {
    title: "Prospectus & Document Downloads",
    desc: "A secure repository for newsletters, school policy docs, and prospectus downloads.",
  },
  {
    title: "News & Events Board",
    desc: "Keep the community updated on sports fixtures, terms dates, and assemblies.",
  },
];

const mutualBenefits = [
  {
    title: "For Your School",
    list: [
      "Modern, secure web presence to attract new enrolments.",
      "Zero IT overhead or monthly server subscription costs.",
      "Stationery admin completely handled by our team.",
      "Annual development rebate checks on every pack sold.",
    ],
  },
  {
    title: "For Your Parents",
    list: [
      "100% correct items packed according to official grade lists.",
      "No retail store hopping or long queues in January.",
      "Secure payment methods including card, instant EFT, and WhatsApp options.",
      "Direct home delivery or organized bulk drop-off at school.",
    ],
  },
];

export const metadata: Metadata = buildMetadata(
  "Partner With Pexpacks | Free Website & Hosting for Schools",
  "Designate Pexpacks as your official school stationery partner and get a professional modern website built, hosted, and maintained completely free of charge.",
  "/partner-with-schools"
);

export default function PartnerWithSchoolsPage() {
  return (
    <>
      <PageHero
        eyebrow="Exclusive school program"
        title="A Free Modern Website & Hosting for Your School"
        text="Upgrade your school's digital presence and streamline stationery list ordering. We will design, build, and host a professional site completely free of charge—while simplifying stationery ordering for parents."
        panelText="School Web Package Value"
        panelTitle="R35,000 / year"
      >
        <div className={marketingStyles.buttonRow}>
          <Button href="#partner-form">Get Started</Button>
          <Button href="#how-it-works" variant="white">
            How It Works
          </Button>
        </div>
      </PageHero>

      {/* The Hook Detail Section */}
      <section className={marketingStyles.section}>
        <div className={marketingStyles.inner}>
          <SectionHeader
            eyebrow="Zero Cost Web Development"
            title="Professional Web Design & Hosting, On Us"
            text="We handle the design, server management, security, and updates. You get a modern online hub for your community."
          />
          <div className={marketingStyles.splitBand}>
            <div>
              <p className={marketingStyles.sectionEyebrow}>Fully Managed Package</p>
              <h2>Everything your school needs online</h2>
              <p>
                From custom domain routing to mobile responsiveness, our free website package matches premium agency designs. All we ask is that you list Pexpacks as your official stationery box supplier for parents.
              </p>
              <div className={`${marketingStyles.buttonRow} ${pageStyles.buttonRowMargin}`}>
                <Button href="#partner-form">Apply for Partnership</Button>
              </div>
            </div>
            <ul className={marketingStyles.checkList}>
              {schoolBenefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Realistic Interactive Mockup Section */}
      <section className={`${marketingStyles.section} ${pageStyles.sectionNoPaddingTop}`}>
        <div className={marketingStyles.inner}>
          <SectionHeader
            eyebrow="Interactive Demo"
            title="Experience Your Future School Website"
            text="Below is an authentic preview of the premium websites we design, build, and host for our partner schools. Explore the interactive modules and portal icons."
          />
          <SchoolMockupDemo />
        </div>
      </section>

      {/* Website Features Grid */}
      <section className={marketingStyles.sectionCream}>
        <div className={marketingStyles.inner}>
          <SectionHeader
            eyebrow="Website Features"
            title="Built for modern schools"
            text="Explore the modules built into our custom school websites to help you engage with your community."
          />
          <div className={marketingStyles.infoGrid}>
            {websiteFeatures.map((feat) => (
              <article className={marketingStyles.infoCard} key={feat.title}>
                <h3 className={pageStyles.featureCardTitle}>{feat.title}</h3>
                <p className={pageStyles.featureCardDesc}>
                  {feat.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Mutual Benefit Section */}
      <section className={marketingStyles.section}>
        <div className={marketingStyles.inner}>
          <SectionHeader
            eyebrow="The Mutual Benefit"
            title="A partnership that works for everyone"
            text="Pexpacks removes the admin burden of list compiling, while giving schools a premier digital identity."
          />
          <div className={marketingStyles.infoGrid}>
            {mutualBenefits.map((benefit) => (
              <div key={benefit.title} className={`${marketingStyles.heroPanel} ${pageStyles.benefitPanel}`}>
                <h3 className={pageStyles.benefitTitle}>{benefit.title}</h3>
                <ul className={marketingStyles.checkList}>
                  {benefit.list.map((item, idx) => (
                    <li key={idx} className={pageStyles.benefitListItem}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works steps */}
      <section className={marketingStyles.sectionCream} id="how-it-works">
        <div className={marketingStyles.inner}>
          <SectionHeader
            eyebrow="Simple setup"
            title="Launch in 4 simple steps"
            text="Our team handles the transition process from start to finish."
          />
          <div className={marketingStyles.packageClaimLayout}>
            <div className={marketingStyles.packageClaimSummary}>
              <ol className={pageStyles.stepsGrid}>
                <li className={pageStyles.stepItem}>
                  <h4 className={pageStyles.stepTitle}>1. Submit Request</h4>
                  <p className={pageStyles.stepDesc}>
                    Fill out the form below with your school details and contact information.
                  </p>
                </li>
                <li className={pageStyles.stepItem}>
                  <h4 className={pageStyles.stepTitle}>2. Share Stationery Lists</h4>
                  <p className={pageStyles.stepDesc}>
                    Provide your approved grade lists. We digitize them and build custom pack configurations.
                  </p>
                </li>
                <li className={pageStyles.stepItem}>
                  <h4 className={pageStyles.stepTitle}>3. Website & Store Setup</h4>
                  <p className={pageStyles.stepDesc}>
                    We design your brand new school website, secure domain connection, and launch the parent store.
                  </p>
                </li>
                <li className={pageStyles.stepItem}>
                  <h4 className={pageStyles.stepTitle}>4. Launch & Earn Rebates</h4>
                  <p className={pageStyles.stepDesc}>
                    Parents order hassle-free. Your school receives annual development fund checks on all orders.
                  </p>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Supplier Section (Secondary) */}
      <section className={marketingStyles.section}>
        <div className={marketingStyles.inner}>
          <div className={`${marketingStyles.splitBand} ${pageStyles.supplierPanel}`}>
            <div>
              <p className={marketingStyles.sectionEyebrow}>Supplier Network</p>
              <h2>Are you a stationery distributor?</h2>
              <p>
                Pexpacks partners with reliable stationery suppliers in Gauteng to source certified quality brands in bulk. Join our distribution network to quote on recurring seasonal volume.
              </p>
            </div>
            <div className={pageStyles.supplierAction}>
              <Button href="#partner-form">Join as Supplier</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Enquiry Form */}
      <section className={marketingStyles.sectionCream} id="partner-form">
        <div className={marketingStyles.inner}>
          <SectionHeader
            eyebrow="Partnership Enquiry"
            title="Start your partnership today"
            text="Complete the form below and our team will get in touch with you to design your school website and prepare your grade packs."
          />
          <PartnerForm />
        </div>
      </section>
    </>
  );
}
