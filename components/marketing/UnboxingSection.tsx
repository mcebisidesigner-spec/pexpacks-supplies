"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useId, FormEvent } from "react";
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
  ChevronDown,
  Eye,
  X,
  Search,
  ArrowRight,
  Info,
  ExternalLink,
} from "lucide-react";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { IMAGE_BLUR_DATA_URL } from "@/lib/constants";
import { useHideHeaderOnScroll } from "@/hooks/useHideHeaderOnScroll";
import {
  getRecentSchoolVisits,
  RECENT_SCHOOL_VISITS_EVENT,
} from "@/components/schools/schoolVisitTracker";
import {
  rankHybridSchools,
  type HybridSchoolItem,
} from "@/lib/schools/hybridSchoolRanking";
import { cn } from "@/lib/utils";

type StationeryItem = {
  brand: string;
  brandLogo: string;
  product: string;
  quantityBadge: string;
  description: string;
  teacherNote: string;
  specs?: string;
};

type ItemCategory = {
  id: string;
  name: string;
  icon: typeof PenTool;
  headline: string;
  items: StationeryItem[];
};

type ExampleGradePack = {
  id: string;
  label: string;
  phase: string;
  phaseBadge: string;
  boxTitle: string;
  demoSubtitle: string;
  categories: ItemCategory[];
};

const POPULAR_SEARCH_PRESETS = [
  "Bryanston Primary School",
  "Camps Bay High School",
  "Crawford International",
  "Durban Girls' College",
  "Parktown Boys' High",
  "St Stithians College",
  "Grade 1 Foundation Pack",
  "Grade 4 Intermediate Pack",
  "Grade 8 Senior Pack",
];

const GRADE_PACKS: Record<string, ExampleGradePack> = {
  "grade-4": {
    id: "grade-4",
    label: "Grade 4 Pack",
    phase: "Intermediate Phase",
    phaseBadge: "Intermediate Phase • Ages 9–10",
    boxTitle: "Pexpacks Intermediate Phase Box • 2027 Grade 4 Kit",
    demoSubtitle:
      "Representative Grade 4 pack featuring handwriting ballpoints, HB pencils, starter geometry, and feint/margin books.",
    categories: [
      {
        id: "writing",
        name: "Writing & Colouring",
        icon: PenTool,
        headline: "Crisp lines & vibrant creativity",
        items: [
          {
            brand: "Staedtler",
            brandLogo: "/images/stationery-brands/staedtler.svg",
            product: "Noris HB Pencils",
            quantityBadge: "Pack of 12",
            description:
              "Classic yellow & black striped break-resistant German lead.",
            teacherNote:
              "Classroom staple. High-density lead resists breaking under intermediate learner pressure.",
            specs: "Grade HB • 2mm German graphite core • FSC certified wood",
          },
          {
            brand: "Staedtler",
            brandLogo: "/images/stationery-brands/staedtler.svg",
            product: "Noris Club 24 Coloured Pencils",
            quantityBadge: "Pack of 24",
            description:
              "Rich, vivid pigments with high break resistance for class art.",
            teacherNote:
              "Required for geography mapping, science diagrams, and creative arts projects.",
            specs:
              "24 hexagonal colored pencils with white A.B.S. protective coating",
          },
          {
            brand: "Bic",
            brandLogo: "/images/stationery-brands/bic.svg",
            product: "Cristal Ballpoint Pens",
            quantityBadge: "4x Pens (3 Blue, 1 Red)",
            description:
              "Smooth, skip-free ink flow for everyday classwork & marking.",
            teacherNote:
              "Approved for transition to penmanship; does not seep through standard exercise book pages.",
            specs:
              "1.0mm medium point • Clear hexagonal barrel • Tungsten carbide ball",
          },
          {
            brand: "Staedtler",
            brandLogo: "/images/stationery-brands/staedtler.svg",
            product: "Rasoplast Eraser & Sharpener",
            quantityBadge: "1x Eraser + 1x Sharpener",
            description:
              "Clean pencil erasing without paper smudges or tearing.",
            teacherNote:
              "Phthalate-free vinyl eraser prevents greasy film on lined pages.",
            specs:
              "Phthalate-free white vinyl • Double-hole metal canister sharpener",
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
            brandLogo: "/images/stationery-brands/pritt.svg",
            product: "Original Glue Stick (43g)",
            quantityBadge: "2x 43g Jumbo Sticks",
            description:
              "Non-toxic, solvent-free South African school classroom favorite.",
            teacherNote:
              "Mandated by teachers because it applies cleanly without wrinkling thin workbook pages.",
            specs:
              "43g solvent-free formula • 97% natural ingredients • Washable at 20°C",
          },
          {
            brand: "Bostik",
            brandLogo: "/images/stationery-brands/bostik.svg",
            product: "Genuine Blu Tack",
            quantityBadge: "1x 100g Pack",
            description:
              "Reusable adhesive putty ideal for posters, charts & projects.",
            teacherNote:
              "Standard classroom supply for hanging periodic tables and curriculum charts.",
            specs: "100g clean reusable adhesive • Non-greasy • Solvent-free",
          },
          {
            brand: "Marlin",
            brandLogo: "/images/stationery-brands/marlin.svg",
            product: "Kids Safety Scissors (13cm)",
            quantityBadge: "1x 13cm Scissors",
            description:
              "Rounded safety tips with ergonomic handles designed for young hands.",
            teacherNote:
              "Comfortable ambidextrous grip with precision stainless steel blades.",
            specs: "13cm length • Blunt safety tip • Stainless steel blade",
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
            brand: "Marlin",
            brandLogo: "/images/stationery-brands/marlin.svg",
            product: "30cm Clear Shatterproof Ruler",
            quantityBadge: "1x 30cm Ruler",
            description:
              "Clear metric markings with anti-shatter durable acrylic.",
            teacherNote:
              "Explicitly requested by primary educators to prevent snapping injuries.",
            specs:
              "30cm metric & millimetre scale • Beveled drawing edge • Shatterproof",
          },
          {
            brand: "Marlin",
            brandLogo: "/images/stationery-brands/marlin.svg",
            product: "Maths Instrument Geometry Set",
            quantityBadge: "1x 9-Piece Tin Set",
            description:
              "Compass, protractor & set squares tailored for geometry.",
            teacherNote:
              "Starter geometry pack for angles, shapes, and technical drawing lessons.",
            specs:
              "Sturdy metal tin • Metal pencil compass • 180° protractor • 45° & 60° set squares",
          },
          {
            brand: "Casio",
            brandLogo: "/images/stationery-brands/casio.svg",
            product: "Desktop 8-Digit School Calculator",
            quantityBadge: "1x Calculator",
            description:
              "Clear dual-power display suited for intermediate arithmetic.",
            teacherNote:
              "Compact solar/battery calculator compliant with CAPS Grade 4–6 guidelines.",
            specs:
              "Large 8-digit LCD • Dual solar/battery power • Non-programmable",
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
            brandLogo: "/images/stationery-brands/croxley.svg",
            product: "A4 Feint & Margin Exercise Books",
            quantityBadge: "8x 72-Page Books",
            description:
              "Premium high-opacity paper preventing pen bleed-through.",
            teacherNote:
              "Standard South African 8mm feint lines with red margin rule.",
            specs:
              "A4 (297x210mm) • 72 pages • 80gsm high-opacity bond paper • Gloss varnished cover",
          },
          {
            brand: "Croxley",
            brandLogo: "/images/stationery-brands/croxley.svg",
            product: "A4 Quad & Margin Maths Books",
            quantityBadge: "4x 72-Page Books",
            description:
              "Standard graph ruled pages for calculations and neat columns.",
            teacherNote:
              "5mm quad grid essential for alignment in long division and column addition.",
            specs: "A4 • 72 pages • 5mm squared grid • Stitched binding",
          },
          {
            brand: "Bantex",
            brandLogo: "/images/stationery-brands/bantex.svg",
            product: "20-Pocket Clear View Flip File",
            quantityBadge: "1x 20-Pocket File",
            description:
              "Durable presentation sleeve for portfolios, tests & certificates.",
            teacherNote:
              "Copysafe clear sleeves prevent print transfer from photocopied assessments.",
            specs:
              "A4 size • 20 copysafe polypropylene pockets • Insertable spine label",
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
            brandLogo: "/images/logo-icon.svg",
            product: "Heavy-Duty Handle Carry Box",
            quantityBadge: "1x Carry Case",
            description:
              "Sturdy corrugated craft box keeps books pristine and easy to carry.",
            teacherNote:
              "Custom designed to hold all year-long books flat without dog-earing pages.",
            specs:
              "350gsm flute corrugated kraft cardboard • Die-cut reinforced handle • Water-resistant exterior",
          },
          {
            brand: "Pexpacks",
            brandLogo: "/images/logo-icon.svg",
            product: "Personalized Learner ID Label",
            quantityBadge: "1x Waterproof Tag",
            description:
              "Clearly marked with learner's name and grade for day-one peace of mind.",
            teacherNote:
              "Guarantees immediate recovery if left in hallways or school buses.",
            specs:
              "Waterproof vinyl • Smudge-proof thermal ink • Child's full name, grade & class",
          },
          {
            brand: "Classroom",
            brandLogo: "/images/logo-icon.svg",
            product: "Student Multimedia Headphones",
            quantityBadge: "1x Padded Headset",
            description:
              "Comfortable padded stereo headset for computer lab & tablet learning.",
            teacherNote:
              "Requested for e-learning, interactive phonics, and reading comprehension apps.",
            specs:
              "Adjustable headband • Padded on-ear cushions • 3.5mm stereo jack • Tangle-resistant cord",
          },
        ],
      },
    ],
  },
  "grade-1": {
    id: "grade-1",
    label: "Grade 1 Pack",
    phase: "Foundation Phase",
    phaseBadge: "Foundation Phase • Ages 6–7",
    boxTitle: "Pexpacks Foundation Phase Box • 2027 Grade 1 Kit",
    demoSubtitle:
      "Representative Grade 1 starter pack featuring thick triangular learner pencils, jumbo wax crayons, and safe craft essentials.",
    categories: [
      {
        id: "writing",
        name: "Writing & Colouring",
        icon: PenTool,
        headline: "Ergonomic grips tailored for beginner writers",
        items: [
          {
            brand: "Staedtler",
            brandLogo: "/images/stationery-brands/staedtler.svg",
            product: "Noris Jumbo Triangular HB Pencils",
            quantityBadge: "Pack of 12",
            description:
              "Extra-thick triangular barrel encourages correct ergonomic tripod grip.",
            teacherNote:
              "Recommended by South African occupational therapists for Grade 1 writing development.",
            specs:
              "Thick 4mm German lead • Ergonomic triangular grip • Unvarnished natural wood",
          },
          {
            brand: "Staedtler",
            brandLogo: "/images/stationery-brands/staedtler.svg",
            product: "Noris Club 12 Jumbo Wax Crayons",
            quantityBadge: "Pack of 12",
            description:
              "Vibrant, high-wax coverage with paper sleeve to keep little fingers clean.",
            teacherNote:
              "Essential for early childhood motor control and creative expressive art.",
            specs:
              "12 vibrant colours • Paper wrapped • Waterproof & break-resistant",
          },
          {
            brand: "Staedtler",
            brandLogo: "/images/stationery-brands/staedtler.svg",
            product: "Jumbo Double Hole Canister Sharpener",
            quantityBadge: "1x Sharpener",
            description:
              "Container sharpener with safety lock for both standard and jumbo pencils.",
            teacherNote:
              "Spill-proof lid prevents shavings from dropping on desks and carpets.",
            specs:
              "Double hole (8.2mm & 10.2mm) • Safety twist lock • Shatterproof container",
          },
          {
            brand: "Staedtler",
            brandLogo: "/images/stationery-brands/staedtler.svg",
            product: "Rasoplast Large Clean Eraser",
            quantityBadge: "2x Erasers",
            description:
              "Soft vinyl eraser specially formulated for beginner handwriting lines.",
            teacherNote:
              "Erases softly without gouging or tearing delicate 60gsm practice worksheets.",
            specs: "Phthalate-free vinyl • Protective sliding cardboard sleeve",
          },
        ],
      },
      {
        id: "craft",
        name: "Cutting & Adhesives",
        icon: Scissors,
        headline: "Safe, non-toxic preschool and primary craft",
        items: [
          {
            brand: "Pritt",
            brandLogo: "/images/stationery-brands/pritt.svg",
            product: "Original Glue Stick (43g)",
            quantityBadge: "4x 43g Jumbo Sticks",
            description:
              "High-volume solvent-free adhesive lasting through multiple term projects.",
            teacherNote:
              "Grade 1 classrooms use glue daily for pasting phonics worksheets and art.",
            specs:
              "43g jumbo size • 97% natural ingredients • Odourless & non-toxic",
          },
          {
            brand: "Marlin",
            brandLogo: "/images/stationery-brands/marlin.svg",
            product: "Blunt Safety Preschool Scissors",
            quantityBadge: "1x 13cm Scissors",
            description:
              "Safety rounded tip designed specifically to protect little fingers.",
            teacherNote:
              "Precision alignment allows accurate cutting of card and paper without pinching.",
            specs:
              "Rounded safety tip • Soft-grip handle • Stainless steel blades",
          },
          {
            brand: "Bostik",
            brandLogo: "/images/stationery-brands/bostik.svg",
            product: "Genuine Blu Tack (Adhesive Putty)",
            quantityBadge: "1x 100g Slab",
            description:
              "Mess-free reusable putty for temporary display of drawings.",
            teacherNote:
              "Clean adhesion without leaving greasy residue on classroom walls.",
            specs: "Non-toxic • Reusable • Clean formulation",
          },
        ],
      },
      {
        id: "maths",
        name: "STEM & Mathematics",
        icon: Calculator,
        headline: "Hands-on counting and measuring essentials",
        items: [
          {
            brand: "Marlin",
            brandLogo: "/images/stationery-brands/marlin.svg",
            product: "30cm Clear Shatterproof Ruler",
            quantityBadge: "1x 30cm Ruler",
            description:
              "Clear metric markings with bold numerals for easy early reading.",
            teacherNote:
              "Helps learners visualize centimetre spacing and draw straight borders.",
            specs: "Bold centimetre numerals • Flexible shatterproof material",
          },
          {
            brand: "Croxley",
            brandLogo: "/images/stationery-brands/croxley.svg",
            product: "Abacus / Counters Set (100 Pieces)",
            quantityBadge: "1x 100-Pack",
            description:
              "Colourful plastic tokens for concrete number concept learning.",
            teacherNote:
              "Standard CAPS foundation tool for teaching addition and grouping.",
            specs: "100 durable multi-coloured tokens in resealable pouch",
          },
        ],
      },
      {
        id: "books",
        name: "Books & Filing",
        icon: BookOpen,
        headline: "Durable foundation phase lined workbooks",
        items: [
          {
            brand: "Croxley",
            brandLogo: "/images/stationery-brands/croxley.svg",
            product: "A4 Irish Ruled Exercise Books (72pg)",
            quantityBadge: "6x 72-Page Books",
            description:
              "Wide spacing for early letter formation and introductory handwriting.",
            teacherNote:
              "Mandated wide ruling for Grade 1 print-to-cursive readiness.",
            specs: "Irish ruled lines • 72 pages • High-opacity paper",
          },
          {
            brand: "Croxley",
            brandLogo: "/images/stationery-brands/croxley.svg",
            product: "A4 Unruled / Blank Drawing Books",
            quantityBadge: "4x 72-Page Books",
            description:
              "Clean blank sheets for illustration, phonics drawing, and cut-and-paste.",
            teacherNote:
              "High grammage pages prevent glue soaking through to the reverse side.",
            specs: "Blank white pages • 80gsm paper • Sturdy card cover",
          },
          {
            brand: "Bantex",
            brandLogo: "/images/stationery-brands/bantex.svg",
            product: "20-Pocket Clear View Flip File",
            quantityBadge: "1x 20-Pocket File",
            description:
              "Organizes weekly reading worksheets and assessment reports.",
            teacherNote:
              "Teachers store sight word lists and homework sheets inside.",
            specs: "Copysafe clear plastic • Wipe-clean exterior",
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
            brandLogo: "/images/logo-icon.svg",
            product: "Heavy-Duty Handle Carry Box",
            quantityBadge: "1x Carry Case",
            description:
              "Reinforced handle carry box sized perfectly for Grade 1 school bags.",
            teacherNote:
              "Prevents bent corners and ruined books on the daily school run.",
            specs:
              "Heavy-duty corrugated kraft cardboard with die-cut carry handle",
          },
          {
            brand: "Pexpacks",
            brandLogo: "/images/logo-icon.svg",
            product: "Personalized Learner ID Label",
            quantityBadge: "1x Waterproof Tag",
            description:
              "High-contrast printed tag with learner's full name and Grade 1 class.",
            teacherNote:
              "Critical during the chaotic first weeks of school to prevent lost packs.",
            specs:
              "Waterproof vinyl tag with scratch-resistant permanent print",
          },
        ],
      },
    ],
  },
  "grade-8": {
    id: "grade-8",
    label: "Grade 8 Pack",
    phase: "Senior Phase",
    phaseBadge: "Senior Phase • Ages 13–14",
    boxTitle: "Pexpacks Senior Phase Box • 2027 Grade 8 Kit",
    demoSubtitle:
      "Representative Grade 8 pack featuring DBE-approved Casio scientific calculator, high-yield ballpoints, full geometry tin, and multi-subject filing.",
    categories: [
      {
        id: "writing",
        name: "Writing & Colouring",
        icon: PenTool,
        headline: "High-volume note taking & exam marking",
        items: [
          {
            brand: "Bic",
            brandLogo: "/images/stationery-brands/bic.svg",
            product: "Cristal Ballpoint Pens Value Pack",
            quantityBadge: "Pack of 10 (8 Blue, 2 Black)",
            description:
              "High-mileage ballpoint pens engineered for secondary school exam volumes.",
            teacherNote:
              "High school teachers require black/blue pens only; crisp line for legible script.",
            specs:
              "1.0mm medium line • Over 2km write-out length • Clear barrel for ink monitoring",
          },
          {
            brand: "Staedtler",
            brandLogo: "/images/stationery-brands/staedtler.svg",
            product: "Noris HB & 2B Drawing Pencils",
            quantityBadge: "Pack of 6",
            description:
              "Dual grade pencil pack for everyday calculations and technical design.",
            teacherNote:
              "2B lead required for shading in arts & technology drawing.",
            specs:
              "Graded HB and 2B German graphite cores • Break-resistant bonding",
          },
          {
            brand: "Staedtler",
            brandLogo: "/images/stationery-brands/staedtler.svg",
            product: "Textsurfer Classic Highlighters",
            quantityBadge: "Pack of 4 Pastel",
            description:
              "Fast-drying highlighter ink that won't smudge ballpoint handwriting.",
            teacherNote:
              "Essential for study summaries, comprehension texts, and exam preparation.",
            specs: "Chisel tip 1–5mm • Lightfast pigment • Large ink reservoir",
          },
        ],
      },
      {
        id: "craft",
        name: "Cutting & Adhesives",
        icon: Scissors,
        headline: "Classroom crafting & project assembly",
        items: [
          {
            brand: "Pritt",
            brandLogo: "/images/stationery-brands/pritt.svg",
            product: "Original Glue Stick (43g)",
            quantityBadge: "2x 43g Jumbo Sticks",
            description:
              "Solvent-free instant adhesion for science projects and visual arts portfolios.",
            teacherNote:
              "Applies smoothly without paper cockling or discoloration over time.",
            specs: "43g size • 97% natural ingredients • Non-toxic",
          },
          {
            brand: "Marlin",
            brandLogo: "/images/stationery-brands/marlin.svg",
            product: "17cm Student Scissors",
            quantityBadge: "1x 17cm Scissors",
            description:
              "Longer contoured blade for clean, sharp cuts through heavy cardstock.",
            teacherNote:
              "Suitable for teenage hand dimensions; sharp stainless steel precision edge.",
            specs: "17cm stainless steel blades • Ergonomic rubberized grip",
          },
          {
            brand: "Bostik",
            brandLogo: "/images/stationery-brands/bostik.svg",
            product: "Genuine Blu Tack",
            quantityBadge: "1x 100g Slab",
            description:
              "Versatile adhesive putty for project display boards and model building.",
            teacherNote:
              "Required for science fair presentation boards and classroom presentations.",
            specs: "100g reusable putty",
          },
        ],
      },
      {
        id: "maths",
        name: "STEM & Mathematics",
        icon: Calculator,
        headline: "CAPS syllabus scientific & technical tools",
        items: [
          {
            brand: "Casio",
            brandLogo: "/images/stationery-brands/casio.svg",
            product: "fx-82ZA PLUS II Scientific Calculator",
            quantityBadge: "1x Scientific Calc",
            description:
              "The official South African CAPS syllabus calculator for High School.",
            teacherNote:
              "Developed specifically with South African educators; displays natural mathematical fractions.",
            specs:
              "283 functions • Natural Textbook Display • DBE Approved for Matric exams",
          },
          {
            brand: "Marlin",
            brandLogo: "/images/stationery-brands/marlin.svg",
            product: "Complete Geometry Maths Instrument Set",
            quantityBadge: "1x 9-Piece Tin Set",
            description:
              "Precision metal compass, divider, protractor, and set squares in a metal tin.",
            teacherNote:
              "Strictly required for Grade 8–12 Euclidean geometry and technical drawing.",
            specs:
              "Metal tin case • Screw-lock metal compass • Clear 180° protractor • 45° & 60° triangles",
          },
          {
            brand: "Marlin",
            brandLogo: "/images/stationery-brands/marlin.svg",
            product: "30cm Clear Shatterproof Metric Ruler",
            quantityBadge: "1x 30cm Ruler",
            description:
              "Anti-glare beveled ruler with clear millimetre markings.",
            teacherNote:
              "Essential for physics graphing, technical drawing, and geometry exams.",
            specs:
              "Shatterproof acrylic • Dual millimetre / centimetre calibrations",
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
            brandLogo: "/images/stationery-brands/croxley.svg",
            product: "A4 Feint & Margin Exercise Books (72pg)",
            quantityBadge: "10x 72-Page Books",
            description:
              "High-opacity 80gsm paper preventing pen bleed-through during fast lectures.",
            teacherNote:
              "Each high school subject requires a dedicated feint & margin workbook.",
            specs: "A4 size • 72 pages • Feint & margin • Heavyweight cover",
          },
          {
            brand: "Croxley",
            brandLogo: "/images/stationery-brands/croxley.svg",
            product: "A4 Quad & Margin Maths Books (72pg)",
            quantityBadge: "6x 72-Page Books",
            description:
              "Graph paper grid essential for algebraic functions and coordinate geometry.",
            teacherNote:
              "Required for pure maths and physical sciences graphing.",
            specs: "A4 • 72 pages • 5mm squared grid • Durable saddle stitch",
          },
          {
            brand: "Bantex",
            brandLogo: "/images/stationery-brands/bantex.svg",
            product: "30-Pocket Clear View Flip File",
            quantityBadge: "2x 30-Pocket Files",
            description:
              "Heavy-duty presentation folder for term SBA (School Based Assessment) files.",
            teacherNote:
              "Mandated by DBE for official term assessment and portfolio moderation.",
            specs:
              "30 copysafe pockets • Rigid cover • Spine label for subject naming",
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
            brandLogo: "/images/logo-icon.svg",
            product: "Heavy-Duty Handle Carry Box",
            quantityBadge: "1x Carry Case",
            description:
              "Heavy corrugated case protecting expensive textbooks and calculators.",
            teacherNote:
              "Carries up to 15kg of books with zero tearing or broken handles.",
            specs:
              "350gsm flute corrugated kraft cardboard • Die-cut reinforced handle",
          },
          {
            brand: "Pexpacks",
            brandLogo: "/images/logo-icon.svg",
            product: "Personalized Learner ID Label",
            quantityBadge: "1x Waterproof Tag",
            description:
              "Full learner identification preventing locker and classroom mix-ups.",
            teacherNote:
              "Permanent high-adhesion vinyl tag that doesn't peel off through the year.",
            specs: "Waterproof vinyl • Scratch-resistant thermal print",
          },
        ],
      },
    ],
  },
};

type QuickSchool = {
  name: string;
  slug: string;
};

const DEFAULT_QUICK_SCHOOLS: QuickSchool[] = [
  { name: "Dawnview High School", slug: "dawnview-high-school" },
  { name: "Hoërskool Primrose", slug: "ho-rskool-primrose" },
  {
    name: "Primrose Hill Primary School",
    slug: "primrose-hill-primary-school",
  },
];

export function UnboxingSection() {
  const router = useRouter();
  const searchInputId = useId();
  const [selectedGradeId, setSelectedGradeId] = useState<string>("grade-4");
  const [activeCategoryId, setActiveCategoryId] = useState<string>("writing");
  const [selectedItem, setSelectedItem] = useState<StationeryItem | null>(null);

  // Search input state for the primary CTA combobox
  const [searchQuery, setSearchQuery] = useState<string>("");

  const currentPack = GRADE_PACKS[selectedGradeId] ?? GRADE_PACKS["grade-4"];
  const activeCategory =
    currentPack.categories.find((cat) => cat.id === activeCategoryId) ??
    currentPack.categories[0];

  const { isHidden: isHeaderHidden, isAtTop } = useHideHeaderOnScroll({
    hideAfter: 64,
    directionThreshold: 4,
  });
  const isFloating = isHeaderHidden && !isAtTop;

  // Quick find suggestions: uses the app's established edge IP + hybrid ranking setup
  const [quickSchools, setQuickSchools] = useState<QuickSchool[]>(
    DEFAULT_QUICK_SCHOOLS,
  );

  useEffect(() => {
    let isCancelled = false;

    function applyRanking(serverSchools: HybridSchoolItem[]) {
      const recents = getRecentSchoolVisits();
      const { rankedSchools } = rankHybridSchools(serverSchools, recents, 4);
      const schools: QuickSchool[] = rankedSchools
        .map((s) => ({
          name: s.name?.trim() ?? "",
          slug: s.slug?.trim() ?? "",
        }))
        .filter((s) => Boolean(s.name) && Boolean(s.slug));
      if (schools.length > 0 && !isCancelled) {
        setQuickSchools(schools);
      }
    }

    void fetch("/api/schools/search?limit=8")
      .then((res) => res.json())
      .then((data) => {
        if (
          !isCancelled &&
          Array.isArray(data?.results) &&
          data.results.length > 0
        ) {
          applyRanking(data.results);
        }
      })
      .catch(() => {});

    function handleVisitsUpdate() {
      const recents = getRecentSchoolVisits();
      if (recents.length > 0 && !isCancelled) {
        const topRecentSchools: QuickSchool[] = recents
          .map((r) => ({
            name: r.schoolName?.trim() ?? "",
            slug: r.schoolSlug?.trim() ?? "",
          }))
          .filter((s) => Boolean(s.name) && Boolean(s.slug))
          .slice(0, 4);
        if (topRecentSchools.length > 0) {
          setQuickSchools(topRecentSchools);
        }
      }
    }

    window.addEventListener(RECENT_SCHOOL_VISITS_EVENT, handleVisitsUpdate);
    window.addEventListener("storage", handleVisitsUpdate);

    return () => {
      isCancelled = true;
      window.removeEventListener(
        RECENT_SCHOOL_VISITS_EVENT,
        handleVisitsUpdate,
      );
      window.removeEventListener("storage", handleVisitsUpdate);
    };
  }, []);

  // Handle Quick-View modal keyboard and scroll lock
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSelectedItem(null);
      }
    }
    if (selectedItem) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [selectedItem]);

  const handleSearchSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      router.push("/schools");
      return;
    }

    // 1. Direct match with current quick/loaded schools
    const matched = quickSchools.find(
      (s) =>
        s.name.toLowerCase() === query.toLowerCase() ||
        s.slug.toLowerCase() === query.toLowerCase(),
    );
    if (matched?.slug) {
      router.push(`/schools/${encodeURIComponent(matched.slug)}`);
      return;
    }

    // 2. Query the schools search API to get the exact top school record
    try {
      const res = await fetch(
        `/api/schools/search?q=${encodeURIComponent(query)}&limit=1`,
      );
      if (res.ok) {
        const data = await res.json();
        const topSchool = data?.results?.[0];
        if (topSchool?.slug) {
          router.push(`/schools/${encodeURIComponent(topSchool.slug)}`);
          return;
        }
      }
    } catch {
      // Fallback
    }

    // 3. Fallback: format slug and navigate directly to school page
    const slug = query
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    router.push(`/schools/${encodeURIComponent(slug)}`);
  };

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
                  {currentPack.boxTitle}
                </span>
                <span className="hidden sm:inline-block text-pex-text-muted">
                  • 2027 Kit Preview
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
                  src="/images/pexpacks-unboxing-clean.webp"
                  alt="Pexpacks school stationery carry box with official full navy logo unboxing featuring Staedtler pencils, Pritt glue stick, Croxley books, Bic pens, Casio calculator, and Bantex folder"
                  fill
                  priority
                  placeholder="blur"
                  blurDataURL={IMAGE_BLUR_DATA_URL}
                  sizes="(min-width: 1280px) 1200px, 100vw"
                  className="object-cover object-center group-hover:scale-[1.015] transition-transform duration-700 ease-out"
                />

                {/* Official Full Navy Logo on Box - Designed with Tailwind */}
                <div
                  className="absolute top-[28.5%] sm:top-[29%] left-[49.8%] -translate-x-1/2 w-[18%] sm:w-[18.5%] max-w-[245px] pointer-events-none select-none mix-blend-multiply opacity-95 transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                  aria-hidden="true"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/logo-navy.svg"
                    alt="Pexpacks Supplies Official Full Navy Logo"
                    className="w-full h-auto object-contain block drop-shadow-[0_1px_1px_rgba(255,255,255,0.25)]"
                  />
                </div>

                {/* Floating Interactive Badge: Personalized Learner Tag */}
                <div className="absolute top-3 left-3 sm:top-5 sm:left-5 inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-[0_8px_20px_rgba(26,42,64,0.12)] text-pex-navy text-xs sm:text-sm font-bold">
                  <Tag className="w-4 h-4 text-pex-coral shrink-0" />
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
              {/* Pack Context Selector Bar (Area 1: Make Pack Context Explicit) */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-pex-border/70 mb-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pex-keppel mb-1">
                    <span className="w-2 h-2 rounded-full bg-pex-keppel" />
                    <span>Representative Pack Preview</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-heading font-extrabold text-pex-navy m-0">
                    Explore items included in this pack
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 m-0">
                    {currentPack.demoSubtitle}
                  </p>
                </div>

                {/* Subtle Dropdown Selector for Example Packs */}
                <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 bg-pex-bg-soft border border-pex-border rounded-2xl p-1.5 shadow-2xs">
                  <label
                    htmlFor="example-pack-selector"
                    className="text-xs font-bold text-pex-navy/80 pl-2 shrink-0 cursor-pointer"
                  >
                    Preview Pack:
                  </label>
                  <div className="relative inline-block">
                    <select
                      id="example-pack-selector"
                      value={selectedGradeId}
                      onChange={(e) => {
                        setSelectedGradeId(e.target.value);
                      }}
                      className="appearance-none cursor-pointer pl-3 pr-8 py-1.5 rounded-xl bg-white border border-pex-border/80 text-xs sm:text-sm font-extrabold text-pex-navy shadow-2xs hover:border-pex-keppel focus:outline-none focus:ring-2 focus:ring-pex-keppel/30 transition-all"
                    >
                      <option value="grade-1">
                        Grade 1 Pack (Foundation Phase)
                      </option>
                      <option value="grade-4">
                        Grade 4 Pack (Intermediate Phase)
                      </option>
                      <option value="grade-8">
                        Grade 8 Pack (Senior Phase)
                      </option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-pex-navy/60 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Category Selection Bar: Sticky on mobile/tablet matching legal pages navigation */}
              <div
                className={cn(
                  "sticky max-lg:z-30 w-full self-start transition-all duration-200 mb-6",
                  isFloating
                    ? "max-md:top-2"
                    : "max-md:top-[calc(60px+8px)] md:top-[calc(72px+10px)] lg:static lg:top-auto",
                )}
              >
                <div className="rounded-2xl border border-pex-border bg-white/95 backdrop-blur-md p-2 shadow-xs sm:shadow-sm">
                  <div
                    className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none"
                    role="tablist"
                    aria-label="Stationery categories"
                  >
                    {currentPack.categories.map((cat) => {
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
                              : "bg-pex-bg-soft text-pex-navy hover:bg-slate-200/70",
                          )}
                        >
                          <Icon
                            className={cn(
                              "w-4 h-4 shrink-0",
                              isSelected
                                ? "text-pex-keppel"
                                : "text-pex-text-muted",
                            )}
                          />
                          <span>{cat.name}</span>
                          <span
                            className={cn(
                              "text-[11px] font-extrabold px-1.5 py-0.5 rounded-md",
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-slate-200/80 text-slate-600",
                            )}
                          >
                            {cat.items.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Selected Category Details Grid with Miniature 40x40px Brand Thumbnails */}
              <div className="mt-6 rounded-2xl bg-pex-bg-soft/60 border border-pex-border/70 p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-pex-keppel">
                    <span className="w-1.5 h-1.5 rounded-full bg-pex-keppel" />
                    <span>{activeCategory.headline}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-pex-keppel shrink-0" />
                    <span>
                      Click any item for quantities & teacher specifications
                    </span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeCategory.items.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className="group text-left rounded-2xl bg-white p-4 border border-pex-border shadow-2xs hover:border-pex-keppel/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-pex-keppel/40"
                      aria-label={`View quick details for ${item.product}`}
                    >
                      <div>
                        {/* 40x40px Brand Thumbnail + Brand Chip + Prominent Quick-View Link */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* 40x40px Brand Logo Thumbnail */}
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-center p-1.5 shrink-0 shadow-2xs group-hover:border-pex-keppel/50 group-hover:bg-white transition-all">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.brandLogo}
                                alt={`${item.brand} logo`}
                                className="w-full h-full object-contain filter group-hover:scale-105 transition-transform"
                                loading="lazy"
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="inline-block text-[11px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 truncate max-w-full">
                                {item.brand}
                              </span>
                              <span className="block text-[11px] font-bold text-pex-keppel mt-0.5 truncate">
                                {item.quantityBadge}
                              </span>
                            </div>
                          </div>

                          {/* Quick View Link Affordance */}
                          <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-pex-navy bg-slate-100 group-hover:bg-pex-keppel group-hover:text-white transition-all shadow-2xs">
                            <span>Quick view</span>
                            <Eye className="w-3 h-3 transition-transform group-hover:scale-110" />
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-pex-navy group-hover:text-pex-keppel transition-colors m-0 leading-snug">
                          {item.product}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed m-0 line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                        <span className="inline-flex items-center gap-1 text-pex-navy/70">
                          <CheckCircle2 className="w-3.5 h-3.5 text-pex-keppel shrink-0" />
                          <span>Official List Item</span>
                        </span>
                        <span className="text-pex-keppel font-bold group-hover:translate-x-0.5 transition-transform">
                          Details →
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* 4 Feature Cards: Why Our Packaging Matters (Area 2: Contrast & Personalization Highlight) */}
        <ScrollReveal delay={200}>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Carry Box (Enhanced prominence) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-white to-teal-50/20 border-2 border-pex-keppel/35 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-pex-keppel/15 flex items-center justify-center text-pex-keppel">
                    <Package className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-pex-keppel/15 text-pex-keppel uppercase tracking-wider">
                    Included Free
                  </span>
                </div>
                <h4 className="font-heading font-extrabold text-base text-pex-navy m-0">
                  Durable Handle Carry Box
                </h4>
                <p className="text-sm text-slate-700 mt-2 leading-relaxed font-normal m-0">
                  Heavy-duty 350gsm corrugated case with a die-cut carry handle
                  keeps exercise books pristine, protects rulers, and makes
                  day-one transport effortless.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-pex-keppel/15 flex items-center gap-2 text-xs font-bold text-pex-keppel">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Prevents crushed books & bent corners</span>
              </div>
            </div>

            {/* Card 2: Personalized Learner Tag (Highlighted Standout Differentiator) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-white via-rose-50/20 to-pex-coral/[0.05] border-2 border-pex-coral/50 ring-4 ring-pex-coral/10 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-pex-coral/15 flex items-center justify-center text-pex-coral">
                    <Tag className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-pex-coral/20 text-pex-coral uppercase tracking-wider">
                    ★ Parent Favorite
                  </span>
                </div>
                <h4 className="font-heading font-extrabold text-base text-pex-navy m-0">
                  Personalised Learner Tag
                </h4>
                <p className="text-sm text-slate-700 mt-2 leading-relaxed font-normal m-0">
                  Custom printed waterproof vinyl ID badge featuring your
                  child’s full name, grade, and class — completely eliminating
                  lost stationery and classroom mix-ups.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-pex-coral/20 flex items-center gap-2 text-xs font-bold text-pex-coral">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Pre-labeled & ready for day one</span>
              </div>
            </div>

            {/* Card 3: Zero Generic Knock-Offs (High Contrast Body Copy) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-pex-border shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-pex-keppel/15 flex items-center justify-center text-pex-keppel mb-3.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-heading font-extrabold text-base text-pex-navy m-0">
                  Zero Generic Knock-Offs
                </h4>
                <p className="text-sm text-slate-700 mt-2 leading-relaxed font-normal m-0">
                  We never substitute items with unbranded budget products. You
                  receive 100% authentic Staedtler, Pritt, Bic, Croxley, and
                  Casio as mandated by South African teachers.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-pex-navy/70">
                <ShieldCheck className="w-4 h-4 text-pex-keppel shrink-0" />
                <span>Official Brand Guarantee</span>
              </div>
            </div>

            {/* Card 4: Grade-Accurate Matching (High Contrast Body Copy) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-pex-border shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-600 mb-3.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="font-heading font-extrabold text-base text-pex-navy m-0">
                  Grade-Accurate Matching
                </h4>
                <p className="text-sm text-slate-700 mt-2 leading-relaxed font-normal m-0">
                  Digitized directly from verified school stationery lists,
                  ensuring accurate page rulings, calculator models, and exact
                  item counts without supermarket queues.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-pex-navy/70">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Matches official school lists</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Section Action Banner (Area 3: Inline School Search Combobox) */}
        <ScrollReveal delay={250}>
          <div className="mt-10 rounded-3xl bg-gradient-to-br from-pex-navy via-[#1e3450] to-pex-navy p-6 sm:p-8 lg:p-10 text-white shadow-[0_20px_50px_rgba(26,42,64,0.22)] border border-white/10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-10">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-pex-keppel uppercase tracking-wider mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-pex-coral" />
                  <span>Zero-Friction Search</span>
                </div>
                <h4 className="text-xl sm:text-2xl lg:text-3xl font-heading font-extrabold text-white m-0">
                  Ready to get your child&apos;s stationery pack sorted?
                </h4>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed m-0">
                  Search your school name to jump straight to your verified
                  grade stationery list with zero extra steps.
                </p>
              </div>

              {/* Inline Search / School Selector Combobox */}
              <div className="w-full lg:max-w-md xl:max-w-lg">
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex flex-col sm:flex-row items-stretch gap-2.5"
                >
                  <div className="relative flex-1">
                    <label htmlFor={searchInputId} className="sr-only">
                      Search your school or grade
                    </label>
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id={searchInputId}
                      name="q"
                      type="text"
                      list="popular-school-presets"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Select your school or grade..."
                      className="w-full min-h-[50px] pl-11 pr-4 rounded-xl sm:rounded-2xl bg-white/95 text-pex-navy placeholder:text-slate-500 font-semibold text-sm sm:text-base border border-white/30 focus:outline-none focus:ring-4 focus:ring-pex-keppel/30 focus:border-pex-keppel shadow-sm transition-all"
                    />
                    <datalist id="popular-school-presets">
                      {quickSchools.map((school) => (
                        <option key={school.slug} value={school.name} />
                      ))}
                      {POPULAR_SEARCH_PRESETS.map((name) => (
                        <option key={name} value={name} />
                      ))}
                    </datalist>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    iconDirection="right"
                    className="min-h-[50px] shrink-0 font-extrabold text-sm sm:text-base px-6 shadow-md"
                    data-conversion-event="homepage_unboxing_inline_find_pack"
                  >
                    Find Pack
                  </Button>
                </form>

                {/* Quick-Select Chips */}
                <div className="mt-3 flex items-center flex-wrap gap-1.5 text-xs">
                  <span className="text-slate-400 font-medium">
                    Quick find:
                  </span>
                  {quickSchools.map((school) => (
                    <Link
                      key={school.slug}
                      href={`/schools/${encodeURIComponent(school.slug)}`}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-semibold transition-colors cursor-pointer text-xs inline-block"
                      title={`Open official packs for ${school.name}`}
                    >
                      {school.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Quick-View Product Modal (Area 1: Specifying quantities & teacher rationale) */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-pex-navy/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-view-title"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-pex-border overflow-hidden animate-in zoom-in-95 duration-200 text-pex-navy"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-pex-navy hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close details modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Top: Large Brand Logo & Guarantee */}
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 shrink-0 shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedItem.brandLogo}
                  alt={selectedItem.brand}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wide px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800">
                    {selectedItem.brand}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-pex-keppel">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    100% Genuine Brand
                  </span>
                </div>
                <h3
                  id="quick-view-title"
                  className="text-lg sm:text-xl font-heading font-extrabold text-pex-navy mt-1 m-0 leading-tight"
                >
                  {selectedItem.product}
                </h3>
              </div>
            </div>

            {/* Quantity in Pack Highlight Pill */}
            <div className="p-3.5 rounded-2xl bg-pex-keppel/10 border border-pex-keppel/20 flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2 text-pex-keppel">
                <Package className="w-4 h-4 shrink-0" />
                <span className="text-xs sm:text-sm font-bold">
                  Included in {currentPack.label}:
                </span>
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-pex-navy bg-white px-3 py-1 rounded-xl shadow-2xs">
                {selectedItem.quantityBadge}
              </span>
            </div>

            {/* Product Overview Description */}
            <div className="mb-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Item Overview
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed m-0">
                {selectedItem.description}
              </p>
            </div>

            {/* Teacher / Curriculum Specification Note */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-pex-navy mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-pex-keppel shrink-0" />
                <span>Why South African Teachers Specify This</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
                {selectedItem.teacherNote}
              </p>
              {selectedItem.specs && (
                <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200 font-mono">
                  {selectedItem.specs}
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button
                href="/schools#schools-search"
                variant="primary"
                size="md"
                iconDirection="right"
                className="w-full sm:w-auto flex-1 font-bold"
                onClick={() => setSelectedItem(null)}
              >
                Find My School Pack
              </Button>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
