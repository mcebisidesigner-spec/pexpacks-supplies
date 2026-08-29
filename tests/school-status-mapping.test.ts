import { describe, it, expect, vi } from "vitest";
import {
  PUBLICATION_STATUSES,
  PARTNERSHIP_STATUSES,
  FEATURE_STATUSES,
  PARENT_COLLECTION_OPTIONS,
} from "@/lib/admin/school-constants";
import { parseSchoolForm } from "@/lib/admin/schools";
import { handleTrayCheckout, TrayCheckoutError } from "@/lib/checkout/trayCheckout";

// Mock Supabase admin client for server-side testing
vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn(() => ({
    from: (table: string) => {
      if (table === "schools") {
        return {
          select: () => ({
            in: (field: string, values: string[]) => {
              if (values.includes("disallowed-school")) {
                return Promise.resolve({
                  data: [
                    {
                      id: "s1",
                      name: "Disallowed School",
                      slug: "disallowed-school",
                      parent_collection_accepted: false,
                    },
                  ],
                  error: null,
                });
              }
              return Promise.resolve({
                data: [
                  {
                    id: "s2",
                    name: "Allowed School",
                    slug: "allowed-school",
                    parent_collection_accepted: true,
                  },
                ],
                error: null,
              });
            },
          }),
        };
      }
      return {
        select: () => ({
          in: () => Promise.resolve({ data: [], error: null }),
        }),
      };
    },
  })),
}));

vi.mock("@/lib/orders", () => ({
  createMultiPackOrder: vi.fn(),
  generateOrderReference: () => "ORDER-TEST-123",
  getOrderByIdempotencyKey: () => Promise.resolve(null),
}));

vi.mock("@/lib/school-utils", () => ({
  getGradeBySlug: () =>
    Promise.resolve({
      id: "pack-1",
      grade: "Grade 1",
      gradeSlug: "grade-1",
      price: 500,
      packItems: [],
    }),
}));

describe("School Status, Public Visibility & Checkout Mapping Architecture", () => {
  it("defines authoritative canonical constants without legacy bloat", () => {
    expect(PUBLICATION_STATUSES).toEqual(["published", "ready_for_review"]);
    expect(PARTNERSHIP_STATUSES).toEqual(["partner", "non_partner", "refused_partner"]);
    expect(FEATURE_STATUSES).toEqual(["featured", "unfeatured"]);
    expect(PARENT_COLLECTION_OPTIONS).toEqual(["accepted", "unaccepted"]);
  });

  it("correctly parses canonical form inputs and maintains deterministic legacy derivation", () => {
    const formData = new FormData();
    formData.set("name", "Test Academy");
    formData.set("slug", "test-academy");
    formData.set("publication_status", "published");
    formData.set("partnership", "partner");
    formData.set("feature_status", "featured");
    formData.set("parent_collection_accepted", "accepted");

    const parsed = parseSchoolForm(formData);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.data.publication_status).toBe("published");
      expect(parsed.data.published).toBe(true);
      expect(parsed.data.partnership).toBe("partner");
      expect(parsed.data.is_partner).toBe(true);
      expect(parsed.data.refused_partnership).toBe(false);
      expect(parsed.data.feature_status).toBe("featured");
      expect(parsed.data.is_featured).toBe(true);
      expect(parsed.data.parent_collection_accepted).toBe(true);
    }
  });

  it("handles ready_for_review, refused_partner and unaccepted collections deterministically", () => {
    const formData = new FormData();
    formData.set("name", "Refused School");
    formData.set("slug", "refused-school");
    formData.set("publication_status", "ready_for_review");
    formData.set("partnership", "refused_partner");
    formData.set("feature_status", "unfeatured");
    formData.set("parent_collection_accepted", "unaccepted");

    const parsed = parseSchoolForm(formData);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.data.publication_status).toBe("ready_for_review");
      expect(parsed.data.published).toBe(false);
      expect(parsed.data.partnership).toBe("refused_partner");
      expect(parsed.data.is_partner).toBe(false);
      expect(parsed.data.refused_partnership).toBe(true);
      expect(parsed.data.feature_status).toBe("unfeatured");
      expect(parsed.data.is_featured).toBe(false);
      expect(parsed.data.parent_collection_accepted).toBe(false);
    }
  });

  it("server-side revalidates checkout and rejects school_collection when parent_collection_accepted is false", async () => {
    await expect(
      handleTrayCheckout({
        buyerName: "Jane Doe",
        buyerEmail: "jane@example.com",
        buyerPhone: "0821234567",
        estimatedTotal: 500,
        deliveryMethod: "school_collection",
        primarySchoolSlug: "disallowed-school",
        packs: [
          {
            learnerName: "Child",
            schoolSlug: "disallowed-school",
            schoolName: "Disallowed School",
            grade: "Grade 1",
            gradeSlug: "grade-1",
            packName: "Grade 1 Pack",
            packMode: "full",
            items: [],
            totalPrice: 500,
            basePackPrice: 500,
            wantsPexcover: false,
            pexcoverPrice: 0,
          },
        ],
      })
    ).rejects.toThrowError(TrayCheckoutError);
  });

  it("determines Official Partner pill display strictly by partnership status", () => {
    // Partner -> is_partner: true (Pill rendered)
    const partnerData = new FormData();
    partnerData.set("name", "Partner School");
    partnerData.set("partnership", "partner");
    const partnerParsed = parseSchoolForm(partnerData);
    expect(partnerParsed.ok && partnerParsed.data.is_partner).toBe(true);

    // Non-partner -> is_partner: false (Pill removed)
    const nonPartnerData = new FormData();
    nonPartnerData.set("name", "Non Partner School");
    nonPartnerData.set("partnership", "non_partner");
    const nonPartnerParsed = parseSchoolForm(nonPartnerData);
    expect(nonPartnerParsed.ok && nonPartnerParsed.data.is_partner).toBe(false);

    // Refused Partnership -> is_partner: false, refused_partnership: true (Pill removed)
    const refusedData = new FormData();
    refusedData.set("name", "Refused School");
    refusedData.set("partnership", "refused_partner");
    const refusedParsed = parseSchoolForm(refusedData);
    expect(refusedParsed.ok && refusedParsed.data.is_partner).toBe(false);
    expect(refusedParsed.ok && refusedParsed.data.refused_partnership).toBe(true);
  });
});
