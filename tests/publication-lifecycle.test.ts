import { describe, it, expect } from "vitest";
import { mapSchoolToPublicPage } from "@/lib/public-data/mappers";
import type { PublicSeason } from "@/lib/public-data/contracts";

describe("Publication State Model & Readiness Rules", () => {
  const activeSeason: PublicSeason = {
    id: "season-2027",
    name: "2027 Back-to-School",
    academicYear: 2027,
    isDefault: true,
    orderingStatus: "open",
  };

  it("classifies school as verified when active grade packs exist", () => {
    const school = {
      id: "school-1",
      name: "St Peter's College",
      slug: "st-peters-college",
      city: "Sandton",
      province: "Gauteng",
      isPartnerSchool: true,
      publication_status: "published" as const,
      grades: [
        {
          id: "pack-1",
          grade: "Grade 8",
          gradeSlug: "grade-8",
          price: 1250,
          contents: ["Calculator", "Pens"],
          availability: "in-stock" as const,
          deliveryNote: "Delivery arranged by school phase.",
        },
      ],
    };

    const page = mapSchoolToPublicPage(school, activeSeason);
    expect(page.listStatus).toBe("verified");
    expect(page.packs).toHaveLength(1);
    expect(page.packs[0].inStock).toBe(true);
  });

  it("classifies school as awaiting when no grade packs exist yet", () => {
    const school = {
      id: "school-2",
      name: "New Discovery Academy",
      slug: "new-discovery-academy",
      city: "Midrand",
      province: "Gauteng",
      isPartnerSchool: false,
      publication_status: "published" as const,
      grades: [],
    };

    const page = mapSchoolToPublicPage(school, activeSeason);
    expect(page.listStatus).toBe("awaiting");
    expect(page.packs).toHaveLength(0);
  });

  it("classifies school as custom_only when partnership was refused", () => {
    const school = {
      id: "school-3",
      name: "Private High",
      slug: "private-high",
      city: "Pretoria",
      province: "Gauteng",
      refusedPartnership: true,
      grades: [],
    };

    const page = mapSchoolToPublicPage(school, activeSeason);
    expect(page.listStatus).toBe("custom_only");
  });

  it("validates pack readiness criteria deterministically", () => {
    // Pure function representing the validation logic of validate_pack_for_publication
    function checkPackReadiness(input: {
      hasSchool: boolean;
      schoolPublished: boolean;
      seasonActive: boolean;
      itemCount: number;
      price: number;
      hasNegativeItems: boolean;
    }) {
      const reasons: string[] = [];
      if (!input.hasSchool || !input.schoolPublished) {
        reasons.push("Associated school must be published.");
      }
      if (!input.seasonActive) {
        reasons.push("Commercial season must be active.");
      }
      if (input.itemCount < 1) {
        reasons.push("Pack must contain at least 1 stationery item.");
      }
      if (input.price < 0) {
        reasons.push("Pack total price cannot be negative.");
      }
      if (input.hasNegativeItems) {
        reasons.push("Items carry invalid negative pricing.");
      }

      return {
        isReady: reasons.length === 0,
        reasons,
      };
    }

    // Invalid pack: 0 items and negative price
    const invalidResult = checkPackReadiness({
      hasSchool: true,
      schoolPublished: true,
      seasonActive: true,
      itemCount: 0,
      price: -50,
      hasNegativeItems: false,
    });
    expect(invalidResult.isReady).toBe(false);
    expect(invalidResult.reasons).toContain("Pack must contain at least 1 stationery item.");
    expect(invalidResult.reasons).toContain("Pack total price cannot be negative.");

    // Valid pack
    const validResult = checkPackReadiness({
      hasSchool: true,
      schoolPublished: true,
      seasonActive: true,
      itemCount: 15,
      price: 850,
      hasNegativeItems: false,
    });
    expect(validResult.isReady).toBe(true);
    expect(validResult.reasons).toHaveLength(0);
  });
});
