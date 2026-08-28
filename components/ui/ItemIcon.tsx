import React from "react";
import {
  BookOpen,
  Book,
  FileText,
  Folder,
  Layers,
  Scroll,
  Newspaper,
  BookCheck,
  StickyNote,
  BookOpenText,
  BookMarked,
  NotebookPen,
  NotebookTabs,
  FileCheck,
  FileSpreadsheet,
  Clipboard,
  ClipboardList,
  ClipboardCheck,
  Pencil,
  PencilLine,
  Pen,
  PenTool,
  Highlighter,
  Sparkles,
  Palette,
  Paintbrush,
  Eraser,
  Compass,
  Ruler,
  Calculator,
  Shapes,
  Scissors,
  Stamp,
  Paperclip,
  Pin,
  Briefcase,
  Backpack,
  Package,
  Box,
  Archive,
  Tag,
  Bookmark,
  Shield,
  FlaskConical,
  Microscope,
  Globe,
  Atom,
  Music,
  Image,
  Laptop,
  Headphones,
  Clock,
  Bell,
  Award,
  Smile,
  PenLine,
  PencilRuler,
  Brush,
  PaintBucket,
  Signature,
  RulerDimensionLine,
  DraftingCompass,
  Triangle,
  Pi,
  ShoppingBag,
  Folders,
  Beaker,
  TestTube,
  TestTubes,
  Dna,
  Thermometer,
  Images,
  Frame,
  Speaker,
  Monitor,
  Keyboard,
  Mouse,
  Printer,
  Smartphone,
  Tablet,
  GraduationCap,
  School,
  Bus,
  Medal,
  Trophy,
  Tags,
  MapPin,
  Grid3x3,
  LayoutGrid,
  Type,
  SpellCheck,
  Languages,
  AlignLeft,
} from "lucide-react";

type ItemIconProps = {
  name?: string;
  className?: string;
  size?: number;
};

export function ItemIcon({ name, className = "", size = 20 }: ItemIconProps) {
  const props = { size, className };

  switch (name) {
    // ── Books & Paper ────────────────────────────────────────
    case "notebook":
      return <BookOpen {...props} />;
    case "pad":
      return <Book {...props} />;
    case "file":
      return <FileText {...props} />;
    case "folder":
      return <Folder {...props} />;
    case "layers":
      return <Layers {...props} />;
    case "scroll":
      return <Scroll {...props} />;
    case "newspaper":
      return <Newspaper {...props} />;
    case "book-check":
      return <BookCheck {...props} />;
    case "sticky-note":
      return <StickyNote {...props} />;
    case "book-open-text":
      return <BookOpenText {...props} />;
    case "book-marked":
      return <BookMarked {...props} />;
    case "notebook-pen":
      return <NotebookPen {...props} />;
    case "notebook-tabs":
      return <NotebookTabs {...props} />;
    case "file-check":
      return <FileCheck {...props} />;
    case "file-spreadsheet":
      return <FileSpreadsheet {...props} />;
    case "clipboard":
      return <Clipboard {...props} />;
    case "clipboard-list":
      return <ClipboardList {...props} />;
    case "clipboard-check":
      return <ClipboardCheck {...props} />;

    // ── Writing & Drawing ────────────────────────────────────
    case "pencil":
      return <Pencil {...props} />;
    case "pen":
      return <PencilLine {...props} />;
    case "fountain-pen":
      return <Pen {...props} />;
    case "marker":
      return <PenTool {...props} />;
    case "highlighter":
      return <Highlighter {...props} />;
    case "crayon":
      return <Sparkles {...props} />;
    case "paint":
      return <Palette {...props} />;
    case "paintbrush":
      return <Paintbrush {...props} />;
    case "eraser":
      return <Eraser {...props} />;
    case "sharpener":
      return <Compass {...props} />;
    case "pen-line":
      return <PenLine {...props} />;
    case "pencil-ruler":
      return <PencilRuler {...props} />;
    case "brush":
      return <Brush {...props} />;
    case "paint-bucket":
      return <PaintBucket {...props} />;
    case "signature":
      return <Signature {...props} />;

    // ── Math & Measurement ───────────────────────────────────
    case "ruler":
      return <Ruler {...props} />;
    case "calculator":
      return <Calculator {...props} />;
    case "shapes":
      return <Shapes {...props} />;
    case "ruler-dimension":
      return <RulerDimensionLine {...props} />;
    case "drafting-compass":
      return <DraftingCompass {...props} />;
    case "triangle":
      return <Triangle {...props} />;
    case "pi":
      return <Pi {...props} />;

    // ── Cutting & Adhesive ───────────────────────────────────
    case "scissors":
      return <Scissors {...props} />;
    case "glue":
      return <Stamp {...props} />;
    case "paperclip":
      return <Paperclip {...props} />;
    case "pin":
      return <Pin {...props} />;
    case "stamp":
      return <Stamp {...props} />;

    // ── Bags & Cases ─────────────────────────────────────────
    case "bag":
      return <Briefcase {...props} />;
    case "backpack":
      return <Backpack {...props} />;
    case "box":
      return <Package {...props} />;
    case "archive":
      return <Archive {...props} />;
    case "tag":
      return <Tag {...props} />;
    case "bookmark":
      return <Bookmark {...props} />;
    case "shield":
      return <Shield {...props} />;
    case "briefcase":
      return <Briefcase {...props} />;
    case "shopping-bag":
      return <ShoppingBag {...props} />;
    case "folders":
      return <Folders {...props} />;
    case "package":
      return <Package {...props} />;

    // ── STEM & Science ───────────────────────────────────────
    case "flask":
      return <FlaskConical {...props} />;
    case "microscope":
      return <Microscope {...props} />;
    case "globe":
      return <Globe {...props} />;
    case "atom":
      return <Atom {...props} />;
    case "beaker":
      return <Beaker {...props} />;
    case "test-tube":
      return <TestTube {...props} />;
    case "test-tubes":
      return <TestTubes {...props} />;
    case "dna":
      return <Dna {...props} />;
    case "thermometer":
      return <Thermometer {...props} />;

    // ── Art, Music & Tech ────────────────────────────────────
    case "music":
      return <Music {...props} />;
    case "image":
      return <Image aria-label="Image item icon" {...props} />;
    case "laptop":
      return <Laptop {...props} />;
    case "headphones":
      return <Headphones {...props} />;
    case "clock":
      return <Clock {...props} />;
    case "bell":
      return <Bell {...props} />;
    case "award":
      return <Award {...props} />;
    case "smile":
      return <Smile {...props} />;
    case "palette":
      return <Palette {...props} />;
    case "images":
      return <Images {...props} />;
    case "frame":
      return <Frame {...props} />;
    case "speaker":
      return <Speaker {...props} />;
    case "monitor":
      return <Monitor {...props} />;
    case "keyboard":
      return <Keyboard {...props} />;
    case "mouse":
      return <Mouse {...props} />;
    case "printer":
      return <Printer {...props} />;
    case "smartphone":
      return <Smartphone {...props} />;
    case "tablet":
      return <Tablet {...props} />;

    // ── School ───────────────────────────────────────────────
    case "graduation-cap":
      return <GraduationCap {...props} />;
    case "school":
      return <School {...props} />;
    case "bus":
      return <Bus {...props} />;
    case "medal":
      return <Medal {...props} />;
    case "trophy":
      return <Trophy {...props} />;

    // ── Tags & Markers ───────────────────────────────────────
    case "tags":
      return <Tags {...props} />;
    case "map-pin":
      return <MapPin {...props} />;

    // ── Layout & Text ────────────────────────────────────────
    case "grid-3x3":
      return <Grid3x3 {...props} />;
    case "layout-grid":
      return <LayoutGrid {...props} />;
    case "type":
      return <Type {...props} />;
    case "spell-check":
      return <SpellCheck {...props} />;
    case "languages":
      return <Languages {...props} />;
    case "align-left":
      return <AlignLeft {...props} />;

    default:
      return <Box {...props} />;
  }
}
