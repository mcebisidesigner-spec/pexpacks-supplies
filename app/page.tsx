import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { CTASection } from "@/components/marketing/CTASection";
import { HeroSearch } from "@/components/marketing/HeroSearch";
import { PackCard } from "@/components/marketing/PackCard";
import { PackCardSlider } from "@/components/marketing/PackCardSlider";
import { PathwayCards } from "@/components/marketing/PathwayCards";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { TestimonialMarquee } from "@/components/shared/TestimonialMarquee";
import { faqs } from "@/data/faqs";
import {
  homepagePacks,
  homeProcessSteps,
  trustBadges,
  whyChoosePexpacks,
} from "@/data/packs";
import { testimonials } from "@/data/testimonials";
import styles from "@/components/marketing/Marketing.module.css";

export default function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <p className={styles.eyebrow}>School and office stationery</p>
            <h1 className={styles.heroTitle}>
              School and office
              <br className={styles.mobileBreak} /> stationery made simple.
            </h1>
            <p className={styles.heroLead}>
              No queues. No confusion. No missing items.
            </p>
            <HeroSearch />
            <ul
              className={styles.trustBadges}
              aria-label="Pexpacks trust points">
              {trustBadges.map((badge) => (
                <li key={badge}>{badge}</li>
              ))}
            </ul>
          </div>

          <div className={styles.heroVisual}>
            <span className={styles.heroVisualImage}>
              <Image
                src="/images/hero-school-delivery.webp"
                alt="Pexpacks stationery pack items arranged neatly"
                fill
                priority
                sizes="(min-width: 1024px) 44vw, 100vw"
              />
            </span>
            <div className={styles.productScene}>
              <div className={styles.brandBox}>
                <div>
                  <span>Pexpacks Supplies</span>
                  <br />
                  <strong>Ready-packed stationery</strong>
                </div>
                <p>
                  Complete school stationery packs prepared according to your
                  child's school list and grade requirements. Practical office
                  stationery packs are available for SMEs and home offices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionHeader
            eyebrow="Pack options"
            title="Choose the pack that fits you"
            text="Whether you are a parent, school, or office administrator, you can start with what you need right now."
          />
          <PathwayCards />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionHeader
            eyebrow="Ordering process"
            title="How it works"
            text="We keep the process simple, so you can focus on other important things."
          />
          <div className={styles.stepsGrid}>
            {homeProcessSteps.map((step, index) => (
              <article className={styles.stepCard} key={step.title}>
                <span className={styles.stepNumber}>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionCream}>
        <div className={styles.inner}>
          <div className={styles.splitBand}>
            <div>
              <p className={styles.eyebrow}>The Pexpacks box</p>
              <h2>What's in the Box?</h2>
              <p>
                Each Pexpacks stationery pack is prepared to help learners start
                ready, with essential school supplies according to school lists.
              </p>
              <ul
                className={[styles.checkList, styles.checkListSpaced].join(
                  " ",
                )}>
                <li>Exercise books, pens, pencils and rulers</li>
                <li>Glue, files, crayons or colour pencils where required</li>
                <li>Grade-specific school-list items packed with care</li>
                <li>Ready for the first day of school or collection</li>
              </ul>
              <div
                className={[styles.buttonRow, styles.splitActions].join(" ")}>
                <Button href="/schools">Find Your School Pack</Button>
              </div>
            </div>
            <div className={styles.unboxingImageWrap}>
              <Image
                src="/images/unboxing-G7.webp"
                alt="Open Pexpacks stationery box showing school supplies packed inside"
                fill
                className={styles.mediaImage}
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionHeader
            eyebrow="Why Pexpacks"
            title="The Pexpacks Difference"
            text="Because we promise to save you time, reduce stress and help you stay prepared."
          />
          <div className={styles.benefitGrid}>
            {whyChoosePexpacks.map((benefit) => (
              <article className={styles.benefitCard} key={benefit.title}>
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className={styles.homePackSection}
        aria-labelledby="pack-section-heading">
        <div className={styles.inner}>
          <SectionHeader
            eyebrow="Prepacked packs"
            title="Our most popular packs"
            text="Ready-to-go stationery for every learner and school."
            headingId="pack-section-heading"
          />
          <PackCardSlider>
            {homepagePacks.map((pack) => (
              <PackCard pack={pack} key={pack.id} />
            ))}
          </PackCardSlider>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.splitBand}>
            <div className={styles.unboxingImageWrap}>
              <Image
                src="/images/office-packs.png"
                alt="Pexpacks premium office stationery packs"
                fill
                className={styles.mediaImage}
                sizes="(min-width: 1024px) 42vw, 100vw"
              />
            </div>
            <div>
              <p className={styles.eyebrow}>Office and SME solutions</p>
              <h2>Office stationery, packed for work.</h2>
              <p>
                Keep your business stocked with curated office stationery packs.
                We handle the supplies so your team can focus on the work.
              </p>
              <div
                className={[styles.buttonRow, styles.splitActions].join(" ")}>
                <Button href="/office-packs">View Office Packs</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionCream}>
        <div className={styles.inner}>
          <div className={styles.guaranteeBox}>
            <div className={styles.guaranteeContent}>
              <p className={styles.eyebrow}>Quality promise</p>
              <h2>The Pexpacks quality guarantee</h2>
              <p>
                We pack trusted stationery items clearly and carefully. If a
                supplied item is faulty or does not match the agreed school-list
                requirement, we will help put it right.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className={styles.section}
        aria-labelledby="home-testimonials-heading">
        <div className={styles.inner}>
          <SectionHeader
            eyebrow="Trusted by parents and schools"
            title="How Pexpacks will feel"
            headingId="home-testimonials-heading"
          />
          <TestimonialMarquee items={testimonials} />
        </div>
      </section>

      <section className={styles.sectionCream}>
        <div className={styles.inner}>
          <SectionHeader
            eyebrow="Questions and answers"
            title="Frequently Asked Questions"
            text="Answers for parents, schools and office buyers."
          />
          <div className={styles.faqList}>
            {faqs.map((faq) => (
              <details className={styles.faqItem} key={faq.id}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <div className={styles.partnerBanner}>
        <p>
          For schools:{" "}
          <a href="/partner-with-schools">
            Help parents order the correct stationery from your school list
            &rarr;
          </a>
        </p>
      </div>

      <CTASection
        eyebrow="Ready to order"
        title="Pexpacks gets stationery packed right."
        text="Choose your school or office pack and let Pexpacks prepare your stationery for you."
        primaryHref="/schools"
        primaryLabel="Find Your School Pack"
        secondaryHref="/office-packs"
        secondaryLabel="Order Office Stationery"
      />
    </>
  );
}
