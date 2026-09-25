"use client";

import Image from "next/image";
import { useState } from "react";
import {
  CheckCircle2,
  Package,
  Sparkles,
  PenTool,
  Scissors,
  Calculator,
  BookOpen,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { IMAGE_BLUR_DATA_URL } from "@/lib/constants";
import { useHideHeaderOnScroll } from "@/hooks/useHideHeaderOnScroll";
import { cn } from "@/lib/utils";

type ItemCategory = {
  id: string;
  name: string;
  icon: typeof PenTool;
  headline: string;
  items: Array<{
    brand: string;
    product: string;
    description: string;
  }>;
};

const CATEGORIES: ItemCategory[] = [
  {
    id: "writing",
    name: "Writing & Colouring",
    icon: PenTool,
    headline: "Crisp lines & vibrant creativity",
    items: [
      {
        brand: "Staedtler",
        product: "Noris HB Pencils (12-Pack)",
        description: "Classic yellow & black striped break-resistant German lead.",
      },
      {
        brand: "Staedtler",
        product: "Noris Club 24 Coloured Pencils",
        description: "Rich, vivid pigments with high break resistance for class art.",
      },
      {
        brand: "Bic",
        product: "Cristal Ballpoint Pens (Blue & Red)",
        description: "Smooth, skip-free ink flow for everyday classwork & marking.",
      },
      {
        brand: "Staedtler",
        product: "Rasoplast Eraser & Metal Sharpener",
        description: "Clean pencil erasing without paper smudges or tearing.",
      },
    ],
  },
  {
    id: "craft",
    name: "Cutting & Adhesives",
    icon: Scissors,
    headline: "Classroom crafting made safe & clean",
    items: [
      {
        brand: "Pritt",
        product: "Original Glue Stick (43g)",
        description: "Non-toxic, solvent-free South African school classroom favorite.",
      },
      {
        brand: "Bostik",
        product: "Genuine Blu Tack",
        description: "Reusable adhesive putty ideal for posters, charts & projects.",
      },
      {
        brand: "Marlin",
        product: "Kids Safety Scissors (13cm)",
        description: "Rounded safety tips with ergonomic handles designed for young hands.",
      },
    ],
  },
  {
    id: "maths",
    name: "STEM & Mathematics",
    icon: Calculator,
    headline: "Curriculum-compliant measuring tools",
    items: [
      {
        brand: "Casio",
        product: "fx-82ZA PLUS II Scientific Calculator",
        description: "The standard CAPS syllabus calculator for South African schools.",
      },
      {
        brand: "Marlin",
        product: "30cm Clear Shatterproof Ruler",
        description: "Clear metric markings with anti-shatter durable acrylic.",
      },
      {
        brand: "Marlin",
        product: "Maths Instrument Geometry Set",
        description: "Compass, protractor & set squares tailored for geometry.",
      },
    ],
  },
  {
    id: "books",
    name: "Books & Filing",
    icon: BookOpen,
    headline: "Heavy-duty paper that withstands the school year",
    items: [
      {
        brand: "Croxley",
        product: "A4 Feint & Margin Exercise Books (72pg)",
        description: "Premium high-opacity paper preventing pen bleed-through.",
      },
      {
        brand: "Croxley",
        product: "A4 Quad & Margin Maths Books",
        description: "Standard graph ruled pages for calculations and neat columns.",
      },
      {
        brand: "Bantex",
        product: "20-Pocket Clear View Flip File",
        description: "Durable presentation sleeve for portfolios, tests & certificates.",
      },
    ],
  },
  {
    id: "box",
    name: "Box & Extras",
    icon: Package,
    headline: "Organized, labeled & protected",
    items: [
      {
        brand: "Pexpacks",
        product: "Heavy-Duty Handle Carry Box",
        description: "Sturdy corrugated craft box keeps books pristine and easy to carry.",
      },
      {
        brand: "Pexpacks",
        product: "Personalized Learner ID Label",
        description: "Clearly marked with learner's name and grade for day-one peace of mind.",
      },
      {
        brand: "Classroom",
        product: "Student Multimedia Headphones",
        description: "Comfortable padded stereo headset for computer lab & tablet learning.",
      },
    ],
  },
];

export function UnboxingSection() {
  const [activeCategoryId, setActiveCategoryId] = useState<string>("writing");
  const activeCategory =
    CATEGORIES.find((cat) => cat.id === activeCategoryId) ?? CATEGORIES[0];

  const { isHidden: isHeaderHidden, isAtTop } = useHideHeaderOnScroll({
    hideAfter: 64,
    directionThreshold: 4,
  });
  const isFloating = isHeaderHidden && !isAtTop;

  return (
    <section
      id="unboxing"
      className="relative py-14 sm:py-20 md:py-24 bg-gradient-to-b from-pex-bg-soft/50 via-white to-pex-bg-soft/70 overflow-visible"
      aria-labelledby="unboxing-heading"
    >
      {/* Decorative ambient background glows */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[680px] h-[340px] rounded-full bg-pex-keppel/5 blur-3xl" />
        <div className="absolute bottom-10 right-4 w-[420px] h-[420px] rounded-full bg-pex-coral/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-[var(--layout-max-width)] mx-auto px-4 md:px-8">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-12">
            <SectionHeader
              eyebrow="Unbox School Readiness"
              title="What to expect in your Pexpacks box"
              text="Curated directly from your school's verified requirements. We pack 100% genuine South African classroom brands into a durable, personalized carry box."
              headingId="unboxing-heading"
              className="mb-0 max-w-[720px]"
            />
            <div className="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-pex-border shadow-xs text-xs font-bold text-pex-navy">
              <ShieldCheck className="w-4 h-4 text-pex-keppel shrink-0" />
              <span>100% Brand Guarantee • Zero Cheap Substitutes</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Hero Visual Box + Contents Showcase Card */}
        <ScrollReveal delay={100}>
          <div className="relative rounded-[28px] lg:rounded-[36px] border border-pex-border/90 bg-white shadow-[0_24px_70px_rgba(26,42,64,0.07)] overflow-visible">
            {/* Visual presentation header pill bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-8 py-4 border-b border-pex-border/60 bg-pex-bg-soft/40 text-xs sm:text-sm font-semibold text-pex-navy">
              <div className="inline-flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-pex-keppel animate-pulse" />
                <span className="font-extrabold text-pex-navy">
                  Pexpacks Foundation & Senior School Box
                </span>
                <span className="hidden sm:inline-block text-pex-text-muted">
                  • 2027 Grade Kit
                </span>
              </div>
              <div className="inline-flex items-center gap-2 text-pex-keppel font-bold text-xs uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-pex-coral" />
                <span>Pre-Sorted by School Checklist</span>
              </div>
            </div>

            {/* Main Visual Image Showcase */}
            <div className="relative group bg-gradient-to-b from-[#f9fafb] to-white p-3 sm:p-6 lg:p-8">
              <div className="relative w-full aspect-[16/9] max-h-[580px] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 shadow-[0_12px_40px_rgba(0,0,0,0.06)] bg-[#fafafa]">
                <Image
                  src="/images/pexpacks-unboxing-showcase.webp"
                  alt="Pexpacks school stationery carry box with official logo unboxing featuring Staedtler pencils, Pritt glue stick, Croxley books, Bic pens, Casio calculator, and Bantex folder"
                  fill
                  priority
                  placeholder="blur"
                  blurDataURL={IMAGE_BLUR_DATA_URL}
                  sizes="(min-width: 1280px) 1200px, 100vw"
                  className="object-cover object-center group-hover:scale-[1.015] transition-transform duration-700 ease-out"
                />

                {/* Floating Interactive Badge: Personalized Learner Tag */}
                <div className="absolute top-3 left-3 sm:top-5 sm:left-5 inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-[0_8px_20px_rgba(26,42,64,0.12)] text-pex-navy text-xs sm:text-sm font-bold">
                  <Tag className="w-4 h-4 text-pex-keppel shrink-0" />
                  <span>Learner Name & Grade Labeled</span>
                </div>

                {/* Floating Interactive Badge: Verified Checklist Match */}
                <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl bg-pex-navy/95 backdrop-blur-md border border-white/15 shadow-[0_12px_28px_rgba(26,42,64,0.28)] text-white text-xs sm:text-sm font-bold">
                  <CheckCircle2 className="w-4 h-4 text-pex-keppel shrink-0" />
                  <span>Exact List Item Match</span>
                </div>
              </div>
            </div>

            {/* Interactive Category Tabs & Explorer */}
            <div className="border-t border-pex-border/80 bg-white p-5 sm:p-8 lg:p-10">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-heading font-extrabold text-pex-navy m-0">
                    Explore items included in this pack
                  </h3>
                  <p className="text-xs sm:text-sm text-pex-text-muted mt-1 m-0">
                    Click each category to inspect the genuine South African stationery brands inside.
                  </p>
                </div>
                <span className="text-xs font-bold text-pex-keppel bg-pex-keppel/10 px-3 py-1.5 rounded-full self-start sm:self-auto">
                  {CATEGORIES.length} Core Categories
                </span>
              </div>

              {/* Category Selection Bar: Sticky on mobile/tablet matching legal pages navigation */}
              <div
                className={cn(
                  "sticky max-lg:z-30 w-full self-start transition-all duration-200 mb-6",
                  isFloating
                    ? "max-md:top-2"
                    : "max-md:top-[calc(60px+8px)] md:top-[calc(72px+10px)] lg:static lg:top-auto"
                )}
              >
                <div className="rounded-2xl border border-pex-border bg-white/95 backdrop-blur-md p-2 shadow-xs sm:shadow-sm">
                  <div
                    className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none"
                    role="tablist"
                    aria-label="Stationery categories"
                  >
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = cat.id === activeCategoryId;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          role="tab"
                          aria-selected={isSelected}
                          onClick={() => setActiveCategoryId(cat.id)}
                          className={cn(
                            "inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0",
                            isSelected
                              ? "bg-pex-navy text-white shadow-xs scale-[1.01]"
                              : "bg-pex-bg-soft text-pex-navy hover:bg-slate-200/70"
                          )}
                        >
                          <Icon
                            className={cn(
                              "w-4 h-4 shrink-0",
                              isSelected ? "text-pex-keppel" : "text-pex-text-muted"
                            )}
                          />
                          <span>{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Selected Category Details Grid */}
              <div className="mt-6 rounded-2xl bg-pex-bg-soft/60 border border-pex-border/70 p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4 text-xs font-extrabold uppercase tracking-wider text-pex-keppel">
                  <span className="w-1.5 h-1.5 rounded-full bg-pex-keppel" />
                  <span>{activeCategory.headline}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeCategory.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl bg-white p-4 border border-pex-border shadow-xs hover:border-pex-keppel/50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {item.brand}
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-pex-keppel shrink-0" />
                      </div>
                      <h4 className="text-sm font-bold text-pex-navy m-0">
                        {item.product}
                      </h4>
                      <p className="text-xs text-pex-text-muted mt-1 leading-relaxed m-0">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>


        {/* 4 Feature Cards: Why Our Packaging Matters */}
        <ScrollReveal delay={200}>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-pex-border shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-pex-keppel/15 flex items-center justify-center text-pex-keppel mb-3.5">
                <Package className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-extrabold text-base text-pex-navy m-0">
                Durable Handle Carry Box
              </h4>
              <p className="text-xs text-pex-text-muted mt-1.5 leading-relaxed m-0">
                Corrugated heavy-duty case with a die-cut handle prevents damaged exercise books and crumpled pages.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-pex-border shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-pex-coral/15 flex items-center justify-center text-pex-coral mb-3.5">
                <Tag className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-extrabold text-base text-pex-navy m-0">
                Personalized Learner Tag
              </h4>
              <p className="text-xs text-pex-text-muted mt-1.5 leading-relaxed m-0">
                Labeled with your child’s full name and grade so packs never get mixed up in busy school classrooms.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-pex-border shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-pex-keppel/15 flex items-center justify-center text-pex-keppel mb-3.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-extrabold text-base text-pex-navy m-0">
                Zero Generic Knock-Offs
              </h4>
              <p className="text-xs text-pex-text-muted mt-1.5 leading-relaxed m-0">
                We never substitute items with unbranded products. You receive the exact brand specified by the teacher.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-pex-border shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-600 mb-3.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-extrabold text-base text-pex-navy m-0">
                Grade-Accurate Matching
              </h4>
              <p className="text-xs text-pex-text-muted mt-1.5 leading-relaxed m-0">
                Digitized from official school lists, saving you hours of checking item quantities and ruler requirements.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Section Action Banner */}
        <ScrollReveal delay={250}>
          <div className="mt-10 rounded-3xl bg-gradient-to-r from-pex-navy via-[#1e3450] to-pex-navy p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shadow-[0_16px_40px_rgba(26,42,64,0.18)]">
            <div className="max-w-xl">
              <h4 className="text-xl sm:text-2xl font-heading font-extrabold m-0">
                Ready to get your child’s pack sorted?
              </h4>
              <p className="text-sm text-slate-300 mt-1 m-0">
                Find your school to preview the exact stationery list and customize your pack in minutes.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                href="/schools#schools-search"
                variant="primary"
                size="lg"
                iconDirection="right"
                className="w-full sm:w-auto"
                data-conversion-event="homepage_unboxing_find_pack"
              >
                Find my school pack
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
