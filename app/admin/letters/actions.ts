"use server";

import React from "react";
import { Resend } from "resend";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/rbac";
import {
  saveLetter,
  deleteLetter,
  getLetterById,
  type SaveLetterInput,
  type AdminLetterRecord,
} from "@/lib/admin/letters";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface ActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Server action to save or update an official letter.
 */
export async function saveLetterAction(
  input: SaveLetterInput,
): Promise<ActionResult<AdminLetterRecord>> {
  try {
    await requireAdmin({ permission: "orders.view" });
    const letter = await saveLetter(input);
    revalidatePath("/admin/letters");
    revalidatePath("/admin/documents");
    return { ok: true, data: letter, message: "Letter saved successfully." };
  } catch (err: unknown) {
    console.error("[saveLetterAction] Error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to save letter.",
    };
  }
}

/**
 * Server action to delete an official letter.
 */
export async function deleteLetterAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin({ permission: "orders.view" });
    await deleteLetter(id);
    revalidatePath("/admin/letters");
    revalidatePath("/admin/documents");
    return { ok: true, message: "Letter deleted successfully." };
  } catch (err: unknown) {
    console.error("[deleteLetterAction] Error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to delete letter.",
    };
  }
}

/**
 * Server action to send an official letter via Resend with PDF attachment.
 */
export async function sendLetterEmailAction({
  letterId,
  recipientEmail,
  customMessage,
}: {
  letterId: string;
  recipientEmail?: string;
  customMessage?: string;
}): Promise<ActionResult> {
  try {
    await requireAdmin({ permission: "orders.view" });
    const letter = await getLetterById(letterId);

    if (!letter) {
      return { ok: false, error: "Letter not found." };
    }

    const targetEmail = (recipientEmail || letter.recipient_email).trim();
    if (!targetEmail) {
      return { ok: false, error: "Recipient email address is required." };
    }

    // Lazy load React-PDF dependencies
    const [{ pdf }, { OfficialLetterPdfDocument }] = await Promise.all([
      import("@react-pdf/renderer"),
      import("@/components/pdf/OfficialLetterPdfDocument"),
    ]);

    const pdfElement = React.createElement(OfficialLetterPdfDocument, {
      data: {
        reference_number: letter.reference_number,
        created_at: letter.created_at,
        recipient_type: letter.recipient_type,
        recipient_organization: letter.recipient_organization,
        recipient_title: letter.recipient_title,
        recipient_name: letter.recipient_name,
        recipient_email: letter.recipient_email,
        recipient_country: letter.recipient_country,
        recipient_address: letter.recipient_address,
        subject: letter.subject,
        body_markdown: letter.body_markdown,
        include_quotation: letter.include_quotation,
        quotation_data: letter.quotation_data,
        signatory_name: letter.signatory_name,
        signatory_title: letter.signatory_title,
        school_name: letter.school?.name,
      },
    }) as NonNullable<Parameters<typeof pdf>[0]>;

    const pdfBlob = await pdf(pdfElement).toBlob();
    const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn(
        "[sendLetterEmailAction] RESEND_API_KEY not configured. Simulating dispatch.",
      );
      // Still update status to emailed in DB for audit trail
      const supabase = createSupabaseAdminClient();
      await supabase
        .from("admin_letters")
        .update({
          status: "emailed",
          last_emailed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", letter.id);

      revalidatePath("/admin/letters");
      if (letter.reference_number) {
        revalidatePath(`/admin/letters/${letter.reference_number}`);
      }
      revalidatePath(`/admin/letters/${letter.id}`);
      return {
        ok: true,
        message: `Dispatched in simulation mode to ${targetEmail} (RESEND_API_KEY is unset).`,
      };
    }

    const resend = new Resend(apiKey);
    const fromAddress =
      process.env.RESEND_FROM_EMAIL ||
      "Pexpacks Supplies <helpme@pexpacks.co.za>";

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="margin-bottom: 20px; border-bottom: 2px solid #059669; padding-bottom: 12px;">
          <h2 style="color: #0f172a; margin: 0 0 4px 0; font-size: 20px;">Pexpacks Supplies</h2>
          <p style="color: #059669; margin: 0; font-size: 12px; font-weight: bold; text-transform: uppercase;">Official Correspondence</p>
        </div>
        
        <p style="font-size: 14px; margin-bottom: 12px;">Dear <strong>${letter.recipient_name}</strong>,</p>
        
        <div style="background-color: #f8fafc; border-left: 3px solid #059669; padding: 12px; margin-bottom: 16px;">
          <strong style="color: #0f172a; font-size: 13px;">Subject: ${letter.subject}</strong><br />
          <span style="color: #64748b; font-size: 12px;">Document Reference: ${letter.reference_number}</span>
        </div>
        
        ${
          customMessage
            ? `<div style="font-size: 14px; line-height: 1.6; margin-bottom: 20px; white-space: pre-wrap;">${customMessage}</div>`
            : `<p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">Please find attached our official institutional document (<strong>${letter.reference_number}.pdf</strong>) regarding <em>${letter.subject}</em>.</p>`
        }
        
        <p style="font-size: 13px; color: #475569; line-height: 1.5;">
          If you have any questions or require additional documentation, please do not hesitate to reach out to our team at <a href="mailto:helpme@pexpacks.co.za" style="color: #059669;">helpme@pexpacks.co.za</a> or call +27 78 003 6048.
        </p>
        
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
          <strong>${letter.signatory_name}</strong><br />
          <span>${letter.signatory_title}</span><br />
          <span>Pexpacks Supplies (Pty) Ltd</span>
        </div>
      </div>
    `;

    let sendResult = await resend.emails.send({
      from: fromAddress,
      to: [targetEmail],
      subject: `[${letter.reference_number}] ${letter.subject}`,
      html: htmlContent,
      attachments: [
        {
          filename: `${letter.reference_number}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    // Fallback to onboarding@resend.dev in sandbox/test environments
    if (sendResult.error && sendResult.error.message?.includes("domain")) {
      sendResult = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: [targetEmail],
        subject: `[${letter.reference_number}] ${letter.subject}`,
        html: htmlContent,
        attachments: [
          {
            filename: `${letter.reference_number}.pdf`,
            content: pdfBuffer,
          },
        ],
      });
    }

    if (sendResult.error) {
      throw new Error(
        sendResult.error.message || "Resend failed to deliver email.",
      );
    }

    // Update letter status in database
    const supabase = createSupabaseAdminClient();
    await supabase
      .from("admin_letters")
      .update({
        status: "emailed",
        last_emailed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", letter.id);

    revalidatePath("/admin/letters");
    if (letter.reference_number) {
      revalidatePath(`/admin/letters/${letter.reference_number}`);
    }
    revalidatePath(`/admin/letters/${letter.id}`);

    return {
      ok: true,
      message: `Document successfully dispatched to ${targetEmail}.`,
    };
  } catch (err: unknown) {
    console.error("[sendLetterEmailAction] Error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to send email.",
    };
  }
}

/**
 * Server action to search schools for recipient auto-population.
 */
export async function searchSchoolsForLetterAction(query: string) {
  try {
    await requireAdmin({ permission: "orders.view" });
    const supabase = createSupabaseAdminClient();

    let dbQuery = supabase
      .from("schools")
      .select(
        "id, name, slug, address, city, province, principal, email, telephone",
      )
      .order("name", { ascending: true });

    if (query && query.trim()) {
      const q = query.trim();
      dbQuery = dbQuery.or(`name.ilike.%${q}%,city.ilike.%${q}%`).limit(50);
    }

    const { data, error } = await dbQuery;
    if (error) throw error;
    return { ok: true, data: data || [] };
  } catch (err: unknown) {
    console.error("[searchSchoolsForLetterAction] Error:", err);
    return { ok: false, data: [], error: "Failed to search schools." };
  }
}

/**
 * Server action to fetch available quotations for embedding.
 */
export async function searchQuotationsForLetterAction(query: string) {
  try {
    await requireAdmin({ permission: "orders.view" });
    const supabase = createSupabaseAdminClient();

    let dbQuery = supabase
      .from("quotations" as never)
      .select(
        "id, quote_number, recipient_name, recipient_email, school_name, subtotal, vat_rate, vat_amount, total_amount, items:quotation_items(id, item_title, sku, unit, quantity, unit_price, total_price)",
      )
      .order("created_at", { ascending: false })
      .limit(20);

    if (query && query.trim()) {
      const q = query.trim();
      dbQuery = dbQuery.or(
        `quote_number.ilike.%${q}%,recipient_name.ilike.%${q}%,school_name.ilike.%${q}%`,
      );
    }

    const { data, error } = await dbQuery;
    if (error) throw error;
    return { ok: true, data: data || [] };
  } catch (err: unknown) {
    console.error("[searchQuotationsForLetterAction] Error:", err);
    return { ok: false, data: [], error: "Failed to search quotations." };
  }
}
