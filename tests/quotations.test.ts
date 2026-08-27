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

  it("handles discount, delivery fee, and VAT exemptions in quotation schema", () => {
    const inputWithDiscount = {
      recipient_name: "Finance Department",
      recipient_email: "finance@school.co.za",
      valid_until: "2027-01-01",
      discount_amount: 100.0,
      delivery_fee: 150.0,
      vat_enabled: false,
      items: [
        { item_title: "Bulk Paper Reams", quantity: 10, unit_price: 60.0 }, // 600
      ],
    };

    const parsed = quotationInputSchema.safeParse(inputWithDiscount);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.discount_amount).toBe(100.0);
      expect(parsed.data.delivery_fee).toBe(150.0);
      expect(parsed.data.vat_enabled).toBe(false);

      const rawSubtotal = parsed.data.items.reduce((s, it) => s + it.quantity * it.unit_price, 0);
      const subtotalAfterDisc = Math.max(0, rawSubtotal - (parsed.data.discount_amount || 0));
      expect(subtotalAfterDisc).toBe(500.0);
      const vat = parsed.data.vat_enabled ? subtotalAfterDisc * 0.15 : 0;
      expect(vat).toBe(0);
      const total = subtotalAfterDisc + vat + (parsed.data.delivery_fee || 0);
      expect(total).toBe(650.0);
    }
  });

  it("renders QuotationPdfDocument with Prepared by text into a valid PDF buffer", async () => {
    const React = await import("react");
    const { pdf } = await import("@react-pdf/renderer");
    const { QuotationPdfDocument } = await import("@/components/pdf/QuotationPdfDocument");

    const sampleData = {
      quote_number: "PX-Q-2026-0101",
      created_at: "26/08/2026",
      valid_until: "25/09/2026",
      status: "draft",
      prepared_by: "Mcebisi Hlongwane",
      recipient_name: "Bedfordview Primary School Bursar",
      recipient_email: "bursar@bedfordview.co.za",
      recipient_phone: "+27 11 902 4432",
      school_name: "Bedfordview Primary School",
      school_address: "Germiston, Gauteng",
      subtotal: 1000.0,
      vat_rate: 15.0,
      vat_amount: 150.0,
      total_amount: 1150.0,
      notes: "Standard settlement: 30 days from official invoice.",
      items: [
        {
          item_title: "A4 Clear Plastic Folders",
          sku: "PEX-GEN-ACPF-427",
          unit: "Pack",
          quantity: 10,
          unit_price: 28.0,
          total_price: 280.0,
        },
      ],
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = React.createElement(QuotationPdfDocument, { data: sampleData }) as any;
    const blob = await pdf(element).toBlob();
    const arrayBuffer = await blob.arrayBuffer();
    const documentBuffer = Buffer.from(arrayBuffer);

    expect(documentBuffer).toBeDefined();
    expect(documentBuffer.length).toBeGreaterThan(1000);
    const header = documentBuffer.slice(0, 5).toString("utf-8");
    expect(header.startsWith("%PDF")).toBe(true);
  }, 15000);
});
