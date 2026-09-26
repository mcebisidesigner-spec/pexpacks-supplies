"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Shield,
  Sparkles,
  Check,
  ChevronDown,
  ArrowRight,
  Layers,
  Droplets,
  Tag,
  Clock,
  Sparkle,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Real Photography Gallery ──
const GALLERY_ITEMS = [
  {
    id: "hero-stack",
    src: "/images/pexcover-showcase-hero.jpg",
    alt: "Pexcover covered school exercise books with printed labels",
    title: "Neatly Covered & Labeled Books",
    description: "Every book arrives covered in heavy-duty clear sleeves with customized waterproof subject labels.",
  },
  {
    id: "paper-styles",
    src: "/images/pexcover-paper-styles.jpg",
    alt: "Three exercise book covering styles: Kraft, Marbled, and Teal",
    title: "Three Backing Paper Styles",
    description: "Choose between traditional brown kraft, decorative marbled prints, or modern solid colors.",
  },
  {
    id: "spill-test",
    src: "/images/pexcover-spill-protection.jpg",
    alt: "Water droplets beading on clear protective book sleeve being wiped clean",
    title: "100% Spill & Water Resistant",
    description: "Juice, tea, and rainy day spills wipe right off the 120+ micron outer sleeve without touching the paper.",
  },
  {
    id: "workshop-craft",
    src: "/images/pexcover-img-01.webp",
    alt: "Pexpacks workshop staff preparing school packs",
    title: "Hand-Prepared by Specialists",
    description: "Carefully wrapped and inspected by trained stationery specialists before pack sealing.",
  },
];

// ── Parent FAQs Data ──
const PARENT_FAQS = [
  {
    question: "What is Pexcover in simple terms?",
    answer:
      "Pexcover is our 'done-for-you' school book covering service. Instead of spending hours at home cutting rolls of plastic and wrestling with sticky tape, you simply tick Pexcover when ordering your child's school pack. We neatly cover every exercise book and textbook using durable paper, heavy-duty clear slip-on sleeves, and personalized printed name labels, then pack them directly into your child's stationery box.",
  },
  {
    question: "Are these covers compliant with school and teacher requirements?",
    answer:
      "Yes, 100% compliant. South African schools and teachers require that book titles and subject labels remain immediately visible. Our crystal-clear outer sleeves allow full visibility of the underlying book title, while our personalized printed labels show the learner's name, grade, and subject neatly right on the front.",
  },
  {
    question: "Can I use Pexcover on textbooks that must be returned at the end of the year?",
    answer:
      "Yes! In fact, Pexcover is ideal for school-issued loan textbooks. Unlike adhesive contact plastic that permanently sticks to book covers and damages them when peeled, our heavy-duty sleeves slip on smoothly without any glue or tape touching the book. At the end of the year, simply slide the sleeve off and return the textbook in pristine, penalty-free condition.",
  },
  {
    question: "What happens if juice or water spills in my child's backpack?",
    answer:
      "Our 120+ micron heavy-duty outer sleeve creates an impermeable liquid barrier. If a juice box leaks or water spills inside the backpack, simply wipe the sleeve dry with a towel or cloth. The moisture never reaches the paper or the notebook pages inside.",
  },
  {
    question: "How are the learner name and subject labels printed?",
    answer:
      "We print every label using high-resolution thermal resin onto waterproof synthetic vinyl labels. Unlike paper stickers or ballpoint ink, our labels never smear from sweaty hands, fade in sunlight, or peel off when damp.",
  },
  {
    question: "Which backing paper styles can I choose from?",
    answer:
      "You can choose from 3 popular styles: Standard Kraft (classic, traditional natural brown paper favored by conservative schools), Marbled & Patterned (fun, decorative swirl prints), or Vibrant Solid Colors (bold modern colors that make visual subject sorting easy).",
  },
  {
    question: "How much does Pexcover cost?",
    answer:
      "Pexcover is priced affordably per coverable book (typically starting from R15 to R25 per book, which includes the backing paper, heavy-duty clear slip-on sleeve, and personalized waterproof printed label). The exact covering total is clearly calculated in your order drawer before you checkout.",
  },
  {
    question: "Can I add Pexcover if I uploaded my own custom stationery list?",
    answer:
      "Yes! When you upload a school stationery list using our 'Upload a List' service, our team will identify all coverable books on your list and give you the option to add Pexcover during checkout.",
  },
];

export function PexcoverShowcaseClient() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedStyleTab, setSelectedStyleTab] = useState<"kraft" | "marbled" | "colors">("kraft");

  return (
    <div className="w-full bg-white pb-16 selection:bg-[#1E7468]/15 selection:text-[#1E7468]">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: HERO SECTION
      ────────────────────────────────────────────────────────────── */}
      <section className="pt-10 sm:pt-14 pb-12 sm:pb-16 bg-white" aria-labelledby="pexcover-hero-title">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="max-w-2xl text-left flex flex-col items-start">
              <p className="mb-3 text-pex-keppel text-sm font-semibold leading-tight normal-case text-left">
                The done-for-you book covering service
              </p>
              <h1
                id="pexcover-hero-title"
                className="mb-4 text-pex-navy font-heading text-[clamp(2.5rem,5.5vw,4.25rem)] font-extrabold leading-[1.02] tracking-normal text-balance text-left"
              >
                Skip the Late-Night Scissors and Tape. Arrive First-Day Ready.
              </h1>
              <p className="max-w-xl mb-6 text-slate-600 text-base sm:text-lg leading-relaxed text-left">
                Pexcover is our signature service where we professionally cover your child&apos;s school exercise books and textbooks with durable backing paper, heavy-duty clear sleeves, and personalized waterproof name labels—delivered straight inside your school stationery pack.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-8">
                <Link
                  href="/schools"
                  className="inline-flex items-center justify-center gap-2 bg-[#FF6B53] text-white px-7 py-3.5 rounded-xl font-bold text-base shadow-sm hover:bg-[#f8593f] active:scale-[0.98] transition-all"
                >
                  <span>Find Your School Pack</span>
                  <ArrowRight size={17} />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 bg-white text-pex-navy border border-slate-200/80 px-6 py-3.5 rounded-xl font-bold text-base hover:bg-slate-50 active:scale-[0.98] transition-all shadow-xs"
                >
                  <span>See How It Works</span>
                </a>
              </div>

              {/* 4 Micro Highlights */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200/80 w-full text-left">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EBF7F5] text-pex-keppel grid place-items-center shrink-0 mt-0.5">
                    <Clock size={16} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-pex-navy">4+ Hours Saved</div>
                    <div className="text-[11px] text-slate-500">Zero late-night wrapping</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EBF7F5] text-pex-keppel grid place-items-center shrink-0 mt-0.5">
                    <Shield size={16} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-pex-navy">120+ Micron Shield</div>
                    <div className="text-[11px] text-slate-500">Heavy-duty clear sleeve</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EBF7F5] text-pex-keppel grid place-items-center shrink-0 mt-0.5">
                    <Droplets size={16} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-pex-navy">100% Spill Proof</div>
                    <div className="text-[11px] text-slate-500">Juice & rain wipes dry</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EBF7F5] text-pex-keppel grid place-items-center shrink-0 mt-0.5">
                    <Tag size={16} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-pex-navy">Printed Labels</div>
                    <div className="text-[11px] text-slate-500">Custom waterproof resin</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Hero Image Container */}
            <div className="relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-slate-200/80 bg-slate-100 group">
                <Image
                  src="/images/pexcover-showcase-hero.jpg"
                  alt="Neatly covered school exercise books with clear sleeves and printed labels"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 600px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-xl p-3.5 shadow-md flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-pex-navy">100% School Compliant Standard</div>
                      <div className="text-[11px] text-slate-500">Clean printed labels & clear protective outer wrap</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-extrabold text-pex-keppel uppercase tracking-wider bg-[#EBF7F5] px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: WHAT IS PEXCOVER? (SIMPLE TERMS EXPLANATION)
      ────────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-20 bg-slate-50/50 border-y border-slate-200/80" aria-labelledby="what-is-pexcover-title">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8 text-left flex flex-col items-start">
            <p className="mb-3 text-pex-keppel text-sm font-semibold leading-tight normal-case text-left">
              Clear &amp; simple explanation
            </p>
            <h2
              id="what-is-pexcover-title"
              className="mb-3 max-w-3xl text-pex-navy font-heading text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold leading-[1.02] tracking-normal text-balance text-left"
            >
              What Exactly Is Pexcover?
            </h2>
            <p className="max-w-3xl mb-8 text-slate-600 text-base sm:text-lg leading-relaxed text-left">
              A hassle-free book preparation service engineered to protect school books, save family time, and help learners walk into class organized from day one.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Visual Showcase Card with Spill Test Photo */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200/80 bg-white shadow-sm">
              <Image
                src="/images/pexcover-spill-protection.jpg"
                alt="Water droplets beading on clear protective book cover and wiped clean with cloth"
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                className="object-cover"
              />
              <div className="absolute top-4 left-4 bg-pex-navy/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5">
                <Droplets size={13} className="text-teal-300" />
                <span>Heavy-Duty Spill Defense</span>
              </div>
            </div>

            {/* 3 Plain-English Comparison Cards */}
            <div className="flex flex-col gap-4">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm transition-all duration-200 hover:shadow-md">
                <div className="text-xs font-extrabold text-pex-keppel tracking-wider mb-2 uppercase">
                  ZERO STICKY RESIDUE
                </div>
                <h3 className="text-lg font-bold text-pex-navy mb-1.5 leading-snug">
                  No Sticky Glue or Messy Adhesive Tape
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed m-0">
                  Standard supermarket plastic rolls wrinkle, trap air bubbles, and leave sticky gum when peeled. Pexcover uses precision clear slip-on sleeves that slide over books with zero adhesive touching the book itself.
                </p>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm transition-all duration-200 hover:shadow-md">
                <div className="text-xs font-extrabold text-pex-keppel tracking-wider mb-2 uppercase">
                  TEXTBOOK FRIENDLY
                </div>
                <h3 className="text-lg font-bold text-pex-navy mb-1.5 leading-snug">
                  Safe for School-Issued Loan Textbooks
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed m-0">
                  Because our protective sleeves slip on without glue or tape, they can be removed in seconds at the end of the school year. You return the textbook to the school in pristine, penalty-free condition.
                </p>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm transition-all duration-200 hover:shadow-md">
                <div className="text-xs font-extrabold text-pex-keppel tracking-wider mb-2 uppercase">
                  CLASSROOM READY
                </div>
                <h3 className="text-lg font-bold text-pex-navy mb-1.5 leading-snug">
                  Uniform Neatness Loved by Teachers
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed m-0">
                  Teachers spend the first two weeks helping learners sort missing labels and bent books. When books arrive pre-covered and clearly printed, lessons start smoothly without classroom disruption.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: THE 3-LAYER PROTECTION BREAKDOWN
      ────────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-20 bg-white" aria-labelledby="layers-title">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8 text-left flex flex-col items-start">
            <p className="mb-3 text-pex-keppel text-sm font-semibold leading-tight normal-case text-left">
              Engineered for the school year
            </p>
            <h2
              id="layers-title"
              className="mb-3 max-w-3xl text-pex-navy font-heading text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold leading-[1.02] tracking-normal text-balance text-left"
            >
              How Each Book Is Covered. Three Protective Layers.
            </h2>
            <p className="max-w-3xl mb-8 text-slate-600 text-base sm:text-lg leading-relaxed text-left">
              We don&apos;t just throw a plastic cover over a book. Every covered book is assembled using a three-stage protective system built to last 200+ school days.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LAYER 1: Inner Backing Paper */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md flex flex-col">
              <div className="text-xs font-extrabold text-pex-keppel tracking-wider mb-3 uppercase">
                LAYER 01 • BASE FOUNDATION
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-pex-navy m-0 mb-3 leading-tight">
                Durable Inner Backing Paper
              </h3>
              <p className="text-slate-600 text-sm sm:text-[15px] leading-relaxed m-0 mb-5 grow">
                High-gsm paper backing that wraps the book cover, providing structural stiffness, high opacity, and clean color.
              </p>

              {/* 3 Styles Breakdown */}
              <div className="space-y-2 mb-5">
                <div
                  onClick={() => setSelectedStyleTab("kraft")}
                  className={cn(
                    "p-2.5 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between",
                    selectedStyleTab === "kraft"
                      ? "bg-[#EBF7F5] border-pex-keppel font-bold text-pex-navy"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70"
                  )}
                >
                  <span className="text-xs">1. Standard Kraft (Classic Brown)</span>
                  {selectedStyleTab === "kraft" && <Check size={14} className="text-pex-keppel" />}
                </div>

                <div
                  onClick={() => setSelectedStyleTab("marbled")}
                  className={cn(
                    "p-2.5 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between",
                    selectedStyleTab === "marbled"
                      ? "bg-[#EBF7F5] border-pex-keppel font-bold text-pex-navy"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70"
                  )}
                >
                  <span className="text-xs">2. Marbled Patterns (Decorative)</span>
                  {selectedStyleTab === "marbled" && <Check size={14} className="text-pex-keppel" />}
                </div>

                <div
                  onClick={() => setSelectedStyleTab("colors")}
                  className={cn(
                    "p-2.5 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between",
                    selectedStyleTab === "colors"
                      ? "bg-[#EBF7F5] border-pex-keppel font-bold text-pex-navy"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70"
                  )}
                >
                  <span className="text-xs">3. Vibrant Solid Colors (Modern)</span>
                  {selectedStyleTab === "colors" && <Check size={14} className="text-pex-keppel" />}
                </div>
              </div>

              <ul className="list-none p-0 m-0 flex flex-col gap-2 border-t border-slate-200 pt-4">
                <li className="flex items-center gap-2 text-sm font-semibold text-pex-navy">
                  <Check size={16} className="text-pex-keppel shrink-0" />
                  <span>Prevents see-through of original cover prints</span>
                </li>
                <li className="flex items-center gap-2 text-sm font-semibold text-pex-navy">
                  <Check size={16} className="text-pex-keppel shrink-0" />
                  <span>Selected style applied consistently across pack</span>
                </li>
              </ul>
            </div>

            {/* LAYER 2: Clear Slip-On Outer Sleeve */}
            <div className="bg-white border-2 border-pex-keppel rounded-2xl p-6 sm:p-8 shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg flex flex-col relative">
              <div className="text-xs font-extrabold text-pex-keppel tracking-wider mb-3 uppercase">
                LAYER 02 • SHIELD &amp; DEFENSE
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-pex-navy m-0 mb-3 leading-tight">
                120+ Micron Clear Slip-On
              </h3>
              <p className="text-slate-600 text-sm sm:text-[15px] leading-relaxed m-0 mb-5 grow">
                Heavy-duty polypropylene protective sleeve that slides over the covered book, forming an armor against daily classroom accidents.
              </p>

              <div className="p-3 rounded-xl bg-[#EBF7F5] border border-[#BBE5DE] text-xs text-slate-700 leading-snug mb-5">
                🛡️ <strong>Double Caliber Thickness:</strong> Standard supermarket plastic is only 50–60 microns. Pexcover sleeves are 120+ microns thick.
              </div>

              <ul className="list-none p-0 m-0 flex flex-col gap-2 border-t border-slate-200 pt-4">
                <li className="flex items-center gap-2 text-sm font-semibold text-pex-navy">
                  <Check size={16} className="text-pex-keppel shrink-0" />
                  <span>100% water and juice spill repellent</span>
                </li>
                <li className="flex items-center gap-2 text-sm font-semibold text-pex-navy">
                  <Check size={16} className="text-pex-keppel shrink-0" />
                  <span>Reinforced edges prevent dog-eared corners</span>
                </li>
                <li className="flex items-center gap-2 text-sm font-semibold text-pex-navy">
                  <Check size={16} className="text-pex-keppel shrink-0" />
                  <span>Slip-on design leaves zero glue on books</span>
                </li>
              </ul>
            </div>

            {/* LAYER 3: Personalized Waterproof Thermal Label */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md flex flex-col">
              <div className="text-xs font-extrabold text-pex-keppel tracking-wider mb-3 uppercase">
                LAYER 03 • IDENTITY &amp; NEATNESS
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-pex-navy m-0 mb-3 leading-tight">
                Personalized Thermal Labels
              </h3>
              <p className="text-slate-600 text-sm sm:text-[15px] leading-relaxed m-0 mb-5 grow">
                Crisp, waterproof labels printed with your child&apos;s full name, grade/class, and subject, placed neatly on the front of each book.
              </p>

              {/* Sample Label Box */}
              <div className="rounded-xl border border-dashed border-pex-keppel/50 bg-slate-50 p-3.5 mb-5 text-left">
                <div className="text-[10px] font-bold text-pex-keppel uppercase tracking-wider mb-1">
                  Pexcover Printed Label Sample
                </div>
                <div className="text-xs font-black text-pex-navy uppercase">
                  Liam Mthembu
                </div>
                <div className="text-[11px] font-semibold text-slate-700">
                  Grade 4B • Mathematics (Book 1)
                </div>
              </div>

              <ul className="list-none p-0 m-0 flex flex-col gap-2 border-t border-slate-200 pt-4">
                <li className="flex items-center gap-2 text-sm font-semibold text-pex-navy">
                  <Check size={16} className="text-pex-keppel shrink-0" />
                  <span>Waterproof synthetic vinyl substrate</span>
                </li>
                <li className="flex items-center gap-2 text-sm font-semibold text-pex-navy">
                  <Check size={16} className="text-pex-keppel shrink-0" />
                  <span>Never smudges, fades, or rubs off</span>
                </li>
                <li className="flex items-center gap-2 text-sm font-semibold text-pex-navy">
                  <Check size={16} className="text-pex-keppel shrink-0" />
                  <span>Clearly legible for teachers and students</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Paper Styles Photo Showcase Banner */}
          <div className="mt-10 rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-50 p-4 sm:p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-full md:w-1/2 aspect-[4/3] rounded-xl overflow-hidden shadow-xs border border-slate-200">
              <Image
                src="/images/pexcover-paper-styles.jpg"
                alt="Three exercise books covered in Kraft, Marbled, and Teal papers side by side"
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover"
              />
            </div>
            <div className="w-full md:w-1/2 text-left">
              <div className="text-xs font-extrabold text-pex-keppel tracking-wider mb-2 uppercase">
                STYLE OPTIONS AVAILABLE
              </div>
              <h4 className="text-xl font-bold text-pex-navy mb-2">
                Choose the Look Your Child Prefers
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Whether your school requires conservative brown kraft paper or your learner wants colorful subject distinction, Pexcover has you covered. Simply choose your paper style in the checkout tray with a single click.
              </p>
              <Link
                href="/schools"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#FF6B53] hover:underline"
              >
                <span>Find your school pack to get started</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: STEP-BY-STEP HOW IT WORKS
      ────────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-12 sm:py-20 bg-slate-50/50 border-y border-slate-200/80" aria-labelledby="how-it-works-title">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8 text-left flex flex-col items-start">
            <p className="mb-3 text-pex-keppel text-sm font-semibold leading-tight normal-case text-left">
              Simple 4-step ordering
            </p>
            <h2
              id="how-it-works-title"
              className="mb-3 max-w-3xl text-pex-navy font-heading text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold leading-[1.02] tracking-normal text-balance text-left"
            >
              How to Add Pexcover to Your Order.
            </h2>
            <p className="max-w-3xl mb-8 text-slate-600 text-base sm:text-lg leading-relaxed text-left">
              Ordering takes less than 60 seconds when choosing your child&apos;s stationery pack.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Step 1 */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col text-left">
              <div className="w-10 h-10 rounded-xl bg-[#EBF7F5] text-pex-keppel font-black text-base flex items-center justify-center mb-4">
                01
              </div>
              <h3 className="text-lg font-bold text-pex-navy mb-2 leading-tight">
                Find Your School &amp; Grade
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4 grow">
                Search your school name and select your child&apos;s grade to view the teacher-verified stationery list.
              </p>
              <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-slate-400">
                100% list match guaranteed
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col text-left">
              <div className="w-10 h-10 rounded-xl bg-[#EBF7F5] text-pex-keppel font-black text-base flex items-center justify-center mb-4">
                02
              </div>
              <h3 className="text-lg font-bold text-pex-navy mb-2 leading-tight">
                Tick &ldquo;Pexcover&rdquo; in Drawer
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4 grow">
                Open your pack in the order tray, tick the Pexcover checkbox, and choose your preferred paper style.
              </p>
              <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-pex-keppel">
                Kraft, Marbled, or Vibrant
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col text-left">
              <div className="w-10 h-10 rounded-xl bg-[#EBF7F5] text-pex-keppel font-black text-base flex items-center justify-center mb-4">
                03
              </div>
              <h3 className="text-lg font-bold text-pex-navy mb-2 leading-tight">
                Enter Learner&apos;s Name
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4 grow">
                Type your child&apos;s full name so our team can print custom waterproof labels for each book.
              </p>
              <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-slate-400">
                Smudge-proof thermal ink
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white border-2 border-pex-keppel rounded-2xl p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col text-left">
              <div className="w-10 h-10 rounded-xl bg-pex-keppel text-white font-black text-base flex items-center justify-center mb-4">
                04
              </div>
              <h3 className="text-lg font-bold text-pex-navy mb-2 leading-tight">
                Arrive First-Day Ready
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4 grow">
                We cover the books, pack everything into your reusable Pexpacks bag, and deliver directly to your school or home.
              </p>
              <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-600">
                Zero home scissors or tape
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: REAL PHOTO SHOWCASE GALLERY
      ────────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-20 bg-white" aria-labelledby="gallery-title">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8 text-left flex flex-col items-start">
            <p className="mb-3 text-pex-keppel text-sm font-semibold leading-tight normal-case text-left">
              Workshop craftsmanship
            </p>
            <h2
              id="gallery-title"
              className="mb-3 max-w-3xl text-pex-navy font-heading text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold leading-[1.02] tracking-normal text-balance text-left"
            >
              Real Pexcover Books in Action.
            </h2>
            <p className="max-w-3xl mb-8 text-slate-600 text-base sm:text-lg leading-relaxed text-left">
              Take a closer look at our workshop fulfillment, precision clear sleeves, and first-day delivered stationery packs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {GALLERY_ITEMS.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm flex flex-col text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full bg-slate-100">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-pex-navy text-base mb-1.5 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed m-0">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6: FREQUENTLY ASKED QUESTIONS BY PARENTS
      ────────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-20 bg-slate-50/50 border-y border-slate-200/80" aria-labelledby="parent-faqs-title">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8 text-left flex flex-col items-start">
            <p className="mb-3 text-pex-keppel text-sm font-semibold leading-tight normal-case text-left">
              Parent questions answered
            </p>
            <h2
              id="parent-faqs-title"
              className="mb-3 max-w-3xl text-pex-navy font-heading text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold leading-[1.02] tracking-normal text-balance text-left"
            >
              Frequently Asked Questions.
            </h2>
            <p className="max-w-3xl mb-8 text-slate-600 text-base sm:text-lg leading-relaxed text-left">
              Have questions about school uniform compliance, pricing, or textbook returns? Find clear answers below.
            </p>
          </div>

          <div className="space-y-3 text-left">
            {PARENT_FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={faq.question}
                  className={cn(
                    "rounded-2xl border transition-all duration-200 overflow-hidden",
                    isOpen
                      ? "bg-white border-pex-keppel shadow-sm"
                      : "bg-white border-slate-200/80 hover:border-slate-300"
                  )}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full py-4 sm:py-5 px-5 sm:px-6 flex items-center justify-between gap-4 text-left font-bold text-pex-navy text-base focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={18}
                      className={cn(
                        "shrink-0 text-slate-400 transition-transform duration-200",
                        isOpen && "rotate-180 text-pex-keppel"
                      )}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-left text-sm text-slate-500">
            Have a question not listed here?{" "}
            <Link href="/contact" className="text-pex-keppel font-bold hover:underline">
              Contact our parent support team
            </Link>{" "}
            or chat with us directly on WhatsApp.
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 7: FINAL CONVERSION CALL TO ACTION
      ────────────────────────────────────────────────────────────── */}
      <section className="pt-12 sm:pt-20">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-pex-navy rounded-3xl p-8 sm:p-12 md:p-16 text-white text-left relative overflow-hidden shadow-lg">
            <div className="max-w-3xl flex flex-col items-start relative z-10">
              <p className="mb-3 text-pex-keppel text-sm font-semibold leading-tight normal-case text-left">
                Start the school year stress-free
              </p>
              <h2 className="mb-3 max-w-3xl text-white font-heading text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold leading-[1.02] tracking-normal text-balance text-left">
                Ready to Save 4+ Hours of Book Wrapping This Year?
              </h2>
              <p className="max-w-2xl mb-8 text-white/80 text-base sm:text-lg leading-relaxed text-left">
                Browse your school&apos;s verified stationery pack, tick Pexcover at checkout, and arrive first-day ready with zero hassle.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
                <Link
                  href="/schools"
                  className="inline-flex items-center justify-center gap-2 bg-[#FF6B53] text-white px-8 py-4 rounded-xl font-bold text-base shadow-sm hover:bg-[#f8593f] active:scale-[0.98] transition-all"
                >
                  <span>Browse School Packs &amp; Select Grade</span>
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/order"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-4 rounded-xl text-base border border-white/20 active:scale-[0.98] transition-all"
                >
                  <span>Upload a Custom Stationery List</span>
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-6 text-xs font-semibold text-teal-200">
                <span className="flex items-center gap-1.5">
                  <Check size={14} className="text-teal-300" />
                  100% School Compliant
                </span>
                <span className="flex items-center gap-1.5">
                  <Check size={14} className="text-teal-300" />
                  Heavy-Duty Spill Protected
                </span>
                <span className="flex items-center gap-1.5">
                  <Check size={14} className="text-teal-300" />
                  Direct School or Home Delivery
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
