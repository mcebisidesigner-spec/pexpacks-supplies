import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { CTASection } from "@/components/marketing/CTASection";
import { HeroSearch } from "@/components/marketing/HeroSearch";
import { PackCard } from "@/components/marketing/PackCard";
import { PackCardSlider } from "@/components/marketing/PackCardSlider";
import { PathwayCards } from "@/components/marketing/PathwayCards";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { LogoMarquee } from "@/components/shared/LogoMarquee";
import { TestimonialMarquee } from "@/components/shared/TestimonialMarquee";
import {
  homepagePacks,
  homeProcessSteps,
  sponsorshipExamples,
  trustBadges,
  whyChoosePexpacks,
} from "@/data/packs";
import { partnerLogos } from "@/data/partners";
import { testimonials } from "@/data/testimonials";
import styles from "@/components/marketing/Marketing.module.css";

export default function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <p className={styles.eyebrow}>Save time. Pex it.</p>
            <h1 className={styles.heroTitle}>
              Start School
              <br className={styles.mobileBreak} /> Ready
            </h1>
            <p className={styles.heroLead}>
              Everything your child needs for the first day is already packed
              and ready.
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
                alt="PexPacks stationery pack items arranged neatly"
                fill
                priority
                sizes="(min-width: 1024px) 44vw, 100vw"
              />
            </span>
            <div className={styles.productScene}>
              <div className={styles.brandBox}>
                <div>
                  <span>Personal Convenience Packs</span>
                  <br />
                  <strong>Stationery Packs</strong>
                </div>
                <p>
                  Complete school stationery packs prepared according to your
                  child’s school list and grade requirements. Pexpacks also
                  supplies practical office stationery packs for SMEs and home
                  offices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.logoMarqueeSection}>
        <div className={styles.inner}>
           <p className={styles.miniTrust} style={{textAlign: "center", marginBottom: "16px"}}>Trusted by schools and suppliers</p>
           <LogoMarquee partners={partnerLogos} />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionHeader
            title="Choose the pack that fits you"
            text="Whether you’re a parent, school, or office administrator, you can start with what you need right now."
          />
          <PathwayCards />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionHeader
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
              <p className={styles.eyebrow}>The PexPacks Box</p>
              <h2>What's inside your stationery pack?</h2>
              <p>
                Every PexPacks box is carefully packed with exactly what is on your school's list. No more driving around to different stores to find specific brands or items.
              </p>
              <ul className={styles.checkList} style={{marginTop: "24px"}}>
                <li>Premium quality stationery brands</li>
                <li>Labelled with your child's grade</li>
                <li>Securely packed in a sturdy box</li>
                <li>Ready for the first day of school</li>
              </ul>
            </div>
            <div className={styles.unboxingImageWrap}>
              <Image 
                src="/images/hero-school-delivery.webp" 
                alt="PexPacks open box showing stationery inside" 
                fill
                style={{objectFit: "cover"}}
              />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionHeader
            title="Why choose Pexpacks?"
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
            title="Choose Your Pack"
            text="Ready-packed stationery for every learner, grade, and school."
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
            <div>
              <p className={styles.eyebrow}>School partnerships</p>
              <h2>A smarter way for schools to support parents</h2>
              <p>
                Pexpacks school partnership programme provides schools with a
                free standardised school website. We design and personalise the
                website template with the school's branding and logo. We also
                provide free hosting and maintenance for all partner schools.
              </p>
              <p>
                Pexpacks provides and manages the website platform, while
                schools approve their official content and communication.
              </p>
              <div className={styles.buttonRow}>
                <Button href="/partner-with-schools">
                  Partner With Pexpacks
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

      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.darkBand}>
            <div>
              <p className={styles.eyebrow}>Sponsors and donors</p>
              <h2>A safer way for sponsors to support schools</h2>
              <p>
                Pexpacks helps local businesses, donors and community sponsors
                support schools through structured packs, visible sponsorship
                pages and transparent school support campaigns.
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

      <section
        className={styles.section}
        aria-labelledby="home-testimonials-heading">
        <div className={styles.inner}>
          <SectionHeader
            eyebrow="Real parents. Real schools. Real results."
            title="What South African Parents Say"
            headingId="home-testimonials-heading"
          />
          <TestimonialMarquee items={testimonials} />
        </div>
      </section>

      <section className={styles.sectionCream}>
        <div className={styles.inner}>
          <SectionHeader
            title="Frequently Asked Questions"
            text="Got questions? We've got answers."
          />
          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary>What if my child's school isn't listed?</summary>
              <p>You can still order a standard grade-specific pack, or contact us to have your school added to our database.</p>
            </details>
            <details className={styles.faqItem}>
              <summary>How long does delivery take?</summary>
              <p>Orders are typically processed and delivered within 3-5 business days across Gauteng.</p>
            </details>
            <details className={styles.faqItem}>
              <summary>Are the stationery brands high quality?</summary>
              <p>Yes, we only use trusted, premium brands that meet or exceed school requirements to ensure they last the entire year.</p>
            </details>
          </div>
        </div>
      </section>

      <CTASection
        title="PexPacks gets stationery packed right."
        text="Choose your school or office pack and let PexPacks prepare your stationery for you."
        primaryHref="/schools"
        primaryLabel="Find Your School Pack"
        secondaryHref="/office-packs"
        secondaryLabel="Order Office Stationery"
      />
    </>
  );
}
