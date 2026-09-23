import React from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
  console.log("Letter loaded:", letter.reference_number);

  console.log("2. Importing @react-pdf/renderer...");
  const { pdf } = await import("@react-pdf/renderer");

  console.log("3. Importing OfficialLetterPdfDocument...");
  // Use tsx or import the transpiled component
  // Since OfficialLetterPdfDocument is TSX, let's see if we can import it or transpile
}

run().catch(console.error);
