/**
 * Public Data Contracts for Pexpacks Public Web Application (pexpacks.co.za)
 *
 * These contracts define the customer-facing read models.
 * Raw database rows, supplier details, purchase costs, and operational
 * complexity must never leak into these public structures.
 */

export interface PublicSeason {
  id: string;
  name: string;
  academicYear: number;
  isDefault: boolean;
  orderingStatus: "open" | "coming_soon" | "closed";
  orderingOpensAt?: string | null;
  orderingClosesAt?: string | null;
  fulfilmentStart?: string | null;
  fulfilmentEnd?: string | null;
}

export interface PublicSchoolSearchResult {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  city: string;
  province: string;
  district?: string | null;
  isPartner: boolean;
  activeSeason: string;
  statusBadge: string;
  hasOrderablePacks: boolean;
  lowestPrice?: number;
  grades: string[];
}

export interface PublicSchoolLocation {
  city: string;
  province: string;
  district?: string | null;
}

export interface PublicPackItem {
  id: string;
  productId?: string | null;
  name: string;
  brand?: string | null;
  specification?: string | null;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  isRequired: boolean;
  category: string;
  icon: string;
}

export interface PublicPackCard {
  id: string;
  slug: string;
  grade: string;
  title: string;
  shortDescription?: string | null;
  price: number;
  itemCount: number;
  previewItems: string[];
  inStock: boolean;
  pdfAvailable: boolean;
}

export interface PublicPackDetail extends PublicPackCard {
  schoolId: string;
  schoolName: string;
  schoolSlug: string;
  academicYear: string;
  items: PublicPackItem[];
  pexcoverAvailable: boolean;
  pexcoverPrice: number;
  deliveryNote: string;
}

export interface PublicSchoolPage {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  location: PublicSchoolLocation;
  officialWebsite: string | null;
  isPartner: boolean;
  currentSeason: PublicSeason;
  listStatus: "verified" | "awaiting" | "custom_only";
  searchPillBadge: string;
  noticeMessage?: string | null;
  packs: PublicPackCard[];
}

export interface PublicOrderTrackingStage {
  key: "placed" | "processing" | "shipped" | "out_for_delivery" | "delivered";
  label: string;
  description: string;
  completed: boolean;
  current: boolean;
}

export interface PublicOrderTracking {
  orderReference: string;
  schoolName: string;
  grade: string;
  status: "placed" | "processing" | "shipped" | "out_for_delivery" | "delivered";
  statusLabel: string;
  statusDescription: string;
  estimatedDelivery: string | null;
  courierName: string | null;
  waybillNumber: string | null;
  stages: PublicOrderTrackingStage[];
  updatedAt: string;
}

export interface PublicSiteSettings {
  activeSeason: PublicSeason;
  supportPhone: string;
  supportEmail: string;
  whatsappNumber: string;
  whatsappUrl: string;
  pexcoverPrice: number;
  enabledPaymentMethods: ("ozow" | "happypay")[];
}
