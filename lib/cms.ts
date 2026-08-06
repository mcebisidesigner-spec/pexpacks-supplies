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
} as const;

export const CMS_REVALIDATE_SECONDS = 300;

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
