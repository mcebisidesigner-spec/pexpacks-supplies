"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Shield,
  Sparkles,
  Check,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Layers,
  Droplets,
  Tag,
  Clock,
  Sparkle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Image Gallery Assets ──
const GALLERY_ITEMS = [
  {
    id: "banner",
    src: "/images/pexcover-banner.webp",
    alt: "Pexcover professional book covering showcase",
    title: "Signature Pexcover Stacks",
    caption: "Neatly wrapped exercise books and textbooks with crystal-clear sleeves and printed labels.",
  },
  {
    id: "process-prep",
    src: "/images/pexcover-img-02.webp",
    alt: "Pexcover book covering process with clear heavy-duty sleeves",
    title: "Heavy-Duty Clear Outer Sleeves",
    caption: "120+ micron protective barrier sealed over durable inner backing paper.",
  },
  {
    id: "labels-stack",
    src: "/images/pexcover-img-03.webp",
    alt: "Neatly labeled school exercise book stack",
    title: "Waterproof Thermal Name Labels",
    caption: "Learner name, grade, and subject cleanly printed with smudge-proof resin ink.",
  },
  {
    id: "workshop",
    src: "/images/pexcover-img-01.webp",
    alt: "Pexpacks team assembling covered school books",
    title: "Professional Workshop Craft",
    caption: "Covered by trained prep specialists with zero adhesive residue or dog-eared corners.",
  },
  {
    id: "ready-pack",
    src: "/images/pexcover-img-04.webp",
    alt: "School pack books ready for class",
    title: "Classroom Ready From Day One",
    caption: "Learners walk into school on day one completely organized and ready to learn.",
  },
  {
    id: "delivery-bag",
    src: "/images/pexcover-img.webp",
    alt: "Finished school stationery pack in reusable bag",
    title: "Direct Pack Delivery",
    caption: "Packed straight into your child's reusable Pexpacks carry bag.",
  },
];

// ── Paper Style Options ──
type PaperOptionId = "kraft" | "marbled" | "colors";

interface PaperStyleShowcase {
  id: PaperOptionId;
  name: string;
  tag: string;
  description: string;
  subDescription: string;
  bgGradient: string;
  borderColor: string;
  accentColor: string;
  features: string[];
}

const PAPER_STYLES: PaperStyleShowcase[] = [
  {
    id: "kraft",
    name: "Standard Kraft",
    tag: "Parent Favorite • Classic",
    description: "Durable, traditional natural brown paper backing with a timeless, clean aesthetic.",
    subDescription: "Heavyweight recycled kraft fibers provide an ultra-resilient foundation that resists creasing and maintains structural stiffness all year long.",
    bgGradient: "linear-gradient(135deg, #c79c6d 0%, #a87944 100%)",
    borderColor: "border-[#b88b58]",
    accentColor: "#94632f",
    features: [
      "Traditional natural earthy tone",
      "Reinforced heavy-gsm recycled paper",
      "Full compliance with conservative school uniform codes",
      "High opacity prevents see-through from inner cover prints",
    ],
  },
  {
    id: "marbled",
    name: "Marbled & Patterned",
    tag: "Decorative & Expressive",
    description: "Eye-catching swirl, geometric, and abstract prints that make books distinctive and easy to find.",
    subDescription: "Vibrant assorted patterns printed on smooth calendered paper that turns ordinary school exercise books into stylish, creative workbooks.",
    bgGradient: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
    borderColor: "border-purple-300",
    accentColor: "#7c3aed",
    features: [
      "Dynamic swirl & textured geometric patterns",
      "Instant subject distinction inside crowded backpacks",
      "High-definition fade-resistant ink pigment",
      "Protected under clear anti-glare outer sleeve",
    ],
  },
  {
    id: "colors",
    name: "Vibrant Solid Colors",
    tag: "Modern & Bold",
    description: "Clean, modern solid-color paper backings designed for color-coded organization.",
    subDescription: "Rich, saturated color blocks (royal navy, emerald green, crimson red, and sun yellow) that let learners quickly spot their books at a single glance.",
    bgGradient: "linear-gradient(135deg, #1E7468 0%, #0d9488 50%, #0284c7 100%)",
    borderColor: "border-teal-300",
    accentColor: "#1E7468",
    features: [
      "Bright, rich saturated color pigments",
      "Ideal for visual subject sorting in primary & high school",
      "Smooth, premium paper feel under protective slip-on",
      "Neat minimalist finish beloved by teachers",
    ],
  },
];

// ── Sizing & PEXCO Classification Table ──
const PEXCO_SIZING_TABLE = [
  {
    code: "PEXCO01",
    classification: "Slim Exercise Books",
    pageRange: "10–36 Pages",
    exampleBooks: "A4 & A5 handwriting books, music staves, vocabulary jotters, spelling registers",
    fitType: "Precision Slim Snug Slip-On",
    spineAllowance: "Flat / Micro-spine (<3mm)",
  },
  {
    code: "PEXCO02",
    classification: "Standard Exercise Books",
    pageRange: "72–80 Pages",
    exampleBooks: "A4 72-page feint & margin, quad margin (graph/maths), Irish & unruled exercise books",
    fitType: "Standard High-Friction Poly Sleeve",
    spineAllowance: "Standard spine (3mm–6mm)",
  },
  {
    code: "PEXCO03",
    classification: "Softcover Readers & Workbooks",
    pageRange: "Flexible Extent",
    exampleBooks: "Department CAPS readers, literature novels, poetry anthologies, language workbooks",
    fitType: "Adaptive Contour Slip Sleeve",
    spineAllowance: "Flexible gusset spine (5mm–12mm)",
  },
  {
    code: "PEXCO04",
    classification: "1 & 2 Quire Hardcovers",
    pageRange: "92–192 Pages",
    exampleBooks: "A4 1-quire & 2-quire hardbound books, accounting ledgers, science lab journals",
    fitType: "Heavy-Gauge Rigid Hardcover Fit",
    spineAllowance: "Deep rigid book board spine (10mm–18mm)",
  },
  {
    code: "PEXCO05",
    classification: "Heavy Hardcovers & Reference",
    pageRange: "Large Volumes",
    exampleBooks: "Oxford school dictionaries, world atlases, large study guides, comprehensive encyclopedias",
    fitType: "Reinforced Jumbo Shield Sleeve",
    spineAllowance: "Extra-wide reinforced spine (18mm–35mm)",
  },
];

// ── Parent FAQs Data ──
const PARENT_FAQS = [
  {
    question: "Are these covers compliant with school and teacher requirements?",
    answer:
      "Yes, 100% compliant. School policies and subject teachers require that underlying book titles and subjects remain immediately legible. Our crystal-clear outer sleeve provides optical transparency while the personalized thermal name label clearly identifies the learner and grade right on the front cover.",
  },
  {
    question: "Can I pick different paper styles for different subjects?",
    answer:
      "When you add Pexcover in your checkout tray, your selected paper style (Standard Kraft, Marbled, or Vibrant Colors) is applied across all coverable exercise books in that grade pack for a unified, clean presentation. If your school list specifies specific color requirements (e.g. Red for Maths, Blue for English), our fulfillment team notes your school's official list rules automatically.",
  },
  {
    question: "What if my child spills water or juice in their backpack?",
    answer:
      "Our 120+ micron heavy-duty polypropylene outer sleeve forms an impermeable barrier against liquid spills, soggy lunch boxes, and rainy walks. Simply wipe off the clear sleeve with a tissue or cloth—the inner backing paper and notebook pages remain completely dry and damage-free.",
  },
  {
    question: "Which books in my child's stationery pack get covered?",
    answer:
      "Every book on your school’s verified stationery list marked as coverable (standard exercise books, hardcover notebooks, workbooks, and textbooks identified with PEXCO codes) is covered. Non-book items like pencil cases, math sets, and calculators remain in their original factory packaging.",
  },
  {
    question: "How are the learner name and subject labels printed?",
    answer:
      "We print every label using high-resolution thermal resin onto waterproof vinyl synthetic labels. Unlike paper stickers or ballpoint handwriting, our labels never smear, fade, peel off from moisture, or smudge from sweaty hands.",
  },
  {
    question: "How much does Pexcover cost?",
    answer:
      "Pexcover is priced transparently per coverable book according to our standardized PEXCO rate card (typically starting from approximately R15–R25 per book depending on the binding size, inclusive of backing paper, clear heavy-duty sleeve, and personalized printed label). The exact total is clearly calculated in your checkout drawer before you finalize your order.",
  },
  {
    question: "Can I add Pexcover if I uploaded a custom school stationery list?",
    answer:
      "Yes! When you upload a stationery list via our Upload-a-List tool, our team inspects all book requirements on the list and enables Pexcover so you can enjoy the same done-for-you covering service.",
  },
  {
    question: "What happens if a book needs to be returned to the school at the end of the year?",
    answer:
      "Pexcover is ideal for school-issued textbooks and library books. Because our clear sleeves slip on without sticky sellotape or permanent glue touching the book itself, the sleeve can be cleanly removed at the end of the academic year, leaving the original school book in pristine, damage-free condition.",
  },
];

export function PexcoverShowcaseClient() {
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [selectedPaper, setSelectedPaper] = useState<PaperOptionId>("kraft");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [demoLearnerName, setDemoLearnerName] = useState("Liam Mthembu");
  const [demoGrade, setDemoGrade] = useState("Grade 4B");
  const [demoSubject, setDemoSubject] = useState("Mathematics (Book 1)");

  const currentPaper = PAPER_STYLES.find((p) => p.id === selectedPaper) || PAPER_STYLES[0];
  const activeImage = GALLERY_ITEMS[activeGalleryIndex];

  return (
    <div className="w-full bg-slate-50/60 pb-20 selection:bg-[#1E7468]/15 selection:text-[#1E7468]">


      {/* ─────────────────────────────────────────────────────────────
          SECTION B: Hero Section
      ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-8 sm:pt-12 md:pt-16 pb-12 sm:pb-16 bg-gradient-to-b from-white via-slate-50/50 to-slate-50">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E7468] text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-xs mb-4 sm:mb-5">
              <Sparkles size={12} className="text-teal-200" />
              <span>Pexcover™ Done-For-You Service</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-black text-slate-900 tracking-tight leading-[1.12] mb-4 sm:mb-6 text-balance">
              Skip the Late-Night Scissors and Tape.{" "}
              <span className="text-[#1E7468] underline decoration-[#BBE5DE] decoration-wavy decoration-2 underline-offset-8">
                Arrive First-Day Ready.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg md:text-xl text-slate-600 font-normal leading-relaxed text-balance mb-6 sm:mb-8">
              Professional school book covering done for you. Premium protective clear sleeves, durable paper backings, and personalized waterproof learner labels—delivered directly in your school stationery pack.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
              <Link
                href="/schools"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FF6B53] text-white px-7 py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-md hover:bg-[#f8593f] active:scale-[0.98] transition-all"
              >
                <span>Find Your School Pack</span>
                <ArrowRight size={17} />
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-slate-800 border border-slate-300 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base hover:bg-slate-100/80 active:scale-[0.98] transition-all shadow-xs"
              >
                <span>See How It Works</span>
              </a>
            </div>

            {/* Micro Highlights Ribbon */}
            <div className="mt-8 pt-6 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EBF7F5] text-[#1E7468] grid place-items-center shrink-0">
                  <Clock size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 leading-tight">4+ Hours Saved</div>
                  <div className="text-[11px] text-slate-500">Zero home wrapping</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EBF7F5] text-[#1E7468] grid place-items-center shrink-0">
                  <Shield size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 leading-tight">120+ Micron</div>
                  <div className="text-[11px] text-slate-500">Heavy-duty barrier</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EBF7F5] text-[#1E7468] grid place-items-center shrink-0">
                  <Droplets size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 leading-tight">Spill Proof</div>
                  <div className="text-[11px] text-slate-500">Water & juice defense</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EBF7F5] text-[#1E7468] grid place-items-center shrink-0">
                  <Tag size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 leading-tight">Thermal Labels</div>
                  <div className="text-[11px] text-slate-500">Smudge-free print</div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image Showcase Container */}
          <div className="relative mt-2">
            <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-2xl shadow-xl border border-slate-200 bg-slate-900 group">
              <Image
                src={activeImage.src}
                alt={activeImage.alt}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-cover object-center w-full h-full transition-transform duration-700 group-hover:scale-[1.02]"
              />

              {/* Glossy Sheen Overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 30%, transparent 60%, rgba(0,0,0,0.5) 100%)",
                }}
              />

              {/* Floating Badge on Showcase */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-white/20 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Verified School Standard • PEXCO Class</span>
              </div>

              {/* Caption Overlay Bar */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent p-4 sm:p-6 text-white flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2">
                <div>
                  <h3 className="text-base sm:text-xl font-bold tracking-tight text-white mb-0.5">
                    {activeImage.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                    {activeImage.caption}
                  </p>
                </div>
                <div className="text-xs font-semibold text-teal-300 shrink-0 bg-teal-950/60 px-2.5 py-1 rounded-md border border-teal-500/30">
                  Slide {activeGalleryIndex + 1} of {GALLERY_ITEMS.length}
                </div>
              </div>
            </div>

            {/* Showcase Thumbnails Selector */}
            <div className="mt-4 flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none">
              {GALLERY_ITEMS.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setActiveGalleryIndex(index)}
                  className={cn(
                    "relative shrink-0 w-20 sm:w-28 h-14 sm:h-18 rounded-lg overflow-hidden border-2 transition-all duration-150 focus:outline-none",
                    activeGalleryIndex === index
                      ? "border-[#1E7468] ring-2 ring-[#1E7468]/30 shadow-md scale-105"
                      : "border-slate-200 opacity-70 hover:opacity-100"
                  )}
                  aria-label={`View ${item.title}`}
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION C: The 3-Layer Protection Breakdown (Grid Layout)
      ────────────────────────────────────────────────────────────── */}
      <section id="protection-layers" className="py-14 sm:py-20 bg-white border-y border-slate-200/80">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#1E7468] mb-2">
              Engineering Excellence
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              The 3-Layer Protection System
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Every book covered by Pexcover is engineered to endure 200+ school days of backpack friction, desk drops, and daily note-taking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {/* LAYER 1: Inner Backing Paper */}
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm hover:border-[#1E7468]/40 hover:shadow-md transition-all duration-200 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#1E7468] bg-[#EBF7F5] px-2.5 py-1 rounded-md border border-[#BBE5DE]">
                  Layer 01 • Base Foundation
                </span>
                <Layers size={18} className="text-[#1E7468]" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                Inner Backing Paper
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">
                Choose between 3 distinct backing styles that provide opacity, rigidity, and aesthetic personality:
              </p>

              {/* 3 Styles Sub-Cards / In-Place Selector */}
              <div className="space-y-3 mb-6 flex-1">
                {PAPER_STYLES.map((style) => (
                  <div
                    key={style.id}
                    onClick={() => setSelectedPaper(style.id)}
                    className={cn(
                      "p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 flex items-start gap-3",
                      selectedPaper === style.id
                        ? "bg-[#EBF7F5] border-[#1E7468] shadow-xs"
                        : "bg-slate-50/70 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <div
                      className="w-10 h-10 rounded-lg shrink-0 shadow-xs border border-black/10 flex items-center justify-center text-white"
                      style={{ background: style.bgGradient }}
                    >
                      {selectedPaper === style.id ? (
                        <Check size={16} strokeWidth={3} className="text-white drop-shadow-md" />
                      ) : (
                        <Sparkle size={14} className="text-white/80" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 leading-snug">
                          {style.name}
                        </span>
                        {style.id === "kraft" && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                        {style.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic Paper Benefit Callout */}
              <div className="pt-4 border-t border-slate-100 text-xs text-slate-600 flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#1E7468] shrink-0" />
                <span>Selected style applied consistently across your whole pack.</span>
              </div>
            </div>

            {/* LAYER 2: Clear Slip-On Outer Sleeve */}
            <div className="flex flex-col rounded-2xl border-2 border-[#1E7468] bg-[#EBF7F5]/50 p-6 sm:p-7 shadow-md relative overflow-hidden">
              <div className="absolute -top-1 -right-1 bg-[#1E7468] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-xs">
                Signature Shield
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#1E7468] bg-white px-2.5 py-1 rounded-md border border-[#BBE5DE]">
                  Layer 02 • Shield & Defense
                </span>
                <Shield size={18} className="text-[#1E7468]" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                120+ Micron Clear Slip-On
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">
                Crystal-clear, heavy-gauge polypropylene sleeve that forms an armor-like shield around the book.
              </p>

              <div className="space-y-3.5 mb-6 flex-1 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#1E7468] text-white grid place-items-center shrink-0 mt-0.5">
                    <Check size={11} strokeWidth={3} />
                  </div>
                  <span>
                    <strong>120+ Micron Caliber:</strong> Double the thickness of standard supermarket self-adhesive plastic.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#1E7468] text-white grid place-items-center shrink-0 mt-0.5">
                    <Check size={11} strokeWidth={3} />
                  </div>
                  <span>
                    <strong>Zero Sticky Residue:</strong> Slip-on design means no glue or adhesive tape ruins original covers or textbooks.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#1E7468] text-white grid place-items-center shrink-0 mt-0.5">
                    <Check size={11} strokeWidth={3} />
                  </div>
                  <span>
                    <strong>Liquid & Juice Barrier:</strong> 100% water-repellent surface that wipes dry with a single towel swipe.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#1E7468] text-white grid place-items-center shrink-0 mt-0.5">
                    <Check size={11} strokeWidth={3} />
                  </div>
                  <span>
                    <strong>Reinforced Seams:</strong> Ultrasonic welded edges prevent dog-earing and corner tearing in school bags.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#BBE5DE] text-[11px] text-slate-600 leading-snug">
                💡 <strong>End of Year Bonus:</strong> Slip off cleanly from school-issued loan textbooks without penalty fees!
              </div>
            </div>

            {/* LAYER 3: Personalized Waterproof Thermal Label */}
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm hover:border-[#1E7468]/40 hover:shadow-md transition-all duration-200 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#1E7468] bg-[#EBF7F5] px-2.5 py-1 rounded-md border border-[#BBE5DE]">
                  Layer 03 • Identity & Neatness
                </span>
                <Tag size={18} className="text-[#1E7468]" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                Personalized Waterproof Label
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
                Industrial thermal printed resin labels positioned neatly on the front of every covered book.
              </p>

              {/* Interactive Label Generator Mockup */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-5 flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    Interactive Label Preview
                  </span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    Resin Printed
                  </span>
                </div>

                {/* The Label Mockup Box */}
                <div className="bg-white border-2 border-dashed border-[#1E7468]/40 rounded-lg p-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#1E7468]">
                      Pexcover™ Official Book Label
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">2026 Academic</span>
                  </div>
                  <div className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    {demoLearnerName || "Learner Name"}
                  </div>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">
                    {demoGrade || "Grade / Class"}
                  </div>
                  <div className="text-xs font-semibold text-[#1E7468] mt-0.5">
                    {demoSubject || "Subject"}
                  </div>
                </div>

                {/* Micro Input Controls to Test Personalization */}
                <div className="mt-3 pt-3 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Test Name</label>
                    <input
                      type="text"
                      value={demoLearnerName}
                      onChange={(e) => setDemoLearnerName(e.target.value)}
                      className="w-full mt-0.5 px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-[#1E7468]"
                      placeholder="Learner name"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Test Grade</label>
                    <input
                      type="text"
                      value={demoGrade}
                      onChange={(e) => setDemoGrade(e.target.value)}
                      className="w-full mt-0.5 px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-[#1E7468]"
                      placeholder="Grade"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-xs text-slate-600 flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#1E7468] shrink-0" />
                <span>Smudge-proof thermal ink will never run or peel.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION D: Step-by-Step "How It Works" (#how-it-works)
      ────────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-14 sm:py-20 bg-slate-50">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#1E7468] mb-2 block">
              Zero Friction Process
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              How Pexcover Works in 4 Simple Steps
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              From list selection to first-day classroom unpack—we handle the tedious scissors and tape so you don't have to.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Step 1 */}
            <div className="flex flex-col bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative group hover:border-[#1E7468] hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-[#EBF7F5] text-[#1E7468] font-black text-lg flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Pick Your Grade Pack
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Choose your pre-configured school pack matching your school’s verified stationery and exercise book list.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] font-semibold text-slate-400">
                100% list parity guaranteed
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative group hover:border-[#1E7468] hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-[#EBF7F5] text-[#1E7468] font-black text-lg flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Tick "Done-For-You" Pexcover
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Select Pexcover in the checkout drawer and choose your preferred backing paper (Kraft, Marbled, or Vibrant).
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] font-semibold text-[#1E7468]">
                One-click in checkout drawer
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative group hover:border-[#1E7468] hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-[#EBF7F5] text-[#1E7468] font-black text-lg flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Add Learner Details
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Enter the learner’s full name and grade/class for automated, crisp waterproof thermal label printing.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] font-semibold text-slate-400">
                Smudge-proof resin printed
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative group hover:border-[#1E7468] hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-[#1E7468] text-white font-black text-lg flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                04
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Delivered First-Day Ready
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Unpack neatly covered, ready-to-use books straight out of your reusable Pexpacks bag on day one.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] font-semibold text-emerald-600">
                Zero stress or late-night tape
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION E: Sizing & PEXCO Classification Table (#sizes-standards)
      ────────────────────────────────────────────────────────────── */}
      <section id="sizes-standards" className="py-14 sm:py-20 bg-white border-y border-slate-200/80">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#1E7468] mb-2 block">
                Precision Fit Matrix
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                PEXCO Fit & Sizing Classification
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
                We calibrate each sleeve size to the millimeter so book spines never buckle and corners never slide.
              </p>
            </div>
            <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-2.5 max-w-xs shrink-0">
              🔒 Standardized under Pexpacks Quality Contract 2026.
            </div>
          </div>

          {/* Responsive Table Wrapper */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#EBF7F5] border-b border-[#BBE5DE] text-slate-900 font-extrabold text-[11px] sm:text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">PEXCO Code</th>
                  <th className="py-3.5 px-4 sm:px-6">Classification</th>
                  <th className="py-3.5 px-4 sm:px-6">Page Extent</th>
                  <th className="py-3.5 px-4 sm:px-6">Common School Books</th>
                  <th className="py-3.5 px-4 sm:px-6">Sleeve Precision Standard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                {PEXCO_SIZING_TABLE.map((row) => (
                  <tr key={row.code} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-mono font-bold text-[#1E7468]">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-[#EBF7F5] border border-[#BBE5DE]">
                        {row.code}
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 font-bold text-slate-900">
                      {row.classification}
                    </td>
                    <td className="py-4 px-4 sm:px-6 font-semibold text-slate-600">
                      {row.pageRange}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-slate-600 max-w-xs">
                      {row.exampleBooks}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-slate-700 font-medium">
                      <div>{row.fitType}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{row.spineAllowance}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <span>* Every pack automatically associates required book items with their exact PEXCO rate code.</span>
            <Link href="/schools" className="text-[#1E7468] font-bold hover:underline inline-flex items-center gap-1">
              Find your school's exact pack list &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION F: Interactive Photo Gallery (#gallery)
      ────────────────────────────────────────────────────────────── */}
      <section id="gallery" className="py-14 sm:py-20 bg-slate-50">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#1E7468] mb-2 block">
              Behind the Scenes
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Craftsmanship In Action
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Take a closer look at our workshop fulfillment, precision clear sleeves, and first-day delivered stationery packs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GALLERY_ITEMS.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => {
                  setActiveGalleryIndex(idx);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="group relative rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-xs hover:shadow-lg hover:border-[#1E7468]/50 transition-all duration-300 cursor-pointer flex flex-col"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <span>View in Hero</span>
                      <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#1E7468] transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {item.caption}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION G: Common Parent FAQs (#faqs)
      ────────────────────────────────────────────────────────────── */}
      <section id="faqs" className="py-14 sm:py-20 bg-white border-y border-slate-200/80">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#1E7468] mb-2 block">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Frequently Asked Questions by Parents
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Everything you need to know about school compliance, paper styles, and spill protection.
            </p>
          </div>

          <div className="space-y-3">
            {PARENT_FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={faq.question}
                  className={cn(
                    "rounded-xl border transition-all duration-200 overflow-hidden",
                    isOpen
                      ? "bg-[#EBF7F5]/40 border-[#BBE5DE] shadow-xs"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  )}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full py-4 px-5 sm:px-6 flex items-center justify-between gap-4 text-left font-bold text-slate-900 text-sm sm:text-base focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={18}
                      className={cn(
                        "shrink-0 text-slate-500 transition-transform duration-200",
                        isOpen && "rotate-180 text-[#1E7468]"
                      )}
                    />
                  </button>

                  <div
                    className={cn(
                      "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Secondary FAQ Help Prompt */}
          <div className="mt-8 text-center text-xs sm:text-sm text-slate-500">
            Have a custom school requirement or unique book format?{" "}
            <Link href="/contact" className="text-[#1E7468] font-bold hover:underline">
              Speak with our support team
            </Link>{" "}
            or chat with us directly on WhatsApp.
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION H: Bottom Call-to-Action Card
      ────────────────────────────────────────────────────────────── */}
      <section className="pt-14 sm:pt-20">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 md:p-16 text-white text-center shadow-xl bg-gradient-to-r from-[#165A51] via-[#1E7468] to-[#165A51]">
            {/* Background Decorative Rings */}
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none blur-xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none blur-xl" />

            <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-teal-100 text-[11px] font-black uppercase tracking-wider shadow-xs mb-5">
                <Sparkles size={12} className="text-teal-300" />
                <span>Zero Late-Night Scissors and Tape Guaranteed</span>
              </div>

              {/* Headline */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4 text-balance">
                Ready to save 4+ hours of book wrapping this year?
              </h2>

              {/* Sub-headline */}
              <p className="text-sm sm:text-base md:text-lg text-teal-100/90 leading-relaxed mb-8 max-w-2xl text-balance font-normal">
                Join thousands of South African parents who skip the back-to-school stress. Order your school-approved stationery pack with Pexcover today and arrive first-day ready.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <Link
                  href="/schools"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FF6B53] text-white font-bold px-8 py-4 rounded-xl text-base shadow-lg hover:bg-[#f8593f] active:scale-[0.98] transition-all"
                >
                  <span>Browse School Packs &amp; Select Grade</span>
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/order"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-4 rounded-xl text-base backdrop-blur-xs border border-white/20 active:scale-[0.98] transition-all"
                >
                  <span>Upload a Custom List</span>
                </Link>
              </div>

              {/* Reassurance Micro-Badges */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold text-teal-200">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-teal-300" />
                  100% School Compliant
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-teal-300" />
                  Liquid &amp; Spill Protected
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-teal-300" />
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
