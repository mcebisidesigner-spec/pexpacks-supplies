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

// -------------------------------------------------------------
// TEMPLATE MANAGEMENT (Dynamic permanent templates)
// -------------------------------------------------------------

export interface AdminLetterTemplate {
  id: string;
  name: string;
  subject: string;
  body_markdown: string;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SaveLetterTemplateInput {
  id?: string;
  name: string;
  subject: string;
  body_markdown: string;
  sort_order?: number;
}

export const DEFAULT_LETTER_TEMPLATES: AdminLetterTemplate[] = [
  {
    id: "partnership_proposal",
    name: "Partnership Proposal",
    subject:
      "Partnership Invitation — Modernize Your School's Stationery Procurement with Zero Administrative Load",
    body_markdown: `Dear Principal,

As a Growth Hacker & Founder at Pexpacks Supplies, I have spent years helping schools and startups simplify operations so they can focus on their core mission. At the start of every academic year, school administration teams face a recurring challenge: managing paper order forms, manual cash collections, and the complexity of stationery distribution.

We would like to invite your school to partner with Pexpacks Supplies to eliminate this administrative burden while giving parents a seamless, modern digital ordering experience.

The Pexpacks Partnership Advantage
Complimentary Custom Web Development and Hosting. We build, launch, and host a dedicated premium stationery portal for your school at no cost. Our development team manages security, software updates, and server maintenance.

Effortless Parent Ordering
Parents access custom, teacher-approved stationery lists through an intuitive, mobile-friendly portal linked to your school website or communication channels.

Secure Direct Payment Gateway
Parents pay directly online with instant receipts and clear order confirmations, eliminating cash handling for your bursar and admin staff.

Direct-to-Home Delivery
Every pack is delivered directly to parents with accurate tracking and prompt customer support.

Zero Financial or Operational Cost
There are no development costs, no monthly maintenance fees, and no inventory risk for your school.

Next Steps & Consultation
We would welcome a 15-minute introductory meeting with your leadership team or School Governing Body to demonstrate a live prototype portal tailored for your school.

Thank you for your time, leadership, and ongoing dedication to academic excellence.`,
    sort_order: 1,
  },
  {
    id: "quotation_transmittal",
    name: "Quotation Transmittal",
    subject:
      "Formal Quotation Transmittal: Institutional Scholastic & Office Supplies",
    body_markdown: `Dear School Management Team,

Please find enclosed our formal commercial quotation for the requested scholastic supplies and educational stationery packs.

All quoted line items have been carefully vetted to ensure compliance with Department of Basic Education specifications, high manufacturing durability, and maximum cost efficiency.

Terms & Commercial Conditions:
• Validity: This quotation is strictly valid for 30 calendar days from the date of issue.
• Delivery Timelines: Estimated delivery within 3–5 business days following formal purchase order sign-off.
• Settlement: Payment terms as per our approved institutional credit agreement or EFT prior to dispatch.

Should you require any line-item adjustments or additional bundle customizations, please do not hesitate to contact our administrative desk directly.`,
    sort_order: 2,
  },
  {
    id: "credit_terms",
    name: "Credit Terms Application",
    subject:
      "Formal Notification: 30-Day Institutional Account Facility & Settlement Terms",
    body_markdown: `Dear Finance Office / Bursar,

Following our recent commercial review, PexPacks Supplies is pleased to confirm the approval of your institutional 30-Day Commercial Account facility.

Account Specifications:
• Approved Billing Entity: School Governing Body / Commercial Desk
• Standard Payment Terms: Strictly 30 days from date of monthly statement
• Remittance Address: accounts@pexpacks.co.za

To ensure seamless order dispatch throughout the academic term, please ensure all authorized purchase orders reference your official institutional customer code.

Thank you for choosing PexPacks Supplies as your trusted scholastic distribution partner.`,
    sort_order: 3,
  },
  {
    id: "general",
    name: "General Commercial Notice",
    subject: "Commercial Update & Term Notice from PexPacks Supplies",
    body_markdown: `Dear Valued Partner,

We are writing to provide an important administrative and operational update regarding upcoming procurement deadlines and delivery logistics for the forthcoming school term.

Our team remains fully dedicated to providing unparalleled customer care and uninterrupted distribution across all contracted regions.

Please feel free to reach out directly should you have any questions or require custom supply arrangements for your campus.`,
    sort_order: 4,
  },
];

export async function listLetterTemplates(): Promise<AdminLetterTemplate[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("admin_letter_templates")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_LETTER_TEMPLATES;
    }

    return data as AdminLetterTemplate[];
  } catch (err) {
    console.warn("[listLetterTemplates] DB error, using default templates:", err);
    return DEFAULT_LETTER_TEMPLATES;
  }
}

export async function saveLetterTemplate(
  input: SaveLetterTemplateInput,
): Promise<AdminLetterTemplate> {
  const supabase = createSupabaseAdminClient();

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    input.id || "",
  );

  // 1. If valid UUID, update that specific record
  if (input.id && isUuid) {
    const { data, error } = await supabase
      .from("admin_letter_templates")
      .update({
        name: input.name.trim(),
        subject: input.subject.trim(),
        body_markdown: input.body_markdown,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.id)
      .select()
      .single();

    if (!error && data) {
      return data as AdminLetterTemplate;
    }
  }

  // 2. If it's a preset slug or matching preset name, search for an existing template by name
  const { data: existingByName } = await supabase
    .from("admin_letter_templates")
    .select("*")
    .ilike("name", input.name.trim())
    .limit(1);

  if (existingByName && existingByName.length > 0) {
    const { data: updated, error: updateErr } = await supabase
      .from("admin_letter_templates")
      .update({
        subject: input.subject.trim(),
        body_markdown: input.body_markdown,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingByName[0].id)
      .select()
      .single();

    if (!updateErr && updated) {
      return updated as AdminLetterTemplate;
    }
  }

  // 3. Fallback: Insert new template into library
  const { data, error } = await supabase
    .from("admin_letter_templates")
    .insert({
      name: input.name.trim(),
      subject: input.subject.trim(),
      body_markdown: input.body_markdown,
      sort_order: input.sort_order ?? 10,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to save template: ${error?.message || "Unknown database error"}`);
  }

  return data as AdminLetterTemplate;
}

export async function deleteLetterTemplate(id: string): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("admin_letter_templates")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete template: ${error.message}`);
  }

  return true;
}

