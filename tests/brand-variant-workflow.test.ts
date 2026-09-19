import { describe, it, expect } from "vitest";
import { getProductSlug } from "@/lib/admin/items";

describe("Brand Variant Workflow & Product Isolation Engine", () => {
  it("generates distinct, SEO-friendly slugs when products share the same name across different brands", () => {
    const bicProduct = {
      name: "Ballpoint Pen Black Medium",
      brand: "Bic",
      sku: "PEX-BPBM-BIC-448",
    };
    const staedtlerProduct = {
      name: "Ballpoint Pen Black Medium",
      brand: "Staedtler",
      sku: "PEX-BPBM-STAEDTL-449",
    };

    const bicSlug = getProductSlug(bicProduct);
    const staedtlerSlug = getProductSlug(staedtlerProduct);

    expect(bicSlug).toBe("ballpoint-pen-black-medium-bic");
    expect(staedtlerSlug).toBe("ballpoint-pen-black-medium-staedtler");
    expect(bicSlug).not.toBe(staedtlerSlug);
  });

  it("does not append brand to slug if product name already contains the brand", () => {
    const product = {
      name: "Bic Cristal Medium Ballpoint Pen Black",
      brand: "Bic",
      sku: "PEX-BCMBP-BIC-448",
    };
    const slug = getProductSlug(product);
    expect(slug).toBe("bic-cristal-medium-ballpoint-pen-black");
    expect(slug).not.toContain("black-bic");
  });

  it("handles placeholder brands cleanly without polluting slugs", () => {
    const product = {
      name: "A4 Clear Plastic Folder",
      brand: "Add-Brand-Name",
      sku: "PEX-ACPF-101",
    };
    const slug = getProductSlug(product);
    expect(slug).toBe("a4-clear-plastic-folder");
  });

  it("verifies ItemForm contains brand variant detection and save mode selector", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const code = fs.readFileSync(
      path.join(process.cwd(), "components/admin/items/ItemForm.tsx"),
      "utf8",
    );

    expect(code).toContain("isBrandChanged");
    expect(code).toContain("saveMode");
    expect(code).toContain("Brand Changed");
    expect(code).toContain("save_mode");
    expect(code).toContain("new_variant");
    expect(code).toContain("update_existing");
    expect(code).toContain("SubmitButton");
  });

  it("verifies lib/admin/items.ts updateItem contains new variant creation logic", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const code = fs.readFileSync(
      path.join(process.cwd(), "lib/admin/items.ts"),
      "utf8",
    );

    expect(code).toContain("shouldCreateNewVariant");
    expect(code).toContain("Original ${targetMaster.brand} product was preserved");
    expect(code).toContain("save_mode");
  });

  it("verifies ensureMasterProduct matches by both name AND brand before updating", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const code = fs.readFileSync(
      path.join(process.cwd(), "lib/admin/items.ts"),
      "utf8",
    );

    expect(code).toContain("isNewBrandReal && isPBrandReal");
    expect(code).toContain("pBrand.toLowerCase() === newBrandTrimmed.toLowerCase()");
  });
});
