"use server";

import { revalidatePath } from "next/cache";
import { pdf } from "@react-pdf/renderer";
import React from "react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  createQuotation,
  updateQuotationStatus,
  convertQuotationToOrder,
  getQuotation,
  updateQuotationPdfPath,
  type QuotationInput,
  type QuotationStatus,
} from "@/lib/admin/quotations";
import { getQuotationSettings } from "@/lib/admin/quotation-settings";
import { QuotationPdfDocument } from "@/components/pdf/QuotationPdfDocument";
import { getPack } from "@/lib/admin/packs";

/**
 * Generate PDF buffer and upload to Supabase Storage
 */
async function generateAndUploadPdf(quotationId: string): Promise<string | null> {
  try {
    const quotation = await getQuotation(quotationId);
    if (!quotation) return null;

    const settings = await getQuotationSettings();
    const formattedAddress = `${settings.address.address_line1}, ${
      settings.address.address_line2 ? settings.address.address_line2 + ", " : ""
    }${settings.address.suburb}, ${settings.address.city}, ${settings.address.postal_code}, ${settings.address.country}`;

    let preparedBy: string | null = null;
    if (quotation.notes) {
      const match = quotation.notes.match(/Prepared by:\s*([^\n\r]+)/i);
      if (match) {
        preparedBy = match[1].trim();
      }
    }

    const pdfData = {
      quote_number: quotation.quote_number,
      created_at: new Date(quotation.created_at).toLocaleDateString("en-ZA"),
      valid_until: new Date(quotation.valid_until).toLocaleDateString("en-ZA"),
      status: quotation.status,
      prepared_by: preparedBy,
      recipient_name: quotation.recipient_name,
      recipient_email: quotation.recipient_email,
      recipient_phone: quotation.recipient_phone,
      school_name: quotation.school?.name,
      school_address: quotation.school
        ? `${quotation.school.city || "Johannesburg"}, ${quotation.school.province || "Gauteng"}`
        : null,
      subtotal: quotation.subtotal,
      vat_rate: quotation.vat_rate,
      vat_amount: quotation.vat_amount,
      total_amount: quotation.total_amount,
      notes: quotation.notes,
      items: (quotation.items || []).map((item) => ({
        item_title: item.item_title,
        sku: item.sku,
        unit: item.unit,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      })),
      company: {
        registered_name: settings.business.registered_name,
        trading_name: settings.business.trading_name,
        reg_number: settings.business.reg_number,
        vat_number: settings.business.vat_number,
        address_text: formattedAddress,
        phone: settings.contacts.main_phone,
        email: `${settings.contacts.quotation_email} | ${settings.contacts.general_email}`,
        website: settings.business.website,
        bank_name: settings.banking.bank_name,
        account_holder: settings.banking.account_holder,
        account_type: settings.banking.account_type,
        account_number: settings.banking.account_number,
        branch_code: settings.banking.branch_code,
        default_terms: settings.notesTerms.terms_and_conditions,
      },
    };

    // Render PDF buffer
    const element = React.createElement(QuotationPdfDocument, { data: pdfData }) as NonNullable<Parameters<typeof pdf>[0]>;
    const documentBuffer = await pdf(element).toBuffer();

    const admin = createSupabaseAdminClient();
    const filePath = `quotes/${quotation.quote_number}_${Date.now()}.pdf`;

    const { error: uploadError } = await admin.storage
      .from("quotations")
      .upload(filePath, documentBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("[quotations] storage upload failed:", uploadError);
      return null;
    }

    const { data: publicUrlData } = admin.storage
      .from("quotations")
      .getPublicUrl(filePath);

    const storagePath = publicUrlData?.publicUrl || filePath;

    // Update quote record with PDF path, status, and bumped version
    await updateQuotationPdfPath(quotationId, storagePath);

    return storagePath;
  } catch (err) {
    console.error("[quotations] PDF generation error:", err);
    return null;
  }
}

/**
 * Create quotation server action
 */
export async function createQuotationAction(
  input: QuotationInput,
  status: QuotationStatus = "draft"
): Promise<{ ok: boolean; id?: string; quoteNumber?: string; error?: string }> {
  const result = await createQuotation(input, status);
  if (!result.ok || !result.quotation) {
    return { ok: false, error: result.error || "Failed to create quotation" };
  }

  const quoteId = result.quotation.id;
  const quoteNumber = result.quotation.quote_number;

  // Background render PDF
  void generateAndUploadPdf(quoteId);

  revalidatePath("/admin/quotations");
  revalidatePath("/admin/quotations", "layout");

  return { ok: true, id: quoteId, quoteNumber };
}

/**
 * Delete quotation server action
 */
export async function deleteQuotationAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const { deleteQuotation } = await import("@/lib/admin/quotations");
  const result = await deleteQuotation(id);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/admin/quotations");
  return { ok: true };
}

/**
 * Update quotation status server action
 */
export async function updateQuotationStatusAction(
  id: string,
  status: QuotationStatus
): Promise<{ ok: boolean; error?: string }> {
  const result = await updateQuotationStatus(id, status);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/admin/quotations");
  revalidatePath(`/admin/quotations/${id}`);
  return { ok: true };
}

/**
 * Convert quotation to order server action
 */
export async function convertQuotationToOrderAction(
  quotationId: string
): Promise<{ ok: boolean; orderId?: string; orderReference?: string; error?: string }> {
  const result = await convertQuotationToOrder(quotationId);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/admin/quotations");
  revalidatePath(`/admin/quotations/${quotationId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin/procurement");

  return {
    ok: true,
    orderId: result.orderId,
    orderReference: result.orderReference,
  };
}

/**
 * Regenerate / get PDF URL
 */
export async function regenerateQuotationPdfAction(
  quotationId: string
): Promise<{ ok: boolean; pdfUrl?: string; error?: string }> {
  const pdfUrl = await generateAndUploadPdf(quotationId);
  if (!pdfUrl) {
    return { ok: false, error: "Failed to generate PDF letterhead." };
  }
  revalidatePath(`/admin/quotations/${quotationId}`);
  return { ok: true, pdfUrl };
}

/**
 * Import line items from an existing school grade pack
 */
export async function importSchoolPackItemsAction(
  packId: string
): Promise<{
  ok: boolean;
  packTitle?: string;
  items?: Array<{
    master_product_id: string | null;
    item_title: string;
    sku: string | null;
    unit: string;
    quantity: number;
    unit_price: number;
  }>;
  error?: string;
}> {
  try {
    const { pack, items } = await getPack(packId);
    if (!pack || !items) {
      return { ok: false, error: "School pack not found." };
    }

    const converted = items.map((item) => ({
      master_product_id: item.product_id || null,
      item_title: item.name,
      sku: item.sku || null,
      unit: "Each",
      quantity: Number(item.quantity || 1),
      unit_price: Number(item.unit_price || 0),
    }));

    return {
      ok: true,
      packTitle: pack.title,
      items: converted,
    };
  } catch (err: unknown) {
    console.error("[quotations] importSchoolPackItemsAction failed:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to load pack items.",
    };
  }
}

/**
 * Fetch list of packs for a specific school
 */
export async function listSchoolPacksForQuotation(
  schoolId: string
): Promise<Array<{ id: string; title: string; price: number }>> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("school_packs")
    .select("id, title, price")
    .eq("school_id", schoolId)
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  if (error || !data) return [];
  return data.map((p) => ({ id: p.id, title: p.title, price: Number(p.price || 0) }));
}
