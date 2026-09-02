import type { Metadata } from 'next'
import { PartnerForm } from '@/components/forms/PartnerForm'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/marketing/PageHero'
import { getPublicSchoolIndex } from '@/lib/schools/publicSchoolData'
import { getWebsiteContent, getFaqs } from '@/lib/cms'
import { buildMetadata } from '@/lib/seo'
import { FaqMarquee } from '@/components/shared/FaqMarquee'
import type { FAQ } from '@/data/faqs'
import sectionStyles from '@/components/marketing/MarketingSections.module.css'
import cardStyles from '@/components/marketing/MarketingCards.module.css'

const benefits = [
  'Your own school website with your own domain',
  'Free hosting, SSL, and maintenance — forever',
  'A parent ordering portal built around your lists',
  '1.5% of every pack sold back to your school',
  'Zero setup or ongoing fees — ever',
]

const steps = [
  {
    title: 'Send your grade lists',
    text: 'Share your approved stationery lists per grade. That is all we need to start.',
  },
  {
    title: 'We build your portal',
    text: 'Your school website and ordering system go live within 96 hours.',
  },
  {
    title: 'Share one link',
    text: 'Parents order through your school-branded link — we handle packing, payment, and delivery.',
  },
]

const fallbackPartnershipFaqs: FAQ[] = [
  {
    id: 'free-website',
    category: 'Schools',
    question: 'Is the website and hosting really 100% free?',
    answer:
      'Yes. Zero setup costs, monthly fees, or hidden charges. Pexpacks covers all development and hosting costs out of our standard stationery margins.',
    links: [
      { label: 'School partnership', href: '/partnership' },
      { label: 'School partnership terms', href: '/school-partnership-terms' },
    ],
  },
  {
    id: 'rebate-work',
    category: 'Schools',
    question: 'How does the 1.5% rebate work?',
    answer:
      "Every time a parent orders through your school portal, 1.5% of the pack cost goes to your school's development fund. We transfer it annually.",
    links: [
      { label: 'School partnership', href: '/partnership' },
      { label: 'Contact Pexpacks', href: '/contact' },
    ],
  },
  {
    id: 'admin-work',
    category: 'Schools',
    question: 'Does this create admin work for my staff?',
    answer:
      'None. We handle packing, delivery, payments, and parent support. Your staff do nothing after sharing the link.',
    links: [
      { label: 'Find school packs', href: '/schools' },
      { label: 'Contact support', href: '/contact' },
    ],
  },
  {
    id: 'time-to-live',
    category: 'Schools',
    question: 'How long does it take to go live?',
    answer:
      'Once we receive your grade lists, we typically launch your school portal within 96 hours.',
    links: [
      { label: 'Add your school', href: '/add-your-school' },
      { label: 'School partnership', href: '/partnership' },
    ],
  },
  {
    id: 'after-apply',
    category: 'Schools',
    question: 'What happens after I apply?',
    answer:
      'We review your enquiry and get in touch to confirm your grade lists and launch your school portal. There is nothing to pay at any point.',
    links: [
      { label: 'School partnership', href: '/partnership' },
      { label: 'Contact support', href: '/contact' },
    ],
  },
]

// Fictional examples only. Replace with approved partner names as the network grows.
const EXAMPLE_SCHOOL_NAMES = [
  'Willowcrest Learning Academy',
  'Cedarbrook Preparatory',
  'Northstar Heights School',
  'Brightfield College',
  'Meadowridge Learning School',
  'Silveroak Academy',
  'Riverstone Preparatory',
  'Greenhaven College',
  'Horizon Gate School',
  'Maplewood Learning Academy',
  'Sunrise Ridge Preparatory',
  'Bluebell Heights School',
]

export const metadata: Metadata = buildMetadata(
  'Partner With Pexpacks | Free School Website',
  'Partner with Pexpacks and get a free school website, parent ordering portal, and 1.5% fundraising rebate on every pack sold.',
  '/partnership',
)

export const dynamic = 'force-static'

export default async function PartnerWithSchoolsPage() {
  const [schoolIndex, content, cmsFaqs] = await Promise.all([
    getPublicSchoolIndex(),
    getWebsiteContent(),
    getFaqs('partnership'),
  ])
  const displayFaqs: FAQ[] =
    cmsFaqs && cmsFaqs.length > 0
      ? cmsFaqs
      : fallbackPartnershipFaqs
  const hero = content['partnership.hero']
  const heroEyebrow =
    typeof hero?.eyebrow === 'string' && hero.eyebrow
      ? hero.eyebrow
      : 'Partner with us'
  const heroTitle =
    typeof hero?.title === 'string' && hero.title
      ? hero.title
      : 'Empower your school with effortless stationery packs.'
  const partnerCount = schoolIndex.filter((school) => school.isPartnerSchool)
    .length

  const stats = [
    { value: `${partnerCount}+`, label: 'schools already partnering' },
    { value: '1.5%', label: 'rebate to your development fund' },
    { value: '96h', label: 'from list to live portal' },
    { value: 'R0', label: 'setup or monthly fees' },
  ]

  return (
    <>
      <PageHero
        eyebrow={heroEyebrow}
        title={heroTitle}
        text="Become an official Pexpacks partner. We build and host your school's website and parent ordering portal for free — and your school earns 1.5% on every pack sold."
        panelTitle="What your school gets"
        panelText="Free website, hosting, SSL, parent portal & 1.5% rebate"
      >
        <div className={sectionStyles.buttonRow}>
          <Button href="#partner-form" variant="primary">
            Apply to Partner
          </Button>
          <Button href="#how-it-works" variant="white">
            How It Works
          </Button>
        </div>
      </PageHero>

      <section
        className={sectionStyles.socialProofSection}
        aria-labelledby="partnership-stats-heading"
      >
        <div className={sectionStyles.inner}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 14,
              textAlign: 'center',
            }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                style={{
                  border: 'var(--card-border)',
                  borderRadius: 20,
                  background: 'var(--card-bg)',
                  boxShadow: 'var(--card-shadow)',
                  padding: '26px 16px',
                }}
              >
                <strong
                  style={{
                    display: 'block',
                    fontSize: 'clamp(34px, 4.5vw, 52px)',
                    lineHeight: 1,
                    color: 'var(--pex-primary)',
                  }}
                >
                  {stat.value}
                </strong>
                <span
                  style={{
                    display: 'block',
                    marginTop: 8,
                    color: 'var(--pex-text-muted)',
                    fontSize: 14,
                    fontWeight: 700,
                    lineHeight: 1.4,
                  }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
          <p
            id="partnership-stats-heading"
            className={sectionStyles.sectionEyebrow}
            style={{ textAlign: 'center', margin: '36px 0 14px' }}
          >
            Example schools we are built to support
          </p>
          <ul
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 10,
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}
          >
            {EXAMPLE_SCHOOL_NAMES.map((name) => (
              <li
                key={name}
                style={{
                  padding: '9px 16px',
                  border: '1px solid var(--color-teal-border)',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--color-teal-subtle)',
                  color: 'var(--pex-primary)',
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <div className={sectionStyles.splitBand}>
            <div>
              <p className={sectionStyles.sectionEyebrow}>
                Everything included
              </p>
              <h2>
                Your school gets a complete online presence — at no cost.
              </h2>
              <p>
                Designate Pexpacks as your official stationery partner and we
                build, host, and maintain a professional school website with a
                dedicated parent ordering portal. No invoices, no admin, no
                hidden fees.
              </p>
              <div className={sectionStyles.buttonRow}>
                <Button href="#partner-form" variant="primary">
                  Get your free school website
                </Button>
                <Button href="#how-it-works" variant="outline">
                  How It Works
                </Button>
              </div>
            </div>
            <ul className={sectionStyles.checkList}>
              {benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={sectionStyles.section} id="how-it-works">
        <div className={sectionStyles.inner}>
          <p className={sectionStyles.sectionEyebrow}>3 steps</p>
          <h2
            style={{
              margin: 0,
              fontSize: 'clamp(32px, 4.6vw, 56px)',
              lineHeight: 1,
              fontWeight: 800,
            }}
          >
            Go live in 3 steps
          </h2>
          <p
            style={{
              margin: '14px 0 34px',
              color: 'var(--pex-text-muted)',
              fontSize: 18,
              lineHeight: 1.45,
            }}
          >
            From list upload to live link — no IT meetings needed.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 22,
            }}
          >
            {steps.map((step, i) => (
              <div
                key={step.title}
                className={cardStyles.packCard}
                style={{ textAlign: 'center' }}
              >
                <div className={cardStyles.packCardHead}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      background: 'var(--pex-keppel)',
                      color: '#fff',
                      fontSize: 22,
                      fontWeight: 800,
                      display: 'grid',
                      placeItems: 'center',
                      margin: '0 auto 14px',
                    }}
                  >
                    {i + 1}
                  </div>
                  <h3 style={{ fontSize: 20, margin: 0 }}>{step.title}</h3>
                </div>
                <div className={cardStyles.packCardBody}>
                  <p className={cardStyles.packDescription}>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div id="partnership-faq">
        <FaqMarquee
          faqs={displayFaqs}
          eyebrow="FAQ"
          title="Common questions"
          seeAllHref="/faq"
        />
      </div>

      <section className={sectionStyles.section} id="partner-form">
        <div className={sectionStyles.inner}>
          <PartnerForm />
        </div>
      </section>
    </>
  )
}
