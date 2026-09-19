import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { HeroSearch } from "@/components/marketing/HeroSearch";
import { ConciergeSection } from "@/components/marketing/ConciergeSection";
import { SuperpowerSection } from "@/components/marketing/SuperpowerSection";
import {
  RetailVsPexpacksSlider,
  FaqMarquee,
  TestimonialMarquee,
  HappyPayBanner,
  HappyPaySteps,
} from "@/components/marketing/HomeBelowFold";
import { IMAGE_BLUR_DATA_URL } from "@/lib/constants";
import { getFaqs, getTestimonials, getWebsiteContent } from "@/lib/cms";
import { testimonials as confirmedTestimonials } from "@/data/testimonials";

export const revalidate = 300;

export default async function HomePage() {
  const [testimonials, allFaqs, content] = await Promise.all([
    getTestimonials(),
    getFaqs("homepage"),
    getWebsiteContent(),
  ]);
  const hero = content["homepage.hero"];
  const heroEyebrow =
    typeof hero.eyebrow === "string" && hero.eyebrow
      ? hero.eyebrow
      : "School stationery made simple";
  const heroTitle =
    typeof hero.title === "string" && hero.title
      ? hero.title
      : "Your school stationery list, perfectly packed.";
  const heroLead =
    typeof hero.lead === "string" && hero.lead
      ? hero.lead
      : "Your official school stationery list, perfectly packed and delivered.";
  const featuredTestimonial = testimonials[0] ?? confirmedTestimonials[0];
  const visibleHomepageFaqs = allFaqs.slice(0, 5);

  return (
    <>
      <section
        id="home-hero"
        className="bg-pex-navy pt-[clamp(36px,6vw,52px)] pb-[clamp(44px,8vw,72px)] md:pt-[clamp(52px,8vw,96px)] md:pb-[clamp(58px,8vw,108px)]"
      >
        <div className="w-full max-w-[var(--layout-max-width)] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] items-center gap-[clamp(38px,6vw,76px)]">
          <div className="min-w-0">
            <p className="m-0 mb-4 text-pex-keppel font-extrabold text-sm tracking-normal">
              {heroEyebrow}
            </p>
            <h1 className="m-0 text-white font-heading text-[clamp(36px,16vw,42px)] sm:text-[clamp(40px,10.7vw,44px)] lg:text-[clamp(42px,6.4vw,76px)] font-extrabold leading-[1.02] lg:leading-[0.98] tracking-normal break-normal lg:break-words">
              Stationery sorted. Time saved.
            </h1>
            <p className="max-w-[530px] my-[18px] mb-6 text-white/80 text-[clamp(15px,4vw,16px)] lg:text-[clamp(15.5px,1.8vw,17px)] leading-[1.55] line-clamp-2">
              {heroLead}
            </p>
            <HeroSearch />
          </div>

          <div className="relative min-h-[390px] md:min-h-[440px] lg:min-h-[560px] rounded-card lg:rounded-[30px] overflow-hidden bg-[linear-gradient(135deg,rgba(26,42,64,0.94),rgba(21,34,56,0.88))] shadow-[0_28px_70px_rgba(26,42,64,0.18)] lg:[animation:floatAnimation_6s_ease-in-out_infinite] transition-transform duration-300 motion-reduce:animate-none min-w-0">
            <span className="absolute inset-0">
              <Image
                src="/images/hero-school-stationery-delivery.webp"
                alt="Pexpacks Stationery Delivery Packs"
                fill
                priority
                placeholder="blur"
                blurDataURL={IMAGE_BLUR_DATA_URL}
                sizes="(min-width: 1024px) 44vw, 100vw"
                className="object-cover"
              />
            </span>
          </div>
        </div>
      </section>

      <div
        className="overflow-hidden bg-pex-bg-soft py-[18px] border-y border-pex-border"
        aria-hidden="true"
      >
        <div className="flex gap-[60px] w-max [animation:marqueeScroll_40s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none">
          {[
            "croxley",
            "bic",
            "pilot",
            "pritt",
            "staedtler",
            "post-it",
            "bantex",
            "penflex",
            "freedom",
            "casio",
            "marlin",
            "pentel",
            "rapid",
            "rexel",
            "sellotape",
            "stabilo",
            "sharpie",
            "croxley",
            "bic",
            "pilot",
            "pritt",
            "staedtler",
            "post-it",
            "bantex",
            "penflex",
            "freedom",
            "casio",
            "marlin",
            "pentel",
            "rapid",
            "rexel",
            "sellotape",
            "stabilo",
            "sharpie",
          ].map((brand, i) => (
            <span
              key={i}
              className="flex items-center justify-center shrink-0 px-5 opacity-65 hover:opacity-100 transition-opacity duration-300"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/images/stationery-brands/${brand}.svg`}
                alt={`${brand} logo`}
                width={80}
                height={40}
                loading="lazy"
                decoding="async"
                style={{ objectFit: "contain", display: "block" }}
              />
            </span>
          ))}
        </div>
      </div>

      <section className="py-8 bg-transparent">
        <div className="w-full max-w-[var(--layout-max-width)] mx-auto px-4 md:px-8">
          <HappyPayBanner variant="homepage" />
          <div className="mt-6">
            <HappyPaySteps />
          </div>
        </div>
      </section>

      <section
        id="social-proof"
        className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-pex-bg to-pex-bg-soft"
        aria-labelledby="home-social-proof-heading"
      >
        <div className="w-full max-w-[var(--layout-max-width)] mx-auto px-4 md:px-8">
          <div className="overflow-hidden border border-pex-border rounded-card lg:rounded-[28px] bg-[radial-gradient(circle_at_94%_12%,rgba(255,111,89,0.16),transparent_32%),var(--color-pex-bg)] shadow-[0_24px_70px_rgba(26,42,64,0.1)] grid grid-cols-1 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.78fr)] items-stretch p-0">
            <div className="relative min-h-0 aspect-[1.25/1] lg:min-h-[clamp(360px,44vw,560px)] lg:aspect-auto overflow-hidden bg-pex-bg-soft after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-[28%] lg:after:h-[36%] after:bg-gradient-to-b after:from-transparent after:to-[rgba(26,42,64,0.24)] lg:after:to-[rgba(26,42,64,0.48)] after:pointer-events-none">
              <Image
                src="/images/pex-stationery-box-v2.webp"
                alt="Learners holding Pexpacks Stationery Box"
                fill
                placeholder="blur"
                blurDataURL={IMAGE_BLUR_DATA_URL}
                sizes="(min-width: 1280px) 700px, (min-width: 820px) 55vw, 100vw"
                className="object-cover object-[center_top] lg:object-center"
              />
              <div
                className="absolute left-6 bottom-3.5 lg:left-[clamp(18px,3vw,34px)] lg:bottom-[clamp(18px,3vw,34px)] z-1 w-[78px] h-[78px] lg:w-[138px] lg:h-[138px] rounded-full border border-white/60 bg-white/90 text-pex-navy grid place-items-center content-center text-center shadow-[0_10px_24px_rgba(26,42,64,0.16)] lg:shadow-[0_16px_36px_rgba(26,42,64,0.18)] backdrop-blur-[10px]"
                aria-label="Trusted parent validation"
              >
                <strong className="font-heading text-[23px] lg:text-[34px] leading-none block">
                  100%
                </strong>
                <span className="max-w-[58px] lg:max-w-[90px] text-pex-keppel text-[8px] lg:text-[11px] font-black leading-[1.15] uppercase block">
                  List match promise
                </span>
              </div>
            </div>

            <div className="relative p-[clamp(24px,6vw,38px)] lg:p-[clamp(30px,5vw,62px)] grid content-center">
              <p className="m-0 mb-3 text-pex-keppel font-extrabold text-xs uppercase tracking-[0.08em]">
                Parent validation
              </p>
              <h2
                id="home-social-proof-heading"
                className="m-0 text-pex-navy font-heading text-[clamp(28px,12vw,38px)] lg:text-[clamp(34px,4.5vw,62px)] font-extrabold leading-[0.98] tracking-normal"
              >
                Real packs. Real schools. Real peace of mind.
              </h2>
              {featuredTestimonial ? (
                <>
                  <blockquote className="relative mt-[clamp(24px,4vw,38px)] p-[clamp(20px,3vw,28px)] border border-[rgba(255,111,89,0.22)] rounded-card lg:rounded-[28px] bg-[linear-gradient(135deg,rgba(255,111,89,0.1),rgba(33,158,154,0.08)),var(--color-pex-bg)] text-pex-navy font-heading text-[clamp(20px,7vw,26px)] lg:text-[clamp(21px,2.4vw,31px)] font-extrabold leading-[1.16] shadow-[0_16px_34px_rgba(26,42,64,0.06)] before:content-['“'] before:absolute before:-top-[26px] before:right-[22px] before:text-[rgba(255,111,89,0.26)] before:font-serif before:text-[110px] before:leading-none">
                    &ldquo;{featuredTestimonial.quote}&rdquo;
                  </blockquote>
                  <p className="mt-4 text-pex-keppel text-[15px] font-black">
                    {featuredTestimonial.name}, {featuredTestimonial.role}
                  </p>
                </>
              ) : null}
              <div
                className="my-[clamp(22px,4vw,34px)] mb-[26px] flex flex-wrap gap-2.5"
                aria-label="Pexpacks trust highlights"
              >
                <span className="inline-flex items-center min-h-[38px] px-3.5 py-2 border border-pex-keppel/30 rounded-full bg-pex-keppel/10 text-pex-navy text-xs font-black">
                  School-accurate lists
                </span>
                <span className="inline-flex items-center min-h-[38px] px-3.5 py-2 border border-pex-keppel/30 rounded-full bg-pex-keppel/10 text-pex-navy text-xs font-black">
                  Named learner packs
                </span>
                <span className="inline-flex items-center min-h-[38px] px-3.5 py-2 border border-pex-keppel/30 rounded-full bg-pex-keppel/10 text-pex-navy text-xs font-black">
                  Delivered before term starts
                </span>
              </div>
              <Button
                href="/schools#schools-search"
                variant="primary"
                size="lg"
                data-conversion-event="homepage_find_school_pack"
                className="w-full sm:w-auto"
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
          className="py-[var(--section-padding-y-mobile)] sm:py-[var(--section-padding-y-tablet)] lg:py-[var(--section-padding-y-desktop)] bg-transparent"
          aria-labelledby="home-testimonials"
        >
          <div className="w-full max-w-[var(--layout-max-width)] mx-auto px-4 md:px-8">
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

      <FaqMarquee faqs={visibleHomepageFaqs} />
    </>
  );
}
