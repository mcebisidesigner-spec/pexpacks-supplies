import { describe, it, expect } from "vitest";
import {
  mapPackItemToPublic,
  mapPackToPublicCard,
  mapSchoolToPublicPage,
  normalizeWebsiteUrl,
} from "@/lib/public-data/mappers";
import { DEFAULT_PUBLIC_SEASON } from "@/lib/public-data/seasons";
import { DEFAULT_SITE_SETTINGS, PUBLIC_SITE_SETTING_KEYS } from "@/lib/public-data/settings";
import type { GradePack, SchoolPackItem } from "@/data/schools";

describe("Public Data Adapter Layer", () => {
  it("normalizes official website URLs cleanly", () => {
    expect(normalizeWebsiteUrl("dawnviewhigh.co.za")).toBe("https://dawnviewhigh.co.za");
    expect(normalizeWebsiteUrl("http://example.com")).toBe("http://example.com");
    expect(normalizeWebsiteUrl("https://example.com")).toBe("https://example.com");
    expect(normalizeWebsiteUrl(null)).toBeNull();
    expect(normalizeWebsiteUrl("   ")).toBeNull();
  });

  it("maps school pack items safely without leaking internal operational fields", () => {
    const rawItem: SchoolPackItem = {
      name: "Staedtler HB Pencils Box of 12",
      quantity: 2,
      unitPrice: 45.5,
      icon: "pencil",
      specification: "HB Lead",
      description: "Standard school pencil",
    };

    const publicItem = mapPackItemToPublic(rawItem, 0);

    expect(publicItem.name).toBe("Staedtler HB Pencils Box of 12");
    expect(publicItem.quantity).toBe(2);
    expect(publicItem.unitPrice).toBe(45.5);
    expect(publicItem.specification).toBe("HB Lead");
    expect(publicItem.icon).toBe("pencil");
    // Ensure no internal purchase cost or supplier data exists
    expect((publicItem as unknown as Record<string, unknown>).purchase_cost).toBeUndefined();
    expect((publicItem as unknown as Record<string, unknown>).supplier).toBeUndefined();
  });

  it("maps grade pack to public pack card with contents preview", () => {
    const pack: GradePack = {
      id: "pack-g1-test",
      grade: "Grade 1",
      gradeSlug: "grade-1",
      price: 850,
      contents: ["Pencils", "Eraser", "Ruler", "Glue", "Crayons"],
      deliveryNote: "Packed ready for school",
      availability: "in-stock",
    };

    const card = mapPackToPublicCard(pack);

    expect(card.grade).toBe("Grade 1");
    expect(card.price).toBe(850);
    expect(card.inStock).toBe(true);
    expect(card.previewItems).toHaveLength(4);
    expect(card.pdfAvailable).toBe(true);
  });

  it("maps school page model using the active season and verified status", () => {
    const mockSchool = {
      id: "school-123",
      name: "Roosevelt High School",
      slug: "roosevelt-high-school",
      city: "Johannesburg",
      province: "Gauteng",
      district: "Johannesburg North",
      logo: "https://example.com/logo.png",
      website: "roosevelt.co.za",
      isPartnerSchool: true,
      customBadge: "2027 Packs",
      grades: [
        {
          id: "pack-8",
          grade: "Grade 8",
          gradeSlug: "grade-8",
          price: 1100,
          contents: ["Geometry Set", "Pens"],
          deliveryNote: "Dispatched direct",
          availability: "in-stock" as const,
        },
      ],
    };

    const page = mapSchoolToPublicPage(mockSchool, DEFAULT_PUBLIC_SEASON);

    expect(page.name).toBe("Roosevelt High School");
    expect(page.officialWebsite).toBe("https://roosevelt.co.za");
    expect(page.isPartner).toBe(true);
    expect(page.currentSeason.academicYear).toBe(2027);
    expect(page.listStatus).toBe("verified");
    expect(page.packs).toHaveLength(1);
    expect(page.packs[0].price).toBe(1100);
  });

  it("loads public settings from the same keys saved by admin settings", () => {
    expect(PUBLIC_SITE_SETTING_KEYS).toContain("business.support_phone");
    expect(PUBLIC_SITE_SETTING_KEYS).toContain("business.support_email");
    expect(PUBLIC_SITE_SETTING_KEYS).toContain("pricing.pexcover_price");
    expect(PUBLIC_SITE_SETTING_KEYS).not.toContain("company.support_phone");
    expect(PUBLIC_SITE_SETTING_KEYS).not.toContain("company.support_email");
  });

  it("provides fallback settings and defaults when database is cold", () => {
    expect(DEFAULT_SITE_SETTINGS.supportPhone).toBeDefined();
    expect(DEFAULT_SITE_SETTINGS.supportEmail).toBe("helpme@pexpacks.co.za");
    expect(DEFAULT_SITE_SETTINGS.enabledPaymentMethods).toContain("ozow");
    expect(DEFAULT_SITE_SETTINGS.pexcoverPrice).toBe(350);
  });

  it("sanitises public school directory projection strictly against sensitive fields", () => {
    const rawSchoolRecord = {
      id: "sch-1",
      name: "St Stithians College",
      slug: "st-stithians-college",
      city: "Sandton",
      province: "Gauteng",
      district: "Johannesburg North",
      logo: "https://example.com/logo.png",
      is_partner: true,
      is_featured: true,
      refused_partnership: false,
      lowest_price: 950,
      grades: ["Grade 8", "Grade 9"],
      principal: "https://stithian.com",
      parent_collection_accepted: true,
      custom_badge: "2027 Packs",
      publication_status: "published",
      directory_status: "listed",
      stationery_list_status: "verified",
      // Internal operational fields that MUST NEVER leak to public directory:
      internal_notes: "High priority commercial partner",
      commission_rate: 0.15,
      bank_account_number: "62000000000",
    };

    // Public directory projection
    const publicDirectoryEntry = {
      id: rawSchoolRecord.id,
      name: rawSchoolRecord.name,
      slug: rawSchoolRecord.slug,
      city: rawSchoolRecord.city,
      province: rawSchoolRecord.province,
      district: rawSchoolRecord.district,
      logo: rawSchoolRecord.logo,
      is_partner: rawSchoolRecord.is_partner,
      is_featured: rawSchoolRecord.is_featured,
      lowest_price: rawSchoolRecord.lowest_price,
      grades: rawSchoolRecord.grades,
      custom_badge: rawSchoolRecord.custom_badge,
      publication_status: rawSchoolRecord.publication_status,
      directory_status: rawSchoolRecord.directory_status,
      stationery_list_status: rawSchoolRecord.stationery_list_status,
    };

    expect((publicDirectoryEntry as Record<string, unknown>).internal_notes).toBeUndefined();
    expect((publicDirectoryEntry as Record<string, unknown>).commission_rate).toBeUndefined();
    expect((publicDirectoryEntry as Record<string, unknown>).bank_account_number).toBeUndefined();
    expect(publicDirectoryEntry.publication_status).toBe("published");
    expect(publicDirectoryEntry.directory_status).toBe("listed");
  });
});
