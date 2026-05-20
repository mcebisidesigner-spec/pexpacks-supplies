import type { Metadata } from "next";
import { PartnerForm } from "@/components/forms/PartnerForm";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { buildMetadata } from "@/lib/seo";
import styles from "@/components/marketing/Marketing.module.css";

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
        <div className={styles.buttonRow}>
          <Button href="#partner-form">Get Started</Button>
          <Button href="#how-it-works" variant="white">
            How It Works
          </Button>
        </div>
      </PageHero>

      {/* The Hook Detail Section */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionHeader
            eyebrow="Zero Cost Web Development"
            title="Professional Web Design & Hosting, On Us"
            text="We handle the design, server management, security, and updates. You get a modern online hub for your community."
          />
          <div className={styles.splitBand}>
            <div>
              <p className={styles.sectionEyebrow}>Fully Managed Package</p>
              <h2>Everything your school needs online</h2>
              <p>
                From custom domain routing to mobile responsiveness, our free website package matches premium agency designs. All we ask is that you list Pexpacks as your official stationery box supplier for parents.
              </p>
              <div className={styles.buttonRow} style={{ marginTop: "24px" }}>
                <Button href="#partner-form">Apply for Partnership</Button>
              </div>
            </div>
            <ul className={styles.checkList}>
              {schoolBenefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Website Features Grid */}
      <section className={styles.sectionCream}>
        <div className={styles.inner}>
          <SectionHeader
            eyebrow="Website Features"
            title="Built for modern schools"
            text="Explore the modules built into our custom school websites to help you engage with your community."
          />
          <div className={styles.infoGrid}>
            {websiteFeatures.map((feat) => (
              <article className={styles.infoCard} key={feat.title}>
                <h3 style={{ margin: "0 0 10px 0", color: "var(--pex-navy)", fontWeight: 800 }}>{feat.title}</h3>
                <p style={{ margin: 0, fontSize: "15px", color: "var(--pex-text-muted)", lineHeight: 1.5 }}>
                  {feat.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Mutual Benefit Section */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionHeader
            eyebrow="The Mutual Benefit"
            title="A partnership that works for everyone"
            text="Pexpacks removes the admin burden of list compiling, while giving schools a premier digital identity."
          />
          <div className={styles.infoGrid}>
            {mutualBenefits.map((benefit) => (
              <div key={benefit.title} className={styles.heroPanel} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h3 style={{ margin: 0, color: "var(--pex-primary)", fontSize: "22px", fontWeight: 800 }}>{benefit.title}</h3>
                <ul className={styles.checkList}>
                  {benefit.list.map((item, idx) => (
                    <li key={idx} style={{ fontSize: "15px", fontWeight: "normal", color: "var(--pex-text)" }}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works steps */}
      <section className={styles.sectionCream} id="how-it-works">
        <div className={styles.inner}>
          <SectionHeader
            eyebrow="Simple setup"
            title="Launch in 4 simple steps"
            text="Our team handles the transition process from start to finish."
          />
          <div className={styles.packageClaimLayout}>
            <div className={styles.packageClaimSummary} style={{ gridColumn: "1 / -1", position: "static" }}>
              <ol style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
                <li style={{ counterIncrement: "list-item 1" }}>
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "17px", fontWeight: 800 }}>1. Submit Request</h4>
                  <p style={{ margin: 0, fontSize: "14px", color: "var(--pex-text-muted)", fontWeight: "normal" }}>
                    Fill out the form below with your school details and contact information.
                  </p>
                </li>
                <li style={{ counterIncrement: "list-item 1" }}>
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "17px", fontWeight: 800 }}>2. Share Stationery Lists</h4>
                  <p style={{ margin: 0, fontSize: "14px", color: "var(--pex-text-muted)", fontWeight: "normal" }}>
                    Provide your approved grade lists. We digitize them and build custom pack configurations.
                  </p>
                </li>
                <li style={{ counterIncrement: "list-item 1" }}>
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "17px", fontWeight: 800 }}>3. Website & Store Setup</h4>
                  <p style={{ margin: 0, fontSize: "14px", color: "var(--pex-text-muted)", fontWeight: "normal" }}>
                    We design your brand new school website, secure domain connection, and launch the parent store.
                  </p>
                </li>
                <li style={{ counterIncrement: "list-item 1" }}>
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "17px", fontWeight: 800 }}>4. Launch & Earn Rebates</h4>
                  <p style={{ margin: 0, fontSize: "14px", color: "var(--pex-text-muted)", fontWeight: "normal" }}>
                    Parents order hassle-free. Your school receives annual development fund checks on all orders.
                  </p>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Supplier Section (Secondary) */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.splitBand} style={{ background: "var(--pex-bg-warm)", border: "none" }}>
            <div>
              <p className={styles.sectionEyebrow}>Supplier Network</p>
              <h2>Are you a stationery distributor?</h2>
              <p>
                Pexpacks partners with reliable stationery suppliers in Gauteng to source certified quality brands in bulk. Join our distribution network to quote on recurring seasonal volume.
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button href="#partner-form">Join as Supplier</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Enquiry Form */}
      <section className={styles.sectionCream} id="partner-form">
        <div className={styles.inner}>
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
