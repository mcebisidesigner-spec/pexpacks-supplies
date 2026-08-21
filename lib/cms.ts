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
} as const;

/** Public routes that render testimonials / FAQs from the CMS. */
export const CMS_PUBLIC_PATHS = ["/", "/faq", "/track-order", "/add-your-school"] as const;

export const CMS_REVALIDATE_SECONDS = 300;

export type WebsiteContentKey =
  | "homepage.hero"
  | "homepage.announcement"
  | "company_info"
  | "footer"
  | "seo_defaults";

export type WebsiteContentValue = Record<WebsiteContentKey, Record<string, unknown>>;

export const WEBSITE_CONTENT_DEFAULTS: WebsiteContentValue = {
  "homepage.hero": {
    eyebrow: "School stationery made simple",
    title: "Your school stationery list, perfectly packed.",
    lead: "Your official school stationery list, perfectly packed and delivered.",
  },
  "homepage.announcement": { enabled: false, text: "" },
  company_info: {
    site_name: "Pexpacks",
    support_email: "care@pexpacks.co.za",
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
    links:
      Array.isArray(row.links)
        ? (row.links as { label: string; href: string }[])
        : undefined,
  }));
}

export const getTestimonials = unstable_cache(fetchTestimonials, ["cms-testimonials"], {
  revalidate: CMS_REVALIDATE_SECONDS,
  tags: [CMS_TAGS.testimonials],
});

export const getFaqs = unstable_cache(fetchFaqs, ["cms-faqs"], {
  revalidate: CMS_REVALIDATE_SECONDS,
  tags: [CMS_TAGS.faqs],
});

async function fetchWebsiteContent(): Promise<WebsiteContentValue> {
  const result = structuredClone(WEBSITE_CONTENT_DEFAULTS) as WebsiteContentValue;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("website_content").select("key, value");
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
  }
);
