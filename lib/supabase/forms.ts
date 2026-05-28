import { randomUUID } from "node:crypto";
import { createSupabaseAdminClient } from "./admin";
import type { FormSubmission } from "@/lib/forms/types";
import type { Json } from "./types";

export async function saveFormSubmission(
  data: FormSubmission
): Promise<{ success: boolean; error?: string; submission_id?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("[supabase] Missing env vars — skipping form submission insert");
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const supabase = createSupabaseAdminClient();

    const submissionId = randomUUID();

    const { error } = await supabase
      .from("form_submissions")
      .insert({
        id: submissionId,
        form_type: data.formType,
        status: "new",
        data: data as unknown as Json,
        source_url: data.sourceUrl || data.pageUrl || null,
        user_agent: data.userAgent || null,
      });

    if (error) {
      console.error("[supabase] Failed to insert form submission:", error);
      return { success: false, error: error.message };
    }

    return { success: true, submission_id: submissionId };
  } catch (err) {
    console.error("[supabase] Unexpected error inserting form submission:", err);
    return { success: false, error: "Unexpected error" };
  }
}

function splitItems(items?: string): string[] | null {
  if (!items) return null;
  return items.split(/;\s*/).filter(Boolean);
}

const ORDER_FORM_TYPES = new Set([
  "school-pack-enquiry",
  "full-pack-enquiry",
  "custom-pack-enquiry",
  "track-order-interest",
]);

export async function saveOrderRecord(
  data: FormSubmission,
  submissionId: string
): Promise<void> {
  if (!ORDER_FORM_TYPES.has(data.formType)) return;

  try {
    const supabase = createSupabaseAdminClient();

    const deliveryAddress: Record<string, string> = {};
    if (data.address) deliveryAddress.address = data.address;
    if (data.suburb) deliveryAddress.suburb = data.suburb;
    if (data.city) deliveryAddress.city = data.city;
    if (data.province) deliveryAddress.province = data.province;

    const { error } = await supabase.from("orders").insert({
      submission_id: submissionId,
      order_reference:
        data.orderReference ||
        `ORD-${submissionId.slice(0, 8).toUpperCase()}`,
      school_name: data.schoolName || "",
      grade: data.grade || "",
      pack_type: data.packType || data.packName || "full",
      items: splitItems(data.selectedItems),
      removed_items: splitItems(data.removedItems),
      estimated_total:
        typeof data.estimatedTotal === "number" ? data.estimatedTotal : null,
      pexcover_requested:
        data.message?.toLowerCase().includes("pexcover") || false,
      fulfilment_option: data.deliveryMethod || null,
      delivery_address:
        Object.keys(deliveryAddress).length > 0
          ? (deliveryAddress as unknown as Json)
          : null,
      buyer_name: data.fullName,
      buyer_phone: data.phone || "",
      buyer_email: data.email || null,
      learner_name: data.learnerName || null,
      consent: data.consent,
      status: "pending",
    });

    if (error) {
      console.error("[supabase] Failed to insert order record:", error);
    }
  } catch (err) {
    console.error("[supabase] Unexpected error inserting order record:", err);
  }
}

const BRAND_PACKAGE_FORM_TYPES = new Set(["brand-package-enquiry"]);

export async function saveBrandPackageRecord(
  data: FormSubmission,
  submissionId: string
): Promise<void> {
  if (!BRAND_PACKAGE_FORM_TYPES.has(data.formType)) return;

  try {
    const supabase = createSupabaseAdminClient();

    const { error } = await supabase.from("brand_package_claims").insert({
      submission_id: submissionId,
      business_name: data.businessName || data.schoolOrBusinessName || "",
      applicant_name: data.fullName || data.contactPerson || "",
      phone: data.phone || "",
      email: data.email || "",
      website: data.website || null,
      business_description: data.businessDescription || "",
      branding_preferences: data.brandingPreferences || "",
      existing_branding: data.existingBranding || null,
      target_audience: data.targetAudience || null,
      deadline: data.deadline || null,
      notes: data.notes || null,
      consent: data.consent,
      status: "new",
    });

    if (error) {
      console.error(
        "[supabase] Failed to insert brand package record:",
        error
      );
    }
  } catch (err) {
    console.error(
      "[supabase] Unexpected error inserting brand package record:",
      err
    );
  }
}

const LAY_BY_FORM_TYPES = new Set(["contact"]);

export async function saveLayByRecord(
  data: FormSubmission,
  submissionId: string
): Promise<void> {
  if (!LAY_BY_FORM_TYPES.has(data.formType)) return;
  if (data.enquiryType !== "Lay-by application") return;

  try {
    const supabase = createSupabaseAdminClient();

    const { error } = await supabase.from("lay_by_applications").insert({
      submission_id: submissionId,
      applicant_name: data.fullName || data.parentName || "",
      id_number: data.notes?.match(/ID[:\s]*([A-Z0-9]+)/i)?.[1] || "",
      phone: data.phone || "",
      email: data.email || null,
      residential_address: data.address || "",
      learner_name: data.learnerName || "",
      school_name: data.schoolName || "",
      grade: data.grade || "",
      pack_name: data.packName || data.packType || "",
      pexcover_requested: data.message?.includes("pexcover") || false,
      estimated_total:
        typeof data.estimatedTotal === "number" ? data.estimatedTotal : null,
      notes: data.notes || null,
      signature_name: data.fullName || "",
      signature_date: new Date().toISOString().slice(0, 10),
      status: "pending",
    });

    if (error) {
      console.error("[supabase] Failed to insert lay-by record:", error);
    }
  } catch (err) {
    console.error(
      "[supabase] Unexpected error inserting lay-by record:",
      err
    );
  }
}
