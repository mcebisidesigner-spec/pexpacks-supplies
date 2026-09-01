import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getAdminUser,
  hasPermission,
  writeAuditLog,
  type AdminSession,
} from "@/lib/admin/rbac";
import { supplierCodeFromSlug, supplierSlug } from "@/lib/admin/supplier-slug";

/**
 * Suppliers module. The /admin/suppliers/[supplierName] routes are slug-based
 * (derived from the supplier name) — reads match suppliers by their slugified
 * name, and writes upsert the matching row (falling back to creating one).
 */

export type SupplierFormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  /** Set when the saved name changes the URL slug, so the client can refresh the address bar. */
  newSlug?: string;
};

export type SupplierRow = {
  id: string;
  code: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  telephone: string | null;
  lead_time_days: number | null;
  payment_terms: string | null;
  active: boolean;
};

const SUPPLIER_STATUSES = ["Preferred", "Approved", "Prospect"] as const;
export type SupplierStatus = (typeof SUPPLIER_STATUSES)[number];

export const supplierInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Supplier name is required")
    .max(160, "Name is too long"),
  code: z.string().trim().max(40, "Code is too long"),
  contact_name: z.string().trim().max(120, "Contact name is too long"),
  status: z.enum(SUPPLIER_STATUSES),
  email: z
    .string()
    .trim()
    .max(200, "Email is too long")
    .refine(
      (v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      "Enter a valid email address",
    ),
  telephone: z.string().trim().max(40, "Telephone is too long"),
  payment_terms: z.string().trim().max(80, "Payment terms are too long"),
  lead_time: z
    .string()
    .trim()
    .max(6, "Lead time is too long")
    .refine(
      (v) => v === "" || /^\d+$/.test(v),
      "Lead time must be a whole number of days",
    ),
});

export type SupplierInput = z.infer<typeof supplierInputSchema>;

/**
 * Maps raw form input onto the suppliers table columns (kept pure + testable).
 * An empty code falls back to a slug-derived ref, and empty optional fields
 * normalise to NULL before hitting the database.
 */
export function buildSupplierPayload(input: SupplierInput): {
  code: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  telephone: string | null;
  payment_terms: string | null;
  lead_time_days: number | null;
  active: boolean;
  /** URL slug for the saved name — differs from the route when the supplier is renamed. */
  newSlug: string;
} {
  const newSlug = supplierSlug(input.name);
  return {
    code: input.code || supplierCodeFromSlug(newSlug),
    name: input.name,
    contact_name: input.contact_name || null,
    email: input.email || null,
    telephone: input.telephone || null,
    payment_terms: input.payment_terms || null,
    lead_time_days:
      input.lead_time === "" ? null : parseInt(input.lead_time, 10),
    active: input.status !== "Prospect",
    newSlug,
  };
}

export async function getSupplierBySlug(
  slug: string,
): Promise<SupplierRow | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("suppliers")
    .select(
      "id,code,name,contact_name,email,telephone,lead_time_days,payment_terms,active",
    )
    .order("name");
  if (error) {
    console.error("[suppliers] get by slug failed:", error);
    return null;
  }
  for (const row of data ?? []) {
    if (supplierSlug(row.name) === slug) {
      return row as SupplierRow;
    }
  }
  return null;
}

async function assertCanManage(): Promise<AdminSession> {
  const session = await getAdminUser();
  if (!session || !hasPermission(session, "suppliers.manage")) {
    const err = new Error("You don't have permission to do that.");
    (err as Error & { status?: number }).status = 403;
    throw err;
  }
  return session;
}

/**
 * Saves the edited supplier details. Resolves the row by slug first, then by
 * the submitted code, then creates one — so a cold database still persists.
 */
export async function updateSupplierBySlug(
  input: SupplierInput,
  slug: string,
): Promise<SupplierFormState> {
  const actor = await assertCanManage();
  const admin = createSupabaseAdminClient();
  const payload = buildSupplierPayload(input);
  const { newSlug, ...columns } = payload;

  let existing: (Pick<SupplierRow, "id" | "code"> & { name?: string }) | null =
    null;
  const { data: bySlug, error: slugError } = await admin
    .from("suppliers")
    .select("id,code,name")
    .limit(500);
  if (slugError) {
    console.error("[suppliers] lookup failed:", slugError);
    return { ok: false, message: "Failed to look up the supplier." };
  }
  for (const row of bySlug ?? []) {
    const candidate = row as { id: string; code: string; name: string };
    if (!existing && slug && supplierSlug(candidate.name) === slug) {
      existing = candidate;
    }
    if (candidate.code === columns.code) {
      existing = candidate;
    }
  }

  try {
    if (existing) {
      const { error } = await admin
        .from("suppliers")
        .update({ ...columns, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await admin
        .from("suppliers")
        .insert({ ...columns, created_at: new Date().toISOString() });
      if (error) throw error;
    }
  } catch (err) {
    console.error("[suppliers] save failed:", err);
    return { ok: false, message: "Failed to save the supplier details." };
  }

  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: existing ? "suppliers.update" : "suppliers.create",
    entityType: "supplier",
    entityId: existing?.id ?? null,
    summary: `${existing ? "Updated" : "Created"} supplier ${columns.name}`,
  });

  return {
    ok: true,
    message: "Supplier details saved.",
    newSlug: newSlug !== slug ? newSlug : undefined,
  };
}
