"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { pdf } from "@react-pdf/renderer";
import React from "react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  createQuotation,
  updateQuotationStatus,
  convertQuotationToOrder,
  getQuotation,
  type QuotationInput,
  type QuotationStatus,
} from "@/lib/admin/quotations";
import { QuotationPdfDocument } from "@/components/pdf/QuotationPdfDocument";

/**
 * Generate PDF buffer and upload to Supabase Storage
 */
async function generateAndUploadPdf(quotationId: string): Promise<string | null> {
  try {
    const quotation = await getQuotation(quotationId);
    if (!quotation) return null;

    const pdfData = {
      quote_number: quotation.quote_number,
      created_at: new Date(quotation.created_at).toLocaleDateString("en-ZA"),
      valid_until: new Date(quotation.valid_until).toLocaleDateString("en-ZA"),
      status: quotation.status,
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
    };

    // Render PDF buffer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = React.createElement(QuotationPdfDocument, { data: pdfData }) as any;
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

    // Update quote record with PDF path
    await admin
      .from("quotations" as never)
      .update({ pdf_storage_path: storagePath } as never)
      .eq("id" as never, quotationId);

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
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const result = await createQuotation(input, status);
  if (!result.ok || !result.quotation) {
    return { ok: false, error: result.error || "Failed to create quotation" };
  }

  const quoteId = result.quotation.id;

  // Background render PDF
  void generateAndUploadPdf(quoteId);

  revalidatePath("/admin/quotations");
  revalidatePath("/admin/quotations", "layout");

  return { ok: true, id: quoteId };
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
): Promise<{ ok: boolean; orderId?: string; error?: string }> {
  const result = await convertQuotationToOrder(quotationId);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/admin/quotations");
  revalidatePath(`/admin/quotations/${quotationId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin/procurement");

  return { ok: true, orderId: result.orderId };
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
