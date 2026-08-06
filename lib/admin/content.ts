import { z } from "zod";
import { revalidateTag } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/types";
import {
  getAdminUser,
  hasPermission,
  writeAuditLog,
  type PermissionKey,
  type AdminSession,
} from "@/lib/admin/rbac";
import { CMS_TAGS } from "@/lib/cms";
import { FAQ_CATEGORIES } from "@/lib/admin/content-constants";

/**
 * Website content module: testimonials, FAQs and free-form website_content
 * sections. All mutations write through the service-role client, audit-log the
 * change and revalidate the public CMS cache tags.
 */

export type TestimonialRow = Database["public"]["Tables"]["testimonials"]["Row"];
export type FaqRow = Database["public"]["Tables"]["faqs"]["Row"];
export type WebsiteContentRow = Database["public"]["Tables"]["website_content"]["Row"];

export type ContentFormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
};

async function assertCan(permission: PermissionKey): Promise<AdminSession> {
  const session = await getAdminUser();
  if (!session || !hasPermission(session, permission)) {
    const err = new Error("You don't have permission to do that.");
    (err as Error & { status?: number }).status = 403;
    throw err;
  }
  return session;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

export const testimonialInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Too long"),
  role: z.string().trim().max(120, "Too long"),
  context: z.string().trim().max(120, "Too long"),
  quote: z.string().trim().min(1, "Quote is required").max(1200, "Too long"),
  rating: z.coerce.number().int().min(1, "Rating must be 1–5").max(5, "Rating must be 1–5"),
  visible: z.boolean(),
  sort_order: z.coerce.number().int().min(0, "Sort order must be 0 or more"),
});

export type TestimonialInput = z.infer<typeof testimonialInputSchema>;

export async function listTestimonials(): Promise<TestimonialRow[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("testimonials")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[content] list testimonials failed:", error);
    return [];
  }
  return data ?? [];
}

export async function getTestimonial(id: string): Promise<TestimonialRow | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("testimonials")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[content] get testimonial failed:", error);
    return null;
  }
  return data;
}

export async function saveTestimonial(
  input: TestimonialInput,
  id?: string
): Promise<ContentFormState> {
  const actor = await assertCan("content.manage");
  const admin = createSupabaseAdminClient();
  const payload = {
    name: input.name,
    role: input.role,
    context: input.context,
    quote: input.quote,
    rating: input.rating,
    visible: input.visible,
    sort_order: input.sort_order,
    updated_by: actor.user.id,
  };

  try {
    if (id) {
      const { error } = await admin.from("testimonials").update(payload).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await admin.from("testimonials").insert(payload);
      if (error) throw error;
    }
  } catch (err) {
    console.error("[content] save testimonial failed:", err);
    return { ok: false, message: "Failed to save testimonial." };
  }

  revalidateTag(CMS_TAGS.testimonials, "max");
  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: id ? "content.testimonial.update" : "content.testimonial.create",
    entityType: "testimonial",
    entityId: id ?? null,
    summary: `${id ? "Updated" : "Created"} testimonial ${input.name}`,
  });
  return { ok: true, message: id ? "Testimonial updated." : "Testimonial created." };
}

export async function setTestimonialVisible(id: string, visible: boolean): Promise<ContentFormState> {
  const actor = await assertCan("content.manage");
  const admin = createSupabaseAdminClient();
  try {
    const { data, error } = await admin
      .from("testimonials")
      .update({ visible, updated_by: actor.user.id })
      .eq("id", id)
      .select("name")
      .maybeSingle();
    if (error) throw error;
    if (!data) return { ok: false, message: "Testimonial not found." };
    revalidateTag(CMS_TAGS.testimonials, "max");
    void writeAuditLog({
      actorId: actor.user.id,
      actorName: actor.user.email,
      action: visible ? "content.testimonial.show" : "content.testimonial.hide",
      entityType: "testimonial",
      entityId: id,
      summary: `${visible ? "Showed" : "Hidden"} testimonial ${data.name}`,
    });
    return { ok: true, message: visible ? "Testimonial shown on the site." : "Testimonial hidden." };
  } catch (err) {
    console.error("[content] toggle testimonial failed:", err);
    return { ok: false, message: "Failed to update testimonial." };
  }
}

export async function deleteTestimonial(id: string): Promise<ContentFormState> {
  const actor = await assertCan("content.manage");
  const admin = createSupabaseAdminClient();
  try {
    const { error } = await admin.from("testimonials").delete().eq("id", id);
    if (error) throw error;
    revalidateTag(CMS_TAGS.testimonials, "max");
    void writeAuditLog({
      actorId: actor.user.id,
      actorName: actor.user.email,
      action: "content.testimonial.delete",
      entityType: "testimonial",
      entityId: id,
      summary: "Deleted testimonial",
    });
    return { ok: true, message: "Testimonial deleted." };
  } catch (err) {
    console.error("[content] delete testimonial failed:", err);
    return { ok: false, message: "Failed to delete testimonial." };
  }
}

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------

const linkItemSchema = z.object({
  label: z.string().trim().min(1, "Link label is required").max(120, "Too long"),
  href: z.string().trim().min(1, "Link URL is required").max(500, "Too long"),
});

export const faqInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only")
    .max(120, "Too long"),
  category: z.enum(FAQ_CATEGORIES),
  question: z.string().trim().min(1, "Question is required").max(300, "Too long"),
  answer: z.string().trim().min(1, "Answer is required").max(3000, "Too long"),
  links: z.array(linkItemSchema).max(8, "At most 8 links"),
  visible: z.boolean(),
  sort_order: z.coerce.number().int().min(0, "Sort order must be 0 or more"),
});

export type FaqInput = z.infer<typeof faqInputSchema>;

export async function listFaqs(): Promise<FaqRow[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("faqs")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[content] list faqs failed:", error);
    return [];
  }
  return data ?? [];
}

export async function getFaq(id: string): Promise<FaqRow | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("faqs").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("[content] get faq failed:", error);
    return null;
  }
  return data;
}

export async function saveFaq(input: FaqInput, id?: string): Promise<ContentFormState> {
  const actor = await assertCan("content.manage");
  const admin = createSupabaseAdminClient();
  const payload = {
    slug: input.slug,
    category: input.category,
    question: input.question,
    answer: input.answer,
    links: input.links as Json,
    visible: input.visible,
    sort_order: input.sort_order,
    updated_by: actor.user.id,
  };

  try {
    if (id) {
      const { error } = await admin.from("faqs").update(payload).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await admin.from("faqs").insert(payload);
      if (error) throw error;
    }
  } catch (err) {
    console.error("[content] save faq failed:", err);
    const msg =
      err && typeof err === "object" && "message" in err &&
      String((err as { message: unknown }).message).includes("idx_faqs_slug")
        ? "A FAQ with that slug already exists."
        : "Failed to save FAQ.";
    return { ok: false, message: msg };
  }

  revalidateTag(CMS_TAGS.faqs, "max");
  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: id ? "content.faq.update" : "content.faq.create",
    entityType: "faq",
    entityId: id ?? null,
    summary: `${id ? "Updated" : "Created"} FAQ ${input.question}`,
  });
  return { ok: true, message: id ? "FAQ updated." : "FAQ created." };
}

export async function setFaqVisible(id: string, visible: boolean): Promise<ContentFormState> {
  const actor = await assertCan("content.manage");
  const admin = createSupabaseAdminClient();
  try {
    const { data, error } = await admin
      .from("faqs")
      .update({ visible, updated_by: actor.user.id })
      .eq("id", id)
      .select("question")
      .maybeSingle();
    if (error) throw error;
    if (!data) return { ok: false, message: "FAQ not found." };
    revalidateTag(CMS_TAGS.faqs, "max");
    void writeAuditLog({
      actorId: actor.user.id,
      actorName: actor.user.email,
      action: visible ? "content.faq.show" : "content.faq.hide",
      entityType: "faq",
      entityId: id,
      summary: `${visible ? "Showed" : "Hidden"} FAQ ${data.question}`,
    });
    return { ok: true, message: visible ? "FAQ shown on the site." : "FAQ hidden." };
  } catch (err) {
    console.error("[content] toggle faq failed:", err);
    return { ok: false, message: "Failed to update FAQ." };
  }
}

export async function deleteFaq(id: string): Promise<ContentFormState> {
  const actor = await assertCan("content.manage");
  const admin = createSupabaseAdminClient();
  try {
    const { error } = await admin.from("faqs").delete().eq("id", id);
    if (error) throw error;
    revalidateTag(CMS_TAGS.faqs, "max");
    void writeAuditLog({
      actorId: actor.user.id,
      actorName: actor.user.email,
      action: "content.faq.delete",
      entityType: "faq",
      entityId: id,
      summary: "Deleted FAQ",
    });
    return { ok: true, message: "FAQ deleted." };
  } catch (err) {
    console.error("[content] delete faq failed:", err);
    return { ok: false, message: "Failed to delete FAQ." };
  }
}

// ---------------------------------------------------------------------------
// Website content sections (free-form key → jsonb)
// ---------------------------------------------------------------------------

export type ContentField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "checkbox";
  help?: string;
};

export type ContentSection = {
  key: WebsiteContentKey;
  label: string;
  description: string;
  fields: ContentField[];
};

const contentDefs = {
  "homepage.hero": {
    label: "Homepage hero",
    description: "Headline and intro shown at the top of the homepage.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "lead", label: "Lead paragraph", type: "textarea" },
    ] as ContentField[],
    schema: z.object({
      eyebrow: z.string().trim().max(200, "Too long"),
      title: z.string().trim().min(1, "Title is required").max(300, "Too long"),
      lead: z.string().trim().max(500, "Too long"),
    }),
  },
  "homepage.announcement": {
    label: "Announcement bar",
    description: "Optional promo banner shown across the top of the site.",
    fields: [
      { key: "enabled", label: "Show announcement", type: "checkbox" },
      { key: "text", label: "Announcement text", type: "text" },
    ] as ContentField[],
    schema: z.object({
      enabled: z.boolean(),
      text: z.string().trim().max(300, "Too long"),
    }),
  },
  company_info: {
    label: "Company information",
    description: "Store identity and contact details used around the site.",
    fields: [
      { key: "site_name", label: "Site name", type: "text" },
      { key: "support_email", label: "Support email", type: "text" },
      { key: "support_phone", label: "Support phone", type: "text" },
      { key: "site_url", label: "Site URL", type: "text" },
    ] as ContentField[],
    schema: z.object({
      site_name: z.string().trim().min(1, "Site name is required").max(120, "Too long"),
      support_email: z.string().trim().email("Enter a valid email").max(200, "Too long"),
      support_phone: z.string().trim().max(60, "Too long"),
      site_url: z.string().trim().url("Enter a valid URL").max(200, "Too long"),
    }),
  },
  footer: {
    label: "Footer",
    description: "Footer about and copyright text.",
    fields: [
      { key: "about_text", label: "About text", type: "textarea" },
      { key: "copyright_text", label: "Copyright text", type: "text" },
    ] as ContentField[],
    schema: z.object({
      about_text: z.string().trim().max(500, "Too long"),
      copyright_text: z.string().trim().max(200, "Too long"),
    }),
  },
  seo_defaults: {
    label: "SEO defaults",
    description: "Fallback title and description for pages that do not define their own.",
    fields: [
      { key: "default_title", label: "Default title", type: "text" },
      { key: "default_description", label: "Default description", type: "textarea" },
    ] as ContentField[],
    schema: z.object({
      default_title: z.string().trim().min(1, "Title is required").max(200, "Too long"),
      default_description: z.string().trim().max(400, "Too long"),
    }),
  },
} as const;

type ContentKeyOf<T> = T extends readonly unknown[] ? never : Extract<keyof T, string>;
export type WebsiteContentKey = ContentKeyOf<typeof contentDefs>;

const BOOLEAN_FIELDS: Record<string, string[]> = {
  "homepage.announcement": ["enabled"],
};

const contentDefaults: Record<WebsiteContentKey, Record<string, unknown>> = {
  "homepage.hero": {
    eyebrow: "School stationery made simple",
    title: "Your school stationery list, perfectly packed.",
    lead: "Your official school stationery list, perfectly packed and delivered.",
  },
  "homepage.announcement": { enabled: false, text: "" },
  company_info: {
    site_name: "Pexpacks",
    support_email: "hello@pexpacks.co.za",
    support_phone: "",
    site_url: "https://pexpacks.co.za",
  },
  footer: {
    about_text: "School stationery, packed and delivered.",
    copyright_text: "Pexpacks Supplies. All rights reserved.",
  },
  seo_defaults: {
    default_title: "Pexpacks Supplies",
    default_description: "School stationery packs, listed and delivered.",
  },
};

export function contentSections(): ContentSection[] {
  return (Object.keys(contentDefs) as WebsiteContentKey[]).map((key) => ({
    key,
    label: contentDefs[key].label,
    description: contentDefs[key].description,
    fields: contentDefs[key].fields,
  }));
}

export async function getWebsiteContent(): Promise<Record<WebsiteContentKey, Record<string, unknown>>> {
  const result = structuredClone(contentDefaults);
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("website_content").select("key, value");
  if (error || !data) return result;

  for (const row of data) {
    const key = row.key as WebsiteContentKey;
    if (!(key in contentDefs)) continue;
    const value = row.value as Record<string, unknown>;
    const current = result[key];
    for (const field of Object.keys(current)) {
      if (value[field] !== undefined) current[field] = value[field];
    }
  }
  return result;
}

function raw(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

export async function updateWebsiteContent(
  key: string,
  formData: FormData
): Promise<ContentFormState> {
  const actor = await assertCan("content.manage");
  const def = contentDefs[key as WebsiteContentKey];
  if (!def) return { ok: false, message: "Unknown content section." };

  const input: Record<string, unknown> = {};
  for (const field of def.fields) {
    if ((BOOLEAN_FIELDS[key] ?? []).includes(field.key)) {
      input[field.key] = formData.has(field.key);
    } else {
      input[field.key] = raw(formData, field.key);
    }
  }

  const parsed = def.schema.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const fieldKey = String(issue.path[0]);
      if (!errors[fieldKey]) errors[fieldKey] = issue.message;
    }
    return { ok: false, errors };
  }

  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("website_content").upsert(
      {
        key,
        title: def.label,
        value: parsed.data as unknown as Json,
        updated_by: actor.user.id,
      },
      { onConflict: "key" }
    );
    if (error) throw error;

    void writeAuditLog({
      actorId: actor.user.id,
      actorName: actor.user.email,
      action: "content.section.update",
      entityType: "website_content",
      entityId: key,
      summary: `Updated ${def.label} content`,
    });
    return { ok: true, message: `${def.label} saved. Live ${today()}.` };
  } catch (err) {
    console.error("[content] update section failed:", err);
    return { ok: false, message: "Failed to save content." };
  }
}
