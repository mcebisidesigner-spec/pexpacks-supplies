import { describe, it, expect } from "vitest";
import {
  environmentSchema,
  productMutationSchema,
  schoolMutationSchema,
  supplierMutationSchema,
  checkoutSubmissionSchema,
  aiExtractedItemSchema,
} from "@/lib/schemas";

describe("Pexpacks Runtime Validation Contracts (Phase K4)", () => {
  describe("Product Mutation Schema", () => {
    it("validates a legitimate product mutation payload", () => {
      const valid = {
        name: "Staedtler HB Pencils (Pack of 12)",
        sku: "STA-HB-12",
        brand: "Staedtler",
        category: "Stationery",
        unit_cost_cents: 2500,
        selling_price_cents: 4500,
        requires_pexcover: false,
        is_active: true,
      };

      const result = productMutationSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Staedtler HB Pencils (Pack of 12)");
        expect(result.data.selling_price_cents).toBe(4500);
      }
    });

    it("rejects an invalid product with missing name or negative price", () => {
      const invalid = {
        name: "A", // too short
        selling_price_cents: -500, // negative price prohibited
      };

      const result = productMutationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("School Mutation Schema", () => {
    it("validates compliant school data and validates slug regex", () => {
      const valid = {
        name: "Bryandale Primary School",
        slug: "bryandale-primary",
        city: "Sandton",
        province: "Gauteng",
        status: "active",
      };

      const result = schoolMutationSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects invalid slugs containing uppercase or spaces", () => {
      const invalid = {
        name: "Bryandale Primary School",
        slug: "Bryandale Primary!",
      };

      const result = schoolMutationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("Supplier Mutation Schema", () => {
    it("validates supplier data", () => {
      const valid = {
        name: "Croxley South Africa",
        slug: "croxley-sa",
        contact_email: "orders@croxley.co.za",
        is_active: true,
      };

      const result = supplierMutationSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects malformed email format", () => {
      const invalid = {
        name: "Croxley South Africa",
        slug: "croxley-sa",
        contact_email: "not-an-email",
      };

      const result = supplierMutationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("Checkout Submission Schema", () => {
    it("validates complete checkout submission with SA phone number", () => {
      const valid = {
        buyerName: "Thabo Mbeki",
        buyerEmail: "thabo@example.com",
        buyerPhone: "+27821234567",
        preferredContactMethod: "whatsapp",
        fulfilmentMethod: "school_collection",
        items: [
          {
            packId: "pack-grade-7",
            learnerName: "Sipho Mbeki",
            pexcoverSelected: true,
            pexcoverStyle: "style-geo",
          },
        ],
      };

      const result = checkoutSubmissionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects checkout with empty items array", () => {
      const invalid = {
        buyerName: "Thabo Mbeki",
        buyerEmail: "thabo@example.com",
        buyerPhone: "0821234567",
        fulfilmentMethod: "school_collection",
        items: [],
      };

      const result = checkoutSubmissionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("AI OCR Item Extraction Schema", () => {
    it("validates and coerces extracted OCR line items", () => {
      const valid = {
        raw_text: "4x Pritt Glue Stick 43g",
        item_name: "Pritt Glue Stick 43g",
        quantity: "4", // coerced to number
        specifications: "43g Jumbo",
      };

      const result = aiExtractedItemSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.quantity).toBe(4);
      }
    });
  });
});
