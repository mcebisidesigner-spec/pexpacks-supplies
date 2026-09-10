import { describe, it, expect } from "vitest";
import {
  calculateSellingPrice,
  generateVariantSku,
  PRESEEDED_SA_BRANDS,
  ProductEditForm,
} from "@/components/admin/products/ProductEditForm";

describe("ProductEditForm & Brand Variant Workflow Engine", () => {
  it("verifies margin calculation matches retail formula (16.00 cost yields R 22.08)", () => {
    // 38% target margin
    const sellingPrice = calculateSellingPrice(16.0, 38);
    expect(sellingPrice).toBe(22.08);

    // Dynamic checks
    expect(calculateSellingPrice(10.0, 38)).toBe(13.8);
    expect(calculateSellingPrice(100.0, 38)).toBe(138.0);
    expect(calculateSellingPrice(0, 38)).toBe(0);
    expect(calculateSellingPrice(-5, 38)).toBe(0);
  });

  it("verifies auto-generated SKU structure following Pexpacks nomenclature", () => {
    const sku1 = generateVariantSku("College Exercise Unruled", "Freedom", 0);
    expect(sku1).toBe("PEX-STN-CEU-FREEDOM-01");

    const sku2 = generateVariantSku("Hardcover 2 Quire Notebook", "Croxley", 1);
    expect(sku2).toBe("PEX-STN-H2Q-CROXLEY-02");

    const sku3 = generateVariantSku("Eraser", "Staedtler", 2);
    expect(sku3).toBe("PEX-STN-ERA-STAEDTL-03");
  });

  it("verifies pre-seeded South African stationery brands list", () => {
    const expectedBrands = [
      "Freedom",
      "Croxley",
      "Typek",
      "Bic",
      "Bantex",
      "Mondi",
      "Sigma",
      "Aspire",
      "Lion",
      "Oxford",
      "Sasco",
      "Staedtler",
      "Faber-Castell",
      "Pilot",
      "Pritt",
    ];

    const brandNames = PRESEEDED_SA_BRANDS.map((b) => b.name);
    for (const expected of expectedBrands) {
      expect(brandNames).toContain(expected);
    }
  });

  it("verifies ProductEditForm component exports and functional signatures", () => {
    expect(ProductEditForm).toBeDefined();
    expect(typeof ProductEditForm).toBe("function");
  });

  it("verifies brands API route handles GET and default fallback brands", async () => {
    const { GET } = await import("@/app/api/brands/route");
    const req = new Request("http://localhost:3000/api/brands", {
      method: "GET",
    });

    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.brands).toBeDefined();
    expect(Array.isArray(data.brands)).toBe(true);
    expect(data.brands.length).toBeGreaterThanOrEqual(15);
  });

  it("verifies parseItemForm correctly parses and includes brand field", async () => {
    const { parseItemForm } = await import("@/lib/admin/items");
    const formData = new FormData();
    formData.append("name", "College Exercise Unruled");
    formData.append("category", "Stationery");
    formData.append("brand", "Freedom");
    formData.append("price", "16.00");

    const parsed = parseItemForm(formData);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.data.brand).toBe("Freedom");
      expect(parsed.data.name).toBe("College Exercise Unruled");
    }
  });

  it("verifies ItemForm contains Brand name field and modal trigger in masterMode", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");

    const itemFormCode = fs.readFileSync(
      path.join(process.cwd(), "components/admin/items/ItemForm.tsx"),
      "utf8",
    );

    // Verify Brand name label and searchable selector
    expect(itemFormCode).toContain("Brand name");
    expect(itemFormCode).toContain('name="brand"');
    expect(itemFormCode).toContain("__ADD_NEW_BRAND__");
    expect(itemFormCode).toContain("+ Add New Brand...");
    expect(itemFormCode).toContain("showBrandModal");
    expect(itemFormCode).toContain("handleCreateBrand");
    expect(itemFormCode).toContain("searchable={true}");

    // Verify EditProductClient renders ItemForm with masterMode
    const editClientCode = fs.readFileSync(
      path.join(process.cwd(), "components/admin/items/EditProductClient.tsx"),
      "utf8",
    );
    expect(editClientCode).toContain("<ItemForm");
    expect(editClientCode).toContain("masterMode");

    // Verify icon picker is rendered unconditionally (not hidden behind !masterMode)
    expect(itemFormCode).toContain("Item Icon Symbol");
    expect(itemFormCode).not.toContain("{!masterMode && (\n              <div className={adminStyles.formField}>\n                <div>\n                  <span className={adminStyles.formLabel}>Item Icon Symbol");
  });

  it("verifies stationery icons include all existing and new stationery icons", async () => {
    const { PACK_ITEM_ICONS } = await import("@/lib/packs/itemIcons");
    const iconKeys = PACK_ITEM_ICONS.map((i) => i.key);

    const requiredStationeryIcons = [
      "tape",
      "book-copy",
      "book-text",
      "bookmark-check",
      "file-stack",
      "folder-open",
      "folder-archive",
      "files",
      "wallet",
      "glasses",
      "case-sensitive",
      "case-upper",
      "square-pen",
      "notebook",
      "pad",
      "pencil",
      "pen",
      "ruler",
      "calculator",
      "scissors",
      "glue",
      "paperclip",
      "pin",
      "backpack",
    ];

    for (const icon of requiredStationeryIcons) {
      expect(iconKeys).toContain(icon);
    }
  });

  it("verifies SKU code is created with the combination of Product Name and Brand name", async () => {
    const { generateSkuFromName, getBrandCode } = await import(
      "@/lib/sku-generator"
    );

    expect(getBrandCode("Freedom")).toBe("FREEDOM");
    expect(getBrandCode("Croxley")).toBe("CROXLEY");
    expect(getBrandCode("Staedtler")).toBe("STAEDTL");

    // Product Name + Brand combination
    const skuWithBrand = generateSkuFromName(
      "College Exercise Unruled",
      "Stationery",
      "Freedom",
    );
    expect(skuWithBrand).toContain("PEX-STN-CEU-FREEDOM");

    const skuWithCroxley = generateSkuFromName(
      "Hardcover 2 Quire Notebook",
      "Stationery",
      "Croxley",
      "02",
    );
    expect(skuWithCroxley).toBe("PEX-STN-H2QN-CROXLEY-02");

    // Check ItemForm implementation
    const fs = await import("node:fs");
    const path = await import("node:path");
    const itemFormCode = fs.readFileSync(
      path.join(process.cwd(), "components/admin/items/ItemForm.tsx"),
      "utf8",
    );

    // Verifies that brand is passed to generateSkuFromName in handlers
    expect(itemFormCode).toContain(
      "generateSkuFromName(val, category, brand)",
    );
    expect(itemFormCode).toContain(
      "generateSkuFromName(productName, category, val)",
    );
    expect(itemFormCode).toContain("productName.trim() || \"Item\"");
    expect(itemFormCode).toContain("brand");
  });
});

