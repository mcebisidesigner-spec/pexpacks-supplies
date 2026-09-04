"use server";

import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { LetterheadDocument, type LetterheadProps } from "@/lib/pdf/LetterheadDocument";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

export interface SendOfficialLetterEmailPayload extends LetterheadProps {
  recipientEmail: string;
  emailCoverBody?: string;
}

export async function sendOfficialLetterEmail(payload: SendOfficialLetterEmailPayload) {
  const supabase = createAdminClient();

  // 1. Generate Binary PDF Buffer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(LetterheadDocument, payload) as any;
  const pdfBuffer = await renderToBuffer(element);

  const filename = `${payload.referenceNumber}_Letter.pdf`;
  const storagePath = `official-letters/${payload.referenceNumber}.pdf`;

  // 2. Upload to Supabase Storage if bucket exists
  try {
    await supabase.storage
      .from("documents")
      .upload(storagePath, pdfBuffer, { contentType: "application/pdf", upsert: true });
  } catch (storageErr) {
    console.warn("[letters-storage] Notice on storage upload:", storageErr);
  }

  // 3. Send International Dispatch via Resend
  const resendApiKey = process.env.RESEND_API_KEY;
  let emailId: string | undefined;

  if (resendApiKey) {
    const resend = new Resend(resendApiKey);
    const { data: emailRes, error: emailErr } = await resend.emails.send({
      from: "Pexpacks Supplies <commercial@pexpacks.co.za>",
      to: [payload.recipientEmail],
      subject: `Official Letter: ${payload.subject} (Ref: ${payload.referenceNumber})`,
      text:
        payload.emailCoverBody ||
        `Dear ${payload.recipientName},\n\nPlease find attached the official correspondence from Pexpacks Supplies regarding: ${payload.subject}.\n\nKind regards,\n${payload.signatoryName}`,
      attachments: [
        {
          filename,
          content: pdfBuffer,
        },
      ],
    });

    if (emailErr) {
      throw new Error(`Email dispatch failed: ${emailErr.message}`);
    }
    emailId = emailRes?.id;
  } else {
    console.warn("[letters-email] RESEND_API_KEY is not configured; skipping live email dispatch.");
  }

  // 4. Update Database Record
  await supabase.from("admin_letters").upsert(
    {
      reference_number: payload.referenceNumber,
      recipient_type: "private_client",
      recipient_organization: propsRecipientOrg(payload),
      recipient_name: payload.recipientName,
      recipient_email: payload.recipientEmail,
      subject: payload.subject,
      body_markdown: payload.body,
      status: "emailed",
      last_emailed_at: new Date().toISOString(),
      pdf_storage_path: storagePath,
    },
    { onConflict: "reference_number" }
  );

  return { success: true, emailId };
}

function propsRecipientOrg(p: LetterheadProps) {
  return p.recipientOrg || "Private Entity";
}
