import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { CTASection } from "@/components/marketing/CTASection";
import { HeroSearch } from "@/components/marketing/HeroSearch";
import { PackCard } from "@/components/marketing/PackCard";
import { PathwayCards } from "@/components/marketing/PathwayCards";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import {
  featuredPacks,
  homeProcessSteps,
  sponsorshipExamples,
  trustBadges,
  whyChoosePexPacks,
} from "@/data/packs";
import { testimonials } from "@/data/testimonials";
import styles from "@/components/marketing/Marketing.module.css";

export default function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <p className={styles.eyebrow}>Save time. Pex it.</p>
            <h1 className={styles.heroTitle}>Start School<br className={styles.mobileBreak} /> Ready</h1>
            <p className={styles.heroLead}>
              Everything your child needs for day one is already packed and ready.
            </p>
            <HeroSearch />
            <ul className={styles.trustBadges} aria-label="PexPacks trust points">
              {trustBadges.map((badge) => (
                <li key={badge}>{badge}</li>
              ))}
            </ul>
          </div>

          <div className={styles.heroVisual}>
            <span className={styles.heroVisualImage}>
              <Image
                src="/images/hero-school-delivery.webp"
                alt="PexPacks stationery and convenience pack items arranged neatly"
                fill
                priority
                sizes="(min-width: 1024px) 44vw, 100vw"
              />
            </span>
            <div className={styles.productScene}>
              <div className={styles.brandBox}>
                <div>
                  <span>PexPacks</span>
                  <br />
                  <strong>Convenience Packs</strong>
                </div>
                <p>School lists, office basics and household essentials prepared in one ready pack.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionHeader
            centered
            title="Choose the pack journey that fits you"
            text="Parents, schools, offices and households can move straight to the pack category they need."
          />
          <PathwayCards />
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.inner}>
          <SectionHeader
            title="How it works"
            text="A simple process built for school mornings, office admin and home routines."
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

      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionHeader
            title="Why choose PexPacks?"
            text="Because convenience should save you time, reduce stress and help you stay prepared."
          />
          <div className={styles.benefitGrid}>
            {whyChoosePexPacks.map((benefit) => (
              <article className={styles.benefitCard} key={benefit.title}>
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionCream}>
        <div className={styles.inner}>
          <SectionHeader
            title="Featured packs"
            text="Sample pack options that show how PexPacks covers school, office and home needs."
          />
          <div className={styles.packGrid}>
            {featuredPacks.map((pack) => (
              <PackCard pack={pack} key={pack.id} />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.splitBand}>
            <div>
              <p className={styles.eyebrow}>School partnerships</p>
              <h2>A smarter way for schools to support parents</h2>
              <p>
                PexPacks partners with schools to simplify stationery ordering and provide free standardised school
                websites for approved partner schools. Each website can support school communication, stationery pack
                links, sponsor pages and parent information.
              </p>
              <p>
                PexPacks provides and manages the website platform, while schools approve their official content and
                communication.
              </p>
              <div className={styles.buttonRow}>
                <Button href="/partner-with-schools">Partner With PexPacks</Button>
                <Button href="/partner-with-schools#sponsor" variant="white">
                  Sponsor a School
                </Button>
              </div>
            </div>
            <ul className={styles.checkList}>
              <li>Free school website template</li>
              <li>School stationery list pages</li>
              <li>Parent order links</li>
              <li>Sponsor visibility pages</li>
              <li>Improved communication</li>
              <li>Community support channel</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.inner}>
          <div className={styles.darkBand}>
            <div>
              <p className={styles.eyebrow}>Sponsors and donors</p>
              <h2>A safer way for sponsors to support schools</h2>
              <p>
                PexPacks helps local businesses, donors and community sponsors support schools through structured packs,
                visible sponsorship pages and transparent school support campaigns.
              </p>
              <div className={styles.buttonRow}>
                <Button href="/partner-with-schools#sponsor" variant="white">
                  Become a Sponsor
                </Button>
              </div>
            </div>
            <ul className={styles.checkList}>
              {sponsorshipExamples.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionHeader
            centered
            title="What PexPacks should feel like"
            text="Short proof points for parents, schools and SMEs."
          />
          <div className={styles.testimonialsGrid}>
            {testimonials.slice(0, 3).map((item) => (
              <article className={styles.testimonialCard} key={item.name}>
                <h3>{item.name}</h3>
                <p>{item.quote}</p>
                <span className={styles.role}>{item.role}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to save time? PexPacks it."
        text="Choose your school, office or household pack and let PexPacks prepare the essentials for you."
        primaryHref="/schools"
        primaryLabel="Find Your School Pack"
        secondaryHref="/office-packs"
        secondaryLabel="View Office Packs"
      />
    </>
  );
}
