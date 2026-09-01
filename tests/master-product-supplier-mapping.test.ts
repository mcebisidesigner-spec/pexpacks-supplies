import { describe, it, expect } from "vitest";
import { parseItemForm } from "@/lib/admin/items";

describe("Master Product Supplier Cost Mapping", () => {
  it("parses supplier_id correctly from FormData", () => {
    const formData = new FormData();
    formData.append("name", "Staedtler Tradition HB Pencil");
    formData.append("sku", "STAED-HB-001");
    formData.append("category", "Stationery");
    formData.append("price", "4.50");
    formData.append("supplier_id", "supp-1234-croxley");

    const result = parseItemForm(formData);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.supplier_id).toBe("supp-1234-croxley");
      expect(result.data.name).toBe("Staedtler Tradition HB Pencil");
      expect(result.data.price).toBe(4.5);
    }
  });

  it("handles null/empty supplier_id gracefully", () => {
    const formData = new FormData();
    formData.append("name", "A4 Exercise Book 72pg");
    formData.append("category", "Books");
    formData.append("supplier_id", "");

    const result = parseItemForm(formData);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.supplier_id).toBeNull();
    }
  });

  it("handles omitted supplier_id gracefully", () => {
    const formData = new FormData();
    formData.append("name", "Ruler 30cm Shatterproof");
    formData.append("category", "Stationery");

    const result = parseItemForm(formData);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.supplier_id).toBeNull();
    }
  });
});
