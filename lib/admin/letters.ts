import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface LetterQuotationItem {
  id?: string;
  item_title: string;
  sku?: string | null;
  unit?: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface LetterQuotationData {
  quote_number?: string;
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total_amount: number;
  currency?: string;
  notes?: string;
  items: LetterQuotationItem[];
}

export interface AdminLetterRecord {
  id: string;
  reference_number: string;
  school_id: string | null;
  quotation_id: string | null;
  recipient_type: "registered_school" | "private_client";
  recipient_organization: string;
  recipient_title: string | null;
  recipient_name: string;
  recipient_email: string;
  recipient_country: string;
  recipient_address: string | null;
  subject: string;
  body_markdown: string;
  include_quotation: boolean;
  quotation_data: LetterQuotationData;
  signatory_name: string;
  signatory_title: string;
  status: "draft" | "generated" | "emailed" | "archived";
  last_emailed_at: string | null;
  pdf_storage_path: string | null;
  created_at: string;
  updated_at: string;
  school?: {
    id: string;
    name: string;
    slug?: string;
    address?: string | null;
    city?: string | null;
    province?: string | null;
  } | null;
  quotation?: {
    id: string;
    quote_number: string;
    total_amount: number;
  } | null;
}

export interface ListLettersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  recipientType?: string;
}

export interface ListLettersResult {
  letters: AdminLetterRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Generates the next sequential letter reference number: PX-DOC-YYYY-XXXX
 */
export async function generateLetterReferenceNumber(): Promise<string> {
  const supabase = createSupabaseAdminClient();
  const year = new Date().getFullYear();
  const prefix = `PX-DOC-${year}-`;

  const { data } = await supabase
    .from("admin_letters")
    .select("reference_number")
    .like("reference_number", `${prefix}%`)
    .order("reference_number", { ascending: false })
    .limit(1);

  let nextSequence = 1;
  if (data && data.length > 0) {
    const lastRef = data[0].reference_number;
    const parts = lastRef.split("-");
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      nextSequence = lastNum + 1;
    }
  }

  const padded = String(nextSequence).padStart(4, "0");
  return `${prefix}${padded}`;
}

/**
 * Lists letters with pagination, search, and status filtering.
 */
export async function listLetters(
  params: ListLettersParams = {},
): Promise<ListLettersResult> {
  const supabase = createSupabaseAdminClient();
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.max(1, Math.min(100, params.pageSize || 20));
  const offset = (page - 1) * pageSize;

  let query = supabase.from("admin_letters").select(
    `
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
    `,
    { count: "exact" },
  );

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status as any);
  }

  if (params.recipientType && params.recipientType !== "all") {
    query = query.eq("recipient_type", params.recipientType as any);
  }

  if (params.search && params.search.trim()) {
    const s = params.search.trim();
    query = query.or(
      `reference_number.ilike.%${s}%,subject.ilike.%${s}%,recipient_organization.ilike.%${s}%,recipient_name.ilike.%${s}%,recipient_email.ilike.%${s}%`,
    );
  }

  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("[listLetters] Error fetching letters:", error);
    return {
      letters: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);

  return {
    letters: (data as unknown as AdminLetterRecord[]) || [],
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Gets a single letter by ID or reference number (e.g. PX-DOC-YYYY-XXXX).
 */
export async function getLetterById(
  idOrRef: string,
): Promise<AdminLetterRecord | null> {
  const supabase = createSupabaseAdminClient();
  const trimmed = decodeURIComponent(idOrRef).trim();
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      trimmed,
    );

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

  if (isUuid) {
    const { data } = await supabase
      .from("admin_letters")
      .select(selectFields)
      .eq("id", trimmed)
      .maybeSingle();

    if (data) {
      return data as unknown as AdminLetterRecord;
    }
  }

  // Lookup by reference number (or fallback)
  const { data: byRef } = await supabase
    .from("admin_letters")
    .select(selectFields)
    .eq("reference_number", trimmed)
    .maybeSingle();

  if (byRef) {
    return byRef as unknown as AdminLetterRecord;
  }

  // Fallback: check if id matches without strict uuid format
  if (!isUuid) {
    const { data: byId } = await supabase
      .from("admin_letters")
      .select(selectFields)
      .eq("id", trimmed)
      .maybeSingle();

    if (byId) {
      return byId as unknown as AdminLetterRecord;
    }
  }

  return null;
}

export const getLetterByReference = getLetterById;


export interface SaveLetterInput {
  id?: string;
  reference_number?: string;
  school_id?: string | null;
  quotation_id?: string | null;
  recipient_type: "registered_school" | "private_client";
  recipient_organization: string;
  recipient_title?: string | null;
  recipient_name: string;
  recipient_email: string;
  recipient_country?: string | null;
  recipient_address?: string | null;
  subject: string;
  body_markdown: string;
  include_quotation?: boolean;
  quotation_data?: LetterQuotationData;
  signatory_name?: string;
  signatory_title?: string;
  status?: "draft" | "generated" | "emailed" | "archived";
}

/**
 * Creates or updates an admin letter.
 */
export async function saveLetter(
  input: SaveLetterInput,
): Promise<AdminLetterRecord> {
  const supabase = createSupabaseAdminClient();

  const reference_number =
    input.reference_number ||
    (input.id ? undefined : await generateLetterReferenceNumber());

  const payload = {
    school_id: input.school_id || null,
    quotation_id: input.quotation_id || null,
    recipient_type: input.recipient_type,
    recipient_organization: input.recipient_organization.trim(),
    recipient_title: input.recipient_title?.trim() || null,
    recipient_name: input.recipient_name.trim(),
    recipient_email: input.recipient_email.trim(),
    recipient_country: input.recipient_country?.trim() || "South Africa",
    recipient_address: input.recipient_address?.trim() || null,
    subject: input.subject.trim(),
    body_markdown: input.body_markdown.trim(),
    include_quotation: Boolean(input.include_quotation),
    quotation_data: (input.quotation_data || {
      subtotal: 0,
      vat_rate: 15,
      vat_amount: 0,
      total_amount: 0,
      items: [],
    }) as unknown as Record<string, unknown>,
    signatory_name: input.signatory_name?.trim() || "Mcebisi Hlatshwayo",
    signatory_title: input.signatory_title?.trim() || "Managing Director",
    status: input.status || "draft",
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { data, error } = await supabase
      .from("admin_letters")
      .update(payload as any)
      .eq("id", input.id)
      .select(
        `
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
      `,
      )
      .single();

    if (error) {
      throw new Error(`Failed to update letter: ${error.message}`);
    }

    return data as unknown as AdminLetterRecord;
  } else {
    const { data, error } = await supabase
      .from("admin_letters")
      .insert({
        ...payload,
        reference_number: reference_number!,
        created_at: new Date().toISOString(),
      } as any)
      .select(
        `
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
      `,
      )
      .single();

    if (error) {
      throw new Error(`Failed to create letter: ${error.message}`);
    }

    return data as unknown as AdminLetterRecord;
  }
}

/**
 * Deletes a letter by ID.
 */
export async function deleteLetter(id: string): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("admin_letters").delete().eq("id", id);
  if (error) {
    throw new Error(`Failed to delete letter: ${error.message}`);
  }
  return true;
}
