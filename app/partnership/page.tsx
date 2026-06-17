import type { Metadata } from 'next'
import Link from 'next/link'
import { PartnerForm } from '@/components/forms/PartnerForm'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/marketing/PageHero'
import { buildMetadata } from '@/lib/seo'
import sectionStyles from '@/components/marketing/MarketingSections.module.css'
import cardStyles from '@/components/marketing/MarketingCards.module.css'

const benefits = [
  'Custom school website with your own domain',
  'Free hosting, SSL, and all maintenance',
  'Dedicated parent ordering portal',
  '5% development-fund rebate on every pack sold',
  'Zero setup or ongoing fees — ever',
]

const steps = [
  {
    title: 'Share your grade lists',
    text: 'Send us your approved stationery lists per grade.',
  },
  {
    title: 'We build your portal',
    text: 'Our team sets up your school website and ordering system within days.',
  },
  {
    title: 'Share one link',
    text: 'Parents order through your school-branded link — we handle the rest.',
  },
]

const faqItems = [
  {
    q: 'Is the website and hosting really 100% free?',
    a: 'Yes. Zero setup costs, monthly fees, or hidden charges. Pexpacks covers all development and hosting costs out of our standard stationery margins.',
  },
  {
    q: 'How does the 5% rebate work?',
    a: "Every time a parent orders through your school portal, 5% of the pack cost goes to your school's development fund. We transfer it annually.",
  },
  {
    q: 'Does this create admin work for my staff?',
    a: 'None. We handle packing, delivery, payments, and parent support. Your staff do nothing after sharing the link.',
  },
  {
    q: 'How long does it take to go live?',
    a: 'Once we receive your grade lists, we typically launch your school portal within 48 hours.',
  },
]

export const metadata: Metadata = buildMetadata(
  'Partner With Pexpacks | Free School Website',
  'Partner with Pexpacks and get a free school website, parent ordering portal, and 5% fundraising rebate on every pack sold.',
  '/partnership',
)

export const dynamic = 'force-static'

export default function PartnerWithSchoolsPage() {
  return (
    <>
      <PageHero
        eyebrow="Partner with us"
        title="Free school website + stationery fundraising."
        panelTitle="What your school gets"
        panelText="Free website, hosting, SSL, parent portal &amp; 5% rebate"
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

      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <div className={sectionStyles.splitBand}>
            <div>
              <p className={sectionStyles.sectionEyebrow}>
                Everything included
              </p>
              <h2>Your school gets a complete online presence — at no cost.</h2>
              <p>
                Designate Pexpacks as your official stationery partner and we
                build, host, and maintain a professional school website with a
                dedicated parent ordering portal. No invoices, no admin, no
                hidden fees.
              </p>
              <div className={sectionStyles.buttonRow}>
                <Button href="#partner-form" variant="primary">
                  Apply to Partner
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

      <section className={sectionStyles.sectionAlt} id="how-it-works">
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
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
