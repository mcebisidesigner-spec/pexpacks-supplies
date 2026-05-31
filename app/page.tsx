import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CTASection } from "@/components/marketing/CTASection";
import { HeroSearch } from "@/components/marketing/HeroSearch";
import { OrderingWorksSection } from "@/components/marketing/OrderingWorksSection";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { FaqMarquee } from "@/components/shared/FaqMarquee";
import { IMAGE_BLUR_DATA_URL } from "@/lib/constants";
import { faqs } from "@/data/faqs";
import { homepagePacks } from "@/data/packs";
import { testimonials } from "@/data/testimonials";
import { TestimonialMarquee } from "@/components/shared/TestimonialMarquee";
import { LayByPromo } from "@/components/shared/LayByPromo";
import {
  BookIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  WalletIcon,
} from "@/components/ui/icons";

import heroStyles from "@/components/marketing/HeroBase.module.css";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";
import cardStyles from "@/components/marketing/MarketingCards.module.css";
import homeStyles from "@/components/marketing/MarketingHome.module.css";



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
                Stationery, packed and ready
                <br />
                for school or office
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
                placeholder="blur"
                blurDataURL={IMAGE_BLUR_DATA_URL}
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

      <section className={homeStyles.laybySpotlight} aria-label="Lay-by payment option">
        <Link href="#layby-promo" className={homeStyles.laybySpotlightLink}>
          <span className={homeStyles.laybySpotlightIcon} aria-hidden="true">
            <WalletIcon />
          </span>
          <span className={homeStyles.laybySpotlightText}>
            <strong>Lay-by now open</strong>
            <span>Reserve your school pack today</span>
          </span>
          <span className={homeStyles.laybySpotlightAction} aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </span>
        </Link>
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
              <Link href="/add-your-school" className={homeStyles.guaranteeLink}>
                School not listed? Notify us &rarr;
              </Link>
            </div>
          </div>

          <div className={homeStyles.officeCard}>
            <div className={homeStyles.officeCardIcon}>
              <BriefcaseIcon />
            </div>
            <div>
              <h3>Office & Business Stationery Packs</h3>
              <p>
                Need reliable stationery for your SME or home office? We offer curated packs for daily business administration, including files, paper, notebooks, writing tools, and custom restock options.
              </p>
            </div>
            <div className={homeStyles.officeCardButton}>
              <Button href="/office" variant="primary">
                Explore Office Packs
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className={homeStyles.brandMarquee}>
        <div className={homeStyles.brandMarqueeTrack}>
          {[
            "croxley", "bic", "pilot", "pritt", "staedtler",
            "post-it", "bantex", "freedom",
            "casio", "marlin", "pentel", "rapid", "rexel",
            "sellotape", "stabilo", "starpie",
            "croxley", "bic", "pilot", "pritt", "staedtler",
            "post-it", "bantex", "freedom",
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

      <div className={homeStyles.urgencyBar}>
        <p>
          Order before <strong>30 September 2026</strong> for delivery before school opens in January.
          <Link href="/schools">Shop now &rarr;</Link>
        </p>
      </div>

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
          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <Button
              href="/schools#schools-search"
              variant="primary"
              size="lg"
            >
              Browse all School Packs
            </Button>
          </div>
        </div>
      </section>

      <section className={sectionStyles.sectionCream} aria-labelledby="home-testimonials-heading">
        <div className={sectionStyles.inner}>
          <SectionHeader
            eyebrow="Trusted by parents"
            title="Parents trust Pexpacks for school stationery"
            text="Hear from parents who have made the smart switch to Pexpacks."
            headingId="home-testimonials-heading"
          />
          <TestimonialMarquee items={testimonials} />
          <div className={homeStyles.statsRow}>
            <span>School-accurate stationery lists</span>
            <span className={homeStyles.statsDot} aria-hidden="true" />
            <span>Delivered before school opens</span>
            <span className={homeStyles.statsDot} aria-hidden="true" />
            <span>Backed by a 100% match promise</span>
          </div>
        </div>
      </section>

      <FaqMarquee
        faqs={faqs.filter((f) =>
          ["school-not-listed", "delivery-timing", "exercise-books", "payment-flow", "find-grade-pack"].includes(f.id)
        )}
      />

      <LayByPromo />
    </>
  );
}
