import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { CTASection } from "@/components/marketing/CTASection";
import { UnboxingAccordion } from "@/components/marketing/UnboxingAccordion";
import { HeroSearch } from "@/components/marketing/HeroSearch";
import { BackToSchoolQuiz } from "@/components/marketing/BackToSchoolQuiz";
import { BookCoveringBanner } from "@/components/schools/BookCoveringBanner";
import { OrderingWorksSection } from "@/components/marketing/OrderingWorksSection";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { SavingsCalculator } from "@/components/marketing/SavingsCalculator";
import { whyChoosePexpacks, homepagePacks } from "@/data/packs";
import { testimonials } from "@/data/testimonials";
import { TestimonialMarquee } from "@/components/shared/TestimonialMarquee";
import { MobileStickyCta } from "@/components/shared/MobileStickyCta";

import heroStyles from "@/components/marketing/HeroBase.module.css";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";
import cardStyles from "@/components/marketing/MarketingCards.module.css";
import homeStyles from "@/components/marketing/MarketingHome.module.css";

const PackageIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

const ClipboardCheckIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
    <path d="M9 14l2 2 4-4"></path>
  </svg>
);

const BookIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
);

const BriefcaseIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

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
             Everything packed. Everything
              <span className={heroStyles.mobileInlineSpace}></span>
              <br className={heroStyles.desktopBreak}/>
              ready
            </h1>
            <p className={heroStyles.heroLead}>
No queues. No confusion. No missing items.
            </p>
            <HeroSearch />

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

      <section className={sectionStyles.section} style={{ paddingBottom: "0" }}>
        <div className={sectionStyles.inner}>
          <div className={homeStyles.guaranteeBox}>
            <div className={homeStyles.guaranteeContent}>
              <div className={homeStyles.guaranteeIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
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
        </div>
      </section>

      <OrderingWorksSection />

      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <SectionHeader
            eyebrow="Top choices"
            title="Most popular packs"
            text="Explore our best-seller standard packs for every grade level."
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
                <div style={{ padding: "0 24px", flexGrow: 1, display: "flex", flexDirection: "column" }}>
                  <p
                    style={{
                      color: "var(--pex-text-muted)",
                      marginBottom: "8px",
                      fontSize: "15px",
                    }}
                  >
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
                <div style={{ padding: "0 24px 24px" }}>
                  <Button
                    href={pack.href}
                    variant="primary"
                    style={{ width: "100%" }}
                  >
                    {pack.cta}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SavingsCalculator />

      <BackToSchoolQuiz />

      <UnboxingAccordion />

      <BookCoveringBanner />

      <section
        className={sectionStyles.section}
        aria-labelledby="home-testimonials-heading"
      >
        <div className={sectionStyles.inner}>
          <SectionHeader
            eyebrow="Trusted by parents and schools"
            title="How Pexpacks will feel"
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

      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <div className={sectionStyles.splitBand}>
            <div className={homeStyles.unboxingImageWrap}>
              <Image
                src="/images/office-packs.webp"
                alt="Pexpacks premium office stationery packs"
                fill
                className={homeStyles.mediaImage}
                sizes="(min-width: 1024px) 42vw, 100vw"
              />
            </div>
            <div>
              <p className={sectionStyles.sectionEyebrow}>Office and SME solutions</p>
              <h2>Office stationery, packed for work.</h2>
              <p>
                Keep your business stocked with curated office stationery packs.
                We handle the supplies so your team can focus on the work.
              </p>
              <div
                className={[sectionStyles.buttonRow, sectionStyles.splitActions].join(" ")}
              >
                <Button href="/office" variant="primary">
                  View Office Packs
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Ready to order"
        title="Pexpacks gets stationery packed right."
        text="Choose your school or office pack and let Pexpacks prepare your stationery for you."
        primaryHref="/schools"
        primaryLabel="Find Your School Pack"
        secondaryHref="/office"
        secondaryLabel="Order Office Stationery"
      />
      <MobileStickyCta />
    </>
  );
}
