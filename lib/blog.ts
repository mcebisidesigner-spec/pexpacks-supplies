import { unstable_cache } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/types";
import { blogPosts, type BlogPost } from "@/data/blog";

/**
 * Public-facing blog reader. Server components use this to render the
 * Resource Hub from the `blog_posts` table (published posts only). The static
 * `data/blog.ts` array is used only as a bootstrap: when the table has no
 * posts at all, the site keeps rendering the shipped defaults so a fresh
 * environment is never left with an empty blog.
 */

export const CMS_BLOG_TAG = "cms-blog";
export const BLOG_REVALIDATE_SECONDS = 300;
`r`n
function toContent(value: Json | null): string[] {
  return Array.isArray(value) ? value.map((line) => String(line)) : [];
}

function toPost(row: { id: string; slug: string; title: string; excerpt?: string | null; content?: Json; author?: string | null; category?: string | null; image?: string | null; created_at?: string | null }): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    content: toContent(row.content ?? null),
    date: row.created_at ? row.created_at.slice(0, 10) : "",
    author: row.author ?? "",
    category: row.category ?? "",
    image: row.image ?? "",
  };
}

async function hasAnyPosts(admin: ReturnType<typeof createSupabaseAdminClient>): Promise<boolean> {
  const { data, error } = await admin.from("blog_posts").select("id").limit(1);
  if (error) return true;
  return (data?.length ?? 0) > 0;
}

async function fetchPublishedPosts(): Promise<BlogPost[]> {
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("blog_posts")
      .select("id,slug,title,excerpt,content,author,category,image,published,created_at,updated_at")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if ((data?.length ?? 0) === 0) {
      if (!(await hasAnyPosts(admin))) return blogPosts;
      return [];
    }
    return (data ?? []).map(toPost);
  } catch (err) {
    console.error("[blog] fetch published posts failed:", err);
    return blogPosts;
  }
}

async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("blog_posts")
      .select("id,slug,title,excerpt,content,author,category,image,published,created_at,updated_at")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (error) throw error;
    if (data) return toPost(data);
    if (!(await hasAnyPosts(admin))) {
      return blogPosts.find((post) => post.slug === slug) ?? null;
    }
    return null;
  } catch (err) {
    console.error("[blog] fetch post failed:", err);
    return blogPosts.find((post) => post.slug === slug) ?? null;
  }
}

export const listBlogPosts = unstable_cache(fetchPublishedPosts, ["cms-blog-list"], {
  revalidate: BLOG_REVALIDATE_SECONDS,
  tags: [CMS_BLOG_TAG],
});

export const getBlogPost = unstable_cache(fetchPostBySlug, ["cms-blog-post"], {
  revalidate: BLOG_REVALIDATE_SECONDS,
  tags: [CMS_BLOG_TAG],
});
