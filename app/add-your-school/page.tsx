import type { Metadata } from 'next'
import Link from 'next/link'
import { AddSchoolForm } from '@/components/forms/AddSchoolForm'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/marketing/PageHero'
import { SectionHeader } from '@/components/marketing/SectionHeader'
import { FaqMarquee } from '@/components/shared/FaqMarquee'
import { faqs } from '@/data/faqs'
import { buildMetadata } from '@/lib/seo'
import heroStyles from '@/components/marketing/HeroBase.module.css'
import sectionStyles from '@/components/marketing/MarketingSections.module.css'
import cardStyles from '@/components/marketing/MarketingCards.module.css'
import formStyles from '@/components/marketing/MarketingForms.module.css'

export const metadata: Metadata = buildMetadata(
  'Add Your School',
  'Submit your school details so Pexpacks can prepare a school stationery pack page for your grade lists.',
  '/add-your-school',
)

export default function AddYourSchoolPage() {
  return (
    <>
      <PageHero
        eyebrow="Not listed?"
        title="Is your school not an official partner yet? Add your school now."
        panelText="Need a pack today?"
        panelTitle="Use a standard grade combo while your school list is being reviewed."
      >
        <div className={sectionStyles.buttonRow}>
          <Button href="#school-request-form" variant="primary">
            Add your school
          </Button>
          <Button href="#contact-faq" variant="white">
            Contact FAQs
          </Button>
        </div>
      </PageHero>

      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <div className={cardStyles.infoGrid}>
            <article className={formStyles.formCard} id="school-request-form">
              <p className={heroStyles.eyebrow}>School request</p>
              <h2>Submit school details</h2>
              <AddSchoolForm />
            </article>

            <article className={cardStyles.infoCard}>
              <SectionHeader
                eyebrow="How it works"
                title="What happens next?"
                text="Pexpacks checks whether the school can be added and whether a standard pack can help while the official list is prepared."
              />
              <ul className={sectionStyles.checkList}>
                <li>We confirm the school name and location.</li>
                <li>We review the grade or stationery list requirement.</li>
                <li>We recommend a school-specific or standard grade pack.</li>
                <li>We help you move to an order or enquiry path.</li>
              </ul>
              <div className={sectionStyles.buttonRow}>
                <Button href="/contact">Talk to Us</Button>
              </div>
            </article>
          </div>
        </div>
      </section>

      <div id="contact-faq">
        <FaqMarquee
          faqs={faqs.filter((f) =>
            [
              'school-not-listed',
              'school-list-submission',
              'find-grade-pack',
              'delivery-timing',
              'school-rebate',
            ].includes(f.id),
          )}
        />
      </div>

      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <div className={sectionStyles.splitBand}>
            <div>
              <p className={sectionStyles.sectionEyebrow}>Already listed?</p>
              <h2>Find your school pack</h2>
              <p>
                Search for your school now &mdash; if we already have the list,
                you can order in seconds.
              </p>
              <div className={sectionStyles.buttonRow}>
                <Button href="/schools" variant="primary">
                  Search Schools
                </Button>
                <Button href="/partnership" variant="white">
                  School Partnerships
                </Button>
              </div>
            </div>
            <div className={cardStyles.packCard}>
              <div className={cardStyles.packCardHead}>
                <h3 style={{ fontSize: '20px' }}>Contact us</h3>
              </div>
              <div className={cardStyles.packCardBody}>
                <p className={cardStyles.packDescription}>
                  Questions about the school request process? Reach out to the
                  Pexpacks support team.
                </p>
              </div>
              <div className={cardStyles.packCardButtonWrap}>
                <Link href="/contact" className={cardStyles.cardLink}>
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
