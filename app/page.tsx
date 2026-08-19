import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/marketing/SectionHeader'
import { HeroSearch } from '@/components/marketing/HeroSearch'
import { ConciergeSection } from '@/components/marketing/ConciergeSection'
import { SuperpowerSection } from '@/components/marketing/SuperpowerSection'
import {
  RetailVsPexpacksSlider,
  FaqMarquee,
  TestimonialMarquee,
  HappyPayBanner,
  HappyPaySteps,
} from '@/components/marketing/HomeBelowFold'
import { IMAGE_BLUR_DATA_URL } from '@/lib/constants'
import { getFaqs, getTestimonials, getWebsiteContent } from '@/lib/cms'
import { testimonials as confirmedTestimonials } from '@/data/testimonials'

import heroStyles from '@/components/marketing/HeroBase.module.css'
import sectionStyles from '@/components/marketing/MarketingSections.module.css'
import homeStyles from '@/components/marketing/MarketingHome.module.css'

export const revalidate = 300

export default async function HomePage() {
  const [testimonials, allFaqs, content] = await Promise.all([
    getTestimonials(),
    getFaqs(),
    getWebsiteContent(),
  ])
  const hero = content['homepage.hero']
  const heroEyebrow =
    typeof hero.eyebrow === 'string' && hero.eyebrow
      ? hero.eyebrow
      : 'School stationery made simple'
  const heroTitle =
    typeof hero.title === 'string' && hero.title
      ? hero.title
      : 'Your school stationery list, perfectly packed.'
  const heroLead =
    typeof hero.lead === 'string' && hero.lead
      ? hero.lead
      : 'Your official school stationery list, perfectly packed and delivered.'
  const featuredTestimonial = testimonials[0] ?? confirmedTestimonials[0]
  return (
    <>
      <section className={heroStyles.heroNavy}>
        <div className={heroStyles.heroInner}>
          <div>
            <p className={heroStyles.eyebrow}>{heroEyebrow}</p>
            <h1 className={heroStyles.heroTitle}>{heroTitle}</h1>
            <p className={heroStyles.heroLead}>{heroLead}</p>
            <HeroSearch />
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

      <section className={sectionStyles.section} style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className={sectionStyles.inner}>
          <HappyPayBanner variant="homepage" />
          <div style={{ marginTop: 24 }}>
            <HappyPaySteps />
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
              {featuredTestimonial ? (
                <>
                  <blockquote>&ldquo;{featuredTestimonial.quote}&rdquo;</blockquote>
                  <p className={sectionStyles.socialProofAuthor}>
                    {featuredTestimonial.name}, {featuredTestimonial.role}
                  </p>
                </>
              ) : null}
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
                data-conversion-event="homepage_find_school_pack"
              >
                Find my school pack
              </Button>
            </div>
          </div>
        </div>
      </section>

      <RetailVsPexpacksSlider />

      <SuperpowerSection />

      <ConciergeSection />

      {testimonials.length > 0 ? (
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
      ) : null}

      <FaqMarquee
        faqs={allFaqs.filter((f) =>
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
