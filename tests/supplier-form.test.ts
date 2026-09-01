import { describe, expect, it } from "vitest";
import {
  buildSupplierPayload,
  supplierInputSchema,
} from "@/lib/admin/suppliers";

const base = {
  name: "BSC Supplies",
  code: "",
  contact_name: "Sipho Nkosi",
  status: "Preferred",
  email: "orders@bscsupplies.co.za",
  telephone: "+27 11 555 0123",
  payment_terms: "30 Days Net",
  lead_time: "3",
};

describe("supplierInputSchema", () => {
  it("accepts a fully populated valid form", () => {
    const result = supplierInputSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it("rejects a missing supplier name", () => {
    const result = supplierInputSchema.safeParse({ ...base, name: "  " });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path[0]).toBe("name");
  });

  it("rejects an invalid email", () => {
    const result = supplierInputSchema.safeParse({
      ...base,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path[0]).toBe("email");
  });

  it("accepts an empty email", () => {
    const result = supplierInputSchema.safeParse({ ...base, email: "" });
    expect(result.success).toBe(true);
  });

  it("rejects a non-numeric lead time", () => {
    const result = supplierInputSchema.safeParse({ ...base, lead_time: "abc" });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].path[0]).toBe("lead_time");
  });

  it("accepts an empty lead time", () => {
    const result = supplierInputSchema.safeParse({ ...base, lead_time: "" });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown status", () => {
    const result = supplierInputSchema.safeParse({
      ...base,
      status: "On Hold",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path[0]).toBe("status");
  });
});

describe("buildSupplierPayload", () => {
  it("maps all form fields onto supplier columns", () => {
    const payload = buildSupplierPayload(supplierInputSchema.parse(base));
    expect(payload).toEqual({
      code: "SUP-BSCSUPPL",
      name: "BSC Supplies",
      contact_name: "Sipho Nkosi",
      email: "orders@bscsupplies.co.za",
      telephone: "+27 11 555 0123",
      payment_terms: "30 Days Net",
      lead_time_days: 3,
      active: true,
      newSlug: "bsc-supplies",
    });
  });

  it("derives the code from the name when left blank", () => {
    const payload = buildSupplierPayload(
      supplierInputSchema.parse({ ...base, name: "Makro" }),
    );
    expect(payload.code).toBe("SUP-MAKRO");
  });

  it("uses the submitted code when provided", () => {
    const payload = buildSupplierPayload(
      supplierInputSchema.parse({ ...base, code: "SUP-041" }),
    );
    expect(payload.code).toBe("SUP-041");
  });

  it("normalises blank optional values to null", () => {
    const payload = buildSupplierPayload(
      supplierInputSchema.parse({
        ...base,
        lead_time: "",
        contact_name: "",
        email: "",
        telephone: "",
        payment_terms: "",
      }),
    );
    expect(payload.lead_time_days).toBeNull();
    expect(payload.contact_name).toBeNull();
    expect(payload.email).toBeNull();
    expect(payload.telephone).toBeNull();
    expect(payload.payment_terms).toBeNull();
  });

  it("downcasts a Prospect to inactive and renames derive a new slug", () => {
    const payload = buildSupplierPayload(
      supplierInputSchema.parse({
        ...base,
        status: "Prospect",
        name: "Stationery Wholesale Group",
      }),
    );
    expect(payload.active).toBe(false);
    expect(payload.newSlug).toBe("stationery-wholesale-group");
  });
});
