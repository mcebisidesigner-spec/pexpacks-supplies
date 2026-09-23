import React from "react";
import { createClient } from "@supabase/supabase-js";
import { OfficialLetterPdfDocument } from "./components/pdf/OfficialLetterPdfDocument";
import { pdf } from "@react-pdf/renderer";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
  console.log("1. Querying letter from Supabase...");
  const selectFields = `
    *,
    school:schools (
      id,
      name,
      slug,
      address,
      city,
      province
    ),
    quotation:quotations (
      id,
      quote_number,
      total_amount
    )
  `;

  const { data: letter, error } = await supabase
    .from("admin_letters")
    .select(selectFields)
    .eq("id", "e83ae917-7c71-4405-8f3d-ce98889a1e54")
    .maybeSingle();

  if (error) {
    console.error("DB Error:", error);
    return;
  }
  if (!letter) {
    console.error("Letter not found!");
    return;
  }
  console.log("Letter loaded:", letter.reference_number);

  console.log("2. Creating PDF element...");
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

  console.log("3. Generating PDF buffer...");
  const stream = await pdf(pdfElement).toBuffer();
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream as unknown as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);
  console.log("SUCCESS! PDF Buffer length:", buffer.length);
}

run().catch((err) => {
  console.error("CRASHED:", err);
});
