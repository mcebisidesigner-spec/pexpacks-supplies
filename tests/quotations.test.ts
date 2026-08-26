import { describe, it, expect } from "vitest";
import {
  quotationInputSchema,
  quotationItemSchema,
} from "@/lib/admin/quotations";

describe("Quotation Generator Logic & Schema Validation", () => {
  it("validates line items correctly", () => {
    const validItem = {
      item_title: "A4 Exercise Books (72 Page)",
      sku: "ST-NB-A4",
      unit: "Pack of 10",
      quantity: 5,
      unit_price: 150.5,
    };

    const parsed = quotationItemSchema.safeParse(validItem);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.quantity).toBe(5);
      expect(parsed.data.unit_price).toBe(150.5);
    }

    const invalidItem = {
      item_title: "",
      quantity: 0,
      unit_price: -10,
    };

    const invalidParsed = quotationItemSchema.safeParse(invalidItem);
    expect(invalidParsed.success).toBe(false);
  });

  it("validates quotation input schema and calculates totals accurately", () => {
    const input = {
      recipient_name: "John Doe",
      recipient_email: "john@example.co.za",
      recipient_phone: "+27 82 123 4567",
      valid_until: "2027-04-30",
      notes: "Standard terms.",
      items: [
        {
          item_title: "A4 Exercise Books",
          sku: "ST-001",
          unit: "Each",
          quantity: 100,
          unit_price: 15.0, // Subtotal: 1500.00
        },
        {
          item_title: "HB Pencils Pack",
          sku: "ST-002",
          unit: "Box",
          quantity: 20,
          unit_price: 50.0, // Subtotal: 1000.00
        },
      ],
    };

    const parsed = quotationInputSchema.safeParse(input);
    expect(parsed.success).toBe(true);

    if (parsed.success) {
      const subtotal = parsed.data.items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0
      );
      expect(subtotal).toBe(2500.0);

      const vatRate = 15.0;
      const vatAmount = Number(((subtotal * vatRate) / 100).toFixed(2));
      expect(vatAmount).toBe(375.0);

      const grandTotal = Number((subtotal + vatAmount).toFixed(2));
      expect(grandTotal).toBe(2875.0);
    }
  });

  it("handles decimal precision and rounding in line items and VAT", () => {
    const items = [
      { quantity: 3, unit_price: 33.33 }, // 99.99
      { quantity: 7, unit_price: 14.28 }, // 99.96
    ];

    const subtotal = Number(
      items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0).toFixed(2)
    );
    expect(subtotal).toBe(199.95);

    const vatRate = 15.0;
    const vatAmount = Number(((subtotal * vatRate) / 100).toFixed(2));
    expect(vatAmount).toBe(29.99);

    const grandTotal = Number((subtotal + vatAmount).toFixed(2));
    expect(grandTotal).toBe(229.94);
  });
});
