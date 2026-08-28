import type {
  PublicPackCard,
  PublicPackDetail,
  PublicPackItem,
  PublicSchoolLocation,
  PublicSchoolPage,
  PublicSeason,
} from "./contracts";
import type { GradePack, SchoolPackItem } from "@/data/schools";

/**
 * Normalizes website URLs to always include http(s) protocol
 */
export function normalizeWebsiteUrl(url?: string | null): string | null {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Maps pack items into public customer-facing items
 */
export function mapPackItemToPublic(
  item: SchoolPackItem,
  index: number
): PublicPackItem {
  return {
    id: `item-${index}-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: item.name,
    specification: item.specification || null,
    description: item.description || null,
    quantity: Math.max(1, item.quantity),
    unitPrice: item.unitPrice ?? 0,
    isRequired: true,
    category: "Stationery",
    icon: item.icon || "pencil",
  };
}

/**
 * Maps a grade pack into a public pack card
 */
export function mapPackToPublicCard(pack: GradePack): PublicPackCard {
  return {
    id: pack.id,
    slug: pack.gradeSlug,
    grade: pack.grade,
    title: `${pack.grade} Stationery Pack`,
    shortDescription: pack.deliveryNote || null,
    price: pack.price,
    itemCount: pack.packItems?.length || pack.contents.length || 0,
    previewItems: pack.contents.slice(0, 4),
    inStock: pack.availability !== "pre-order",
    pdfAvailable: true,
  };
}

/**
 * Maps a grade pack into a complete public pack detail model
 */
export function mapPackToPublicDetail(
  pack: GradePack,
  school: { id: string; name: string; slug: string },
  academicYear: string,
  pexcoverPrice: number = 350
): PublicPackDetail {
  const card = mapPackToPublicCard(pack);
  const items = (pack.packItems || []).map(mapPackItemToPublic);

  return {
    ...card,
    schoolId: school.id,
    schoolName: school.name,
    schoolSlug: school.slug,
    academicYear,
    items,
    pexcoverAvailable: true,
    pexcoverPrice,
    deliveryNote: pack.deliveryNote || "Prepared for delivery before school starts.",
  };
}

/**
 * Maps a database or cached school model into a PublicSchoolPage model
 */
export function mapSchoolToPublicPage(
  school: {
    id: string;
    name: string;
    slug: string;
    city?: string | null;
    province?: string | null;
    district?: string | null;
    logo?: string | null;
    website?: string | null;
    principal?: string | null;
    isPartnerSchool?: boolean;
    is_partner?: boolean | null;
    customBadge?: string | null;
    custom_badge?: string | null;
    refusedPartnership?: boolean;
    grades?: GradePack[];
  },
  season: PublicSeason
): PublicSchoolPage {
  const isPartner = Boolean(school.isPartnerSchool ?? school.is_partner);
  const grades = school.grades || [];
  const packs = grades.map(mapPackToPublicCard);
  const website = normalizeWebsiteUrl(school.website || school.principal);

  let listStatus: PublicSchoolPage["listStatus"] = "verified";
  if (school.refusedPartnership) {
    listStatus = "custom_only";
  } else if (packs.length === 0) {
    listStatus = "awaiting";
  }

  const location: PublicSchoolLocation = {
    city: school.city || "Johannesburg",
    province: school.province || "Gauteng",
    district: school.district || null,
  };

  return {
    id: school.id,
    slug: school.slug,
    name: school.name,
    logoUrl: school.logo || null,
    location,
    officialWebsite: website,
    isPartner,
    currentSeason: season,
    listStatus,
    searchPillBadge: school.customBadge || school.custom_badge || `${season.academicYear} Packs`,
    packs,
  };
}
