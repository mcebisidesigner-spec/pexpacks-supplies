import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing/PageHero";
import { CTASection } from "@/components/marketing/CTASection";
import { FaqMarquee } from "@/components/shared/FaqMarquee";
import { LayByPromo } from "@/components/shared/LayByPromo";
import { Button } from "@/components/ui/Button";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";
import cardStyles from "@/components/marketing/MarketingCards.module.css";
import { phasePacks } from "@/data/phasePacks";
import { PhaseClient } from "@/components/school-packs/PhaseClient";
import { faqs } from "@/data/faqs";
import { buildMetadata } from "@/lib/seo";

const phaseSlug = "high-school";

export const metadata: Metadata = buildMetadata(
  "High School Stationery Packs",
  "Order or customise ready-packed stationery for Grade 8 to Grade 12 learners, including exercise books, pens, files, calculator-ready items and exam basics.",
  `/${phaseSlug}`
);

export default function HighSchoolPage() {
  const phaseData = phasePacks.find((pack) => pack.slug === phaseSlug);

  if (!phaseData) {
    notFound();
  }

  return (
    <>
      <PageHero
        eyebrow={phaseData.eyebrow}
        title={phaseData.title}
        text={phaseData.description}
      >
        <ul className={`${sectionStyles.checkList} ${sectionStyles.checkListSpaced}`}>
          {phaseData.heroBullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </PageHero>

      <PhaseClient phaseData={phaseData} />

      <section className={sectionStyles.section} aria-labelledby="phase-trust">
        <div className={sectionStyles.inner}>
          <div className={sectionStyles.splitBand}>
            <div>
              <p className={sectionStyles.sectionEyebrow}>Guaranteed accuracy</p>
              <h2>Packed to your school's list</h2>
              <p>
                Every item in this phase pack is checked against your school's
                official stationery list. If it's on the list, it's in the box.
              </p>
              <div className={sectionStyles.buttonRow}>
                <Button href="/schools" variant="primary">
                  Find Your School
                </Button>
              </div>
            </div>
            <div className={cardStyles.packCard}>
              <div className={cardStyles.packCardHead}>
                <h3 style={{ fontSize: "20px" }}>Is your school listed?</h3>
              </div>
              <div className={cardStyles.packCardBody}>
                <p className={cardStyles.packDescription}>
                  Search now to see if we have your school's exact stationery
                  list. If not, request it and get notified.
                </p>
              </div>
              <div className={cardStyles.packCardButtonWrap}>
                <Link href="/schools" className={cardStyles.cardLink}>
                  Search schools &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <div className={sectionStyles.splitBand}>
            <div>
              <p className={sectionStyles.sectionEyebrow}>Teachers &amp; tutors</p>
              <h2>Ordering for your classroom?</h2>
              <p>
                Pexpacks supports teachers, tutors, and learning centres with classroom stationery packs. Bulk discounts and custom lists available.
              </p>
              <div className={sectionStyles.buttonRow}>
                <Button href="/contact?type=bulk" variant="primary">Request Bulk Quote</Button>
              </div>
            </div>
            <div className={cardStyles.packCard}>
              <div className={cardStyles.packCardHead}>
                <h3 style={{ fontSize: "20px" }}>Custom classroom packs</h3>
              </div>
              <div className={cardStyles.packCardBody}>
                <p className={cardStyles.packDescription}>
                  Tell us what you need and we&rsquo;ll prepare a classroom pack tailored to your list.
                </p>
              </div>
              <div className={cardStyles.packCardButtonWrap}>
                <Link href="/contact" className={cardStyles.cardLink}>
                  Get in touch &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FaqMarquee
        faqs={faqs.filter((f) =>
          ["delivery-timing", "exercise-books", "multiple-learners", "customise-pack", "stationery-quality"].includes(f.id)
        )}
      />

      <LayByPromo />

      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <div className={sectionStyles.splitBand}>
            <div>
              <p className={sectionStyles.sectionEyebrow}>More grade packs</p>
              <h2>Other phases</h2>
              <p>
                Looking for a younger learner&rsquo;s pack? Browse packs for every grade.
              </p>
              <div className={sectionStyles.buttonRow}>
                <Button href="/foundation-phase" variant="primary">Foundation Phase Packs</Button>
                <Button href="/primary-school" variant="white">Primary School Packs</Button>
              </div>
            </div>
            <div className={cardStyles.packCard}>
              <div className={cardStyles.packCardHead}>
                <h3 style={{ fontSize: "20px" }}>Need office supplies?</h3>
              </div>
              <div className={cardStyles.packCardBody}>
                <p className={cardStyles.packDescription}>
                  Pexpacks also supplies practical office stationery for SMEs, home offices, and small teams.
                </p>
              </div>
              <div className={cardStyles.packCardButtonWrap}>
                <Link href="/office" className={cardStyles.cardLink}>
                  View office packs &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Ready to order"
        title="Ready to save time this year?"
        text="Join the growing number of parents who have made the smart switch to Pexpacks. Order now and experience stress-free school mornings."
        primaryHref="/schools"
        primaryLabel="Find Your School Pack"
      />
    </>
  );
}
