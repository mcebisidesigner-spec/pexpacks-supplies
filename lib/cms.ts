import { unstable_cache } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Testimonial } from "@/data/testimonials";
import type { FAQ } from "@/data/faqs";

/**
 * Public-facing CMS reader. Server components use this to render testimonials
 * and FAQs from Supabase instead of the static data/*.ts arrays. Results are
 * cached and invalidated via revalidateTag when the admin content module
 * writes to the same tables.
 */

export const CMS_TAGS = {
  testimonials: "cms-testimonials",
  faqs: "cms-faqs",
  websiteContent: "cms-website-content",
  announcements: "cms-announcements",
  resources: "cms-resources",
} as const;

/** Public routes that render testimonials / FAQs from the CMS. */
export const CMS_PUBLIC_PATHS = [
  "/",
  "/blog",
  "/faq",
  "/partnership",
  "/schools",
  "/track-order",
  "/add-your-school",
] as const;

export const CMS_REVALIDATE_SECONDS = 300;

export type WebsiteContentKey =
  | "homepage.hero"
  | "homepage.announcement"
  | "company_info"
  | "footer"
  | "seo_defaults"
  | "schools.hero"
  | "track-order.hero"
  | "add-your-school.hero"
  | "faq.hero"
  | "partnership.hero";

export type WebsiteContentValue = Record<
  WebsiteContentKey,
  Record<string, unknown>
>;

export const WEBSITE_CONTENT_DEFAULTS: WebsiteContentValue = {
  "homepage.hero": {
    eyebrow: "School stationery made simple",
    title: "Your school stationery list, perfectly packed.",
    lead: "Your official school stationery list, perfectly packed and delivered.",
  },
  "schools.hero": {
    eyebrow: "Pack finder",
    title: "Find your pack",
  },
  "track-order.hero": {
    eyebrow: "Track your pack",
    title: "Check your stationery pack status",
  },
  "add-your-school.hero": {
    eyebrow: "Not listed?",
    title: "Is your school not an official partner yet? Add your school now.",
  },
  "faq.hero": {
    eyebrow: "Got questions?",
    title: "Answers without the back-and-forth",
  },
  "partnership.hero": {
    eyebrow: "Partner with us",
    title: "Free school website + stationery fundraising.",
  },
  "homepage.announcement": { enabled: false, text: "" },
  company_info: {
    site_name: "Pexpacks",
    support_email: "helpme@pexpacks.co.za",
    support_phone: "0780036048",
    site_url: "https://pexpacks.co.za",
  },
  footer: {
    about_text: "",
    copyright_text: "Pexpacks (Pty) Ltd. All rights reserved.",
  },
  seo_defaults: {
    default_title: "Pexpacks | School Stationery Packs",
    default_description:
      "School stationery made simple. Find your school pack, choose your grade, and get your learner's stationery delivered.",
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function fetchTestimonials(): Promise<Testimonial[]> {
  const admin = createSupabaseAdminClient();
  const { data: cmsData, error: cmsError } = await admin
    .from("cms_testimonials")
    .select("id, author_name, author_role, quote, rating, avatar_url")
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (cmsError) {
    console.error("[cms] cms_testimonials:", cmsError);
  }

  if (cmsData && cmsData.length > 0) {
    return cmsData.map((row) => ({
      id: row.id,
      name: row.author_name,
      role: row.author_role,
      context: "",
      quote: row.quote,
      avatar: row.avatar_url ?? undefined,
      rating: row.rating,
    }));
  }

  const { data, error } = await admin
    .from("testimonials")
    .select("id, name, role, context, quote, avatar, rating")
    .eq("visible", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[cms] testimonials:", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    role: row.role,
    context: row.context ?? "",
    quote: row.quote,
    avatar: row.avatar ?? undefined,
    rating: row.rating,
  }));
}

async function fetchFaqs(): Promise<FAQ[]> {
  const admin = createSupabaseAdminClient();
  const { data: cmsData, error: cmsError } = await admin
    .from("cms_faqs")
    .select("id, category, question, answer, sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (cmsError) {
    console.error("[cms] cms_faqs:", cmsError);
  }

  if (cmsData && cmsData.length > 0) {
    return cmsData.map((row) => ({
      id: row.id,
      category: (row.category || "general") as FAQ["category"],
      question: row.question,
      answer: row.answer,
    }));
  }

  const { data, error } = await admin
    .from("faqs")
    .select("id, slug, question, answer, category, links")
    .eq("visible", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[cms] faqs:", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.slug ?? row.id,
    category: (row.category || "general") as FAQ["category"],
    question: row.question,
    answer: row.answer,
    links: Array.isArray(row.links)
      ? (row.links as { label: string; href: string }[])
      : undefined,
  }));
}

export const getTestimonials = unstable_cache(
  fetchTestimonials,
  ["cms-testimonials"],
  {
    revalidate: CMS_REVALIDATE_SECONDS,
    tags: [CMS_TAGS.testimonials],
  },
);

export const getFaqs = unstable_cache(fetchFaqs, ["cms-faqs"], {
  revalidate: CMS_REVALIDATE_SECONDS,
  tags: [CMS_TAGS.faqs],
});

async function fetchWebsiteContent(): Promise<WebsiteContentValue> {
  const result = structuredClone(
    WEBSITE_CONTENT_DEFAULTS,
  ) as WebsiteContentValue;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("website_content")
    .select("key, value");
  if (error || !data) return result;

  for (const row of data) {
    const key = row.key as WebsiteContentKey;
    if (!(key in WEBSITE_CONTENT_DEFAULTS)) continue;
    const value = row.value;
    if (!isRecord(value)) continue;
    const current = result[key];
    for (const field of Object.keys(current)) {
      if (value[field] !== undefined) current[field] = value[field];
    }
  }
  return result;
}

export const getWebsiteContent = unstable_cache(
  fetchWebsiteContent,
  ["cms-website-content"],
  {
    revalidate: CMS_REVALIDATE_SECONDS,
    tags: [CMS_TAGS.websiteContent],
  },
);

// ---------------------------------------------------------------------------
// Unified CMS Content Getters (Storefront)
// ---------------------------------------------------------------------------

export interface PublicAnnouncement {
  id: string;
  badge_text: string;
  message: string;
  link_url: string | null;
  link_label: string | null;
  display_location: "global_top" | "hero_banner" | "schools_page";
}

async function fetchActiveAnnouncement(
  location?: "global_top" | "hero_banner" | "schools_page",
): Promise<PublicAnnouncement | null> {
  const admin = createSupabaseAdminClient();
  let query = admin
    .from("cms_announcements")
    .select("id, badge_text, message, link_url, link_label, display_location")
    .eq("is_active", true);

  if (location === "schools_page") {
    query = query.eq("display_location", "schools_page");
  } else {
    query = query.in("display_location", ["global_top", "hero_banner"]);
  }

  const { data, error } = await query
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[cms] active announcement:", error);
    return null;
  }

  return data;
}

export const getActiveAnnouncement = unstable_cache(
  fetchActiveAnnouncement,
  ["cms-active-announcement"],
  {
    revalidate: CMS_REVALIDATE_SECONDS,
    tags: [CMS_TAGS.announcements],
  },
);

export interface PublicCmsFaq {
  id: string;
  category: string;
  question: string;
  answer: string;
  sort_order: number;
}

async function fetchPublishedCmsFaqs(): Promise<PublicCmsFaq[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("cms_faqs")
    .select("id, category, question, answer, sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[cms] published faqs:", error);
    return [];
  }

  return data ?? [];
}

export const getPublishedCmsFaqs = unstable_cache(
  fetchPublishedCmsFaqs,
  ["cms-published-faqs"],
  {
    revalidate: CMS_REVALIDATE_SECONDS,
    tags: [CMS_TAGS.faqs],
  },
);

export interface PublicCmsTestimonial {
  id: string;
  author_name: string;
  author_role: string;
  quote: string;
  rating: number;
  avatar_url: string | null;
  school_id: string | null;
}

async function fetchFeaturedCmsTestimonials(): Promise<PublicCmsTestimonial[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("cms_testimonials")
    .select(
      "id, author_name, author_role, quote, rating, avatar_url, school_id",
    )
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[cms] featured testimonials:", error);
    return [];
  }

  return data ?? [];
}

export const getFeaturedCmsTestimonials = unstable_cache(
  fetchFeaturedCmsTestimonials,
  ["cms-featured-testimonials"],
  {
    revalidate: CMS_REVALIDATE_SECONDS,
    tags: [CMS_TAGS.testimonials],
  },
);

export interface PublicCmsResource {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_url: string;
  file_type: string;
  file_size_label: string | null;
  download_count: number;
}

async function fetchPublicCmsResources(): Promise<PublicCmsResource[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("cms_resources")
    .select(
      "id, title, description, category, file_url, file_type, file_size_label, download_count",
    )
    .eq("is_public", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[cms] public resources:", error);
    return [];
  }

  return data ?? [];
}

export const getPublicCmsResources = unstable_cache(
  fetchPublicCmsResources,
  ["cms-public-resources"],
  {
    revalidate: CMS_REVALIDATE_SECONDS,
    tags: [CMS_TAGS.resources],
  },
);
