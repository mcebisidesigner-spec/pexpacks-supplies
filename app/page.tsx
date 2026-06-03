import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { HeroSearch } from "@/components/marketing/HeroSearch";
import { OrderingWorksSection } from "@/components/marketing/OrderingWorksSection";
import { SuperpowerSection } from "@/components/marketing/SuperpowerSection";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { FaqMarquee } from "@/components/shared/FaqMarquee";
import { IMAGE_BLUR_DATA_URL } from "@/lib/constants";
import { faqs } from "@/data/faqs";
import { homepagePacks } from "@/data/packs";
import { LayByPromo } from "@/components/shared/LayByPromo";
import { WalletIcon } from "@/components/ui/icons";

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
            <p className={heroStyles.eyebrow}>Save time today</p>
            <h1 className={heroStyles.heroTitle}>
              Skip the <br /> Back-to-School <br /> Queues
            </h1>
            <p className={heroStyles.heroLead}>
              Your official school stationery list, perfectly packed and delivered to your door. No missing items. No stress.
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

      <SuperpowerSection />

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

      <section id="social-proof" className={sectionStyles.socialProofSection} aria-labelledby="home-social-proof-heading">
        <div className={sectionStyles.inner}>
          <div className={sectionStyles.socialProofPanel}>
            <div className={sectionStyles.socialProofMedia}>
              <Image
                src="/images/pex-stationery-box.webp"
                alt="Happy learners holding Pexpacks branded stationery boxes outside school"
                fill
                priority
                quality={95}
                placeholder="blur"
                blurDataURL={IMAGE_BLUR_DATA_URL}
                sizes="(min-width: 1280px) 700px, (min-width: 820px) 55vw, 100vw"
              />
              <div className={sectionStyles.socialProofSeal} aria-label="Trusted parent validation">
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
                &ldquo;Pexpacks saved me a chaotic Saturday morning at the mall. The customised pack was perfect.&rdquo;
              </blockquote>
              <p className={sectionStyles.socialProofAuthor}>
                Sarah, Grade 4 Parent
              </p>
              <div className={sectionStyles.socialProofStats} aria-label="Pexpacks trust highlights">
                <span>School-accurate lists</span>
                <span>Named learner packs</span>
                <span>Delivered before term starts</span>
              </div>
              <Button href="/schools#schools-search" variant="primary" size="lg">
                Find my school pack
              </Button>
            </div>
          </div>
        </div>
      </section>

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

      <FaqMarquee
        faqs={faqs.filter((f) =>
          ["school-not-listed", "delivery-timing", "exercise-books", "payment-flow", "find-grade-pack"].includes(f.id)
        )}
      />

      <LayByPromo />
    </>
  );
}
