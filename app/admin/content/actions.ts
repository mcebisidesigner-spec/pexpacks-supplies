"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/rbac";
import {
  saveTestimonial,
  setTestimonialVisible,
  deleteTestimonial,
  saveFaq,
  setFaqVisible,
  deleteFaq,
  updateWebsiteContent,
  testimonialInputSchema,
  faqInputSchema,
  type ContentFormState,
} from "@/lib/admin/content";

function raw(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

type ParseResult<T> = { ok: true; data: T } | { ok: false; state: ContentFormState };

function zodErrors(issues: z.ZodIssue[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0]);
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

function parseTestimonial(formData: FormData): ParseResult<z.infer<typeof testimonialInputSchema>> {
  const parsed = testimonialInputSchema.safeParse({
    name: raw(formData, "name"),
    role: raw(formData, "role"),
    context: raw(formData, "context"),
    quote: raw(formData, "quote"),
    rating: raw(formData, "rating"),
    visible: formData.has("visible"),
    sort_order: raw(formData, "sort_order") || "0",
  });
  if (!parsed.success) return { ok: false, state: { ok: false, errors: zodErrors(parsed.error.issues) } };
  return { ok: true, data: parsed.data };
}

function parseFaq(formData: FormData): ParseResult<z.infer<typeof faqInputSchema>> {
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
  formData: FormData
): Promise<ContentFormState> {
  await requireAdmin({ permission: "content.manage" });
  const parsed = parseTestimonial(formData);
  if (!parsed.ok) return parsed.state;
  const result = await saveTestimonial(parsed.data, id ?? undefined);
  if (result.ok) revalidatePath("/admin/content/testimonials");
  return result;
}

export async function setTestimonialVisibleAction(id: string, visible: boolean): Promise<void> {
  await requireAdmin({ permission: "content.manage" });
  const result = await setTestimonialVisible(id, visible);
  if (result.ok) revalidatePath("/admin/content/testimonials");
}

export async function deleteTestimonialAction(id: string): Promise<void> {
  await requireAdmin({ permission: "content.manage" });
  const result = await deleteTestimonial(id);
  if (result.ok) revalidatePath("/admin/content/testimonials");
}

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------

export async function saveFaqAction(
  id: string | null,
  _prev: ContentFormState,
  formData: FormData
): Promise<ContentFormState> {
  await requireAdmin({ permission: "content.manage" });
  const parsed = parseFaq(formData);
  if (!parsed.ok) return parsed.state;
  const result = await saveFaq(parsed.data, id ?? undefined);
  if (result.ok) revalidatePath("/admin/content/faqs");
  return result;
}

export async function setFaqVisibleAction(id: string, visible: boolean): Promise<void> {
  await requireAdmin({ permission: "content.manage" });
  const result = await setFaqVisible(id, visible);
  if (result.ok) revalidatePath("/admin/content/faqs");
}

export async function deleteFaqAction(id: string): Promise<void> {
  await requireAdmin({ permission: "content.manage" });
  const result = await deleteFaq(id);
  if (result.ok) revalidatePath("/admin/content/faqs");
}

// ---------------------------------------------------------------------------
// Website content sections
// ---------------------------------------------------------------------------

export async function updateWebsiteContentAction(
  key: string,
  _prev: ContentFormState,
  formData: FormData
): Promise<ContentFormState> {
  await requireAdmin({ permission: "content.manage" });
  const result = await updateWebsiteContent(key, formData);
  if (result.ok) revalidatePath("/admin/content/sections");
  return result;
}
