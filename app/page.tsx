import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CTASection } from "@/components/marketing/CTASection";
import { HeroSearch } from "@/components/marketing/HeroSearch";
import { OrderingWorksSection } from "@/components/marketing/OrderingWorksSection";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { RatingStrip } from "@/components/shared/RatingStrip";
import { FaqMarquee } from "@/components/shared/FaqMarquee";
import { faqs } from "@/data/faqs";
import { whyChoosePexpacks, homepagePacks } from "@/data/packs";
import { testimonials } from "@/data/testimonials";
import { TestimonialMarquee } from "@/components/shared/TestimonialMarquee";
import { MobileStickyCta } from "@/components/shared/MobileStickyCta";
import {
  PackageIcon,
  ClipboardCheckIcon,
  BookIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
} from "@/components/ui/icons";

import heroStyles from "@/components/marketing/HeroBase.module.css";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";
import cardStyles from "@/components/marketing/MarketingCards.module.css";
import homeStyles from "@/components/marketing/MarketingHome.module.css";

const benefitIcons = [
  PackageIcon,
  ClipboardCheckIcon,
  BookIcon,
  BriefcaseIcon,
];

export default function HomePage() {
  return (
    <>
      <section className={heroStyles.hero}>
        <div className={heroStyles.heroInner}>
          <div>
            <p className={heroStyles.eyebrow}>Save time, Pex it.</p>
            <h1 className={heroStyles.heroTitle}>
              <span className={heroStyles.desktopHeroTitleText}>
                Stationery, packed and ready
                <br className={heroStyles.desktopBreak} />
                for school or office
              </span>
              <span className={heroStyles.mobileHeroTitleText}>
                Stationery, packed
                <br />
                and ready for school or office
              </span>
            </h1>
            <p className={heroStyles.heroLead}>
No queues. No confusion. No missing items.
            </p>
            <HeroSearch />
            <div className={homeStyles.audienceCards}>
              <Link href="/schools" className={homeStyles.audienceCard}>
                <span className={homeStyles.audienceCardIcon}>
                  <BookIcon />
                </span>
                <div>
                  <strong>I am a parent</strong>
                  <span>Find my child&rsquo;s school pack</span>
                </div>
              </Link>
              <Link href="/office" className={homeStyles.audienceCard}>
                <span className={homeStyles.audienceCardIcon}>
                  <BriefcaseIcon />
                </span>
                <div>
                  <strong>I run a business</strong>
                  <span>View office stationery packs</span>
                </div>
              </Link>
            </div>
          </div>

          <div className={heroStyles.heroVisual}>
            <span className={heroStyles.heroVisualImage}>
              <Image
                src="/images/hero-school-delivery.webp"
                alt="Pexpacks stationery pack items arranged neatly"
                fill
                priority
                sizes="(min-width: 1024px) 44vw, 100vw"
              />
            </span>
            <div className={heroStyles.productScene}>
              <div className={heroStyles.brandBox}>
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

      <section className={`${sectionStyles.section} ${homeStyles.guaranteeSection}`}>
        <div className={sectionStyles.inner}>
          <div className={homeStyles.guaranteeBox}>
            <div className={homeStyles.guaranteeContent}>
              <div className={homeStyles.guaranteeIcon}>
                <ShieldCheckIcon />
              </div>
              <h2>100% Exact List Match Guarantee</h2>
              <p>
                We pack exactly what is on your school's official stationery
                list. No missing items, no incorrect brands. If it's on the
                list, it's in the box.
              </p>
              <span className={homeStyles.guaranteeStat}>1 200+ school lists matched</span>
            </div>
          </div>
          <div className={homeStyles.guaranteeLinks}>
            <Link href="/add-your-school" className={homeStyles.guaranteeLink}>
              School not listed? Notify us &rarr;
            </Link>
          </div>
        </div>
      </section>

      <div className={homeStyles.brandMarquee}>
        <div className={homeStyles.brandMarqueeTrack}>
          {[
            "croxley", "bic", "pilot", "pritt", "staedtler",
            "post-it", "bantex", "pexnflex", "freedom",
            "casio", "marlin", "pentel", "rapid", "rexel",
            "sellotape", "stabilo", "starpie",
            "croxley", "bic", "pilot", "pritt", "staedtler",
            "post-it", "bantex", "pexnflex", "freedom",
            "casio", "marlin", "pentel", "rapid", "rexel",
            "sellotape", "stabilo", "starpie",
          ].map((brand, i) => (
            <span key={i} className={homeStyles.brandChip}>
              <Image
                src={`/images/stationery-brands/${brand}.svg`}
                alt={`${brand} logo`}
                width={80}
                height={40}
                style={{ objectFit: "contain", display: "block" }}
              />
            </span>
          ))}
        </div>
      </div>

      <OrderingWorksSection />

      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <SectionHeader
            eyebrow="Best sellers"
            title="Most popular grade packs"
            text="Standard packs from R 659. Exact price depends on your school&rsquo;s list."
            headingId="most-popular-packs"
          />
          <div className={cardStyles.packGrid}>
            {homepagePacks.map((pack, idx) => (
              <div className={`${cardStyles.packCard} ${idx === 1 ? cardStyles.packCardFeatured : ""}`} key={pack.id}>
                {idx === 1 ? <div className={cardStyles.packCardAccent} /> : null}
                {idx === 1 ? <span className={cardStyles.popularPill}>Most popular</span> : null}
                <div
                  className={`${cardStyles.packMedia} ${pack.id === "primary-school-pack" ? cardStyles.packMediaGreen : cardStyles.packMediaBlue}`}
                  aria-hidden="true"
                >
                  <span>{pack.subcategory ?? pack.category}</span>
                </div>
                <div className={cardStyles.packCardHead}>
                  <span className={heroStyles.eyebrow}>
                    {pack.category}
                    {idx === 1 ? <span className={cardStyles.mostOrderedBadge}>Most ordered</span> : null}
                  </span>
                  <h3>{pack.name}</h3>
                </div>
                <div className={cardStyles.packCardBody}>
                  <p className={cardStyles.packDescription}>
                    {pack.description}
                  </p>
                  <div className={cardStyles.packMetaRow}>
                    <span className={cardStyles.priceBadge}>
                      {pack.priceLabel}
                    </span>
                    <span
                      className={cardStyles.quickListPreview}
                      tabIndex={0}
                      aria-label={`${pack.name} quick list preview: ${pack.includes.join(", ")}`}
                    >
                      Quick list preview
                      <span className={cardStyles.quickListTooltip} role="tooltip">
                        {pack.includes.map((item) => (
                          <span key={item}>{item}</span>
                        ))}
                      </span>
                    </span>
                  </div>
                </div>
                <div className={cardStyles.packCardButtonWrap}>
                  <Button
                    href={pack.href}
                    variant="primary"
                    className={cardStyles.fullWidthButton}
                  >
                    {pack.cta}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className={homeStyles.officeCard}>
            <div className={homeStyles.officeCardIcon}>
              <BriefcaseIcon />
            </div>
            <div>
              <h3>Need office stationery?</h3>
              <p>Get a quote for your workplace &mdash; bulk pricing, business invoicing, and scheduled delivery.</p>
            </div>
            <Button href="/office" variant="secondary" className={homeStyles.officeCardButton}>
              View Office Packs
            </Button>
          </div>
        </div>
      </section>

      <section
        className={sectionStyles.section}
        aria-labelledby="home-testimonials-heading"
      >
        <div className={sectionStyles.inner}>
          <SectionHeader
            eyebrow="Trusted by parents"
            title="10,000+ parents have used Pexpacks"
            headingId="home-testimonials-heading"
          />
          <TestimonialMarquee items={testimonials} />
        </div>
      </section>

      <section className={sectionStyles.sectionCream}>
        <div className={sectionStyles.inner}>
          <SectionHeader
            eyebrow="Why Pexpacks"
            title="The Pexpacks promise"
            text="We save you time, reduce stress, and guarantee quality you can trust."
          />
          <div className={cardStyles.benefitGrid}>
            {whyChoosePexpacks.map((benefit, index) => {
              const Icon = benefitIcons[index];
              return (
                <article className={cardStyles.benefitCard} key={benefit.title}>
                  <div className={cardStyles.benefitIconWrapper}>
                    <Icon />
                  </div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <FaqMarquee
        faqs={faqs.filter((faq) =>
          [
            "delivery-timing",
            "customise-pack",
            "wrong-item",
            "minimum-order",
          ].includes(faq.id)
        )}
      />

      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <div className={sectionStyles.splitBand}>
            <div>
              <p className={sectionStyles.sectionEyebrow}>Business supplies</p>
              <h2>Need office stationery?</h2>
              <p>
                Pexpacks prepares practical office packs for SMEs, home offices, freelancers, and small teams &mdash; with custom quotes and bulk pricing.
              </p>
              <div className={sectionStyles.buttonRow}>
                <Button href="/office" variant="primary">View Office Packs</Button>
                <Button href="/office#contact-enquiry" variant="white">Request a Quote</Button>
              </div>
            </div>
            <div className={cardStyles.packCard}>
              <div className={cardStyles.packCardHead}>
                <h3 style={{ fontSize: "20px" }}>Business Starter Brand Package</h3>
              </div>
              <div className={cardStyles.packCardBody}>
                <p className={cardStyles.packDescription}>
                  Launch with a professional identity &mdash; logo, business cards, flyers, letterhead, and a 5-page website hosted free for 12 months.
                </p>
              </div>
              <div className={cardStyles.packCardButtonWrap}>
                <Link href="/business-starter-brand-package" className={cardStyles.cardLink}>
                  View package &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <RatingStrip />
        </div>
      </div>

      <CTASection
        eyebrow="Ready to order"
        title="Find your child's school pack in 30 seconds"
        text="Search your school, pick the grade, and get the exact stationery pack delivered before school opens."
        primaryHref="/schools"
        primaryLabel="Find Your School Pack"
        secondaryHref="/office"
        secondaryLabel="View Office Packs"
      />

      <MobileStickyCta />
    </>
  );
}
