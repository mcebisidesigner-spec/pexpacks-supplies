"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/rbac";
import {
  listCmsAnnouncements,
  listCmsFaqs,
  listCmsTestimonials,
  listCmsResources,
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
  cmsAnnouncementSchema,
  cmsFaqSchema,
  cmsTestimonialSchema,
  cmsResourceSchema,
  getWebsiteContent,
  PAGE_HERO_SECTIONS,
  saveHeroEyebrow,
  type WebsiteContentKey,
} from "@/lib/admin/content";

export async function fetchCmsDataAction() {
  await requireAdmin({ permission: "content.manage" });
  const [announcements, faqs, testimonials, resources, content] =
    await Promise.all([
      listCmsAnnouncements(),
      listCmsFaqs(),
      listCmsTestimonials(),
      listCmsResources(),
      getWebsiteContent(),
    ]);
  const eyebrows: Record<string, string> = {};
  for (const section of PAGE_HERO_SECTIONS) {
    const value = content[section.key];
    eyebrows[section.key] =
      typeof value?.eyebrow === "string" && value.eyebrow ? value.eyebrow : "";
  }
  return {
    announcements,
    faqs,
    testimonials,
    resources,
    eyebrows,
  };
}

function triggerRevalidations() {
  try {
    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath("/faq");
    revalidatePath("/schools");
    revalidatePath("/track-order");
    revalidatePath("/add-your-school");
    revalidatePath("/partnership");
    revalidatePath("/admin/content");
    const reval = revalidateTag as unknown as (
      tag: string,
      options?: { expire?: number },
    ) => void;
    reval("public-cms", { expire: 0 });
    reval("cms-announcements", { expire: 0 });
    reval("cms-faqs", { expire: 0 });
    reval("cms-testimonials", { expire: 0 });
    reval("cms-resources", { expire: 0 });
  } catch (err) {
    console.warn("[cms-action] revalidation fallback:", err);
  }
}

// ----------------------------------------------------
// 1. Announcements & Eyebrows
// ----------------------------------------------------
export async function saveAnnouncementAction(
  id: string | null,
  payload: {
    badge_text: string;
    message: string;
    link_url?: string;
    link_label?: string;
    display_location: "global_top" | "hero_banner" | "schools_page";
    is_active: boolean;
  },
) {
  await requireAdmin({ permission: "content.manage" });
  const parsed = cmsAnnouncementSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "Validation failed",
    };
  }

  const res = await saveCmsAnnouncement(parsed.data, id || undefined);
  if (res.ok) triggerRevalidations();
  return res;
}

export async function deleteAnnouncementAction(id: string) {
  await requireAdmin({ permission: "content.manage" });
  const res = await deleteCmsAnnouncement(id);
  if (res.ok) triggerRevalidations();
  return res;
}

export async function toggleAnnouncementActiveAction(
  id: string,
  is_active: boolean,
) {
  await requireAdmin({ permission: "content.manage" });
  const res = await toggleCmsAnnouncementActive(id, is_active);
  if (res.ok) triggerRevalidations();
  return res;
}

export async function saveHeroEyebrowAction(key: string, eyebrow: string) {
  await requireAdmin({ permission: "content.manage" });
  const res = await saveHeroEyebrow(key as WebsiteContentKey, eyebrow);
  if (res.ok) triggerRevalidations();
  return res;
}

// ----------------------------------------------------
// 2. FAQs
// ----------------------------------------------------
export async function saveFaqAction(
  id: string | null,
  payload: {
    category: string;
    question: string;
    answer: string;
    sort_order?: number;
    is_published: boolean;
  },
) {
  await requireAdmin({ permission: "content.manage" });
  const parsed = cmsFaqSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "Validation failed",
    };
  }

  const res = await saveCmsFaq(parsed.data, id || undefined);
  if (res.ok) triggerRevalidations();
  return res;
}

export async function deleteFaqAction(id: string) {
  await requireAdmin({ permission: "content.manage" });
  const res = await deleteCmsFaq(id);
  if (res.ok) triggerRevalidations();
  return res;
}

export async function toggleFaqPublishedAction(
  id: string,
  is_published: boolean,
) {
  await requireAdmin({ permission: "content.manage" });
  const res = await toggleCmsFaqPublished(id, is_published);
  if (res.ok) triggerRevalidations();
  return res;
}

// ----------------------------------------------------
// 3. Testimonials
// ----------------------------------------------------
export async function saveTestimonialAction(
  id: string | null,
  payload: {
    author_name: string;
    author_role: string;
    quote: string;
    rating: number;
    school_name?: string;
    avatar_url?: string;
    is_featured: boolean;
    sort_order?: number;
  },
) {
  await requireAdmin({ permission: "content.manage" });
  const parsed = cmsTestimonialSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "Validation failed",
    };
  }

  const res = await saveCmsTestimonial(parsed.data, id || undefined);
  if (res.ok) triggerRevalidations();
  return res;
}

export async function deleteTestimonialAction(id: string) {
  await requireAdmin({ permission: "content.manage" });
  const res = await deleteCmsTestimonial(id);
  if (res.ok) triggerRevalidations();
  return res;
}

export async function toggleTestimonialFeaturedAction(
  id: string,
  is_featured: boolean,
) {
  await requireAdmin({ permission: "content.manage" });
  const res = await toggleCmsTestimonialFeatured(id, is_featured);
  if (res.ok) triggerRevalidations();
  return res;
}

// ----------------------------------------------------
// 4. Resources
// ----------------------------------------------------
export async function saveResourceAction(
  id: string | null,
  payload: {
    title: string;
    description?: string;
    category: string;
    file_url: string;
    file_type: string;
    file_size_label?: string;
    sort_order?: number;
    is_public: boolean;
  },
) {
  await requireAdmin({ permission: "content.manage" });
  const parsed = cmsResourceSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "Validation failed",
    };
  }

  const res = await saveCmsResource(parsed.data, id || undefined);
  if (res.ok) triggerRevalidations();
  return res;
}

export async function deleteResourceAction(id: string) {
  await requireAdmin({ permission: "content.manage" });
  const res = await deleteCmsResource(id);
  if (res.ok) triggerRevalidations();
  return res;
}

export async function toggleResourcePublicAction(
  id: string,
  is_public: boolean,
) {
  await requireAdmin({ permission: "content.manage" });
  const res = await toggleCmsResourcePublic(id, is_public);
  if (res.ok) triggerRevalidations();
  return res;
}
