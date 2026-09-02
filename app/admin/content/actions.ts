"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/rbac";
import {
  saveTestimonial,
  setTestimonialVisible,
  deleteTestimonial,
  reorderTestimonial,
  saveFaq,
  setFaqVisible,
  deleteFaq,
  reorderFaq,
  updateWebsiteContent,
  testimonialInputSchema,
  faqInputSchema,
  saveCmsAnnouncement,
  deleteCmsAnnouncement,
  toggleCmsAnnouncementActive,
  saveCmsFaq,
  deleteCmsFaq,
  toggleCmsFaqPublished,
  saveCmsTestimonial,
  deleteCmsTestimonial,
  toggleCmsTestimonialFeatured,
  saveCmsResource,
  deleteCmsResource,
  toggleCmsResourcePublic,
  type ContentFormState,
} from "@/lib/admin/content";

function raw(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; state: ContentFormState };

function zodErrors(issues: z.ZodIssue[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0]);
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

function parseTestimonial(
  formData: FormData,
): ParseResult<z.infer<typeof testimonialInputSchema>> {
  const parsed = testimonialInputSchema.safeParse({
    name: raw(formData, "name"),
    role: raw(formData, "role"),
    context: raw(formData, "context"),
    quote: raw(formData, "quote"),
    rating: raw(formData, "rating"),
    visible: formData.has("visible"),
    sort_order: raw(formData, "sort_order") || "0",
  });
  if (!parsed.success)
    return {
      ok: false,
      state: { ok: false, errors: zodErrors(parsed.error.issues) },
    };
  return { ok: true, data: parsed.data };
}

function parseFaq(
  formData: FormData,
): ParseResult<z.infer<typeof faqInputSchema>> {
  let links: { label: string; href: string }[] = [];
  const rawLinks = raw(formData, "links");
  if (rawLinks.trim()) {
    try {
      const parsed = JSON.parse(rawLinks);
      if (Array.isArray(parsed)) links = parsed;
    } catch {
      // invalid JSON handled by the schema below
    }
  }
  const parsed = faqInputSchema.safeParse({
    slug: raw(formData, "slug"),
    category: raw(formData, "category"),
    question: raw(formData, "question"),
    answer: raw(formData, "answer"),
    links,
    visible: formData.has("visible"),
    sort_order: raw(formData, "sort_order") || "0",
  });
  if (!parsed.success) {
    const errors = zodErrors(parsed.error.issues);
    if (links.length > 0 && Object.keys(errors).includes("links")) {
      errors.links = "One or more links are invalid.";
    }
    return { ok: false, state: { ok: false, errors } };
  }
  return { ok: true, data: parsed.data };
}

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

export async function saveTestimonialAction(
  id: string | null,
  _prev: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  await requireAdmin({ permission: "content.manage" });
  const parsed = parseTestimonial(formData);
  if (!parsed.ok) return parsed.state;
  const result = await saveTestimonial(parsed.data, id ?? undefined);
  if (result.ok) revalidatePath("/admin/content/testimonials");
  return result;
}

export async function setTestimonialVisibleAction(
  id: string,
  visible: boolean,
): Promise<void> {
  await requireAdmin({ permission: "content.manage" });
  const result = await setTestimonialVisible(id, visible);
  if (result.ok) revalidatePath("/admin/content/testimonials");
}

export async function deleteTestimonialAction(id: string): Promise<void> {
  await requireAdmin({ permission: "content.manage" });
  const result = await deleteTestimonial(id);
  if (result.ok) revalidatePath("/admin/content/testimonials");
}

export async function reorderTestimonialAction(
  id: string,
  direction: "up" | "down",
): Promise<void> {
  await requireAdmin({ permission: "content.manage" });
  const result = await reorderTestimonial(id, direction);
  if (result.ok) revalidatePath("/admin/content/testimonials");
}

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------

export async function saveFaqAction(
  id: string | null,
  _prev: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  await requireAdmin({ permission: "content.manage" });
  const parsed = parseFaq(formData);
  if (!parsed.ok) return parsed.state;
  const result = await saveFaq(parsed.data, id ?? undefined);
  if (result.ok) revalidatePath("/admin/content/faqs");
  return result;
}

export async function setFaqVisibleAction(
  id: string,
  visible: boolean,
): Promise<void> {
  await requireAdmin({ permission: "content.manage" });
  const result = await setFaqVisible(id, visible);
  if (result.ok) revalidatePath("/admin/content/faqs");
}

export async function deleteFaqAction(id: string): Promise<void> {
  await requireAdmin({ permission: "content.manage" });
  const result = await deleteFaq(id);
  if (result.ok) revalidatePath("/admin/content/faqs");
}

export async function reorderFaqAction(
  id: string,
  direction: "up" | "down",
): Promise<void> {
  await requireAdmin({ permission: "content.manage" });
  const result = await reorderFaq(id, direction);
  if (result.ok) revalidatePath("/admin/content/faqs");
}

// ---------------------------------------------------------------------------
// Website content sections
// ---------------------------------------------------------------------------

export async function updateWebsiteContentAction(
  key: string,
  _prev: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  await requireAdmin({ permission: "content.manage" });
  const result = await updateWebsiteContent(key, formData);
  if (result.ok) revalidatePath("/admin/content/sections");
  return result;
}

// ---------------------------------------------------------------------------
// Unified CMS Server Actions
// ---------------------------------------------------------------------------

export async function saveCmsAnnouncementAction(
  id: string | null,
  _prev: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  await requireAdmin({ permission: "content.manage" });
  const badge_text = raw(formData, "badge_text");
  const message = raw(formData, "message");
  const link_url = raw(formData, "link_url");
  const link_label = raw(formData, "link_label");
  const display_location = (raw(formData, "display_location") ||
    "global_top") as "global_top" | "hero_banner" | "schools_page";
  const is_active =
    formData.get("is_active") === "true" || formData.get("is_active") === "on";

  return saveCmsAnnouncement(
    {
      badge_text,
      message,
      link_url: link_url || null,
      link_label: link_label || null,
      display_location,
      is_active,
    },
    id ?? undefined,
  );
}

export async function deleteCmsAnnouncementAction(
  id: string,
): Promise<ContentFormState> {
  await requireAdmin({ permission: "content.manage" });
  return deleteCmsAnnouncement(id);
}

export async function toggleCmsAnnouncementActiveAction(
  id: string,
  active: boolean,
): Promise<ContentFormState> {
  await requireAdmin({ permission: "content.manage" });
  return toggleCmsAnnouncementActive(id, active);
}

export async function saveCmsFaqAction(
  id: string | null,
  _prev: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  await requireAdmin({ permission: "content.manage" });
  const category = raw(formData, "category") || "General";
  const question = raw(formData, "question");
  const answer = raw(formData, "answer");
  const sort_order = parseInt(raw(formData, "sort_order") || "0", 10);
  const is_published =
    formData.get("is_published") === "true" ||
    formData.get("is_published") === "on";
  const rawTarget = raw(formData, "target_page");
  const target_page =
    rawTarget === "homepage" || rawTarget === "schools" ? rawTarget : "all";

  return saveCmsFaq(
    {
      category,
      question,
      answer,
      sort_order: Number.isNaN(sort_order) ? 0 : sort_order,
      is_published,
      target_page,
    },
    id ?? undefined,
  );
}

export async function deleteCmsFaqAction(
  id: string,
): Promise<ContentFormState> {
  await requireAdmin({ permission: "content.manage" });
  return deleteCmsFaq(id);
}

export async function toggleCmsFaqPublishedAction(
  id: string,
  published: boolean,
): Promise<ContentFormState> {
  await requireAdmin({ permission: "content.manage" });
  return toggleCmsFaqPublished(id, published);
}

export async function saveCmsTestimonialAction(
  id: string | null,
  _prev: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  await requireAdmin({ permission: "content.manage" });
  const author_name = raw(formData, "author_name");
  const author_role = raw(formData, "author_role");
  const school_id = raw(formData, "school_id") || null;
  const quote = raw(formData, "quote");
  const rating = parseInt(raw(formData, "rating") || "5", 10);
  const avatar_url = raw(formData, "avatar_url") || null;
  const sort_order = parseInt(raw(formData, "sort_order") || "0", 10);
  const is_featured =
    formData.get("is_featured") === "true" ||
    formData.get("is_featured") === "on";

  return saveCmsTestimonial(
    {
      author_name,
      author_role,
      school_id,
      quote,
      rating: Number.isNaN(rating) ? 5 : rating,
      avatar_url,
      sort_order: Number.isNaN(sort_order) ? 0 : sort_order,
      is_featured,
    },
    id ?? undefined,
  );
}

export async function deleteCmsTestimonialAction(
  id: string,
): Promise<ContentFormState> {
  await requireAdmin({ permission: "content.manage" });
  return deleteCmsTestimonial(id);
}

export async function toggleCmsTestimonialFeaturedAction(
  id: string,
  featured: boolean,
): Promise<ContentFormState> {
  await requireAdmin({ permission: "content.manage" });
  return toggleCmsTestimonialFeatured(id, featured);
}

export async function saveCmsResourceAction(
  id: string | null,
  _prev: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  await requireAdmin({ permission: "content.manage" });
  const title = raw(formData, "title");
  const description = raw(formData, "description");
  const category = raw(formData, "category") || "Parent Guides";
  const file_url = raw(formData, "file_url");
  const file_type = raw(formData, "file_type") || "PDF";
  const file_size_label = raw(formData, "file_size_label");
  const sort_order = parseInt(raw(formData, "sort_order") || "0", 10);
  const is_public =
    formData.get("is_public") === "true" || formData.get("is_public") === "on";

  return saveCmsResource(
    {
      title,
      description: description || null,
      category,
      file_url,
      file_type,
      file_size_label: file_size_label || null,
      sort_order: Number.isNaN(sort_order) ? 0 : sort_order,
      is_public,
    },
    id ?? undefined,
  );
}

export async function deleteCmsResourceAction(
  id: string,
): Promise<ContentFormState> {
  await requireAdmin({ permission: "content.manage" });
  return deleteCmsResource(id);
}

export async function toggleCmsResourcePublicAction(
  id: string,
  isPublic: boolean,
): Promise<ContentFormState> {
  await requireAdmin({ permission: "content.manage" });
  return toggleCmsResourcePublic(id, isPublic);
}
