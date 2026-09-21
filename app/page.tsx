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
    typeof hero.eyebrow === "string" &&
    hero.eyebrow &&
    hero.eyebrow !== "School stationery made simple"
      ? hero.eyebrow
      : "2027 School packs now available";
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
        className="relative overflow-visible bg-pex-navy bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(33,158,154,0.32),transparent_72%),radial-gradient(circle_at_90%_25%,rgba(255,111,89,0.14),transparent_48%),radial-gradient(circle_at_10%_80%,rgba(33,158,154,0.16),transparent_45%)] pt-[clamp(40px,6vw,60px)] pb-[clamp(48px,8vw,80px)] md:pt-[clamp(56px,8vw,104px)] md:pb-[clamp(64px,8vw,116px)]"
      >
        {/* Subtle decorative glow orb container - contained to prevent horizontal scrollbar */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div
            className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-pex-keppel/10 blur-3xl"
          />
          <div
            className="absolute top-1/2 -right-32 w-[420px] h-[420px] rounded-full bg-pex-coral/10 blur-3xl"
          />
        </div>

        <div className="relative w-full max-w-[var(--layout-max-width)] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] items-center gap-[clamp(40px,6vw,76px)]">
          <div className="min-w-0">
            {/* Glassmorphic Eyebrow Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 text-pex-keppel text-xs sm:text-sm font-extrabold mb-5 shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
              <span className="w-2 h-2 rounded-full bg-pex-keppel shadow-[0_0_8px_var(--pex-keppel)] animate-pulse" />
              <span>{heroEyebrow}</span>
            </div>

            <h1 className="m-0 text-white font-heading text-[clamp(38px,12vw,46px)] sm:text-[clamp(44px,8vw,56px)] lg:text-[clamp(48px,5.4vw,74px)] font-extrabold leading-[1.04] lg:leading-[0.98] tracking-tight text-balance">
              Stationery sorted.{" "}
              <span className="block mt-1 sm:mt-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-white/95 to-slate-200">
                Time saved.
              </span>
            </h1>

            <p className="max-w-[530px] my-5 mb-7 text-white/85 text-[clamp(15px,4vw,16.5px)] lg:text-[clamp(16px,1.8vw,18px)] leading-[1.6]">
              {heroLead}
            </p>

            <HeroSearch />
          </div>

          {/* Hero Visual Showcase */}
          <div className="relative group min-w-0">
            {/* Ambient colorful backlight glow */}
            <div
              className="absolute -inset-2.5 rounded-[38px] bg-gradient-to-tr from-pex-keppel/25 via-pex-coral/15 to-pex-keppel/10 blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              aria-hidden="true"
            />
            <div className="relative min-h-[390px] md:min-h-[450px] lg:min-h-[570px] rounded-[28px] lg:rounded-[34px] overflow-hidden border border-white/15 bg-[linear-gradient(135deg,rgba(26,42,64,0.95),rgba(21,34,56,0.9))] shadow-[0_32px_80px_rgba(0,0,0,0.38)] lg:[animation:floatAnimation_6s_ease-in-out_infinite] transition-transform duration-300 motion-reduce:animate-none">
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

              {/* Floating Verified Badge */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-[320px] p-3.5 sm:p-4 rounded-2xl bg-pex-navy/90 backdrop-blur-xl border border-white/20 shadow-[0_16px_36px_rgba(0,0,0,0.35)] flex items-center gap-3.5 z-10">
                <div className="w-10 h-10 rounded-xl bg-pex-keppel/20 border border-pex-keppel/40 flex items-center justify-center shrink-0 text-pex-keppel">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-white text-xs sm:text-sm font-bold m-0 truncate">
                    100% School-Accurate Lists
                  </p>
                  <p className="text-slate-300 text-[11px] sm:text-xs m-0">
                    Pre-packed & learner-labelled
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand logo marquee with soft edge masking */}
      <div
        className="overflow-hidden bg-pex-bg-soft/90 py-5 border-y border-pex-border relative [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
        aria-hidden="true"
      >
        <div className="brand-marquee-track">
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
                loading="eager"
                decoding="async"
                className="w-20 h-10 aspect-[2/1] object-contain block"
                style={{ width: "80px", height: "40px", aspectRatio: "2 / 1", objectFit: "contain", display: "block" }}
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
                width={700}
                height={560}
                placeholder="blur"
                blurDataURL={IMAGE_BLUR_DATA_URL}
                sizes="(min-width: 1280px) 700px, (min-width: 820px) 55vw, 100vw"
                className="w-full h-full object-cover object-[center_top] lg:object-center"
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
