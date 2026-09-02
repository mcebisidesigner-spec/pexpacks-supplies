import { unstable_cache } from "next/cache";
import { getPublicCmsResources, type PublicCmsArticle } from "@/lib/cms";
import type { BlogPost } from "@/data/blog";

/**
 * Public-facing blog reader. Articles now live inside the unified Resource
 * Hub (cms_resources, kind = 'article') alongside downloadable files. Server
 * components use these helpers to render /blog and /blog/[slug]. The static
 * `data/blog.ts` array remains as a bootstrap fallback only — if the Resource
 * Hub has no articles at all, the shipped defaults are used so a fresh
 * environment is never left with an empty blog.
 */

export const CMS_BLOG_TAG = "cms-blog";
export const BLOG_REVALIDATE_SECONDS = 300;

function toContent(content: string[] | null | undefined): string[] {
  return Array.isArray(content) ? content.map((line) => String(line)) : [];
}

function toPost(article: PublicCmsArticle): BlogPost {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt ?? "",
    content: toContent(article.content),
    date: article.published_at ? article.published_at.slice(0, 10) : "",
    author: article.author ?? "",
    category: article.category ?? "",
    image: article.image ?? "",
  };
}

async function fetchPublishedPosts(): Promise<BlogPost[]> {
  try {
    const resources = await getPublicCmsResources();
    const articles = resources.filter(
      (r): r is PublicCmsArticle =>
        r.kind === "article" && Boolean(r.slug) && r.slug !== null,
    );

    if (articles.length === 0) {
      // Fresh environment with no articles yet -> show the shipped defaults.
      const { blogPosts } = await import("@/data/blog");
      return blogPosts;
    }

    return articles.map(toPost);
  } catch (err) {
    console.error("[blog] fetch published posts failed:", err);
    const { blogPosts } = await import("@/data/blog");
    return blogPosts;
  }
}

async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const resources = await getPublicCmsResources();
    const article = resources.find(
      (r): r is PublicCmsArticle =>
        r.kind === "article" && r.slug === slug,
    );
    if (article) return toPost(article);
    const { blogPosts } = await import("@/data/blog");
    return blogPosts.find((post) => post.slug === slug) ?? null;
  } catch (err) {
    console.error("[blog] fetch post failed:", err);
    const { blogPosts } = await import("@/data/blog");
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
