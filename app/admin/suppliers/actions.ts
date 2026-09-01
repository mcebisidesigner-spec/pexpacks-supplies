"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/rbac";
import {
  supplierInputSchema,
  updateSupplierBySlug,
  type SupplierFormState,
} from "@/lib/admin/suppliers";

function raw(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

function zodErrors(issues: z.ZodIssue[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0]);
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export async function updateSupplierAction(
  slug: string,
  _prev: SupplierFormState,
  formData: FormData,
): Promise<SupplierFormState> {
  await requireAdmin({ permission: "suppliers.manage" });

  const parsed = supplierInputSchema.safeParse({
    name: raw(formData, "name"),
    code: raw(formData, "code"),
    contact_name: raw(formData, "contact_name"),
    status: raw(formData, "status"),
    email: raw(formData, "email"),
    telephone: raw(formData, "phone"),
    payment_terms: raw(formData, "payment_terms"),
    lead_time: raw(formData, "lead_time"),
  });
  if (!parsed.success) {
    return { ok: false, errors: zodErrors(parsed.error.issues) };
  }

  const result = await updateSupplierBySlug(parsed.data, slug);
  if (result.ok) {
    revalidatePath("/admin/suppliers");
    revalidatePath(`/admin/suppliers/${slug}`);
    revalidatePath(`/admin/suppliers/${slug}/edit`);
    if (result.newSlug) {
      revalidatePath(`/admin/suppliers/${result.newSlug}`);
      revalidatePath(`/admin/suppliers/${result.newSlug}/edit`);
    }
  }
  return result;
}
