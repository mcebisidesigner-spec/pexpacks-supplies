import type { Metadata } from 'next'
import Link from 'next/link'
import { AddSchoolForm } from '@/components/forms/AddSchoolForm'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/marketing/PageHero'
import { SectionHeader } from '@/components/marketing/SectionHeader'
import { FaqMarquee } from '@/components/shared/FaqMarquee'
import { getFaqs, getWebsiteContent } from '@/lib/cms'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata(
  'Add Your School',
  'Submit your school details so Pexpacks can prepare a school stationery pack page for your grade lists.',
  '/add-your-school',
)

// ── Shared layout tokens ─────────────────────────────────────────────────────
const sectionCls =
  'py-[var(--section-padding-y-desktop)] bg-transparent max-lg:py-[var(--section-padding-y-tablet)] max-[480px]:py-[var(--section-padding-y-mobile)]'
const innerCls =
  'w-full max-w-[var(--layout-max-width)] mx-auto px-[var(--gutter-desktop)] max-lg:px-[var(--gutter-mobile)]'
const splitBandCls =
  'rounded-[var(--radius-section)] [border:var(--card-border)] p-[clamp(28px,5vw,54px)] grid grid-cols-[minmax(0,1fr)_minmax(260px,0.72fr)] gap-[clamp(28px,5vw,60px)] items-center bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] max-lg:grid-cols-1'
const sectionEyebrowCls =
  'm-[var(--section-eyebrow-margin)] text-[var(--section-eyebrow-color)] font-[var(--section-eyebrow-font-weight)] text-[var(--section-eyebrow-font-size)] tracking-[var(--section-eyebrow-letter-spacing)]'
const buttonRowCls =
  'mt-[26px] flex items-center flex-wrap gap-[var(--space-3)] max-lg:items-stretch max-lg:[&>*]:w-full'
const checkListCls =
  'm-0 p-0 list-none grid gap-[10px] [&_li]:relative [&_li]:pl-[28px] [&_li]:font-bold [&_li]:overflow-wrap-anywhere [&_li::before]:content-[""] [&_li::before]:absolute [&_li::before]:left-0 [&_li::before]:top-[0.38em] [&_li::before]:w-[12px] [&_li::before]:h-[12px] [&_li::before]:rounded-full [&_li::before]:bg-[var(--pex-keppel)]'

// ── Card tokens ──────────────────────────────────────────────────────────────
const infoGridCls = 'grid grid-cols-2 gap-[18px] max-lg:grid-cols-1'
const infoCardCls =
  'border-[var(--card-border)] rounded-[var(--radius-card)] bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] p-[26px]'
const packCardCls =
  'rounded-[var(--radius-card)] [border:var(--card-border)] bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] overflow-hidden flex flex-col relative'
const packCardHeadCls =
  'py-[var(--space-5)] px-[var(--space-5)] pb-[var(--space-3)] min-w-0'
const packTitleCls =
  'm-0 text-[var(--pex-primary)] font-[var(--font-heading)] text-[var(--text-xl)] font-[var(--font-weight-bold)] leading-[1.2]'
const packCardBodyCls =
  'px-[var(--space-5)] grow flex flex-col gap-[var(--space-5)]'
const packDescriptionCls =
  'text-[var(--pex-text-muted)] m-0 text-[15px] leading-[1.45]'
const packCardButtonWrapCls = 'px-[var(--space-5)] pb-[var(--space-5)]'
const cardLinkCls = 'mt-[var(--space-5)] text-[var(--pex-keppel)] font-extrabold'

// ── Form tokens ──────────────────────────────────────────────────────────────
const formCardCls =
  'p-[28px] [border:var(--card-border)] bg-[var(--card-bg)] rounded-[var(--radius-card-lg)] [box-shadow:var(--card-shadow)] max-[480px]:p-[22px]'

export default async function AddYourSchoolPage() {
  const [faqs, content] = await Promise.all([
    getFaqs("add_your_school"),
    getWebsiteContent(),
  ])
  const hero = content['add-your-school.hero']
  const heroEyebrow =
    typeof hero?.eyebrow === 'string' && hero.eyebrow
      ? hero.eyebrow
      : 'Not listed?'
  const heroTitle =
    typeof hero?.title === 'string' && hero.title
      ? hero.title
      : 'Bring your school list into the future.'
  return (
    <>
      <PageHero
        eyebrow={heroEyebrow}
        title={heroTitle}
        panelText="Need a pack today?"
        panelTitle="Use a standard grade combo while your school list is being reviewed."
      >
        <div className={buttonRowCls}>
          <Button href="#school-request-form" variant="primary">
            Add your school
          </Button>
          <Button href="#contact-faq" variant="white">
            Contact FAQs
          </Button>
        </div>
      </PageHero>

      <section className={sectionCls}>
        <div className={innerCls}>
          <div className={infoGridCls}>
            <article
              className={formCardCls}
              id="school-request-form"
            >
              {/* eyebrow — migrated from HeroBase.module.css */}
              <p className="m-0 mb-[var(--space-4)] text-[var(--pex-keppel)] font-extrabold text-[var(--text-sm)] tracking-[0]">
                School request
              </p>
              <h2>Submit school details</h2>
              <AddSchoolForm />
            </article>

            <article
              className={infoCardCls}
            >
              <SectionHeader
                eyebrow="How it works"
                title="What happens next?"
                text="Pexpacks checks whether the school can be added and whether a standard pack can help while the official list is prepared."
              />
              <ul className={checkListCls}>
                <li>We confirm the school name and location.</li>
                <li>We review the grade or stationery list requirement.</li>
                <li>We recommend a school-specific or standard grade pack.</li>
                <li>We help you move to an order or enquiry path.</li>
              </ul>
              <div className={buttonRowCls}>
                <Button href="/contact">Talk to Us</Button>
              </div>
            </article>
          </div>
        </div>
      </section>

      <div id="contact-faq">
        <FaqMarquee faqs={faqs} />
      </div>

      <section className={sectionCls}>
        <div className={innerCls}>
          <div
            className={splitBandCls}
          >
            <div>
              <p className={sectionEyebrowCls}>Already listed?</p>
              <h2>Find your school pack</h2>
              <p>
                Search for your school now &mdash; if we already have the list,
                you can order in seconds.
              </p>
              <div className={buttonRowCls}>
                <Button href="/schools" variant="primary">
                  Search Schools
                </Button>
                <Button href="/partnership" variant="white">
                  School Partnerships
                </Button>
              </div>
            </div>
            <div
              className={packCardCls}
            >
              <div className={packCardHeadCls}>
                <h3 className={packTitleCls}>Contact us</h3>
              </div>
              <div className={packCardBodyCls}>
                <p className={packDescriptionCls}>
                  Questions about the school request process? Reach out to the
                  Pexpacks support team.
                </p>
              </div>
              <div className={packCardButtonWrapCls}>
                <Link href="/contact" className={cardLinkCls}>
                  Contact Pexpacks &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
