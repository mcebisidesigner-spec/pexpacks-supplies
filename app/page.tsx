import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/marketing/SectionHeader'
import { HeroSearch } from '@/components/marketing/HeroSearch'
import { ConciergeSection } from '@/components/marketing/ConciergeSection'
import { SuperpowerSection } from '@/components/marketing/SuperpowerSection'
import { FaqMarquee } from '@/components/shared/FaqMarquee'
import { TestimonialMarquee } from '@/components/shared/TestimonialMarquee'
import { IMAGE_BLUR_DATA_URL } from '@/lib/constants'
import { faqs } from '@/data/faqs'
import { testimonials } from '@/data/testimonials'
import { SavingsPlanBanner } from '@/components/savings/SavingsPlanBanner'
import { SavingsTimeline } from '@/components/savings/SavingsTimeline'

import heroStyles from '@/components/marketing/HeroBase.module.css'
import sectionStyles from '@/components/marketing/MarketingSections.module.css'
import homeStyles from '@/components/marketing/MarketingHome.module.css'

export default function HomePage() {
  return (
    <>
      {/* Announcement/urgency bar */}
      <div className={homeStyles.announcementBar}>
        <p className={homeStyles.announcementText}>
          <span aria-hidden="true">🎒</span>
          {' '}Free delivery on orders over R500
          <span className={homeStyles.announcementDivider} aria-hidden="true" />
          <span>Pay on delivery</span>
          <span className={homeStyles.announcementDivider} aria-hidden="true" />
          <span>Lay-by available</span>
        </p>
      </div>

      <section className={heroStyles.heroNavy}>
        <div className={heroStyles.heroInner}>
          <div>
            <p className={heroStyles.eyebrow}>School stationery made simple</p>
            <h1 className={heroStyles.heroTitle}>
              Your school <br />
              stationery list, <br /> perfectly packed.
            </h1>
            <p className={heroStyles.heroLead}>
              We match your school&rsquo;s official list exactly &mdash; no
              hunting, no guessing. <strong>Packs from R249.</strong>
            </p>
            <HeroSearch />
            <div className={homeStyles.heroTrustRow}>
              <span className={homeStyles.heroTrustItem}>
                <span className={homeStyles.heroTrustIcon} aria-hidden="true">🏆</span>
                Trusted by 10,000+ parents
              </span>
              <span className={homeStyles.heroTrustItem}>
                <span className={homeStyles.heroTrustIcon} aria-hidden="true">🏫</span>
                3,000+ schools covered
              </span>
              <span className={homeStyles.heroTrustItem}>
                <span className={homeStyles.heroTrustIcon} aria-hidden="true">✅</span>
                100% list match guarantee
              </span>
            </div>
            <div className={homeStyles.heroActions}>
              <a href="/track-order" className={homeStyles.heroSecondaryLink}>
                <span aria-hidden="true">📦</span> Track your order
              </a>
              <a href="/lay-by" className={homeStyles.heroSecondaryLink}>
                <span aria-hidden="true">💳</span> Pay in 3 with lay-by
              </a>
            </div>
          </div>

          <div className={heroStyles.heroVisual}>
            <span className={heroStyles.heroVisualImage}>
              <Image
                src="/images/hero-school-delivery-packs.webp"
                alt="Pexpacks Stationery Box"
                fill
                priority
                placeholder="blur"
                blurDataURL={IMAGE_BLUR_DATA_URL}
                sizes="(min-width: 1024px) 44vw, 100vw"
              />
            </span>
          </div>
        </div>
      </section>

      <div className={homeStyles.brandMarquee} aria-hidden="true">
        <div className={homeStyles.brandMarqueeTrack}>
          {[
            'croxley',
            'bic',
            'pilot',
            'pritt',
            'staedtler',
            'post-it',
            'bantex',
            'penflex',
            'freedom',
            'casio',
            'marlin',
            'pentel',
            'rapid',
            'rexel',
            'sellotape',
            'stabilo',
            'sharpie',
            'croxley',
            'bic',
            'pilot',
            'pritt',
            'staedtler',
            'post-it',
            'bantex',
            'penflex',
            'freedom',
            'casio',
            'marlin',
            'pentel',
            'rapid',
            'rexel',
            'sellotape',
            'stabilo',
            'sharpie',
          ].map((brand, i) => (
            <span key={i} className={homeStyles.brandChip}>
              <Image
                src={`/images/stationery-brands/${brand}.svg`}
                alt={`${brand} logo`}
                width={80}
                height={40}
                style={{ objectFit: 'contain', display: 'block' }}
              />
            </span>
          ))}
        </div>
      </div>

      {/* Trust metrics */}
      <section className={homeStyles.trustStrip} aria-label="Pexpacks by the numbers">
        <div className={homeStyles.trustInner}>
          <div className={homeStyles.trustGrid}>
            <div className={homeStyles.trustCard}>
              <strong className={homeStyles.trustCardValue}>3,342+</strong>
              <span className={homeStyles.trustCardLabel}>Schools covered across Gauteng</span>
            </div>
            <div className={homeStyles.trustCard}>
              <strong className={homeStyles.trustCardValue}>10,000+</strong>
              <span className={homeStyles.trustCardLabel}>Packs delivered to parents</span>
            </div>
            <div className={homeStyles.trustCard}>
              <strong className={homeStyles.trustCardValue}>269</strong>
              <span className={homeStyles.trustCardLabel}>Official school partners</span>
            </div>
            <div className={homeStyles.trustCard}>
              <strong className={homeStyles.trustCardValue}>100%</strong>
              <span className={homeStyles.trustCardLabel}>List match guarantee</span>
            </div>
          </div>
        </div>
      </section>

      <section
        id="social-proof"
        className={sectionStyles.socialProofSection}
        aria-labelledby="home-social-proof-heading"
      >
        <div className={sectionStyles.inner}>
          <div className={sectionStyles.socialProofPanel}>
            <div className={sectionStyles.socialProofMedia}>
              <Image
                src="/images/pex-stationery-box-v2.webp"
                alt="Learners holding Pexpacks Stationery Box"
                fill
                placeholder="blur"
                blurDataURL={IMAGE_BLUR_DATA_URL}
                sizes="(min-width: 1280px) 700px, (min-width: 820px) 55vw, 100vw"
              />
              <div
                className={sectionStyles.socialProofSeal}
                aria-label="Trusted parent validation"
              >
                <strong>100%</strong>
                <span>List match promise</span>
              </div>
            </div>

            <div className={sectionStyles.socialProofCopy}>
              <p className={sectionStyles.sectionEyebrow}>Parent validation</p>
              <h2 id="home-social-proof-heading">
                Real packs. Real schools. Real peace of mind.
              </h2>
              <blockquote>
                &ldquo; Pexpacks delivered the exact pack our daughter needed.
                List accurate and delivered timeously.&rdquo;
              </blockquote>
              <p className={sectionStyles.socialProofAuthor}>
                Sarah, Grade 10 Parent
              </p>
              <div
                className={sectionStyles.socialProofStats}
                aria-label="Pexpacks trust highlights"
              >
                <span>School-accurate lists</span>
                <span>Named learner packs</span>
                <span>Delivered before term starts</span>
              </div>
              <Button
                href="/schools#schools-search"
                variant="primary"
                size="lg"
              >
                Find my school pack
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SuperpowerSection />

      <ConciergeSection />

      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <SavingsPlanBanner variant="homepage" />
          <div style={{ marginTop: 24 }}>
            <SavingsTimeline />
          </div>
        </div>
      </section>


      <section
        className={sectionStyles.section}
        aria-labelledby="home-testimonials"
      >
        <div className={sectionStyles.inner}>
          <SectionHeader
            eyebrow="Real parents, real results"
            title="Hear from our parents"
            text="Read what other parents are saying about the Pexpacks experience."
            headingId="home-testimonials"
          />
          <TestimonialMarquee items={testimonials} />
        </div>
      </section>

      <FaqMarquee
        faqs={faqs.filter((f) =>
          [
            'school-not-listed',
            'delivery-timing',
            'exercise-books',
            'payment-flow',
            'find-grade-pack',
          ].includes(f.id),
        )}
      />
    </>
  )
}
