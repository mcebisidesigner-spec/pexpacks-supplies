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

type PublicCmsTestimonialRpcRow = {
  id: string;
  author_name: string;
  author_role: string;
  school_name: string | null;
  quote: string;
  rating: number | null;
  avatar_url: string | null;
};

async function fetchTestimonials(): Promise<Testimonial[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc(
    "get_public_cms_testimonials" as never,
  );

  if (error) {
    console.error("[cms] public testimonials rpc:", error);
    return [];
  }

  return ((data as unknown as PublicCmsTestimonialRpcRow[] | null) ?? []).map(
    (row) => ({
      id: row.id,
      name: row.author_name,
      role: row.author_role,
      schoolName: row.school_name ?? undefined,
      context: row.school_name ?? "",
      quote: row.quote,
      avatar: row.avatar_url ?? undefined,
      rating: row.rating ?? 5,
    }),
  );
}

type PublicCmsFaqRpcRow = {
  id: string;
  category: string | null;
  question: string;
  answer: string;
  sort_order?: number;
  target_page?: string | null;
};

async function fetchFaqs(page?: string): Promise<FAQ[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc(
    "get_public_cms_faqs" as never,
    {
      p_page: page && page !== "all" ? page : null,
    } as never,
  );

  if (error) {
    console.error("[cms] public faqs rpc:", error);
    return [];
  }

  return ((data as unknown as PublicCmsFaqRpcRow[] | null) ?? []).map(
    (row) => ({
      id: row.id,
      category: (row.category || "General") as FAQ["category"],
      question: row.question,
      answer: row.answer,
      target_page: row.target_page ?? "all",
    }),
  );
}

export const getTestimonials = unstable_cache(
  fetchTestimonials,
  ["cms-testimonials"],
  {
    revalidate: CMS_REVALIDATE_SECONDS,
    tags: [CMS_TAGS.testimonials],
  },
);

export type CmsFaqTargetPage =
  | "all"
  | "homepage"
  | "schools"
  | "track_order"
  | "happy_pay"
  | "add_your_school"
  | "partnership";

export const getFaqs = (page?: CmsFaqTargetPage | string) =>
  unstable_cache(() => fetchFaqs(page), ["cms-faqs", page || "all"], {
    revalidate: CMS_REVALIDATE_SECONDS,
    tags: [CMS_TAGS.faqs],
  })();

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

function normalizeCmsUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:")
  ) {
    return trimmed;
  }
  return `/${trimmed}`;
}

async function fetchActiveAnnouncement(
  location?: "global_top" | "hero_banner" | "schools_page" | "site_header" | string,
): Promise<PublicAnnouncement | null> {
  const admin = createSupabaseAdminClient();
  const rpcLocation = location ?? "site_header";
  const { data, error } = await admin.rpc(
    "get_public_cms_announcements" as never,
    { p_location: rpcLocation } as never,
  );

  if (!error && data) {
    const rows = (data as unknown as PublicAnnouncement[] | null) ?? [];
    if (rows.length > 0 && rows[0]) {
      const item = rows[0];
      return {
        ...item,
        link_url: normalizeCmsUrl(item.link_url),
      };
    }
  }

  if (error) {
    console.error("[cms] public announcements rpc:", error);
  }

  // Resilient fallback directly against cms_announcements table
  try {
    let query = admin
      .from("cms_announcements")
      .select("id, badge_text, message, link_url, link_label, display_location")
      .eq("is_active", true)
      .eq("status", "published");

    if (location === "schools_page") {
      query = query.eq("display_location", "schools_page");
    } else if (location === "hero_banner") {
      query = query.eq("display_location", "hero_banner");
    } else if (location === "global_top") {
      query = query.eq("display_location", "global_top");
    } else {
      // Default / site_header: accept global_top and hero_banner
      query = query.in("display_location", ["global_top", "hero_banner"]);
    }

    const { data: fallbackData } = await query
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fallbackData) {
      const item = fallbackData as unknown as PublicAnnouncement;
      return {
        ...item,
        link_url: normalizeCmsUrl(item.link_url),
      };
    }
  } catch (fallbackErr) {
    console.warn("[cms] fallback announcements query warning:", fallbackErr);
  }

  return null;
}

export const getActiveAnnouncement = (
  location?: "global_top" | "hero_banner" | "schools_page" | "site_header" | string,
) =>
  unstable_cache(
    () => fetchActiveAnnouncement(location),
    ["cms-active-announcement", location || "site_header"],
    {
      revalidate: CMS_REVALIDATE_SECONDS,
      tags: [CMS_TAGS.announcements],
    },
  )();

export interface PublicCmsFaq {
  id: string;
  category: string;
  question: string;
  answer: string;
  sort_order: number;
  target_page?: string;
}

async function fetchPublishedCmsFaqs(page?: string): Promise<PublicCmsFaq[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc(
    "get_public_cms_faqs" as never,
    {
      p_page: page && page !== "all" ? page : null,
    } as never,
  );

  if (error) {
    console.error("[cms] public faqs rpc:", error);
    return [];
  }

  return (data as unknown as PublicCmsFaq[] | null) ?? [];
}

export const getPublishedCmsFaqs = (page?: CmsFaqTargetPage | string) =>
  unstable_cache(
    () => fetchPublishedCmsFaqs(page),
    ["cms-published-faqs", page || "all"],
    {
      revalidate: CMS_REVALIDATE_SECONDS,
      tags: [CMS_TAGS.faqs],
    },
  )();

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
  const { data, error } = await admin.rpc(
    "get_public_cms_testimonials" as never,
  );

  if (error) {
    console.error("[cms] public testimonials rpc:", error);
    return [];
  }

  return (data as unknown as PublicCmsTestimonial[] | null) ?? [];
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
  kind: "file" | "article";
  title: string;
  description: string | null;
  category: string;
  file_url: string;
  file_type: string;
  file_size_label: string | null;
  download_count: number;
  slug: string | null;
  author: string | null;
  image: string | null;
  content: string[] | null;
  published_at: string | null;
  sort_order: number | null;
}

async function fetchPublicCmsResources(): Promise<PublicCmsResource[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc("get_public_cms_resources" as never);

  if (error) {
    console.error("[cms] public resources rpc:", error);
    return [];
  }

  const rows = (data as unknown as Array<Record<string, unknown>> | null) ?? [];
  return rows.map((row) => ({
    id: String(row.id),
    kind: row.kind === "article" ? "article" : "file",
    title: String(row.title ?? ""),
    description: (row.description as string | null) ?? null,
    category: String(row.category ?? ""),
    file_url: String(row.file_url ?? ""),
    file_type: String(row.file_type ?? ""),
    file_size_label: (row.file_size_label as string | null) ?? null,
    download_count: Number(row.download_count ?? 0),
    slug: (row.slug as string | null) ?? null,
    author: (row.author as string | null) ?? null,
    image: (row.image as string | null) ?? null,
    content: Array.isArray(row.content)
      ? (row.content as unknown[]).map((line) => String(line))
      : null,
    published_at: (row.published_at as string | null) ?? null,
    sort_order: row.sort_order == null ? null : Number(row.sort_order),
  }));
}

export const getPublicCmsResources = unstable_cache(
  fetchPublicCmsResources,
  ["cms-public-resources"],
  {
    revalidate: CMS_REVALIDATE_SECONDS,
    tags: [CMS_TAGS.resources],
  },
);

/** Articles (blog posts) living in the unified Resource Hub. */
export interface PublicCmsArticle extends PublicCmsResource {
  kind: "article";
  slug: string;
  title: string;
  excerpt: string;
}

export const isCmsArticle = (
  resource: PublicCmsResource,
): resource is PublicCmsArticle =>
  resource.kind === "article" && Boolean(resource.slug);

export async function listPublicCmsArticles(): Promise<PublicCmsArticle[]> {
  const resources = await getPublicCmsResources();
  return resources
    .filter(isCmsArticle)
    .map((r) => ({ ...r, excerpt: r.description ?? "" }));
}

/** Returns a single published article by slug. */
export async function getPublicCmsArticle(
  slug: string,
): Promise<PublicCmsArticle | null> {
  const articles = await listPublicCmsArticles();
  return articles.find((a) => a.slug === slug) ?? null;
}

/** Downloadable documents (kind = 'file') for the Resource Hub sidebar. */
export async function listPublicCmsFiles(): Promise<PublicCmsResource[]> {
  const resources = await getPublicCmsResources();
  return resources.filter((r) => r.kind === "file");
}
