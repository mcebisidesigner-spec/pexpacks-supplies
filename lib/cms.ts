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
      context: "",
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

export const getFaqs = (page?: "all" | "homepage" | "schools" | string) =>
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

async function fetchActiveAnnouncement(
  location?: "global_top" | "hero_banner" | "schools_page",
): Promise<PublicAnnouncement | null> {
  const admin = createSupabaseAdminClient();
  const rpcLocation = location ?? "site_header";
  const { data, error } = await admin.rpc(
    "get_public_cms_announcements" as never,
    { p_location: rpcLocation } as never,
  );

  if (error) {
    console.error("[cms] public announcements rpc:", error);
    return null;
  }

  const rows = (data as unknown as PublicAnnouncement[] | null) ?? [];
  return rows[0] ?? null;
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

export const getPublishedCmsFaqs = (
  page?: "all" | "homepage" | "schools" | string,
) =>
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
  const { data, error } = await admin.rpc("get_public_cms_resources" as never);

  if (error) {
    console.error("[cms] public resources rpc:", error);
    return [];
  }

  return (data as unknown as PublicCmsResource[] | null) ?? [];
}

export const getPublicCmsResources = unstable_cache(
  fetchPublicCmsResources,
  ["cms-public-resources"],
  {
    revalidate: CMS_REVALIDATE_SECONDS,
    tags: [CMS_TAGS.resources],
  },
);
