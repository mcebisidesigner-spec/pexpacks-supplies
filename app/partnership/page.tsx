import type { Metadata } from 'next'
import Link from 'next/link'
import { PartnerForm } from '@/components/forms/PartnerForm'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/marketing/PageHero'
import { SectionHeader } from '@/components/marketing/SectionHeader'
import { getPublicSchoolIndex } from '@/lib/schools/publicSchoolData'
import { buildMetadata } from '@/lib/seo'
import sectionStyles from '@/components/marketing/MarketingSections.module.css'
import cardStyles from '@/components/marketing/MarketingCards.module.css'

const benefits = [
  'Your own school website with your own domain',
  'Free hosting, SSL, and maintenance — forever',
  'A parent ordering portal built around your lists',
  '2.5% of every pack sold back to your school',
  'Zero setup or ongoing fees — ever',
]

const steps = [
  {
    title: 'Send your grade lists',
    text: 'Share your approved stationery lists per grade. That is all we need to start.',
  },
  {
    title: 'We build your portal',
    text: 'Your school website and ordering system go live within days.',
  },
  {
    title: 'Share one link',
    text: 'Parents order through your school-branded link — we handle packing, payment, and delivery.',
  },
]

// DRAFT — placeholder testimonials for review. Replace these with confirmed
// quotes and permission before publishing.
const successStories = [
  {
    quote:
      'We stopped chasing stationery lists and started spending the saved time on learners. Our parents order online and the rebate lands in our development fund.',
    name: 'School Principal',
    school: 'Primary school, Gauteng',
  },
  {
    quote:
      'The free website alone was worth it. We finally have a proper online home, and parents can find their grade pack in seconds instead of phoning the office.',
    name: 'School Administrator',
    school: 'High school, Gauteng',
  },
  {
    quote:
      'Setup took days, not months. We shared one link with parents and Pexpacks handled the rest — packing, payments, and delivery all on time.',
    name: 'Head of Department',
    school: 'Primary school, Gauteng',
  },
]

const faqItems = [
  {
    q: 'Is the website and hosting really 100% free?',
    a: 'Yes. Zero setup costs, monthly fees, or hidden charges. Pexpacks covers all development and hosting costs out of our standard stationery margins.',
  },
  {
    q: 'How does the 2.5% rebate work?',
    a: "Every time a parent orders through your school portal, 2.5% of the pack cost goes to your school's development fund. We transfer it annually.",
  },
  {
    q: 'Does this create admin work for my staff?',
    a: 'None. We handle packing, delivery, payments, and parent support. Your staff do nothing after sharing the link.',
  },
  {
    q: 'How long does it take to go live?',
    a: 'Once we receive your grade lists, we typically launch your school portal within 48 hours.',
  },
  {
    q: 'What happens after I apply?',
    a: 'We review your enquiry and get in touch to confirm your grade lists and launch your school portal. There is nothing to pay at any point.',
  },
]

// Real partner schools, verified against the school index.
const PARTNER_SCHOOL_NAMES = [
  'St Francis College',
  'Redhill School',
  'Reddam House Waterfall Estate',
  'The Ridge Preparatory School',
  'Centennial Schools',
  'Curro Hazeldean High School',
  'Michael Mount Waldorf School',
  'Spark Turffontein',
  'Nova Pioneer Paulshof',
  'Curro Savanna City',
  'Grayston Preparatory School',
  "The King's School Linbro",
]

export const metadata: Metadata = buildMetadata(
  'Partner With Pexpacks | Free School Website',
  'Partner with Pexpacks and get a free school website, parent ordering portal, and 2.5% fundraising rebate on every pack sold.',
  '/partnership',
)

export const dynamic = 'force-static'

export default async function PartnerWithSchoolsPage() {
  const schoolIndex = await getPublicSchoolIndex()
  const partnerCount = schoolIndex.filter((school) => school.isPartnerSchool)
    .length

  const stats = [
    { value: `${partnerCount}+`, label: 'schools already partnering' },
    { value: '2.5%', label: 'rebate to your development fund' },
    { value: '48h', label: 'from list to live portal' },
    { value: 'R0', label: 'setup or monthly fees' },
  ]

  return (
    <>
      <PageHero
        eyebrow="Partner with us"
        title="Free school website + stationery fundraising."
        text="Become an official Pexpacks partner. We build and host your school's website and parent ordering portal for free — and your school earns 2.5% on every pack sold."
        panelTitle="What your school gets"
        panelText="Free website, hosting, SSL, parent portal & 2.5% rebate"
      >
        <div className={sectionStyles.buttonRow}>
          <Button href="#partner-form" variant="primary">
            Apply to Partner
          </Button>
          <Button href="#how-it-works" variant="white">
            How It Works
          </Button>
        </div>
        <p
          style={{
            marginTop: 18,
            fontSize: 14,
            color: 'var(--pex-text-muted)',
          }}
        >
          <Link
            href="#success-stories"
            style={{ color: 'var(--pex-keppel)', fontWeight: 800 }}
          >
            See success stories &rarr;
          </Link>
        </p>
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
            Trusted by schools like
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
            {PARTNER_SCHOOL_NAMES.map((name) => (
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

      <section
        className={sectionStyles.sectionAlt}
        id="success-stories"
        aria-labelledby="partnership-stories-heading"
      >
        <div className={sectionStyles.inner}>
          <SectionHeader
            eyebrow="Partner success stories"
            title="Schools that already partner with us"
            text="Real schools across Gauteng use Pexpacks to cut stationery admin and raise funds. Here is what they say."
            headingId="partnership-stories-heading"
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 22,
            }}
          >
            {successStories.map((story) => (
              <article
                key={story.name}
                className={cardStyles.packCard}
                style={{ padding: 28 }}
              >
                <div
                  className={cardStyles.packCardHead}
                  style={{ padding: 0 }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: 3,
                      color: 'var(--pex-keppel)',
                    }}
                    aria-label="5 out of 5 stars"
                  >
                    {Array.from({ length: 5 }, (_, i) => (
                      <svg
                        key={i}
                        viewBox="0 0 20 20"
                        style={{ width: 18, height: 18 }}
                      >
                        <path
                          fill="currentColor"
                          d="M10 1.5l2.5 5.1 5.6.8-4 3.9.9 5.6L10 14.1l-5 2.6.9-5.6-4-3.9 5.6-.8z"
                        />
                      </svg>
                    ))}
                  </div>
                </div>
                <div
                  className={cardStyles.packCardBody}
                  style={{ padding: 0 }}
                >
                  <p
                    style={{
                      margin: '14px 0 0',
                      fontSize: 16,
                      lineHeight: 1.55,
                      color: 'var(--pex-text)',
                    }}
                  >
                    &ldquo;{story.quote}&rdquo;
                  </p>
                  <p style={{ margin: '16px 0 0' }}>
                    <strong
                      style={{
                        display: 'block',
                        color: 'var(--pex-navy)',
                        fontSize: 15,
                      }}
                    >
                      {story.name}
                    </strong>
                    <span
                      style={{
                        color: 'var(--pex-text-muted)',
                        fontSize: 14,
                      }}
                    >
                      {story.school}
                    </span>
                  </p>
                </div>
              </article>
            ))}
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

      <section className={sectionStyles.sectionAlt} id="partnership-faq">
        <div className={sectionStyles.inner}>
          <p className={sectionStyles.sectionEyebrow}>FAQ</p>
          <h2
            style={{
              margin: 0,
              fontSize: 'clamp(32px, 4.6vw, 56px)',
              lineHeight: 1,
              fontWeight: 800,
            }}
          >
            Common questions
          </h2>
          <p
            style={{
              margin: '14px 0 0',
              color: 'var(--pex-text-muted)',
              fontSize: 18,
              lineHeight: 1.45,
            }}
          >
            Straight answers for school boards, principals, and admin teams.
          </p>
          <div
            style={{
              display: 'grid',
              gap: 16,
              marginTop: 36,
              maxWidth: 860,
              marginInline: 'auto',
            }}
          >
            {faqItems.map((item, index) => (
              <details
                key={index}
                style={{
                  border: 'var(--card-border)',
                  borderRadius: 20,
                  background: 'var(--card-bg)',
                  boxShadow: 'var(--card-shadow)',
                  overflow: 'hidden',
                }}
              >
                <summary
                  style={{
                    padding: '22px 28px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 18,
                    cursor: 'pointer',
                    color: 'var(--pex-navy)',
                    fontSize: 16,
                    fontWeight: 800,
                    listStyle: 'none',
                    userSelect: 'none',
                  }}
                >
                  <span>{item.q}</span>
                </summary>
                <div
                  style={{
                    padding: '0 28px 22px',
                    color: 'var(--color-text-muted)',
                    fontSize: 15,
                    lineHeight: 1.6,
                    borderTop: '1px solid rgba(26, 42, 64, 0.04)',
                  }}
                >
                  <p style={{ margin: '12px 0 0' }}>{item.a}</p>
                </div>
              </details>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <Link
              href="/faq"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 22px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(33, 158, 154, 0.1)',
                color: 'var(--pex-keppel)',
                fontWeight: 800,
                fontSize: 15,
                textDecoration: 'none',
              }}
            >
              Read all FAQs &rarr;
            </Link>
          </div>
        </div>
      </section>

      <section className={sectionStyles.section} id="partner-form">
        <div className={sectionStyles.inner}>
          <PartnerForm />
        </div>
      </section>
    </>
  )
}
