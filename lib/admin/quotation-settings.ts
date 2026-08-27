import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, writeAuditLog } from "@/lib/admin/rbac";

// ============================================================================
// Schemas
// ============================================================================

export const quotationBusinessSchema = z.object({
  registered_name: z.string().trim().min(1, "Registered name is required"),
  trading_name: z.string().trim().min(1, "Trading name is required"),
  reg_number: z.string().trim().min(1, "Registration number is required"),
  vat_number: z.string().trim().min(1, "VAT number is required"),
  website: z.string().trim().url("Valid URL required"),
});

export const quotationAddressSchema = z.object({
  address_line1: z.string().trim().min(1, "Address Line 1 is required"),
  address_line2: z.string().trim().default(""),
  suburb: z.string().trim().min(1, "Suburb is required"),
  city: z.string().trim().min(1, "City / Town is required"),
  province: z.string().trim().min(1, "Province is required"),
  postal_code: z.string().trim().min(1, "Postal code is required"),
  country: z.string().trim().default("South Africa"),
});

export const quotationContactsSchema = z.object({
  main_phone: z.string().trim().min(5, "Main telephone is required"),
  support_phone: z.string().trim().default(""),
  quotation_email: z.string().trim().email("Valid quotation email is required"),
  general_email: z.string().trim().email("Valid general email is required"),
  finance_email: z.string().trim().email("Valid finance email is required"),
  sender_display_name: z.string().trim().default("Pexpacks Supplies Quotations Desk"),
});

export const quotationBankingSchema = z.object({
  bank_name: z.string().trim().min(1, "Bank name is required"),
  account_holder: z.string().trim().min(1, "Account holder is required"),
  account_type: z.string().trim().min(1, "Account type is required"),
  account_number: z.string().trim().min(5, "Valid account number is required"),
  branch_name: z.string().trim().default("Universal Branch"),
  branch_code: z.string().trim().min(3, "Branch code is required"),
  swift_code: z.string().trim().default(""),
  payment_reference_instructions: z.string().trim().default("Use Quotation Number as payment reference (e.g. PX-Q-YYYY-XXXX)"),
  banking_notes: z.string().trim().default(""),
});

export const quotationNotesTermsSchema = z.object({
  quotation_notes: z.string().trim().default(""),
  terms_and_conditions: z.string().trim().min(10, "Terms and conditions cannot be blank"),
  terms_version: z.string().trim().default("v1.2"),
  updated_at: z.string().optional(),
  updated_by: z.string().optional(),
});

export const quotationDefaultsSchema = z.object({
  default_validity_days: z.coerce.number().int().min(1).max(365).default(30),
  default_payment_terms: z.string().trim().default("Payment due on acceptance"),
  default_currency: z.string().trim().default("ZAR"),
  vat_rate: z.coerce.number().min(0).max(100).default(15),
  vat_enabled: z.boolean().default(true),
  prefix: z.string().trim().default("PX-Q"),
  pdf_template_version: z.string().trim().default("v2.4"),
  pdf_footer_note: z.string().trim().default("Thank you for choosing Pexpacks Supplies. All orders subject to standard trading terms."),
});

export type QuotationBusiness = z.infer<typeof quotationBusinessSchema>;
export type QuotationAddress = z.infer<typeof quotationAddressSchema>;
export type QuotationContacts = z.infer<typeof quotationContactsSchema>;
export type QuotationBanking = z.infer<typeof quotationBankingSchema>;
export type QuotationNotesTerms = z.infer<typeof quotationNotesTermsSchema>;
export type QuotationDefaults = z.infer<typeof quotationDefaultsSchema>;

export interface QuotationAllSettings {
  business: QuotationBusiness;
  address: QuotationAddress;
  contacts: QuotationContacts;
  banking: QuotationBanking;
  notesTerms: QuotationNotesTerms;
  defaults: QuotationDefaults;
}

export interface QuotationSystemInfo {
  prefix: string;
  currentYear: number;
  currentSequence: string;
  nextQuoteNumber: string;
  totalQuotationsCount: number;
  latestQuoteNumber: string | null;
  latestQuoteCreatedAt: string | null;
  latestQuoteSentAt: string | null;
  activeSeason: string;
  activePdfTemplate: string;
  pdfTemplateVersion: string;
  lastSettingsUpdated: string | null;
  lastSettingsUpdatedBy: string | null;
  currency: string;
  vatRate: number;
  vatEnabled: boolean;
  defaultValidityDays: number;
  defaultPaymentTerms: string;
}

// ============================================================================
// Authoritative Fallback Defaults
// ============================================================================

const DEFAULT_BUSINESS: QuotationBusiness = {
  registered_name: "Pexpacks Supplies (Pty) Ltd",
  trading_name: "Pexpacks",
  reg_number: "2024/789123/07",
  vat_number: "4920182741",
  website: "https://pexpacks.co.za",
};

const DEFAULT_ADDRESS: QuotationAddress = {
  address_line1: "33 Kelly Rd",
  address_line2: "Meerzicht Business Park",
  suburb: "Jet Park",
  city: "Boksburg",
  province: "Gauteng",
  postal_code: "1459",
  country: "South Africa",
};

const DEFAULT_CONTACTS: QuotationContacts = {
  main_phone: "078 003 6048",
  support_phone: "078 003 6048",
  quotation_email: "helpme@pexpacks.co.za",
  general_email: "helpme@pexpacks.co.za",
  finance_email: "accounts@pexpacks.co.za",
  sender_display_name: "Pexpacks Supplies Quotations Desk",
};

const DEFAULT_BANKING: QuotationBanking = {
  bank_name: "FNB / RMB",
  account_holder: "Pexpacks",
  account_type: "Current Account",
  account_number: "63215756991",
  branch_name: "Universal Branch",
  branch_code: "250655",
  swift_code: "FIRNZAJJ",
  payment_reference_instructions: "Use Quotation Number as payment reference (e.g. PX-Q-YYYY-XXXX)",
  banking_notes: "Please email proof of payment to helpme@pexpacks.co.za",
};

const DEFAULT_NOTES_TERMS: QuotationNotesTerms = {
  quotation_notes: "Thank you for the opportunity to provide this quotation. Every pack is carefully verified according to the official school requirements.",
  terms_and_conditions: "1. This quotation is valid for 30 calendar days from the date of issue.\n2. Pricing includes packaging, quality verification, and school delivery coordination.\n3. Standard settlement: payment due upon acceptance.\n4. All prices are in South African Rand (ZAR) and inclusive of 15% VAT where applicable.",
  terms_version: "v1.2",
  updated_at: new Date().toISOString(),
  updated_by: "System Admin",
};

const DEFAULT_COMMERCIAL_DEFAULTS: QuotationDefaults = {
  default_validity_days: 30,
  default_payment_terms: "Payment due on acceptance",
  default_currency: "ZAR",
  vat_rate: 15,
  vat_enabled: true,
  prefix: "PX-Q",
  pdf_template_version: "v2.4",
  pdf_footer_note: "Thank you for choosing Pexpacks Supplies. All orders subject to standard trading terms.",
};

// ============================================================================
// Service Getters
// ============================================================================

export async function getQuotationSettings(): Promise<QuotationAllSettings> {
  const admin = createSupabaseAdminClient();
  const keys = [
    "quotation.business",
    "quotation.address",
    "quotation.contacts",
    "quotation.banking",
    "quotation.notes_terms",
    "quotation.defaults",
  ];

  const { data } = await admin
    .from("system_settings" as never)
    .select("key, value")
    .in("key", keys);

  const map = new Map<string, unknown>();
  for (const row of ((data ?? []) as unknown as Array<{ key: string; value: unknown }>)) {
    map.set(row.key, row.value);
  }

  const business = quotationBusinessSchema.safeParse(map.get("quotation.business")).data ?? DEFAULT_BUSINESS;
  const address = quotationAddressSchema.safeParse(map.get("quotation.address")).data ?? DEFAULT_ADDRESS;
  const contacts = quotationContactsSchema.safeParse(map.get("quotation.contacts")).data ?? DEFAULT_CONTACTS;
  const banking = quotationBankingSchema.safeParse(map.get("quotation.banking")).data ?? DEFAULT_BANKING;
  const notesTerms = quotationNotesTermsSchema.safeParse(map.get("quotation.notes_terms")).data ?? DEFAULT_NOTES_TERMS;
  const defaults = quotationDefaultsSchema.safeParse(map.get("quotation.defaults")).data ?? DEFAULT_COMMERCIAL_DEFAULTS;

  return {
    business,
    address,
    contacts,
    banking,
    notesTerms,
    defaults,
  };
}

export async function getQuotationSystemInfo(): Promise<QuotationSystemInfo> {
  const admin = createSupabaseAdminClient();
  const settings = await getQuotationSettings();
  const currentYear = new Date().getFullYear();
  const prefix = `${settings.defaults.prefix}-${currentYear}-`;

  // Fetch count and latest quotes
  const { count } = await admin
    .from("quotations" as never)
    .select("*", { count: "exact", head: true });

  const { data: latestRows } = await admin
    .from("quotations" as never)
    .select("quote_number, created_at, status, updated_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const quotes = (latestRows ?? []) as unknown as Array<{
    quote_number: string;
    created_at: string;
    status: string;
    updated_at: string;
  }>;

  const latestQuote = quotes[0] ?? null;
  const latestSentQuote = quotes.find((q) => q.status === "sent" || q.status === "accepted" || q.status === "converted_to_order") ?? null;

  // Next sequence calculation
  let nextSeqNumber = 1;
  if (latestQuote && latestQuote.quote_number.startsWith(prefix)) {
    const parts = latestQuote.quote_number.split("-");
    const lastNum = parseInt(parts[parts.length - 1] || "0", 10);
    if (!isNaN(lastNum)) {
      nextSeqNumber = lastNum + 1;
    }
  }
  const currentSequence = String(nextSeqNumber).padStart(4, "0");
  const nextQuoteNumber = `${prefix}${currentSequence}`;

  // Fetch active season from settings if present
  const { data: seasonSetting } = await admin
    .from("system_settings" as never)
    .select("value")
    .eq("key", "seasons.active_season")
    .maybeSingle();

  const activeSeason = ((seasonSetting as unknown as { value?: string })?.value) || "2027 Back-to-School";

  // Fetch last update time on settings
  const { data: lastSettingUpdate } = await admin
    .from("system_settings" as never)
    .select("updated_at")
    .ilike("key", "quotation.%")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastUpdated = (lastSettingUpdate as unknown as { updated_at?: string })?.updated_at || null;

  return {
    prefix: settings.defaults.prefix,
    currentYear,
    currentSequence,
    nextQuoteNumber,
    totalQuotationsCount: count ?? 0,
    latestQuoteNumber: latestQuote?.quote_number || null,
    latestQuoteCreatedAt: latestQuote?.created_at || null,
    latestQuoteSentAt: latestSentQuote?.created_at || null,
    activeSeason,
    activePdfTemplate: "QuotationPdfDocument (Standard Corporate)",
    pdfTemplateVersion: settings.defaults.pdf_template_version,
    lastSettingsUpdated: lastUpdated,
    lastSettingsUpdatedBy: "Admin / Authorized Session",
    currency: settings.defaults.default_currency,
    vatRate: settings.defaults.vat_rate,
    vatEnabled: settings.defaults.vat_enabled,
    defaultValidityDays: settings.defaults.default_validity_days,
    defaultPaymentTerms: settings.defaults.default_payment_terms,
  };
}

// ============================================================================
// Service Mutators
// ============================================================================

export async function saveQuotationSectionSetting(
  key: string,
  category: string,
  value: unknown,
  description: string,
  isSensitive = false
): Promise<{ success: boolean; error?: string }> {
  const session = await requireAdmin({ permission: "settings.manage" });
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("system_settings" as never)
    .upsert(
      {
        key,
        category,
        value: value as never,
        value_type: "json" as never,
        description,
        is_sensitive: isSensitive,
        is_public: !isSensitive,
        updated_by: session.user.id,
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "key" }
    );

  if (error) {
    return { success: false, error: error.message };
  }

  await writeAuditLog({
    action: `quotation_settings.update.${key.replace("quotation.", "")}`,
    entityType: "system_settings",
    entityId: key,
    summary: `Updated quotation setting: ${key}`,
    actorId: session.user.id,
    actorName: session.user.email ?? "Admin",
    details: {
      key,
      updated_value: isSensitive ? "[SENSITIVE_DATA_CONFIGURED]" : (value as Record<string, unknown>),
    },
  });

  return { success: true };
}
