import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { CTASection } from "@/components/marketing/CTASection";
import { HeroSearch } from "@/components/marketing/HeroSearch";
import { PathwayCards } from "@/components/marketing/PathwayCards";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { BrandMarquee } from "@/components/shared/BrandMarquee";
import { TestimonialMarquee } from "@/components/shared/TestimonialMarquee";
import { whyChoosePexpacks } from "@/data/packs";
import { testimonials } from "@/data/testimonials";
import styles from "@/components/marketing/Marketing.module.css";

export default function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <p className={styles.eyebrow}>Save time, Pex it.</p>
            <h1 className={styles.heroTitle}>
              Start School
              <br className={styles.mobileBreak} /> Ready
            </h1>
            <p className={styles.heroLead}>
              No queues. No confusion. No missing items.
            </p>
            <HeroSearch />
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
                <li>Optional: Books pre-covered and labelled via Pexcover</li>
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
          <div className={styles.splitBand}>
            <div className={styles.unboxingImageWrap}>
              <Image
                src="/images/office-packs.webp"
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
                <Button href="/office-packs" variant="secondary">View Office Packs</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionCream}>
        <div className={styles.inner}>
          <SectionHeader
            eyebrow="Why Pexpacks"
            title="The Pexpacks Promise"
            text="We save you time, reduce stress, and guarantee quality you can trust."
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

      <BrandMarquee />

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
