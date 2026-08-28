"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  Eye,
  Filter,
  Info,
  Kanban,
  Layers,
  MessageSquare,
  MoreHorizontal,
  Package,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Table as TableIcon,
  TrendingDown,
  TrendingUp,
  Truck,
  User,
  Users,
  X,
} from "lucide-react";
import styles from "./OperationsCommandCenter.module.css";
import viewStyles from "@/components/admin/views/CorePagesView.module.css";
import adminStyles from "@/app/admin/admin.module.css";

// ==========================================
// TYPES & DATA STRUCTURES
// ==========================================

export type OperationsMode = "procurement" | "school_packs";
export type WorkspaceView = "kanban" | "table";
export type SeverityLevel = "high" | "medium" | "info" | "low";
export type ItemStage = "needs_procurement" | "partially_secured" | "fully_secured" | "completed";
export type PackStage = "draft" | "awaiting_approval" | "published" | "needs_update";

export interface ExceptionItem {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  targetCount: string;
  timeAgo: string;
  stageFilter?: ItemStage | PackStage;
  financialImpact?: string;
  actionLabel: string;
}

export interface WorkspaceItem {
  id: string;
  name: string;
  schoolOrCategory: string;
  owner: "LM" | "SB" | "KG" | "JD";
  ownerName: string;
  dueDate: string;
  stage: ItemStage;
  quantity: number;
  committedSpend: number;
  outstandingPoValue: number;
  revenueAtRisk: number;
  healthScore: number;
  healthBreakdown: {
    masterProductLinked: boolean;
    validSku: boolean;
    verifiedPrice: boolean;
    activeSupplierOffer: boolean;
    targetMarginMet: boolean;
    schoolApproved: boolean;
    fulfilmentConfigured: boolean;
  };
  supplier: string;
  supplierLeadDays: number;
  notes: string;
}

export interface SchoolPackItem {
  id: string;
  schoolName: string;
  grade: string;
  price: number;
  stage: PackStage;
  owner: "LM" | "SB" | "KG" | "JD";
  ownerName: string;
  dueDate: string;
  totalItems: number;
  healthScore: number;
  healthBreakdown: {
    masterProductLinked: boolean;
    validSku: boolean;
    verifiedPrice: boolean;
    activeSupplierOffer: boolean;
    targetMarginMet: boolean;
    schoolApproved: boolean;
    fulfilmentConfigured: boolean;
  };
  openingDate: string;
  paidOrders: number;
  securedPercent: number;
}

export interface ActivityComment {
  id: string;
  author: string;
  avatarTone: "LM" | "SB" | "KG";
  text: string;
  time: string;
}

// ==========================================
// SEED DATA: ALIGNED WITH HIGH-FIDELITY SCREENSHOTS
// ==========================================

const INITIAL_PROCUREMENT_ITEMS: WorkspaceItem[] = [
  // Needs Procurement (Red)
  {
    id: "item-1",
    name: "HB Pencils (Box of 12)",
    schoolOrCategory: "Stationery / Grade 1-7",
    owner: "LM",
    ownerName: "Liam Morgan",
    dueDate: "May 31",
    stage: "needs_procurement",
    quantity: 1200,
    committedSpend: 42000,
    outstandingPoValue: 42000,
    revenueAtRisk: 86400,
    healthScore: 50,
    healthBreakdown: {
      masterProductLinked: true,
      validSku: true,
      verifiedPrice: false,
      activeSupplierOffer: false,
      targetMarginMet: false,
      schoolApproved: true,
      fulfilmentConfigured: true,
    },
    supplier: "Bantex SA",
    supplierLeadDays: 14,
    notes: "Awaiting supplier Q3 volume pricing confirmation.",
  },
  {
    id: "item-2",
    name: "Pritt Glue Stick 43g",
    schoolOrCategory: "Adhesives / Essential",
    owner: "SB",
    ownerName: "Sarah Bell",
    dueDate: "May 30",
    stage: "needs_procurement",
    quantity: 850,
    committedSpend: 28900,
    outstandingPoValue: 28900,
    revenueAtRisk: 59500,
    healthScore: 65,
    healthBreakdown: {
      masterProductLinked: true,
      validSku: true,
      verifiedPrice: true,
      activeSupplierOffer: false,
      targetMarginMet: true,
      schoolApproved: true,
      fulfilmentConfigured: false,
    },
    supplier: "Henkel Stationery",
    supplierLeadDays: 7,
    notes: "Lead time confirmed 7 days upon PO issuance.",
  },
  {
    id: "item-3",
    name: "A4 Counter Book (Quad 192p)",
    schoolOrCategory: "Books / High Demand",
    owner: "KG",
    ownerName: "Kagiso Gamedze",
    dueDate: "May 31",
    stage: "needs_procurement",
    quantity: 2100,
    committedSpend: 63000,
    outstandingPoValue: 63000,
    revenueAtRisk: 136500,
    healthScore: 50,
    healthBreakdown: {
      masterProductLinked: true,
      validSku: true,
      verifiedPrice: false,
      activeSupplierOffer: false,
      targetMarginMet: true,
      schoolApproved: true,
      fulfilmentConfigured: false,
    },
    supplier: "Freedom Stationery",
    supplierLeadDays: 21,
    notes: "Mill shipment delay expected; alternate supplier requested.",
  },
  {
    id: "item-4",
    name: "Flip File (40 Pocket)",
    schoolOrCategory: "Filing / High Demand",
    owner: "LM",
    ownerName: "Liam Morgan",
    dueDate: "Jun 02",
    stage: "needs_procurement",
    quantity: 640,
    committedSpend: 19200,
    outstandingPoValue: 19200,
    revenueAtRisk: 41600,
    healthScore: 45,
    healthBreakdown: {
      masterProductLinked: true,
      validSku: true,
      verifiedPrice: false,
      activeSupplierOffer: false,
      targetMarginMet: false,
      schoolApproved: true,
      fulfilmentConfigured: false,
    },
    supplier: "Croxley Supplies",
    supplierLeadDays: 10,
    notes: "Quote expired 12 days ago.",
  },

  // Partially Secured (Amber)
  {
    id: "item-5",
    name: "Erasers (Large Sleeve)",
    schoolOrCategory: "Stationery / General",
    owner: "SB",
    ownerName: "Sarah Bell",
    dueDate: "May 29",
    stage: "partially_secured",
    quantity: 1400,
    committedSpend: 11200,
    outstandingPoValue: 4500,
    revenueAtRisk: 22400,
    healthScore: 80,
    healthBreakdown: {
      masterProductLinked: true,
      validSku: true,
      verifiedPrice: true,
      activeSupplierOffer: true,
      targetMarginMet: true,
      schoolApproved: true,
      fulfilmentConfigured: false,
    },
    supplier: "Staedtler SA",
    supplierLeadDays: 5,
    notes: "60% stock arrived at Midrand Hub.",
  },
  {
    id: "item-6",
    name: "Ruler 30cm Shatterproof",
    schoolOrCategory: "Measurement",
    owner: "LM",
    ownerName: "Liam Morgan",
    dueDate: "May 31",
    stage: "partially_secured",
    quantity: 980,
    committedSpend: 8820,
    outstandingPoValue: 3200,
    revenueAtRisk: 17640,
    healthScore: 80,
    healthBreakdown: {
      masterProductLinked: true,
      validSku: true,
      verifiedPrice: true,
      activeSupplierOffer: true,
      targetMarginMet: true,
      schoolApproved: true,
      fulfilmentConfigured: false,
    },
    supplier: "Marlin Wholesale",
    supplierLeadDays: 4,
    notes: "Partial receipt processed yesterday.",
  },
  {
    id: "item-7",
    name: "Colour Pencils (Box 24)",
    schoolOrCategory: "Art / Creative",
    owner: "KG",
    ownerName: "Kagiso Gamedze",
    dueDate: "Jun 01",
    stage: "partially_secured",
    quantity: 520,
    committedSpend: 28600,
    outstandingPoValue: 14300,
    revenueAtRisk: 57200,
    healthScore: 75,
    healthBreakdown: {
      masterProductLinked: true,
      validSku: true,
      verifiedPrice: true,
      activeSupplierOffer: true,
      targetMarginMet: false,
      schoolApproved: true,
      fulfilmentConfigured: true,
    },
    supplier: "Faber-Castell",
    supplierLeadDays: 8,
    notes: "Batch 1 received, Batch 2 in transit.",
  },
  {
    id: "item-8",
    name: "Scissors (Pointed 13cm)",
    schoolOrCategory: "Craft / Cutting",
    owner: "SB",
    ownerName: "Sarah Bell",
    dueDate: "Jun 02",
    stage: "partially_secured",
    quantity: 610,
    committedSpend: 15250,
    outstandingPoValue: 6100,
    revenueAtRisk: 30500,
    healthScore: 80,
    healthBreakdown: {
      masterProductLinked: true,
      validSku: true,
      verifiedPrice: true,
      activeSupplierOffer: true,
      targetMarginMet: true,
      schoolApproved: true,
      fulfilmentConfigured: false,
    },
    supplier: "Maped Stationery",
    supplierLeadDays: 6,
    notes: "Custom branding stamp applied to first 300 units.",
  },

  // Fully Secured (Teal)
  {
    id: "item-9",
    name: "Grade 1 Stationery Pack Essentials",
    schoolOrCategory: "Pack Bundle / Primrose Hill",
    owner: "LM",
    ownerName: "Liam Morgan",
    dueDate: "May 28",
    stage: "fully_secured",
    quantity: 180,
    committedSpend: 89100,
    outstandingPoValue: 0,
    revenueAtRisk: 0,
    healthScore: 100,
    healthBreakdown: {
      masterProductLinked: true,
      validSku: true,
      verifiedPrice: true,
      activeSupplierOffer: true,
      targetMarginMet: true,
      schoolApproved: true,
      fulfilmentConfigured: true,
    },
    supplier: "Pexpacks Central Warehouse",
    supplierLeadDays: 1,
    notes: "100% SKU stock locked in Bin A4-12.",
  },
  {
    id: "item-10",
    name: "Grade 2 Stationery Pack",
    schoolOrCategory: "Pack Bundle / Northfield PS",
    owner: "KG",
    ownerName: "Kagiso Gamedze",
    dueDate: "May 28",
    stage: "fully_secured",
    quantity: 210,
    committedSpend: 115500,
    outstandingPoValue: 0,
    revenueAtRisk: 0,
    healthScore: 100,
    healthBreakdown: {
      masterProductLinked: true,
      validSku: true,
      verifiedPrice: true,
      activeSupplierOffer: true,
      targetMarginMet: true,
      schoolApproved: true,
      fulfilmentConfigured: true,
    },
    supplier: "Pexpacks Central Warehouse",
    supplierLeadDays: 1,
    notes: "All 18 items checked and pre-sorted for bin allocation.",
  },
  {
    id: "item-11",
    name: "Maths Set (Compass & Stencil)",
    schoolOrCategory: "Mathematics / Senior",
    owner: "SB",
    ownerName: "Sarah Bell",
    dueDate: "May 30",
    stage: "fully_secured",
    quantity: 450,
    committedSpend: 20250,
    outstandingPoValue: 0,
    revenueAtRisk: 0,
    healthScore: 100,
    healthBreakdown: {
      masterProductLinked: true,
      validSku: true,
      verifiedPrice: true,
      activeSupplierOffer: true,
      targetMarginMet: true,
      schoolApproved: true,
      fulfilmentConfigured: true,
    },
    supplier: "Helix Oxford",
    supplierLeadDays: 3,
    notes: "QC passed, ready for bag packaging line.",
  },
  {
    id: "item-12",
    name: "A4 Display Book (20 Pocket)",
    schoolOrCategory: "Filing / General",
    owner: "LM",
    ownerName: "Liam Morgan",
    dueDate: "May 31",
    stage: "fully_secured",
    quantity: 800,
    committedSpend: 16000,
    outstandingPoValue: 0,
    revenueAtRisk: 0,
    healthScore: 100,
    healthBreakdown: {
      masterProductLinked: true,
      validSku: true,
      verifiedPrice: true,
      activeSupplierOffer: true,
      targetMarginMet: true,
      schoolApproved: true,
      fulfilmentConfigured: true,
    },
    supplier: "Bantex SA",
    supplierLeadDays: 2,
    notes: "Direct supplier delivery to packing station.",
  },

  // Completed (Emerald)
  {
    id: "item-13",
    name: "Primrose Hill PS – Grade 1 Batch",
    schoolOrCategory: "Fulfilment Batch / 120 Packs",
    owner: "LM",
    ownerName: "Liam Morgan",
    dueDate: "May 24",
    stage: "completed",
    quantity: 120,
    committedSpend: 64800,
    outstandingPoValue: 0,
    revenueAtRisk: 0,
    healthScore: 100,
    healthBreakdown: {
      masterProductLinked: true,
      validSku: true,
      verifiedPrice: true,
      activeSupplierOffer: true,
      targetMarginMet: true,
      schoolApproved: true,
      fulfilmentConfigured: true,
    },
    supplier: "Pexpacks Assembly Line",
    supplierLeadDays: 0,
    notes: "Packed, sealed with tamper tape, staged at Dispatch Bay 1.",
  },
  {
    id: "item-14",
    name: "Northfield PS – Grade 2 Batch",
    schoolOrCategory: "Fulfilment Batch / 95 Packs",
    owner: "SB",
    ownerName: "Sarah Bell",
    dueDate: "May 24",
    stage: "completed",
    quantity: 95,
    committedSpend: 54150,
    outstandingPoValue: 0,
    revenueAtRisk: 0,
    healthScore: 100,
    healthBreakdown: {
      masterProductLinked: true,
      validSku: true,
      verifiedPrice: true,
      activeSupplierOffer: true,
      targetMarginMet: true,
      schoolApproved: true,
      fulfilmentConfigured: true,
    },
    supplier: "Pexpacks Assembly Line",
    supplierLeadDays: 0,
    notes: "Courier manifested with Courier Guy tracking #PX-9821.",
  },
  {
    id: "item-15",
    name: "Riverside PS – Grade 3 Batch",
    schoolOrCategory: "Fulfilment Batch / 80 Packs",
    owner: "KG",
    ownerName: "Kagiso Gamedze",
    dueDate: "May 23",
    stage: "completed",
    quantity: 80,
    committedSpend: 47200,
    outstandingPoValue: 0,
    revenueAtRisk: 0,
    healthScore: 100,
    healthBreakdown: {
      masterProductLinked: true,
      validSku: true,
      verifiedPrice: true,
      activeSupplierOffer: true,
      targetMarginMet: true,
      schoolApproved: true,
      fulfilmentConfigured: true,
    },
    supplier: "Pexpacks Assembly Line",
    supplierLeadDays: 0,
    notes: "Dispatched to school front office.",
  },
  {
    id: "item-16",
    name: "Westmount PS – Grade 1 Batch",
    schoolOrCategory: "Fulfilment Batch / 110 Packs",
    owner: "LM",
    ownerName: "Liam Morgan",
    dueDate: "May 23",
    stage: "completed",
    quantity: 110,
    committedSpend: 59400,
    outstandingPoValue: 0,
    revenueAtRisk: 0,
    healthScore: 100,
    healthBreakdown: {
      masterProductLinked: true,
      validSku: true,
      verifiedPrice: true,
      activeSupplierOffer: true,
      targetMarginMet: true,
      schoolApproved: true,
      fulfilmentConfigured: true,
    },
    supplier: "Pexpacks Assembly Line",
    supplierLeadDays: 0,
    notes: "Signed delivery note received from Westmount admin.",
  },
];

const INITIAL_SCHOOL_PACKS: SchoolPackItem[] = [
  {
    id: "pack-1",
    schoolName: "Primrose Hill PS",
    grade: "Grade R",
    price: 895,
    stage: "draft",
    owner: "LM",
    ownerName: "Liam Morgan",
    dueDate: "May 28",
    totalItems: 14,
    healthScore: 65,
    healthBreakdown: {
      masterProductLinked: true,
      validSku: true,
      verifiedPrice: false,
      activeSupplierOffer: true,
      targetMarginMet: false,
      schoolApproved: false,
      fulfilmentConfigured: true,
    },
    openingDate: "14 Jan 2027",
    paidOrders: 42,
    securedPercent: 60,
  },
  {
    id: "pack-2",
    schoolName: "Northfield PS",
    grade: "Grade 2",
    price: 1055,
    stage: "draft",
    owner: "SB",
    ownerName: "Sarah Bell",
    dueDate: "May 30",
    totalItems: 18,
    healthScore: 70,
    healthBreakdown: {
      masterProductLinked: true,
      validSku: true,
      verifiedPrice: true,
      activeSupplierOffer: false,
      targetMarginMet: true,
      schoolApproved: false,
      fulfilmentConfigured: true,
    },
    openingDate: "13 Jan 2027",
    paidOrders: 68,
    securedPercent: 45,
  },
  {
    id: "pack-3",
    schoolName: "Primrose Hill PS",
    grade: "Grade 1",
    price: 1067,
    stage: "awaiting_approval",
    owner: "LM",
    ownerName: "Liam Morgan",
    dueDate: "May 28",
    totalItems: 16,
    healthScore: 85,
    healthBreakdown: {
      masterProductLinked: true,
      validSku: true,
      verifiedPrice: true,
      activeSupplierOffer: true,
      targetMarginMet: true,
      schoolApproved: false,
      fulfilmentConfigured: true,
    },
    openingDate: "14 Jan 2027",
    paidOrders: 94,
    securedPercent: 88,
  },
  {
    id: "pack-4",
    schoolName: "Northfield PS",
    grade: "Grade 3",
    price: 1165,
    stage: "awaiting_approval",
    owner: "SB",
    ownerName: "Sarah Bell",
    dueDate: "May 29",
    totalItems: 19,
    healthScore: 90,
    healthBreakdown: {
      masterProductLinked: true,
      validSku: true,
      verifiedPrice: true,
      activeSupplierOffer: true,
      targetMarginMet: true,
      schoolApproved: false,
      fulfilmentConfigured: true,
    },
    openingDate: "13 Jan 2027",
    paidOrders: 82,
    securedPercent: 92,
  },
  {
    id: "pack-5",
    schoolName: "Primrose Hill PS",
    grade: "Grade 2",
    price: 895,
    stage: "published",
    owner: "LM",
    ownerName: "Liam Morgan",
    dueDate: "May 10",
    totalItems: 15,
    healthScore: 100,
    healthBreakdown: {
      masterProductLinked: true,
      validSku: true,
      verifiedPrice: true,
      activeSupplierOffer: true,
      targetMarginMet: true,
      schoolApproved: true,
      fulfilmentConfigured: true,
    },
    openingDate: "14 Jan 2027",
    paidOrders: 118,
    securedPercent: 100,
  },
  {
    id: "pack-6",
    schoolName: "Northfield PS",
    grade: "Grade 1",
    price: 985,
    stage: "published",
    owner: "KG",
    ownerName: "Kagiso Gamedze",
    dueDate: "May 15",
    totalItems: 16,
    healthScore: 100,
    healthBreakdown: {
      masterProductLinked: true,
      validSku: true,
      verifiedPrice: true,
      activeSupplierOffer: true,
      targetMarginMet: true,
      schoolApproved: true,
      fulfilmentConfigured: true,
    },
    openingDate: "13 Jan 2027",
    paidOrders: 145,
    securedPercent: 100,
  },
  {
    id: "pack-7",
    schoolName: "Primrose Hill PS",
    grade: "Grade 1",
    price: 1067,
    stage: "needs_update",
    owner: "LM",
    ownerName: "Liam Morgan",
    dueDate: "May 20",
    totalItems: 17,
    healthScore: 60,
    healthBreakdown: {
      masterProductLinked: true,
      validSku: true,
      verifiedPrice: false,
      activeSupplierOffer: false,
      targetMarginMet: false,
      schoolApproved: true,
      fulfilmentConfigured: true,
    },
    openingDate: "14 Jan 2027",
    paidOrders: 78,
    securedPercent: 55,
  },
  {
    id: "pack-8",
    schoolName: "Northfield PS",
    grade: "Grade 2",
    price: 955,
    stage: "needs_update",
    owner: "SB",
    ownerName: "Sarah Bell",
    dueDate: "May 21",
    totalItems: 16,
    healthScore: 60,
    healthBreakdown: {
      masterProductLinked: true,
      validSku: true,
      verifiedPrice: false,
      activeSupplierOffer: true,
      targetMarginMet: false,
      schoolApproved: true,
      fulfilmentConfigured: true,
    },
    openingDate: "13 Jan 2027",
    paidOrders: 62,
    securedPercent: 50,
  },
];

const INITIAL_EXCEPTIONS: ExceptionItem[] = [
  {
    id: "exc-1",
    title: "14 orders are at risk of delay",
    description: "Missing items or supplier confirmations",
    severity: "high",
    targetCount: "14 orders",
    timeAgo: "32m ago",
    stageFilter: "needs_procurement",
    financialImpact: "R 86,400 exposure",
    actionLabel: "Resolve procurement blocker",
  },
  {
    id: "exc-2",
    title: "R305,620 outstanding in procurement",
    description: "Awaiting supplier confirmation or PO",
    severity: "medium",
    targetCount: "23 POs",
    timeAgo: "1h ago",
    stageFilter: "needs_procurement",
    financialImpact: "R 305,620 committed",
    actionLabel: "Issue pending purchase orders",
  },
  {
    id: "exc-3",
    title: "Primrose Hill Primary is submitting packs",
    description: "Grade 1 & 2 packs due for final approval",
    severity: "info",
    targetCount: "Primrose Hill PS",
    timeAgo: "2h ago",
    stageFilter: "partially_secured",
    financialImpact: "R 142,000 season value",
    actionLabel: "Review submitted packs",
  },
  {
    id: "exc-4",
    title: "356 orders ready to pack",
    description: "All items secured and picked",
    severity: "low",
    targetCount: "356 orders",
    timeAgo: "2h ago",
    stageFilter: "completed",
    financialImpact: "R 378,000 cleared for dispatch",
    actionLabel: "Stage for courier dispatch",
  },
];

// Sparkline SVG waves for KPI cards
function SparklineWave({ color, direction = "up" }: { color: string; direction?: "up" | "down" }) {
  const path =
    direction === "up"
      ? "M 0 18 Q 15 22 30 14 T 50 8 T 72 2"
      : "M 0 4 Q 15 2 30 10 T 50 16 T 72 22";
  return (
    <svg className={adminStyles.kpiSparkline} viewBox="0 0 72 24" fill="none">
      <path
        d={path}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ==========================================
// STATIC CONSTANTS (module scope)
// ==========================================

// Bar chart daily points for May 20-27
const CHART_DAYS = [
  { day: "May 20", label: "20", val: 210000, height: "65%" },
  { day: "May 21", label: "21", val: 245000, height: "76%" },
  { day: "May 22", label: "22", val: 230000, height: "71%" },
  { day: "May 23", label: "23", val: 270000, height: "84%" },
  { day: "May 24", label: "24", val: 285340, height: "95%", isPeak: true },
  { day: "May 25", label: "25", val: 190000, height: "58%" },
  { day: "May 26", label: "26", val: 225000, height: "70%" },
  { day: "May 27", label: "27", val: 250000, height: "78%" },
] as const;

const EXCEPTION_ICON_MAP: Record<SeverityLevel, React.ReactNode> = {
  high: <AlertTriangle size={16} />,
  medium: <Clock size={16} />,
  info: <Info size={16} />,
  low: <CheckCircle2 size={16} />,
};

const EXCEPTION_ICON_CLASS_MAP: Record<SeverityLevel, string> = {
  high: styles.exceptionIconHigh,
  medium: styles.exceptionIconMedium,
  info: styles.exceptionIconInfo,
  low: styles.exceptionIconLow,
};

const EXCEPTION_BADGE_CLASS_MAP: Record<SeverityLevel, string> = {
  high: adminStyles.severityHigh,
  medium: adminStyles.severityMedium,
  info: adminStyles.severityInfo,
  low: adminStyles.severityLow,
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export interface OperationsCommandCenterProps {
  userName?: string;
}

export function OperationsCommandCenter({ userName }: OperationsCommandCenterProps = {}) {
  const [mode, setMode] = useState<OperationsMode>("procurement");
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("kanban");
  const [activeStageFilter, setActiveStageFilter] = useState<string | null>(null);

  const greetingTime = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<WorkspaceItem | null>(null);
  const [selectedPack, setSelectedPack] = useState<SchoolPackItem | null>(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState<"resolution" | "activity" | "supplier">("resolution");
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [chartHoverIndex, setChartHoverIndex] = useState<number | null>(4); // default May 24

  // Items State
  const [items, setItems] = useState<WorkspaceItem[]>(INITIAL_PROCUREMENT_ITEMS);
  const [packs, setPacks] = useState<SchoolPackItem[]>(INITIAL_SCHOOL_PACKS);

  // Collaborative Comments inside Drawer
  const [comments, setComments] = useState<ActivityComment[]>([
    {
      id: "c1",
      author: "Liam Morgan",
      avatarTone: "LM",
      text: "@Sarah Bell Can you follow up with Staedtler SA regarding the 40% missing erasers? We need them by Thursday.",
      time: "2 hours ago",
    },
    {
      id: "c2",
      author: "Sarah Bell",
      avatarTone: "SB",
      text: "@Liam Morgan Dispatched invoice confirmed. Delivery arriving tomorrow at 10:00 AM at Midrand Hub.",
      time: "45 mins ago",
    },
  ]);
  const [newCommentText, setNewCommentText] = useState("");

  // Keyboard shortcut listener (⌘K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsCommandPaletteOpen(false);
        setSelectedItem(null);
        setSelectedPack(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filtered lists
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.schoolOrCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage = activeStageFilter ? item.stage === activeStageFilter : true;
      return matchesSearch && matchesStage;
    });
  }, [items, searchQuery, activeStageFilter]);

  const filteredPacks = useMemo(() => {
    return packs.filter((pack) => {
      const matchesSearch =
        pack.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pack.grade.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage = activeStageFilter ? pack.stage === activeStageFilter : true;
      return matchesSearch && matchesStage;
    });
  }, [packs, searchQuery, activeStageFilter]);

  // Stage counts
  const stageCounts = useMemo(() => {
    return {
      needs_procurement: items.filter((i) => i.stage === "needs_procurement").length,
      partially_secured: items.filter((i) => i.stage === "partially_secured").length,
      fully_secured: items.filter((i) => i.stage === "fully_secured").length,
      completed: items.filter((i) => i.stage === "completed").length,
    };
  }, [items]);

  const packStageCounts = useMemo(() => {
    return {
      draft: packs.filter((p) => p.stage === "draft").length,
      awaiting_approval: packs.filter((p) => p.stage === "awaiting_approval").length,
      published: packs.filter((p) => p.stage === "published").length,
      needs_update: packs.filter((p) => p.stage === "needs_update").length,
    };
  }, [packs]);

  // Kanban column partitions
  const kanbanItemColumns = useMemo(() => ({
    needs_procurement: filteredItems.filter((i) => i.stage === "needs_procurement"),
    partially_secured: filteredItems.filter((i) => i.stage === "partially_secured"),
    fully_secured: filteredItems.filter((i) => i.stage === "fully_secured"),
    completed: filteredItems.filter((i) => i.stage === "completed"),
  }), [filteredItems]);

  const kanbanPackColumns = useMemo(() => ({
    draft: filteredPacks.filter((p) => p.stage === "draft"),
    awaiting_approval: filteredPacks.filter((p) => p.stage === "awaiting_approval"),
    published: filteredPacks.filter((p) => p.stage === "published"),
    needs_update: filteredPacks.filter((p) => p.stage === "needs_update"),
  }), [filteredPacks]);

  // Inline status changer
  const handleMoveStage = (itemId: string, newStage: ItemStage) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, stage: newStage } : i))
    );
    if (selectedItem && selectedItem.id === itemId) {
      setSelectedItem((prev) => (prev ? { ...prev, stage: newStage } : null));
    }
  };

  const handleMovePackStage = (packId: string, newStage: PackStage) => {
    setPacks((prev) =>
      prev.map((p) => (p.id === packId ? { ...p, stage: newStage } : p))
    );
    if (selectedPack && selectedPack.id === packId) {
      setSelectedPack((prev) => (prev ? { ...prev, stage: newStage } : null));
    }
  };

  // Add new comment
  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    const newComment: ActivityComment = {
      id: `c-${Date.now()}`,
      author: "Liam Morgan",
      avatarTone: "LM",
      text: newCommentText,
      time: "Just now",
    };
    setComments((prev) => [newComment, ...prev]);
    setNewCommentText("");
  };

  return (
    <div className={styles.commandCenter}>
      {/* ===================================================
          1. TOP HEADER & DATE CONTROLS
          =================================================== */}
      <div className={styles.topBar}>
        <div className={styles.greetingBlock}>
          <h1 className={styles.greetingTitle}>
            {mode === "procurement" ? (
              <>
                {greetingTime}, {userName || "Liam"} <span className={styles.greetingWave}>👋</span>
              </>
            ) : (
              "School Packs"
            )}
          </h1>
          <p className={styles.greetingSubtitle}>
            {mode === "procurement"
              ? "Here's what's happening across Pexpacks Supplies."
              : "Manage school-specific grade packs, pricing, approval and publication status."}
          </p>
        </div>

        <div className={styles.topBarActions}>
          <div className={styles.modeToggle}>
            <button
              className={`${styles.modeToggleBtn} ${mode === "procurement" ? styles.modeToggleBtnActive : ""}`}
              onClick={() => {
                setMode("procurement");
                setActiveStageFilter(null);
              }}
            >
              <ShoppingCart size={14} /> Operations Dashboard
            </button>
            <button
              className={`${styles.modeToggleBtn} ${mode === "school_packs" ? styles.modeToggleBtnActive : ""}`}
              onClick={() => {
                setMode("school_packs");
                setActiveStageFilter(null);
              }}
            >
              <Layers size={14} /> School Packs Board
            </button>
          </div>

          <button className={adminStyles.datePickerBtn}>
            <Calendar size={14} />
            <span>{mode === "procurement" ? "May 27 – Jun 2, 2024" : "2027 Back-to-School"}</span>
          </button>
        </div>
      </div>

      {/* ===================================================
          2. CONTROL TOWER ("SEE"): 6 KPI CARDS
          =================================================== */}
      {mode === "procurement" ? (
        <div className={adminStyles.kpiGrid}>
          {/* 1. Paid Orders */}
          <div
            className={`${adminStyles.kpiCard} ${activeStageFilter === "completed" ? adminStyles.kpiCardActive : ""}`}
            onClick={() => setActiveStageFilter(activeStageFilter === "completed" ? null : "completed")}
          >
            <div className={adminStyles.kpiTop}>
              <div className={`${adminStyles.kpiIconWrapper} ${adminStyles.kpiIconTeal}`}>
                <ShoppingCart size={18} />
              </div>
              <div className={adminStyles.kpiHeaderInfo}>
                <span className={adminStyles.kpiLabel}>Paid Orders</span>
                <span className={adminStyles.kpiValue}>128</span>
              </div>
            </div>
            <div className={adminStyles.kpiFooter}>
              <span className={`${adminStyles.kpiTrend} ${adminStyles.kpiTrendUp}`}>
                <TrendingUp size={12} /> 18% vs last 7 days
              </span>
              <SparklineWave color="#2dd4bf" direction="up" />
            </div>
          </div>

          {/* 2. Revenue Received */}
          <div className={adminStyles.kpiCard}>
            <div className={adminStyles.kpiTop}>
              <div className={`${adminStyles.kpiIconWrapper} ${adminStyles.kpiIconEmerald}`}>
                <TrendingUp size={18} />
              </div>
              <div className={adminStyles.kpiHeaderInfo}>
                <span className={adminStyles.kpiLabel}>Revenue Received</span>
                <span className={adminStyles.kpiValue}>R1,248,950</span>
              </div>
            </div>
            <div className={adminStyles.kpiFooter}>
              <span className={`${adminStyles.kpiTrend} ${adminStyles.kpiTrendUp}`}>
                <TrendingUp size={12} /> 22% vs last 7 days
              </span>
              <SparklineWave color="#10b981" direction="up" />
            </div>
          </div>

          {/* 3. Procurement Outstanding */}
          <div
            className={`${adminStyles.kpiCard} ${activeStageFilter === "needs_procurement" ? adminStyles.kpiCardActive : ""}`}
            onClick={() => setActiveStageFilter(activeStageFilter === "needs_procurement" ? null : "needs_procurement")}
          >
            <div className={adminStyles.kpiTop}>
              <div className={`${adminStyles.kpiIconWrapper} ${adminStyles.kpiIconAmber}`}>
                <Truck size={18} />
              </div>
              <div className={adminStyles.kpiHeaderInfo}>
                <span className={adminStyles.kpiLabel}>Procurement Outstanding</span>
                <span className={adminStyles.kpiValue}>R305,620</span>
              </div>
            </div>
            <div className={adminStyles.kpiFooter}>
              <span className={`${adminStyles.kpiTrend} ${adminStyles.kpiTrendDown}`}>
                <TrendingDown size={12} /> 8% vs last 7 days
              </span>
              <SparklineWave color="#f59e0b" direction="down" />
            </div>
          </div>

          {/* 4. Ready to Pack */}
          <div
            className={`${adminStyles.kpiCard} ${activeStageFilter === "fully_secured" ? adminStyles.kpiCardActive : ""}`}
            onClick={() => setActiveStageFilter(activeStageFilter === "fully_secured" ? null : "fully_secured")}
          >
            <div className={adminStyles.kpiTop}>
              <div className={`${adminStyles.kpiIconWrapper} ${adminStyles.kpiIconCyan}`}>
                <PackageCheck size={18} />
              </div>
              <div className={adminStyles.kpiHeaderInfo}>
                <span className={adminStyles.kpiLabel}>Ready to Pack</span>
                <span className={adminStyles.kpiValue}>356</span>
              </div>
            </div>
            <div className={adminStyles.kpiFooter}>
              <span className={`${adminStyles.kpiTrend} ${adminStyles.kpiTrendUp}`}>
                <TrendingUp size={12} /> 15% vs last 7 days
              </span>
              <SparklineWave color="#06b6d4" direction="up" />
            </div>
          </div>

          {/* 5. Orders At Risk */}
          <div
            className={`${adminStyles.kpiCard} ${activeStageFilter === "needs_procurement" ? adminStyles.kpiCardActive : ""}`}
            onClick={() => setActiveStageFilter(activeStageFilter === "needs_procurement" ? null : "needs_procurement")}
          >
            <div className={adminStyles.kpiTop}>
              <div className={`${adminStyles.kpiIconWrapper} ${styles.kpiIconRed}`}>
                <AlertTriangle size={18} />
              </div>
              <div className={adminStyles.kpiHeaderInfo}>
                <span className={adminStyles.kpiLabel}>Orders At Risk</span>
                <span className={adminStyles.kpiValue}>14</span>
              </div>
            </div>
            <div className={adminStyles.kpiFooter}>
              <span className={`${adminStyles.kpiTrend} ${adminStyles.kpiTrendDown}`}>
                <TrendingDown size={12} /> 27% vs last 7 days
              </span>
              <SparklineWave color="#ef4444" direction="down" />
            </div>
          </div>

          {/* 6. Procurement Coverage */}
          <div className={adminStyles.kpiCard}>
            <div className={adminStyles.kpiTop}>
              <div className={`${adminStyles.kpiIconWrapper} ${adminStyles.kpiIconTeal}`}>
                <ShieldCheck size={18} />
              </div>
              <div className={adminStyles.kpiHeaderInfo}>
                <span className={adminStyles.kpiLabel}>Procurement Coverage</span>
                <span className={adminStyles.kpiValue}>72%</span>
              </div>
            </div>
            <div className={styles.kpiProgressBar}>
              <div className={styles.kpiProgressFill} style={{ width: "72%" }} />
            </div>
            <div className={adminStyles.kpiFooter}>
              <span className={`${adminStyles.kpiTrend} ${adminStyles.kpiTrendUp}`}>
                <TrendingUp size={12} /> 6pp vs last 7 days
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* School Packs Mode KPI Grid */
        <div className={adminStyles.kpiGrid}>
          <div className={adminStyles.kpiCard}>
            <div className={adminStyles.kpiTop}>
              <div className={`${adminStyles.kpiIconWrapper} ${adminStyles.kpiIconTeal}`}>
                <Package size={18} />
              </div>
              <div className={adminStyles.kpiHeaderInfo}>
                <span className={adminStyles.kpiLabel}>Total Packs</span>
                <span className={adminStyles.kpiValue}>1,248</span>
              </div>
            </div>
            <div className={adminStyles.kpiFooter}>
              <span className={`${adminStyles.kpiTrend} ${adminStyles.kpiTrendUp}`}>
                <TrendingUp size={12} /> 14% vs last 30 days
              </span>
              <SparklineWave color="#2dd4bf" direction="up" />
            </div>
          </div>

          <div
            className={`${adminStyles.kpiCard} ${activeStageFilter === "awaiting_approval" ? adminStyles.kpiCardActive : ""}`}
            onClick={() => setActiveStageFilter(activeStageFilter === "awaiting_approval" ? null : "awaiting_approval")}
          >
            <div className={adminStyles.kpiTop}>
              <div className={`${adminStyles.kpiIconWrapper} ${adminStyles.kpiIconAmber}`}>
                <Clock size={18} />
              </div>
              <div className={adminStyles.kpiHeaderInfo}>
                <span className={adminStyles.kpiLabel}>Awaiting Approval</span>
                <span className={adminStyles.kpiValue}>36</span>
              </div>
            </div>
            <div className={adminStyles.kpiFooter}>
              <span className={`${adminStyles.kpiTrend} ${adminStyles.kpiTrendDown}`}>
                <TrendingDown size={12} /> 12% vs last 30 days
              </span>
              <SparklineWave color="#f59e0b" direction="down" />
            </div>
          </div>

          <div
            className={`${adminStyles.kpiCard} ${activeStageFilter === "published" ? adminStyles.kpiCardActive : ""}`}
            onClick={() => setActiveStageFilter(activeStageFilter === "published" ? null : "published")}
          >
            <div className={adminStyles.kpiTop}>
              <div className={`${adminStyles.kpiIconWrapper} ${adminStyles.kpiIconEmerald}`}>
                <CheckCircle2 size={18} />
              </div>
              <div className={adminStyles.kpiHeaderInfo}>
                <span className={adminStyles.kpiLabel}>Published Packs</span>
                <span className={adminStyles.kpiValue}>982</span>
              </div>
            </div>
            <div className={adminStyles.kpiFooter}>
              <span className={`${adminStyles.kpiTrend} ${adminStyles.kpiTrendUp}`}>
                <TrendingUp size={12} /> 18% vs last 30 days
              </span>
              <SparklineWave color="#10b981" direction="up" />
            </div>
          </div>

          <div className={adminStyles.kpiCard}>
            <div className={adminStyles.kpiTop}>
              <div className={`${adminStyles.kpiIconWrapper} ${adminStyles.kpiIconBlue}`}>
                <Users size={18} />
              </div>
              <div className={adminStyles.kpiHeaderInfo}>
                <span className={adminStyles.kpiLabel}>Schools Covered</span>
                <span className={adminStyles.kpiValue}>164</span>
              </div>
            </div>
            <div className={adminStyles.kpiFooter}>
              <span className={`${adminStyles.kpiTrend} ${adminStyles.kpiTrendUp}`}>
                <TrendingUp size={12} /> 9% vs last 30 days
              </span>
              <SparklineWave color="#3b82f6" direction="up" />
            </div>
          </div>

          <div
            className={`${adminStyles.kpiCard} ${activeStageFilter === "needs_update" ? adminStyles.kpiCardActive : ""}`}
            onClick={() => setActiveStageFilter(activeStageFilter === "needs_update" ? null : "needs_update")}
          >
            <div className={adminStyles.kpiTop}>
              <div className={`${adminStyles.kpiIconWrapper} ${styles.kpiIconRed}`}>
                <RefreshCw size={18} />
              </div>
              <div className={adminStyles.kpiHeaderInfo}>
                <span className={adminStyles.kpiLabel}>Packs Needing Updates</span>
                <span className={adminStyles.kpiValue}>22</span>
              </div>
            </div>
            <div className={adminStyles.kpiFooter}>
              <span className={`${adminStyles.kpiTrend} ${adminStyles.kpiTrendDown}`}>
                <TrendingDown size={12} /> 8% vs last 30 days
              </span>
              <SparklineWave color="#ef4444" direction="down" />
            </div>
          </div>

          <div className={adminStyles.kpiCard}>
            <div className={adminStyles.kpiTop}>
              <div className={`${adminStyles.kpiIconWrapper} ${adminStyles.kpiIconTeal}`}>
                <ShoppingCart size={18} />
              </div>
              <div className={adminStyles.kpiHeaderInfo}>
                <span className={adminStyles.kpiLabel}>Average Pack Value</span>
                <span className={adminStyles.kpiValue}>R1,067</span>
              </div>
            </div>
            <div className={adminStyles.kpiFooter}>
              <span className={`${adminStyles.kpiTrend} ${adminStyles.kpiTrendUp}`}>
                <TrendingUp size={12} /> 6% vs last 30 days
              </span>
              <SparklineWave color="#2dd4bf" direction="up" />
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          3. DYNAMICS & EXCEPTION CENTER (2-COLUMN GRID)
          =================================================== */}
      <div className={styles.dynamicsGrid}>
        {/* Left Panel: Revenue Received / Pack Status Overview Chart */}
        <div className={adminStyles.panel}>
          <div className={adminStyles.panelHeader}>
            <div className={styles.panelTitleGroup}>
              <h2 className={adminStyles.panelTitle}>
                {mode === "procurement" ? "Revenue Received (R)" : "Pack Status Overview"}
              </h2>
              <Info className={styles.panelInfoIcon} />
            </div>
            <select className={styles.panelSelect}>
              <option>This Month</option>
              <option>Last 30 Days</option>
              <option>Season 2027</option>
            </select>
          </div>

          <div className={styles.panelSummary}>
            <span className={styles.panelBigValue}>
              {mode === "procurement" ? "R1,248,950" : "1,248 Packs"}
            </span>
            <span className={styles.panelDelta}>
              <TrendingUp size={12} /> {mode === "procurement" ? "22% vs Apr 27 – May 3" : "14% vs Apr 27 – May 27"}
            </span>
          </div>

          {mode === "school_packs" && (
            <div className={styles.panelLegend}>
              <span><span className={styles.legendDot} style={{ background: "#2dd4bf" }} /> Draft</span>
              <span><span className={styles.legendDot} style={{ background: "#f59e0b" }} /> Awaiting Approval</span>
              <span><span className={styles.legendDot} style={{ background: "#10b981" }} /> Published</span>
              <span><span className={styles.legendDot} style={{ background: "#ef4444" }} /> Needs Update</span>
            </div>
          )}

          {/* Interactive Bar Chart */}
          <div className={styles.chartContainer}>
            {CHART_DAYS.map((item, idx) => (
              <div
                key={item.day}
                className={styles.chartColumn}
                onMouseEnter={() => setChartHoverIndex(idx)}
                onMouseLeave={() => setChartHoverIndex(4)} // back to peak default
              >
                {chartHoverIndex === idx && (
                  <div className={styles.chartTooltip}>
                    <div className={styles.chartTooltipDate}>{item.day}, 2024</div>
                    <div className={styles.chartTooltipVal}>
                      {mode === "procurement" ? `R ${item.val.toLocaleString("en-ZA")}` : `Total Packs: ${Math.round(item.val / 530)}`}
                    </div>
                  </div>
                )}
                <div className={styles.chartBarTrack}>
                  {mode === "procurement" ? (
                    <div
                      className={`${styles.chartBarFill} ${chartHoverIndex === idx ? styles.chartBarFillActive : ""}`}
                      style={{ height: item.height }}
                    />
                  ) : (
                    <>
                      <div className={styles.chartStackedSegment} style={{ height: "35%", background: "#2dd4bf" }} />
                      <div className={styles.chartStackedSegment} style={{ height: "25%", background: "#f59e0b" }} />
                      <div className={styles.chartStackedSegment} style={{ height: "25%", background: "#10b981" }} />
                      <div className={styles.chartStackedSegment} style={{ height: "15%", background: "#ef4444" }} />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.chartXAxis}>
            {CHART_DAYS.map((item) => (
              <span key={item.day}>{item.day}</span>
            ))}
          </div>
        </div>

        {/* Right Panel: What Needs Attention (Exception Center) */}
        <div className={adminStyles.panel}>
          <div className={adminStyles.panelHeader}>
            <h2 className={adminStyles.panelTitle}>What needs attention</h2>
            <Link
              href="/admin/tasks"
              className={adminStyles.occLegendLink}
            >
              View all alerts <ArrowRight size={13} />
            </Link>
          </div>

          <div className={adminStyles.exceptionList}>
            {INITIAL_EXCEPTIONS.map((exc) => {
              return (
                <div
                  key={exc.id}
                  className={adminStyles.exceptionItem}
                  onClick={() => {
                    if (exc.stageFilter) {
                      setActiveStageFilter(exc.stageFilter);
                    }
                    if (items.length > 0) {
                      setSelectedItem(items[0]);
                      setActiveDrawerTab("resolution");
                    }
                  }}
                >
                  <div className={adminStyles.exceptionLeft}>
                    <div className={`${adminStyles.exceptionIcon} ${EXCEPTION_ICON_CLASS_MAP[exc.severity]}`}>
                      {EXCEPTION_ICON_MAP[exc.severity]}
                    </div>
                    <div className={adminStyles.exceptionDetails}>
                      <span className={adminStyles.exceptionHeadline}>{exc.title}</span>
                      <span className={adminStyles.exceptionSubtext}>{exc.description}</span>
                    </div>
                  </div>

                  <div className={adminStyles.exceptionRight}>
                    <span className={styles.exceptionTarget}>{exc.targetCount}</span>
                    <span className={`${adminStyles.severityBadge} ${EXCEPTION_BADGE_CLASS_MAP[exc.severity]}`}>
                      {exc.severity}
                    </span>
                    <span className={adminStyles.exceptionTime}>{exc.timeAgo}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===================================================
          4. ACTION WORKSPACE ("DO")
          =================================================== */}
      <div className={styles.workspace}>
        <div className={styles.workspaceToolbar}>
          <div className={styles.workspaceTitleGroup}>
            <h2 className={styles.workspaceTitle}>
              {mode === "procurement" ? "Procurement Board" : "School Packs Board"}
            </h2>
            <Info className={styles.panelInfoIcon} />
          </div>

          <div className={styles.workspaceControls}>
            {/* View Switcher: Board | Table */}
            <div className={styles.viewSwitcher}>
              <button
                className={`${styles.viewBtn} ${workspaceView === "kanban" ? styles.viewBtnActive : ""}`}
                onClick={() => setWorkspaceView("kanban")}
              >
                <Kanban size={13} /> Board
              </button>
              <button
                className={`${styles.viewBtn} ${workspaceView === "table" ? styles.viewBtnActive : ""}`}
                onClick={() => setWorkspaceView("table")}
              >
                <TableIcon size={13} /> Table
              </button>
            </div>

            {/* Group By Filter */}
            <select
              className={adminStyles.filterSelect}
              value={activeStageFilter ?? ""}
              onChange={(e) => setActiveStageFilter(e.target.value ? e.target.value : null)}
            >
              <option value="">Group by: All Stages</option>
              {mode === "procurement" ? (
                <>
                  <option value="needs_procurement">Needs Procurement</option>
                  <option value="partially_secured">Partially Secured</option>
                  <option value="fully_secured">Fully Secured</option>
                  <option value="completed">Completed</option>
                </>
              ) : (
                <>
                  <option value="draft">Draft</option>
                  <option value="awaiting_approval">Awaiting Approval</option>
                  <option value="published">Published</option>
                  <option value="needs_update">Needs Update</option>
                </>
              )}
            </select>

            <button
              className={styles.controlBtn}
              onClick={() => setIsCommandPaletteOpen(true)}
            >
              <Filter size={13} /> Filter
            </button>

            <button className={styles.controlBtn}>
              <SlidersHorizontal size={13} /> Sort
            </button>

            <button
              className={styles.addBtnPrimary}
              onClick={() => {
                if (mode === "procurement") {
                  const newItem: WorkspaceItem = {
                    id: `item-${Date.now()}`,
                    name: "New Stationery SKU",
                    schoolOrCategory: "General / Addon",
                    owner: "LM",
                    ownerName: "Liam Morgan",
                    dueDate: "Jun 05",
                    stage: "needs_procurement",
                    quantity: 500,
                    committedSpend: 15000,
                    outstandingPoValue: 15000,
                    revenueAtRisk: 32000,
                    healthScore: 40,
                    healthBreakdown: {
                      masterProductLinked: true,
                      validSku: false,
                      verifiedPrice: false,
                      activeSupplierOffer: false,
                      targetMarginMet: false,
                      schoolApproved: true,
                      fulfilmentConfigured: false,
                    },
                    supplier: "Unassigned",
                    supplierLeadDays: 7,
                    notes: "Newly created item requiring PO issuance.",
                  };
                  setItems((prev) => [newItem, ...prev]);
                  setSelectedItem(newItem);
                } else {
                  const newPack: SchoolPackItem = {
                    id: `pack-${Date.now()}`,
                    schoolName: "Westmount Primary",
                    grade: "Grade 4",
                    price: 1195,
                    stage: "draft",
                    owner: "LM",
                    ownerName: "Liam Morgan",
                    dueDate: "Jun 05",
                    totalItems: 16,
                    healthScore: 50,
                    healthBreakdown: {
                      masterProductLinked: true,
                      validSku: true,
                      verifiedPrice: false,
                      activeSupplierOffer: false,
                      targetMarginMet: false,
                      schoolApproved: false,
                      fulfilmentConfigured: true,
                    },
                    openingDate: "15 Jan 2027",
                    paidOrders: 0,
                    securedPercent: 0,
                  };
                  setPacks((prev) => [newPack, ...prev]);
                  setSelectedPack(newPack);
                }
              }}
            >
              <Plus size={14} /> {mode === "procurement" ? "+ Add Item" : "+ Add Pack"}
            </button>
          </div>
        </div>

        {/* ===================================================
            WORKSPACE: KANBAN BOARD VIEW
            =================================================== */}
        {workspaceView === "kanban" ? (
          mode === "procurement" ? (
            <div className={styles.kanbanBoard}>
              {/* Column 1: Needs Procurement */}
              <div className={`${styles.kanbanCol} ${styles.colRed}`}>
                <div className={styles.colHeader}>
                  <span className={`${styles.colHeaderTitle} ${styles.colHeaderTitleRed}`}>
                    Needs Procurement
                  </span>
                  <span className={styles.colCountBadge}>{stageCounts.needs_procurement}</span>
                </div>
                <div className={styles.colSubheaders}>
                  <span>Item / Task</span>
                  <span>Owner</span>
                  <span>Due Date</span>
                </div>
                <div className={styles.colCardsList}>
                  {kanbanItemColumns.needs_procurement.map((item) => (
                      <div
                        key={item.id}
                        className={styles.kanbanCard}
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className={styles.cardItemCol}>
                          <span className={styles.cardDragDots}>⋮⋮</span>
                          <div>
                            <div className={styles.cardTitle}>{item.name}</div>
                            <div className={styles.cardSubmeta}>{item.schoolOrCategory}</div>
                          </div>
                        </div>
                        <span className={`${styles.avatarBadge} ${styles[`avatar${item.owner}`]}`}>
                          {item.owner}
                        </span>
                        <span className={styles.cardDueDate}>{item.dueDate}</span>
                      </div>
                    ))}
                </div>
                <div className={styles.colAddFooter}>
                  <button
                    className={styles.colAddBtn}
                    onClick={() => {
                      const newItem: WorkspaceItem = {
                        id: `item-${Date.now()}`,
                        name: "Custom SKU Order",
                        schoolOrCategory: "Procurement / Urgent",
                        owner: "LM",
                        ownerName: "Liam Morgan",
                        dueDate: "Jun 02",
                        stage: "needs_procurement",
                        quantity: 300,
                        committedSpend: 9000,
                        outstandingPoValue: 9000,
                        revenueAtRisk: 18000,
                        healthScore: 40,
                        healthBreakdown: {
                          masterProductLinked: true,
                          validSku: false,
                          verifiedPrice: false,
                          activeSupplierOffer: false,
                          targetMarginMet: false,
                          schoolApproved: true,
                          fulfilmentConfigured: false,
                        },
                        supplier: "Pending PO",
                        supplierLeadDays: 5,
                        notes: "Added directly from board.",
                      };
                      setItems((prev) => [newItem, ...prev]);
                    }}
                  >
                    <Plus size={12} /> Add item
                  </button>
                </div>
              </div>

              {/* Column 2: Partially Secured */}
              <div className={`${styles.kanbanCol} ${styles.colAmber}`}>
                <div className={styles.colHeader}>
                  <span className={`${styles.colHeaderTitle} ${styles.colHeaderTitleAmber}`}>
                    Partially Secured
                  </span>
                  <span className={styles.colCountBadge}>{stageCounts.partially_secured}</span>
                </div>
                <div className={styles.colSubheaders}>
                  <span>Item / Task</span>
                  <span>Owner</span>
                  <span>Due Date</span>
                </div>
                <div className={styles.colCardsList}>
                  {kanbanItemColumns.partially_secured.map((item) => (
                      <div
                        key={item.id}
                        className={styles.kanbanCard}
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className={styles.cardItemCol}>
                          <span className={styles.cardDragDots}>⋮⋮</span>
                          <div>
                            <div className={styles.cardTitle}>{item.name}</div>
                            <div className={styles.cardSubmeta}>{item.schoolOrCategory}</div>
                          </div>
                        </div>
                        <span className={`${styles.avatarBadge} ${styles[`avatar${item.owner}`]}`}>
                          {item.owner}
                        </span>
                        <span className={styles.cardDueDate}>{item.dueDate}</span>
                      </div>
                    ))}
                </div>
                <div className={styles.colAddFooter}>
                  <button className={styles.colAddBtn}>
                    <Plus size={12} /> Add item
                  </button>
                </div>
              </div>

              {/* Column 3: Fully Secured */}
              <div className={`${styles.kanbanCol} ${styles.colTeal}`}>
                <div className={styles.colHeader}>
                  <span className={`${styles.colHeaderTitle} ${styles.colHeaderTitleTeal}`}>
                    Fully Secured
                  </span>
                  <span className={styles.colCountBadge}>{stageCounts.fully_secured}</span>
                </div>
                <div className={styles.colSubheaders}>
                  <span>Item / Task</span>
                  <span>Owner</span>
                  <span>Due Date</span>
                </div>
                <div className={styles.colCardsList}>
                  {kanbanItemColumns.fully_secured.map((item) => (
                      <div
                        key={item.id}
                        className={styles.kanbanCard}
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className={styles.cardItemCol}>
                          <span className={styles.cardDragDots}>⋮⋮</span>
                          <div>
                            <div className={styles.cardTitle}>{item.name}</div>
                            <div className={styles.cardSubmeta}>{item.schoolOrCategory}</div>
                          </div>
                        </div>
                        <span className={`${styles.avatarBadge} ${styles[`avatar${item.owner}`]}`}>
                          {item.owner}
                        </span>
                        <span className={styles.cardDueDate}>{item.dueDate}</span>
                      </div>
                    ))}
                </div>
                <div className={styles.colAddFooter}>
                  <button className={styles.colAddBtn}>
                    <Plus size={12} /> Add item
                  </button>
                </div>
              </div>

              {/* Column 4: Completed */}
              <div className={`${styles.kanbanCol} ${styles.colEmerald}`}>
                <div className={styles.colHeader}>
                  <span className={`${styles.colHeaderTitle} ${styles.colHeaderTitleEmerald}`}>
                    Completed
                  </span>
                  <span className={styles.colCountBadge}>{stageCounts.completed}</span>
                </div>
                <div className={styles.colSubheaders}>
                  <span>Item / Task</span>
                  <span>Owner</span>
                  <span>Due Date</span>
                </div>
                <div className={styles.colCardsList}>
                  {kanbanItemColumns.completed.map((item) => (
                      <div
                        key={item.id}
                        className={styles.kanbanCard}
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className={styles.cardItemCol}>
                          <span className={styles.cardDragDots}>⋮⋮</span>
                          <div>
                            <div className={styles.cardTitle}>{item.name}</div>
                            <div className={styles.cardSubmeta}>{item.schoolOrCategory}</div>
                          </div>
                        </div>
                        <span className={`${styles.avatarBadge} ${styles[`avatar${item.owner}`]}`}>
                          {item.owner}
                        </span>
                        <span className={`${styles.cardDueDate} ${adminStyles.occStatusRow}`}>
                          {item.dueDate} <Check className={styles.cardCheckmark} />
                        </span>
                      </div>
                    ))}
                </div>
                <div className={styles.colAddFooter}>
                  <button className={styles.colAddBtn}>
                    <Plus size={12} /> Add item
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* School Packs Mode Kanban Board */
            <div className={styles.kanbanBoard}>
              {/* Draft */}
              <div className={`${styles.kanbanCol} ${styles.colTeal}`}>
                <div className={styles.colHeader}>
                  <span className={`${styles.colHeaderTitle} ${styles.colHeaderTitleTeal}`}>
                    Draft
                  </span>
                  <span className={styles.colCountBadge}>{packStageCounts.draft}</span>
                </div>
                <div className={styles.colSubheaders}>
                  <span>Pack / School</span>
                  <span>Owner · Grade · Price</span>
                  <span>Due Date</span>
                </div>
                <div className={styles.colCardsList}>
                  {kanbanPackColumns.draft.map((pack) => (
                      <div
                        key={pack.id}
                        className={styles.kanbanCard}
                        onClick={() => setSelectedPack(pack)}
                      >
                        <div>
                          <div className={styles.cardTitle}>{pack.schoolName} – {pack.grade}</div>
                          <div className={styles.cardSubmeta}>Health: {pack.healthScore}% · {pack.totalItems} items</div>
                        </div>
                        <div className={adminStyles.occStatusRow}>
                          <span className={`${styles.avatarBadge} ${styles[`avatar${pack.owner}`]}`}>{pack.owner}</span>
                          <span className={styles.cardSubmeta}>R{pack.price}</span>
                        </div>
                        <span className={styles.cardDueDate}>{pack.dueDate}</span>
                      </div>
                    ))}
                </div>
                <div className={styles.colAddFooter}>
                  <button className={styles.colAddBtn}><Plus size={12} /> Add pack</button>
                </div>
              </div>

              {/* Awaiting Approval */}
              <div className={`${styles.kanbanCol} ${styles.colAmber}`}>
                <div className={styles.colHeader}>
                  <span className={`${styles.colHeaderTitle} ${styles.colHeaderTitleAmber}`}>
                    Awaiting Approval
                  </span>
                  <span className={styles.colCountBadge}>{packStageCounts.awaiting_approval}</span>
                </div>
                <div className={styles.colSubheaders}>
                  <span>Pack / School</span>
                  <span>Owner · Grade · Price</span>
                  <span>Due Date</span>
                </div>
                <div className={styles.colCardsList}>
                  {kanbanPackColumns.awaiting_approval.map((pack) => (
                      <div
                        key={pack.id}
                        className={styles.kanbanCard}
                        onClick={() => setSelectedPack(pack)}
                      >
                        <div>
                          <div className={styles.cardTitle}>{pack.schoolName} – {pack.grade}</div>
                          <div className={styles.cardSubmeta}>Health: {pack.healthScore}% · {pack.totalItems} items</div>
                        </div>
                        <div className={adminStyles.occStatusRow}>
                          <span className={`${styles.avatarBadge} ${styles[`avatar${pack.owner}`]}`}>{pack.owner}</span>
                          <span className={styles.cardSubmeta}>R{pack.price}</span>
                        </div>
                        <span className={styles.cardDueDate}>{pack.dueDate}</span>
                      </div>
                    ))}
                </div>
                <div className={styles.colAddFooter}>
                  <button className={styles.colAddBtn}><Plus size={12} /> Add pack</button>
                </div>
              </div>

              {/* Published */}
              <div className={`${styles.kanbanCol} ${styles.colEmerald}`}>
                <div className={styles.colHeader}>
                  <span className={`${styles.colHeaderTitle} ${styles.colHeaderTitleEmerald}`}>
                    Published
                  </span>
                  <span className={styles.colCountBadge}>{packStageCounts.published}</span>
                </div>
                <div className={styles.colSubheaders}>
                  <span>Pack / School</span>
                  <span>Owner · Grade · Price</span>
                  <span>Due Date</span>
                </div>
                <div className={styles.colCardsList}>
                  {kanbanPackColumns.published.map((pack) => (
                      <div
                        key={pack.id}
                        className={styles.kanbanCard}
                        onClick={() => setSelectedPack(pack)}
                      >
                        <div>
                          <div className={styles.cardTitle}>{pack.schoolName} – {pack.grade}</div>
                          <div className={styles.cardSubmeta}>Health: {pack.healthScore}% · {pack.totalItems} items</div>
                        </div>
                        <div className={adminStyles.occStatusRow}>
                          <span className={`${styles.avatarBadge} ${styles[`avatar${pack.owner}`]}`}>{pack.owner}</span>
                          <span className={styles.cardSubmeta}>R{pack.price}</span>
                        </div>
                        <span className={styles.cardDueDate}>{pack.dueDate}</span>
                      </div>
                    ))}
                </div>
                <div className={styles.colAddFooter}>
                  <button className={styles.colAddBtn}><Plus size={12} /> Add pack</button>
                </div>
              </div>

              {/* Needs Update */}
              <div className={`${styles.kanbanCol} ${styles.colRed}`}>
                <div className={styles.colHeader}>
                  <span className={`${styles.colHeaderTitle} ${styles.colHeaderTitleRed}`}>
                    Needs Update
                  </span>
                  <span className={styles.colCountBadge}>{packStageCounts.needs_update}</span>
                </div>
                <div className={styles.colSubheaders}>
                  <span>Pack / School</span>
                  <span>Owner · Grade · Price</span>
                  <span>Due Date</span>
                </div>
                <div className={styles.colCardsList}>
                  {kanbanPackColumns.needs_update.map((pack) => (
                      <div
                        key={pack.id}
                        className={styles.kanbanCard}
                        onClick={() => setSelectedPack(pack)}
                      >
                        <div>
                          <div className={styles.cardTitle}>{pack.schoolName} – {pack.grade}</div>
                          <div className={styles.cardSubmeta}>Health: {pack.healthScore}% · Stale price</div>
                        </div>
                        <div className={adminStyles.occStatusRow}>
                          <span className={`${styles.avatarBadge} ${styles[`avatar${pack.owner}`]}`}>{pack.owner}</span>
                          <span className={styles.cardSubmeta}>R{pack.price}</span>
                        </div>
                        <span className={styles.cardDueDate}>{pack.dueDate}</span>
                      </div>
                    ))}
                </div>
                <div className={styles.colAddFooter}>
                  <button className={styles.colAddBtn}><Plus size={12} /> Add pack</button>
                </div>
              </div>
            </div>
          )
        ) : (
          /* ===================================================
              WORKSPACE: DATA TABLE VIEW ALTERNATIVE
              =================================================== */
          <div className={styles.tableView}>
            <table className={adminStyles.dataTable}>
              <thead>
                <tr>
                  <th>Item / Pack Name</th>
                  <th>Category / School</th>
                  <th>Owner</th>
                  <th>Stage Status</th>
                  <th>Health Score</th>
                  <th>Committed Spend</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                  >
                    <td>
                      <strong className={adminStyles.occCardTitle}>{item.name}</strong>
                    </td>
                    <td>{item.schoolOrCategory}</td>
                    <td>
                      <span className={`${styles.avatarBadge} ${styles[`avatar${item.owner}`]}`}>
                        {item.owner}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${adminStyles.severityBadge} ${
                          item.stage === "completed"
                            ? adminStyles.severityLow
                            : item.stage === "fully_secured"
                            ? adminStyles.severityInfo
                            : item.stage === "partially_secured"
                            ? adminStyles.severityMedium
                            : adminStyles.severityHigh
                        }`}
                      >
                        {item.stage.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.healthBadge} ${
                          item.healthScore >= 80
                            ? styles.healthGreen
                            : item.healthScore >= 60
                            ? styles.healthAmber
                            : styles.healthRed
                        }`}
                      >
                        {item.healthScore}%
                      </span>
                    </td>
                    <td>R {item.committedSpend.toLocaleString("en-ZA")}</td>
                    <td>{item.dueDate}</td>
                    <td>
                      <button
                        className={`${styles.controlBtn} ${adminStyles.occBadgePadded}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===================================================
          5. CONTEXTUAL SLIDE-OVER DRAWER (RIGHT SIDE)
          =================================================== */}
      {(selectedItem || selectedPack) && (
        <div className={styles.drawerOverlay} onClick={() => { setSelectedItem(null); setSelectedPack(null); }}>
          <div className={styles.drawerPanel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div className={adminStyles.occMetaRow}>
                <span
                  className={`${styles.avatarBadge} ${
                    styles[`avatar${selectedItem?.owner || selectedPack?.owner || "LM"}`]
                  }`}
                >
                  {selectedItem?.owner || selectedPack?.owner || "LM"}
                </span>
                <h3 className={styles.drawerTitle}>
                  {selectedItem?.name || `${selectedPack?.schoolName} – ${selectedPack?.grade}`}
                </h3>
              </div>
              <button
                className={styles.drawerCloseBtn}
                onClick={() => { setSelectedItem(null); setSelectedPack(null); }}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.drawerTabs}>
              <button
                className={`${styles.drawerTab} ${activeDrawerTab === "resolution" ? styles.drawerTabActive : ""}`}
                onClick={() => setActiveDrawerTab("resolution")}
              >
                Blocker Resolution
              </button>
              <button
                className={`${styles.drawerTab} ${activeDrawerTab === "activity" ? styles.drawerTabActive : ""}`}
                onClick={() => setActiveDrawerTab("activity")}
              >
                Discussion & Audit
              </button>
              <button
                className={`${styles.drawerTab} ${activeDrawerTab === "supplier" ? styles.drawerTabActive : ""}`}
                onClick={() => setActiveDrawerTab("supplier")}
              >
                Supplier / Logistics
              </button>
            </div>

            <div className={styles.drawerBody}>
              {activeDrawerTab === "resolution" && (
                <>
                  {/* Health Score Calculation Breakdown */}
                  <div className={styles.drawerSection}>
                    <h4 className={styles.drawerSectionTitle}>Deterministic Pack Health Score</h4>
                    <div className={styles.healthBreakdownGrid}>
                      <div className={styles.healthRow}>
                        <span>Linked to Master Product</span>
                        <span style={{ color: selectedItem?.healthBreakdown.masterProductLinked ? "#34d399" : "#f87171" }}>
                          {selectedItem?.healthBreakdown.masterProductLinked ? "+20%" : "0%"}
                        </span>
                      </div>
                      <div className={styles.healthRow}>
                        <span>Valid & Active SKU</span>
                        <span style={{ color: selectedItem?.healthBreakdown.validSku ? "#34d399" : "#f87171" }}>
                          {selectedItem?.healthBreakdown.validSku ? "+15%" : "0%"}
                        </span>
                      </div>
                      <div className={styles.healthRow}>
                        <span>Current Verified Selling Price</span>
                        <span style={{ color: selectedItem?.healthBreakdown.verifiedPrice ? "#34d399" : "#f87171" }}>
                          {selectedItem?.healthBreakdown.verifiedPrice ? "+15%" : "0%"}
                        </span>
                      </div>
                      <div className={styles.healthRow}>
                        <span>Active Supplier Offer Available</span>
                        <span style={{ color: selectedItem?.healthBreakdown.activeSupplierOffer ? "#34d399" : "#f87171" }}>
                          {selectedItem?.healthBreakdown.activeSupplierOffer ? "+15%" : "0%"}
                        </span>
                      </div>
                      <div className={styles.healthRow}>
                        <span>Target Margin Met (≥ 28%)</span>
                        <span style={{ color: selectedItem?.healthBreakdown.targetMarginMet ? "#34d399" : "#f87171" }}>
                          {selectedItem?.healthBreakdown.targetMarginMet ? "+15%" : "0%"}
                        </span>
                      </div>
                      <div className={styles.healthRow}>
                        <span>School Approval Signed</span>
                        <span style={{ color: selectedItem?.healthBreakdown.schoolApproved ? "#34d399" : "#f87171" }}>
                          {selectedItem?.healthBreakdown.schoolApproved ? "+10%" : "0%"}
                        </span>
                      </div>
                      <div className={styles.healthRow}>
                        <span>Fulfilment Dates Configured</span>
                        <span style={{ color: selectedItem?.healthBreakdown.fulfilmentConfigured ? "#34d399" : "#f87171" }}>
                          {selectedItem?.healthBreakdown.fulfilmentConfigured ? "+10%" : "0%"}
                        </span>
                      </div>
                      <div className={styles.healthScoreTotal}>
                        <span>Total Deterministic Health</span>
                        <span className={adminStyles.occScoreBig}>
                          {selectedItem?.healthScore || selectedPack?.healthScore || 75}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Exposure */}
                  <div className={styles.drawerSection}>
                    <h4 className={styles.drawerSectionTitle}>Financial Exposure & Margin Risk</h4>
                    <div className={adminStyles.occDetailGrid}>
                      <div className={adminStyles.occDetailCell}>
                        <div className={adminStyles.occDetailLabel}>Committed Spend</div>
                        <div className={adminStyles.occDetailValue}>
                          R {(selectedItem?.committedSpend || 42000).toLocaleString("en-ZA")}
                        </div>
                      </div>
                      <div className={adminStyles.occDetailCell}>
                        <div className={adminStyles.occDetailLabel}>Revenue Tied</div>
                        <div className={adminStyles.occDetailValueRed}>
                          R {(selectedItem?.revenueAtRisk || 86400).toLocaleString("en-ZA")}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Inline Resolution Actions */}
                  <div className={styles.drawerSection}>
                    <h4 className={styles.drawerSectionTitle}>Inline Resolution Controls</h4>
                    <div className={styles.actionButtonGroup}>
                      <button
                        className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                        onClick={() => {
                          if (selectedItem) handleMoveStage(selectedItem.id, "fully_secured");
                          if (selectedPack) handleMovePackStage(selectedPack.id, "published");
                        }}
                      >
                        <CheckCircle2 size={13} /> Approve & Secure
                      </button>
                      <button className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}>
                        <ShoppingCart size={13} /> Create Supplier PO
                      </button>
                      <button className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}>
                        <RefreshCw size={13} /> Override Price
                      </button>
                      <button className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}>
                        <User size={13} /> Reassign Owner
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeDrawerTab === "activity" && (
                <div className={styles.drawerSection}>
                  <h4 className={styles.drawerSectionTitle}>Discussion & Contextual Notes</h4>
                  <div className={styles.commentsList}>
                    {comments.map((c) => (
                      <div key={c.id} className={styles.commentItem}>
                        <span className={`${styles.avatarBadge} ${styles[`avatar${c.avatarTone}`]}`}>
                          {c.avatarTone}
                        </span>
                        <div className={styles.commentBody}>
                          <span className={styles.commentAuthor}>{c.author}</span>
                          <span className={styles.commentText}>{c.text}</span>
                          <span className={styles.commentTime}>{c.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.commentInputGroup}>
                    <textarea
                      className={styles.commentInput}
                      placeholder="Type a message or use @mention (e.g. @Sarah Bell, @Liam)..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                    />
                    <button
                      className={`${styles.actionBtn} ${styles.actionBtnPrimary} ${adminStyles.occAlignEnd}`}
                      onClick={handleAddComment}
                    >
                      <Send size={12} /> Post Comment
                    </button>
                  </div>
                </div>
              )}

              {activeDrawerTab === "supplier" && (
                <div className={styles.drawerSection}>
                  <h4 className={styles.drawerSectionTitle}>Supplier Logistics Profile</h4>
                  <div className={adminStyles.occSupplierInfo}>
                    <div className={adminStyles.occSupplierRow}>
                      <span className={adminStyles.occSupplierLabel}>Primary Supplier:</span>
                      <strong className={adminStyles.occSupplierVal}>{selectedItem?.supplier || "Bantex SA"}</strong>
                    </div>
                    <div className={adminStyles.occSupplierRow}>
                      <span className={adminStyles.occSupplierLabel}>Average Lead Time:</span>
                      <strong className={adminStyles.occSupplierVal}>{selectedItem?.supplierLeadDays || 14} business days</strong>
                    </div>
                    <div className={adminStyles.occSupplierRow}>
                      <span className={adminStyles.occSupplierLabel}>Fulfillment Accuracy:</span>
                      <strong className={adminStyles.occSupplierValGreen}>98.4% On-time</strong>
                    </div>
                    <div className={adminStyles.occSupplierRow}>
                      <span className={adminStyles.occSupplierLabel}>Internal Note:</span>
                      <span className={adminStyles.occSupplierValLight}>{selectedItem?.notes || "No pending blockers."}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          6. UNIVERSAL COMMAND PALETTE MODAL (⌘K)
          =================================================== */}
      {isCommandPaletteOpen && (
        <div className={styles.commandPaletteOverlay} onClick={() => setIsCommandPaletteOpen(false)}>
          <div className={styles.commandPaletteModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.commandInputWrapper}>
              <Search size={18} color="#94a3b8" />
              <input
                autoFocus
                className={styles.commandInput}
                placeholder="Search schools, orders, products, suppliers or type a command..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className={styles.commandBadge}>ESC</span>
            </div>
            <div className={styles.commandList}>
              <div
                className={styles.commandItem}
                onClick={() => {
                  setMode("procurement");
                  setIsCommandPaletteOpen(false);
                }}
              >
                <span>Switch to Operations Dashboard</span>
                <span className={styles.commandBadge}>Dashboard</span>
              </div>
              <div
                className={styles.commandItem}
                onClick={() => {
                  setMode("school_packs");
                  setIsCommandPaletteOpen(false);
                }}
              >
                <span>Switch to School Packs Board</span>
                <span className={styles.commandBadge}>School Packs</span>
              </div>
              <div
                className={styles.commandItem}
                onClick={() => {
                  setActiveStageFilter("needs_procurement");
                  setIsCommandPaletteOpen(false);
                }}
              >
                <span>Filter: Items Needing Procurement</span>
                <span className={styles.commandBadge}>Red Alert</span>
              </div>
              <div
                className={styles.commandItem}
                onClick={() => {
                  setActiveStageFilter("awaiting_approval");
                  setIsCommandPaletteOpen(false);
                }}
              >
                <span>Filter: Packs Awaiting Approval</span>
                <span className={styles.commandBadge}>Approval</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
