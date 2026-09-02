import { z } from "zod";
import { revalidatePath, revalidateTag } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/types";
import {
  getAdminUser,
  hasPermission,
  writeAuditLog,
  type PermissionKey,
  type AdminSession,
} from "@/lib/admin/rbac";
import {
  CMS_PUBLIC_PATHS,
  CMS_TAGS,
  WEBSITE_CONTENT_DEFAULTS as contentDefaults,
} from "@/lib/cms";
import {
  FAQ_CATEGORIES,
  PAGE_HERO_SECTIONS,
} from "@/lib/admin/content-constants";

export { PAGE_HERO_SECTIONS };

/**
 * Website content module: testimonials, FAQs and free-form website_content
 * sections. All mutations write through the service-role client, audit-log the
 * change and revalidate the public CMS cache tags.
 */

export type TestimonialRow =
  Database["public"]["Tables"]["testimonials"]["Row"];
export type FaqRow = Database["public"]["Tables"]["faqs"]["Row"];
export type WebsiteContentRow =
  Database["public"]["Tables"]["website_content"]["Row"];

export type CmsAnnouncementRow =
  Database["public"]["Tables"]["cms_announcements"]["Row"];
export type CmsFaqRow = Database["public"]["Tables"]["cms_faqs"]["Row"];
export type CmsTestimonialRow =
  Database["public"]["Tables"]["cms_testimonials"]["Row"];
export type CmsResourceRow =
  Database["public"]["Tables"]["cms_resources"]["Row"];

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

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

export const testimonialInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Too long"),
  role: z.string().trim().max(120, "Too long"),
  context: z.string().trim().max(120, "Too long"),
  quote: z.string().trim().min(1, "Quote is required").max(1200, "Too long"),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Rating must be 1–5")
    .max(5, "Rating must be 1–5"),
  visible: z.boolean(),
  sort_order: z.coerce.number().int().min(0, "Sort order must be 0 or more"),
});

export type TestimonialInput = z.infer<typeof testimonialInputSchema>;

export async function listTestimonials(): Promise<TestimonialRow[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("testimonials")
    .select(
      "id,name,role,context,quote,avatar,rating,visible,sort_order,updated_by,updated_at,created_at",
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[content] list testimonials failed:", error);
    return [];
  }
  return data ?? [];
}

export async function getTestimonial(
  id: string,
): Promise<TestimonialRow | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("testimonials")
    .select(
      "id,name,role,context,quote,avatar,rating,visible,sort_order,updated_by,updated_at,created_at",
    )
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
  id?: string,
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
      const { error } = await admin
        .from("testimonials")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await admin.from("testimonials").insert(payload);
      if (error) throw error;
    }
  } catch (err) {
    console.error("[content] save testimonial failed:", err);
    return { ok: false, message: "Failed to save testimonial." };
  }

  revalidateTag(CMS_TAGS.testimonials, { expire: 0 });
  for (const path of CMS_PUBLIC_PATHS) revalidatePath(path);
  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: id ? "content.testimonial.update" : "content.testimonial.create",
    entityType: "testimonial",
    entityId: id ?? null,
    summary: `${id ? "Updated" : "Created"} testimonial ${input.name}`,
  });
  return {
    ok: true,
    message: id ? "Testimonial updated." : "Testimonial created.",
  };
}

export async function setTestimonialVisible(
  id: string,
  visible: boolean,
): Promise<ContentFormState> {
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
    revalidateTag(CMS_TAGS.testimonials, { expire: 0 });
    for (const path of CMS_PUBLIC_PATHS) revalidatePath(path);
    void writeAuditLog({
      actorId: actor.user.id,
      actorName: actor.user.email,
      action: visible ? "content.testimonial.show" : "content.testimonial.hide",
      entityType: "testimonial",
      entityId: id,
      summary: `${visible ? "Showed" : "Hidden"} testimonial ${data.name}`,
    });
    return {
      ok: true,
      message: visible
        ? "Testimonial shown on the site."
        : "Testimonial hidden.",
    };
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
    revalidateTag(CMS_TAGS.testimonials, { expire: 0 });
    for (const path of CMS_PUBLIC_PATHS) revalidatePath(path);
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

export async function reorderTestimonial(
  id: string,
  direction: "up" | "down",
): Promise<ContentFormState> {
  const actor = await assertCan("content.manage");
  const rows = await listTestimonials();
  const from = rows.findIndex((row) => row.id === id);
  if (from < 0) return { ok: false, message: "Testimonial not found." };
  const to = from + (direction === "up" ? -1 : 1);
  if (to < 0 || to >= rows.length) {
    return {
      ok: false,
      message: "This item is already at the edge of the list.",
    };
  }

  const reordered = [...rows];
  const [moved] = reordered.splice(from, 1);
  reordered.splice(to, 0, moved);

  const admin = createSupabaseAdminClient();
  const updates = reordered.map((row, index) =>
    admin
      .from("testimonials")
      .update({ sort_order: index + 1, updated_by: actor.user.id })
      .eq("id", row.id),
  );
  const results = await Promise.all(updates);
  const failed = results.find((result) => result.error);
  if (failed?.error) {
    console.error("[content] reorder testimonials failed:", failed.error);
    return { ok: false, message: "Failed to reorder testimonials." };
  }

  revalidateTag(CMS_TAGS.testimonials, { expire: 0 });
  for (const path of CMS_PUBLIC_PATHS) revalidatePath(path);
  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "content.testimonial.reorder",
    entityType: "testimonial",
    entityId: id,
    summary: `Moved testimonial ${moved.name} ${direction}`,
  });
  return { ok: true, message: `Testimonial moved ${direction}.` };
}

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------

const linkItemSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Link label is required")
    .max(120, "Too long"),
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
  question: z
    .string()
    .trim()
    .min(1, "Question is required")
    .max(300, "Too long"),
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
    .select(
      "id,slug,question,answer,category,links,visible,sort_order,updated_by,updated_at,created_at",
    )
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
  const { data, error } = await admin
    .from("faqs")
    .select(
      "id,slug,question,answer,category,links,visible,sort_order,updated_by,updated_at,created_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[content] get faq failed:", error);
    return null;
  }
  return data;
}

export async function saveFaq(
  input: FaqInput,
  id?: string,
): Promise<ContentFormState> {
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
      err &&
      typeof err === "object" &&
      "message" in err &&
      String((err as { message: unknown }).message).includes("idx_faqs_slug")
        ? "A FAQ with that slug already exists."
        : "Failed to save FAQ.";
    return { ok: false, message: msg };
  }

  revalidateTag(CMS_TAGS.faqs, { expire: 0 });
  for (const path of CMS_PUBLIC_PATHS) revalidatePath(path);
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

export async function setFaqVisible(
  id: string,
  visible: boolean,
): Promise<ContentFormState> {
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
    revalidateTag(CMS_TAGS.faqs, { expire: 0 });
    for (const path of CMS_PUBLIC_PATHS) revalidatePath(path);
    void writeAuditLog({
      actorId: actor.user.id,
      actorName: actor.user.email,
      action: visible ? "content.faq.show" : "content.faq.hide",
      entityType: "faq",
      entityId: id,
      summary: `${visible ? "Showed" : "Hidden"} FAQ ${data.question}`,
    });
    return {
      ok: true,
      message: visible ? "FAQ shown on the site." : "FAQ hidden.",
    };
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
    revalidateTag(CMS_TAGS.faqs, { expire: 0 });
    for (const path of CMS_PUBLIC_PATHS) revalidatePath(path);
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

export async function reorderFaq(
  id: string,
  direction: "up" | "down",
): Promise<ContentFormState> {
  const actor = await assertCan("content.manage");
  const rows = await listFaqs();
  const from = rows.findIndex((row) => row.id === id);
  if (from < 0) return { ok: false, message: "FAQ not found." };
  const to = from + (direction === "up" ? -1 : 1);
  if (to < 0 || to >= rows.length) {
    return {
      ok: false,
      message: "This item is already at the edge of the list.",
    };
  }

  const reordered = [...rows];
  const [moved] = reordered.splice(from, 1);
  reordered.splice(to, 0, moved);

  const admin = createSupabaseAdminClient();
  const updates = reordered.map((row, index) =>
    admin
      .from("faqs")
      .update({ sort_order: index + 1, updated_by: actor.user.id })
      .eq("id", row.id),
  );
  const results = await Promise.all(updates);
  const failed = results.find((result) => result.error);
  if (failed?.error) {
    console.error("[content] reorder faqs failed:", failed.error);
    return { ok: false, message: "Failed to reorder FAQs." };
  }

  revalidateTag(CMS_TAGS.faqs, { expire: 0 });
  for (const path of CMS_PUBLIC_PATHS) revalidatePath(path);
  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "content.faq.reorder",
    entityType: "faq",
    entityId: id,
    summary: `Moved FAQ ${moved.question} ${direction}`,
  });
  return { ok: true, message: `FAQ moved ${direction}.` };
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
  "schools.hero": {
    label: "Schools page hero",
    description:
      "Eyebrow and headline shown at the top of the school pack finder.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Title", type: "text" },
    ] as ContentField[],
    schema: z.object({
      eyebrow: z
        .string()
        .trim()
        .min(1, "Eyebrow is required")
        .max(200, "Too long"),
      title: z.string().trim().min(1, "Title is required").max(300, "Too long"),
    }),
  },
  "track-order.hero": {
    label: "Track order hero",
    description:
      "Eyebrow and headline shown at the top of the track order page.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Title", type: "text" },
    ] as ContentField[],
    schema: z.object({
      eyebrow: z
        .string()
        .trim()
        .min(1, "Eyebrow is required")
        .max(200, "Too long"),
      title: z.string().trim().min(1, "Title is required").max(300, "Too long"),
    }),
  },
  "add-your-school.hero": {
    label: "Add your school hero",
    description:
      "Eyebrow and headline shown at the top of the add your school page.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Title", type: "text" },
    ] as ContentField[],
    schema: z.object({
      eyebrow: z
        .string()
        .trim()
        .min(1, "Eyebrow is required")
        .max(200, "Too long"),
      title: z.string().trim().min(1, "Title is required").max(300, "Too long"),
    }),
  },
  "faq.hero": {
    label: "FAQ page hero",
    description:
      "Eyebrow and headline shown at the top of the frequently asked questions page.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Title", type: "text" },
    ] as ContentField[],
    schema: z.object({
      eyebrow: z
        .string()
        .trim()
        .min(1, "Eyebrow is required")
        .max(200, "Too long"),
      title: z.string().trim().min(1, "Title is required").max(300, "Too long"),
    }),
  },
  "partnership.hero": {
    label: "Partnership page hero",
    description:
      "Eyebrow and headline shown at the top of the school partnership page.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Title", type: "text" },
    ] as ContentField[],
    schema: z.object({
      eyebrow: z
        .string()
        .trim()
        .min(1, "Eyebrow is required")
        .max(200, "Too long"),
      title: z.string().trim().min(1, "Title is required").max(300, "Too long"),
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
      site_name: z
        .string()
        .trim()
        .min(1, "Site name is required")
        .max(120, "Too long"),
      support_email: z
        .string()
        .trim()
        .email("Enter a valid email")
        .max(200, "Too long"),
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
    description:
      "Fallback title and description for pages that do not define their own.",
    fields: [
      { key: "default_title", label: "Default title", type: "text" },
      {
        key: "default_description",
        label: "Default description",
        type: "textarea",
      },
    ] as ContentField[],
    schema: z.object({
      default_title: z
        .string()
        .trim()
        .min(1, "Title is required")
        .max(200, "Too long"),
      default_description: z.string().trim().max(400, "Too long"),
    }),
  },
} as const;

type ContentKeyOf<T> = T extends readonly unknown[]
  ? never
  : Extract<keyof T, string>;
export type WebsiteContentKey = ContentKeyOf<typeof contentDefs>;

const BOOLEAN_FIELDS: Record<string, string[]> = {
  "homepage.announcement": ["enabled"],
};

export async function contentSections(): Promise<ContentSection[]> {
  return (Object.keys(contentDefs) as WebsiteContentKey[]).map((key) => ({
    key,
    label: contentDefs[key].label,
    description: contentDefs[key].description,
    fields: contentDefs[key].fields,
  }));
}

export async function getWebsiteContent(): Promise<
  Record<WebsiteContentKey, Record<string, unknown>>
> {
  const result = structuredClone(contentDefaults);
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("website_content")
    .select("key, value");
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
  formData: FormData,
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
      { onConflict: "key" },
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

    revalidateTag(CMS_TAGS.websiteContent, { expire: 0 });
    revalidatePath("/");
    return { ok: true, message: `${def.label} saved and live.` };
  } catch (err) {
    console.error("[content] update section failed:", err);
    return { ok: false, message: "Failed to save content." };
  }
}

/**
 * Updates only the eyebrow of one of the public page hero sections, keeping
 * the other fields (title, lead) unchanged. Reuses the full section
 * validation + upsert + audit + revalidation path.
 */
export async function saveHeroEyebrow(
  key: WebsiteContentKey,
  eyebrow: string,
): Promise<ContentFormState> {
  const def = contentDefs[key];
  if (!def || !PAGE_HERO_SECTIONS.some((section) => section.key === key)) {
    return { ok: false, message: "Unknown page." };
  }

  const current: Record<string, unknown> =
    (await getWebsiteContent())[key] ?? {};
  const formData = new FormData();
  for (const field of def.fields) {
    if (field.type === "checkbox") {
      if (current[field.key]) formData.set(field.key, "on");
    } else {
      formData.set(field.key, String(current[field.key] ?? ""));
    }
  }
  formData.set("eyebrow", eyebrow);
  return updateWebsiteContent(key, formData);
}

// ===========================================================================
// 1. Announcements & Eyebrow Banners (cms_announcements)
// ===========================================================================

export const cmsAnnouncementSchema = z.object({
  badge_text: z
    .string()
    .trim()
    .min(1, "Badge text is required")
    .max(50, "Max 50 characters"),
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(300, "Max 300 characters"),
  link_url: z
    .string()
    .trim()
    .max(500, "Max 500 characters")
    .optional()
    .nullable(),
  link_label: z
    .string()
    .trim()
    .max(50, "Max 50 characters")
    .optional()
    .nullable(),
  is_active: z.boolean().default(true),
  display_location: z
    .enum(["global_top", "hero_banner", "schools_page"])
    .default("global_top"),
});

export type CmsAnnouncementInput = z.infer<typeof cmsAnnouncementSchema>;

export async function listCmsAnnouncements(): Promise<CmsAnnouncementRow[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("cms_announcements")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[cms] list announcements failed:", error);
    return [];
  }
  return data ?? [];
}

export async function saveCmsAnnouncement(
  input: CmsAnnouncementInput,
  id?: string,
): Promise<ContentFormState> {
  const actor = await assertCan("content.manage");
  const parsed = cmsAnnouncementSchema.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const fieldKey = String(issue.path[0]);
      if (!errors[fieldKey]) errors[fieldKey] = issue.message;
    }
    return { ok: false, errors };
  }

  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const payload = {
    badge_text: parsed.data.badge_text,
    message: parsed.data.message,
    link_url: parsed.data.link_url || null,
    link_label: parsed.data.link_label || null,
    is_active: parsed.data.is_active,
    display_location: parsed.data.display_location,
    status: parsed.data.is_active ? "published" : "draft",
    published_at: now,
    updated_at: now,
    updated_by: actor.user.id,
  };

  try {
    if (id) {
      const { error } = await admin
        .from("cms_announcements")
        .update(payload as never)
        .eq("id", id);
      if (error) throw error;
      void writeAuditLog({
        actorId: actor.user.id,
        actorName: actor.user.email,
        action: "content.announcement.update",
        entityType: "cms_announcement",
        entityId: id,
        summary: `Updated announcement: "${payload.badge_text}"`,
      });
    } else {
      const { data, error } = await admin
        .from("cms_announcements")
        .insert(payload as never)
        .select("id")
        .single();
      if (error) throw error;
      void writeAuditLog({
        actorId: actor.user.id,
        actorName: actor.user.email,
        action: "content.announcement.create",
        entityType: "cms_announcement",
        entityId: data?.id,
        summary: `Created announcement: "${payload.badge_text}"`,
      });
    }

    revalidateTag(CMS_TAGS.announcements, { expire: 0 });
    revalidatePath("/");
    revalidatePath("/schools");
    revalidatePath("/admin/content");
    return { ok: true, message: "Announcement saved." };
  } catch (err) {
    console.error("[cms] save announcement failed:", err);
    return { ok: false, message: "Failed to save announcement." };
  }
}

export async function deleteCmsAnnouncement(
  id: string,
): Promise<ContentFormState> {
  const actor = await assertCan("content.manage");
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("cms_announcements").delete().eq("id", id);
  if (error) {
    console.error("[cms] delete announcement failed:", error);
    return { ok: false, message: "Failed to delete announcement." };
  }

  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "content.announcement.delete",
    entityType: "cms_announcement",
    entityId: id,
    summary: `Deleted announcement ${id}`,
  });

  revalidateTag(CMS_TAGS.announcements, { expire: 0 });
  revalidatePath("/");
  revalidatePath("/schools");
  revalidatePath("/admin/content");
  return { ok: true, message: "Announcement deleted." };
}

export async function toggleCmsAnnouncementActive(
  id: string,
  active: boolean,
): Promise<ContentFormState> {
  const actor = await assertCan("content.manage");
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("cms_announcements")
    .update({
      is_active: active,
      status: active ? "published" : "draft",
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updated_by: actor.user.id,
    } as never)
    .eq("id", id);

  if (error) {
    return { ok: false, message: "Failed to toggle status." };
  }

  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "content.announcement.toggle",
    entityType: "cms_announcement",
    entityId: id,
    summary: `${active ? "Activated" : "Deactivated"} announcement ${id}`,
  });

  revalidateTag(CMS_TAGS.announcements, { expire: 0 });
  revalidatePath("/");
  revalidatePath("/admin/content");
  return { ok: true };
}

// ===========================================================================
// 2. FAQs (cms_faqs)
// ===========================================================================

export const cmsFaqSchema = z.object({
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(60, "Max 60 characters"),
  question: z
    .string()
    .trim()
    .min(1, "Question is required")
    .max(300, "Max 300 characters"),
  answer: z
    .string()
    .trim()
    .min(1, "Answer is required")
    .max(2000, "Max 2000 characters"),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_published: z.boolean().default(true),
  target_page: z
    .enum([
      "all",
      "homepage",
      "schools",
      "track_order",
      "happy_pay",
      "add_your_school",
      "partnership",
    ])
    .default("all"),
});

export type CmsFaqInput = z.infer<typeof cmsFaqSchema>;

export async function listCmsFaqs(): Promise<CmsFaqRow[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("cms_faqs")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[cms] list faqs failed:", error);
    return [];
  }
  return (data as unknown as CmsFaqRow[]) ?? [];
}

export async function saveCmsFaq(
  input: CmsFaqInput,
  id?: string,
): Promise<ContentFormState> {
  const actor = await assertCan("content.manage");
  const parsed = cmsFaqSchema.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const fieldKey = String(issue.path[0]);
      if (!errors[fieldKey]) errors[fieldKey] = issue.message;
    }
    return { ok: false, errors };
  }

  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const payload = {
    category: parsed.data.category,
    question: parsed.data.question,
    answer: parsed.data.answer,
    sort_order: parsed.data.sort_order,
    is_published: parsed.data.is_published,
    target_page: parsed.data.target_page,
    status: parsed.data.is_published ? "published" : "draft",
    published_at: now,
    updated_at: now,
    updated_by: actor.user.id,
  };

  try {
    if (id) {
      const { error } = await admin
        .from("cms_faqs")
        .update(payload as never)
        .eq("id", id);
      if (error) throw error;
      void writeAuditLog({
        actorId: actor.user.id,
        actorName: actor.user.email,
        action: "content.faq.update",
        entityType: "cms_faq",
        entityId: id,
        summary: `Updated FAQ: "${payload.question.slice(0, 60)}"`,
      });
    } else {
      const { data, error } = await admin
        .from("cms_faqs")
        .insert(payload as never)
        .select("id")
        .single();
      if (error) throw error;
      void writeAuditLog({
        actorId: actor.user.id,
        actorName: actor.user.email,
        action: "content.faq.create",
        entityType: "cms_faq",
        entityId: data?.id,
        summary: `Created FAQ: "${payload.question.slice(0, 60)}"`,
      });
    }

    revalidateTag(CMS_TAGS.faqs, { expire: 0 });
    revalidatePath("/faq");
    revalidatePath("/admin/content");
    return { ok: true, message: "FAQ saved." };
  } catch (err) {
    console.error("[cms] save FAQ failed:", err);
    return { ok: false, message: "Failed to save FAQ." };
  }
}

export async function deleteCmsFaq(id: string): Promise<ContentFormState> {
  const actor = await assertCan("content.manage");
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("cms_faqs").delete().eq("id", id);
  if (error) {
    return { ok: false, message: "Failed to delete FAQ." };
  }

  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "content.faq.delete",
    entityType: "cms_faq",
    entityId: id,
    summary: `Deleted FAQ ${id}`,
  });

  revalidateTag(CMS_TAGS.faqs, { expire: 0 });
  revalidatePath("/faq");
  revalidatePath("/admin/content");
  return { ok: true, message: "FAQ deleted." };
}

export async function toggleCmsFaqPublished(
  id: string,
  published: boolean,
): Promise<ContentFormState> {
  const actor = await assertCan("content.manage");
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("cms_faqs")
    .update({
      is_published: published,
      status: published ? "published" : "draft",
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updated_by: actor.user.id,
    } as never)
    .eq("id", id);

  if (error) return { ok: false, message: "Failed to toggle status." };

  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "content.faq.toggle",
    entityType: "cms_faq",
    entityId: id,
    summary: `${published ? "Published" : "Unpublished"} FAQ ${id}`,
  });

  revalidateTag(CMS_TAGS.faqs, { expire: 0 });
  revalidatePath("/faq");
  revalidatePath("/admin/content");
  return { ok: true };
}

// ===========================================================================
// 3. Testimonials & Social Proof (cms_testimonials)
// ===========================================================================

export const cmsTestimonialSchema = z.object({
  author_name: z
    .string()
    .trim()
    .min(1, "Author name is required")
    .max(100, "Max 100 characters"),
  author_role: z
    .string()
    .trim()
    .min(1, "Role is required")
    .max(120, "Max 120 characters"),
  school_id: z.string().uuid().optional().nullable(),
  quote: z
    .string()
    .trim()
    .min(1, "Quote is required")
    .max(1200, "Max 1200 characters"),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  avatar_url: z.string().trim().max(500).optional().nullable(),
  is_featured: z.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).default(0),
});

export type CmsTestimonialInput = z.infer<typeof cmsTestimonialSchema>;

export async function listCmsTestimonials(): Promise<CmsTestimonialRow[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("cms_testimonials")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[cms] list testimonials failed:", error);
    return [];
  }
  return data ?? [];
}

export async function saveCmsTestimonial(
  input: CmsTestimonialInput,
  id?: string,
): Promise<ContentFormState> {
  const actor = await assertCan("content.manage");
  const parsed = cmsTestimonialSchema.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const fieldKey = String(issue.path[0]);
      if (!errors[fieldKey]) errors[fieldKey] = issue.message;
    }
    return { ok: false, errors };
  }

  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const payload = {
    author_name: parsed.data.author_name,
    author_role: parsed.data.author_role,
    school_id: parsed.data.school_id || null,
    quote: parsed.data.quote,
    rating: parsed.data.rating,
    avatar_url: parsed.data.avatar_url || null,
    is_featured: parsed.data.is_featured,
    sort_order: parsed.data.sort_order,
    status: parsed.data.is_featured ? "published" : "draft",
    published_at: now,
    updated_at: now,
    updated_by: actor.user.id,
  };

  try {
    if (id) {
      const { error } = await admin
        .from("cms_testimonials")
        .update(payload as never)
        .eq("id", id);
      if (error) throw error;
      void writeAuditLog({
        actorId: actor.user.id,
        actorName: actor.user.email,
        action: "content.testimonial.update",
        entityType: "cms_testimonial",
        entityId: id,
        summary: `Updated testimonial from ${payload.author_name}`,
      });
    } else {
      const { data, error } = await admin
        .from("cms_testimonials")
        .insert(payload as never)
        .select("id")
        .single();
      if (error) throw error;
      void writeAuditLog({
        actorId: actor.user.id,
        actorName: actor.user.email,
        action: "content.testimonial.create",
        entityType: "cms_testimonial",
        entityId: data?.id,
        summary: `Created testimonial from ${payload.author_name}`,
      });
    }

    revalidateTag(CMS_TAGS.testimonials, { expire: 0 });
    revalidatePath("/");
    revalidatePath("/admin/content");
    return { ok: true, message: "Testimonial saved." };
  } catch (err) {
    console.error("[cms] save testimonial failed:", err);
    return { ok: false, message: "Failed to save testimonial." };
  }
}

export async function deleteCmsTestimonial(
  id: string,
): Promise<ContentFormState> {
  const actor = await assertCan("content.manage");
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("cms_testimonials").delete().eq("id", id);
  if (error) {
    return { ok: false, message: "Failed to delete testimonial." };
  }

  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "content.testimonial.delete",
    entityType: "cms_testimonial",
    entityId: id,
    summary: `Deleted testimonial ${id}`,
  });

  revalidateTag(CMS_TAGS.testimonials, { expire: 0 });
  revalidatePath("/");
  revalidatePath("/admin/content");
  return { ok: true, message: "Testimonial deleted." };
}

export async function toggleCmsTestimonialFeatured(
  id: string,
  featured: boolean,
): Promise<ContentFormState> {
  const actor = await assertCan("content.manage");
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("cms_testimonials")
    .update({
      is_featured: featured,
      status: featured ? "published" : "draft",
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updated_by: actor.user.id,
    } as never)
    .eq("id", id);

  if (error) return { ok: false, message: "Failed to toggle status." };

  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "content.testimonial.toggle",
    entityType: "cms_testimonial",
    entityId: id,
    summary: `${featured ? "Featured" : "Unfeatured"} testimonial ${id}`,
  });

  revalidateTag(CMS_TAGS.testimonials, { expire: 0 });
  revalidatePath("/");
  revalidatePath("/admin/content");
  return { ok: true };
}

// ===========================================================================
// 4. Resource Hub (cms_resources)
// ===========================================================================

export const cmsResourceSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(150, "Max 150 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Max 500 characters")
    .optional()
    .nullable(),
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(60, "Max 60 characters")
    .default("Parent Guides"),
  file_url: z.string().trim().min(1, "File URL is required").max(500),
  file_type: z
    .string()
    .trim()
    .min(1, "File type is required")
    .max(10)
    .default("PDF"),
  file_size_label: z.string().trim().max(20).optional().nullable(),
  is_public: z.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).default(0),
});

export type CmsResourceInput = z.infer<typeof cmsResourceSchema>;

export async function listCmsResources(): Promise<CmsResourceRow[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("cms_resources")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[cms] list resources failed:", error);
    return [];
  }
  return data ?? [];
}

export async function saveCmsResource(
  input: CmsResourceInput,
  id?: string,
): Promise<ContentFormState> {
  const actor = await assertCan("content.manage");
  const parsed = cmsResourceSchema.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const fieldKey = String(issue.path[0]);
      if (!errors[fieldKey]) errors[fieldKey] = issue.message;
    }
    return { ok: false, errors };
  }

  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const payload = {
    title: parsed.data.title,
    description: parsed.data.description || null,
    category: parsed.data.category,
    file_url: parsed.data.file_url,
    file_type: parsed.data.file_type.toUpperCase(),
    file_size_label: parsed.data.file_size_label || null,
    is_public: parsed.data.is_public,
    sort_order: parsed.data.sort_order,
    status: parsed.data.is_public ? "published" : "draft",
    published_at: now,
    updated_at: now,
    updated_by: actor.user.id,
  };

  try {
    if (id) {
      const { error } = await admin
        .from("cms_resources")
        .update(payload as never)
        .eq("id", id);
      if (error) throw error;
      void writeAuditLog({
        actorId: actor.user.id,
        actorName: actor.user.email,
        action: "content.resource.update",
        entityType: "cms_resource",
        entityId: id,
        summary: `Updated resource: "${payload.title}"`,
      });
    } else {
      const { data, error } = await admin
        .from("cms_resources")
        .insert(payload as never)
        .select("id")
        .single();
      if (error) throw error;
      void writeAuditLog({
        actorId: actor.user.id,
        actorName: actor.user.email,
        action: "content.resource.create",
        entityType: "cms_resource",
        entityId: data?.id,
        summary: `Created resource: "${payload.title}"`,
      });
    }

    revalidateTag(CMS_TAGS.resources, { expire: 0 });
    revalidatePath("/blog");
    revalidatePath("/admin/content");
    return { ok: true, message: "Resource saved." };
  } catch (err) {
    console.error("[cms] save resource failed:", err);
    return { ok: false, message: "Failed to save resource." };
  }
}

export async function deleteCmsResource(id: string): Promise<ContentFormState> {
  const actor = await assertCan("content.manage");
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("cms_resources").delete().eq("id", id);
  if (error) {
    return { ok: false, message: "Failed to delete resource." };
  }

  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "content.resource.delete",
    entityType: "cms_resource",
    entityId: id,
    summary: `Deleted resource ${id}`,
  });

  revalidateTag(CMS_TAGS.resources, { expire: 0 });
  revalidatePath("/blog");
  revalidatePath("/admin/content");
  return { ok: true, message: "Resource deleted." };
}

export async function toggleCmsResourcePublic(
  id: string,
  isPublic: boolean,
): Promise<ContentFormState> {
  const actor = await assertCan("content.manage");
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("cms_resources")
    .update({
      is_public: isPublic,
      status: isPublic ? "published" : "draft",
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updated_by: actor.user.id,
    } as never)
    .eq("id", id);

  if (error) return { ok: false, message: "Failed to toggle status." };

  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "content.resource.toggle",
    entityType: "cms_resource",
    entityId: id,
    summary: `${isPublic ? "Published" : "Hidden"} resource ${id}`,
  });

  revalidateTag(CMS_TAGS.resources, { expire: 0 });
  revalidatePath("/blog");
  revalidatePath("/admin/content");
  return { ok: true };
}

export async function getCmsOverviewMetrics(): Promise<{
  announcementsCount: number;
  activeAnnouncementsCount: number;
  faqsCount: number;
  publishedFaqsCount: number;
  testimonialsCount: number;
  featuredTestimonialsCount: number;
  resourcesCount: number;
  publicResourcesCount: number;
}> {
  const admin = createSupabaseAdminClient();
  const [announcements, faqs, testimonials, resources] = await Promise.all([
    admin.from("cms_announcements").select("is_active"),
    admin.from("cms_faqs").select("is_published"),
    admin.from("cms_testimonials").select("is_featured"),
    admin.from("cms_resources").select("is_public"),
  ]);

  const annData = announcements.data ?? [];
  const faqData = faqs.data ?? [];
  const testData = testimonials.data ?? [];
  const resData = resources.data ?? [];

  return {
    announcementsCount: annData.length,
    activeAnnouncementsCount: annData.filter((a) => a.is_active).length,
    faqsCount: faqData.length,
    publishedFaqsCount: faqData.filter((f) => f.is_published).length,
    testimonialsCount: testData.length,
    featuredTestimonialsCount: testData.filter((t) => t.is_featured).length,
    resourcesCount: resData.length,
    publicResourcesCount: resData.filter((r) => r.is_public).length,
  };
}
