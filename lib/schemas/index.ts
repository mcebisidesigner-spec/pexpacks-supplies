import { z } from "zod";

/**
 * PEXPACKS AUTHORITATIVE RUNTIME CONTRACTS (PHASE K4)
 *
 * UNTRUSTED INPUT ──► Zod Schema ──► Validated Data ──► Business Logic ──► Typed Supabase ──► Postgres
 */

// ── 1. ENVIRONMENT RUNTIME CONTRACT ──
export const environmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Missing Supabase anon key"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Missing service role key").optional(),
  RESEND_API_KEY: z.string().optional(),
  REDIS_URL: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type EnvironmentConfig = z.infer<typeof environmentSchema>;

// ── 2. PRODUCT MUTATION CONTRACT ──
export const productMutationSchema = z.object({
  name: z.string().trim().min(2, "Product name must be at least 2 characters").max(200),
  sku: z.string().trim().max(50).optional().nullable(),
  brand: z.string().trim().max(100).optional().nullable(),
  category: z.string().trim().max(100).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  specification: z.string().trim().max(1000).optional().nullable(),
  unit_cost_cents: z.coerce.number().int().nonnegative().optional().nullable(),
  selling_price_cents: z.coerce.number().int().nonnegative().optional().nullable(),
  requires_pexcover: z.boolean().default(false),
  pexco_code: z.string().trim().max(30).optional().nullable(),
  is_active: z.boolean().default(true),
});

export type ProductMutationInput = z.infer<typeof productMutationSchema>;

// ── 3. SCHOOL MUTATION CONTRACT ──
export const schoolMutationSchema = z.object({
  name: z.string().trim().min(3, "School name must be at least 3 characters").max(200),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  city: z.string().trim().max(100).optional().nullable(),
  province: z.string().trim().max(100).default("Gauteng"),
  address: z.string().trim().max(300).optional().nullable(),
  status: z.enum(["active", "pending", "archived", "draft"]).default("active"),
});

export type SchoolMutationInput = z.infer<typeof schoolMutationSchema>;

// ── 4. SUPPLIER MUTATION CONTRACT ──
export const supplierMutationSchema = z.object({
  name: z.string().trim().min(2, "Supplier name must be at least 2 characters").max(150),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  contact_name: z.string().trim().max(120).optional().nullable(),
  contact_email: z.string().trim().email("Invalid email address").optional().nullable().or(z.literal("")),
  contact_phone: z.string().trim().max(40).optional().nullable(),
  is_active: z.boolean().default(true),
});

export type SupplierMutationInput = z.infer<typeof supplierMutationSchema>;

// ── 5. CHECKOUT SUBMISSION CONTRACT ──
const SA_PHONE_REGEX = /^(\+27|0)[1-9]\d{8}$/;

export const checkoutItemSchema = z.object({
  packId: z.string().min(1, "Pack ID is required"),
  learnerName: z.string().trim().min(1, "Learner name is required").max(120),
  pexcoverSelected: z.boolean().default(false),
  pexcoverStyle: z.string().optional().nullable(),
});

export const checkoutSubmissionSchema = z.object({
  buyerName: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  buyerEmail: z.string().trim().email("Please enter a valid email address").toLowerCase(),
  buyerPhone: z.string().trim().regex(SA_PHONE_REGEX, "Please enter a valid South African phone number"),
  preferredContactMethod: z.enum(["whatsapp", "phone", "email"]).default("whatsapp"),
  fulfilmentMethod: z.enum(["school_collection", "home_delivery", "arranged_collection"]),
  deliveryAddress: z.string().trim().max(400).optional().nullable(),
  deliveryNotes: z.string().trim().max(500).optional().nullable(),
  multiSchoolDrop: z.string().trim().optional().nullable(),
  items: z.array(checkoutItemSchema).min(1, "At least one pack is required to checkout"),
});

export type CheckoutSubmissionInput = z.infer<typeof checkoutSubmissionSchema>;

// ── 6. AI LIST CONVERTER OCR EXTRACTION CONTRACT ──
export const aiExtractedItemSchema = z.object({
  raw_text: z.string().trim().max(500).default(""),
  item_name: z.string().trim().min(2).max(200),
  quantity: z.coerce.number().int().min(1).max(999),
  specifications: z.string().trim().max(500).default(""),
});

export type AiExtractedItem = z.infer<typeof aiExtractedItemSchema>;
