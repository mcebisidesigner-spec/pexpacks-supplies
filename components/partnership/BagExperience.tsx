import React from "react";
import Image from "next/image";
import { UserCheck, Sparkles, Shield, Award } from "lucide-react";
import { IMAGE_BLUR_DATA_URL } from "@/lib/constants";

const GALLERY_IMAGES = [
  {
    src: "/images/hero-school-delivery-packs.webp",
    alt: "Institutional school delivery packs arranged by grade",
    caption: "Bulk Campus Delivery — Sorted & Labeled per Learner",
  },
  {
    src: "/images/pex-stationery-box-v2.webp",
    alt: "Learners receiving their official Pexpacks stationery packs",
    caption: "Learner Distribution — Classroom Ready from Day One",
  },
  {
    src: "/images/unboxing-G7.webp",
    alt: "Unboxing verified Grade 7 stationery pack contents",
    caption: "Curriculum Compliance — Verified Brand & Quality Standards",
  },
  {
    src: "/images/office-packs.webp",
    alt: "School pack assembly and administrative supply bundles",
    caption: "Pack Collation — Sealed Durable Packaging",
  },
];

export function BagExperience() {
  return (
    <section className="py-12 sm:py-20 bg-[var(--pex-bg-soft,#f4f5f7)] border-y border-slate-200/80" aria-labelledby="brand-experience-title">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 min-[981px]:grid-cols-[minmax(320px,1fr)_minmax(0,1.15fr)] gap-[clamp(32px,5vw,64px)] items-center">
          {/* Feature Highlights */}
          <div>
            <p className="mb-3 text-pex-keppel text-sm font-extrabold text-left">The physical brand experience</p>
            <h2 id="brand-experience-title" className="mb-3 text-pex-navy font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-left">
              From Classroom Essential to Walking Brand Asset.
            </h2>
            <p className="max-w-[760px] mb-7 text-slate-600 text-lg leading-[1.45] text-left">
              Pexpacks delivery packaging is purpose-designed for long-term scholastic
              utility rather than disposable waste. Every pack serves as a durable,
              functional extension of your school’s pride and identity.
            </p>

            <div className="flex flex-col gap-5">
              <div className="flex gap-4 items-start">
                <div className="w-11 h-11 rounded-xl bg-[rgba(26,122,119,0.1)] text-pex-keppel flex items-center justify-center shrink-0">
                  <UserCheck size={20} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[16.5px] font-bold text-pex-navy m-0">Clear Learner ID Window</h3>
                  <p className="text-sm text-slate-600 leading-[1.55] m-0">
                    Allows rapid teacher identification and classroom bag allocation on day one,
                    preventing mix-ups and ensuring smooth desk distribution.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-11 h-11 rounded-xl bg-[rgba(26,122,119,0.1)] text-pex-keppel flex items-center justify-center shrink-0">
                  <Shield size={20} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[16.5px] font-bold text-pex-navy m-0">Reflective Safety Detailing</h3>
                  <p className="text-sm text-slate-600 leading-[1.55] m-0">
                    Subtle reflective piping enhances learner visibility during early-morning
                    winter drop-offs and everyday transport to campus.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-11 h-11 rounded-xl bg-[rgba(26,122,119,0.1)] text-pex-keppel flex items-center justify-center shrink-0">
                  <Sparkles size={20} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[16.5px] font-bold text-pex-navy m-0">Water-Resistant Construction</h3>
                  <p className="text-sm text-slate-600 leading-[1.55] m-0">
                    Constructed with heavy-gauge protective fabrics and reinforced seams
                    to protect costly exercise books and stationery against inclement weather.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-11 h-11 rounded-xl bg-[rgba(26,122,119,0.1)] text-pex-keppel flex items-center justify-center shrink-0">
                  <Award size={20} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[16.5px] font-bold text-pex-navy m-0">School Identity &amp; Crest Integration</h3>
                  <p className="text-sm text-slate-600 leading-[1.55] m-0">
                    Your institutional crest and school colours are professionally integrated,
                    providing proud visual cohesion throughout the academic year.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Showcase */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-label="Physical stationery pack gallery">
            {GALLERY_IMAGES.map((img) => (
              <div key={img.src} className="rounded-2xl overflow-hidden border border-slate-200/80 bg-white shadow-[0_8px_24px_rgba(26,42,64,0.05)]">
                <div className="relative w-full aspect-[4/3]">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(min-width: 980px) 280px, 50vw"
                    placeholder="blur"
                    blurDataURL={IMAGE_BLUR_DATA_URL}
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <p className="p-[12px_14px] text-[12.5px] font-semibold text-pex-navy m-0 bg-white">{img.caption}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
