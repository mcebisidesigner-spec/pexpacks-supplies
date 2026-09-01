import { describe, it, expect } from "vitest";
import {
  supplierSlug,
  supplierNameFromSlug,
  supplierCodeFromSlug,
  supplierEmailFromSlug,
} from "@/lib/admin/supplier-slug";

describe("supplierSlug", () => {
  it("lowercases and hyphenates a supplier name", () => {
    expect(supplierSlug("Makro")).toBe("makro");
    expect(supplierSlug("BSC Stationers")).toBe("bsc-stationers");
  });

  it("strips leading/trailing non-alphanumerics and collapses separators", () => {
    expect(supplierSlug("  Friesland   & Hobs  ")).toBe("friesland-hobs");
  });
});

describe("supplierNameFromSlug", () => {
  it("reconstructs a title-cased display name", () => {
    expect(supplierNameFromSlug("makro")).toBe("Makro");
    expect(supplierNameFromSlug("bsc-stationers")).toBe("Bsc Stationers");
  });

  it("round-trips back through supplierSlug", () => {
    expect(supplierSlug(supplierNameFromSlug("friesland-hobs"))).toBe(
      "friesland-hobs",
    );
  });
});

describe("supplierCodeFromSlug", () => {
  it("builds an uppercase SUP code", () => {
    expect(supplierCodeFromSlug("makro")).toBe("SUP-MAKRO");
    expect(supplierCodeFromSlug("bsc-stationers")).toBe("SUP-BSCSTATI");
  });
});

describe("supplierEmailFromSlug", () => {
  it("builds a procurement email", () => {
    expect(supplierEmailFromSlug("makro")).toBe("orders@makro.co.za");
    expect(supplierEmailFromSlug("bsc-stationers")).toBe(
      "orders@bscstationers.co.za",
    );
  });
});
