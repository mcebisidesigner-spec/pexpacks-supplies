import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  cmsAnnouncementSchema,
  cmsFaqSchema,
  cmsTestimonialSchema,
  cmsResourceSchema,
} from "@/lib/admin/content";
import { CMS_TAGS } from "@/lib/cms";

const root = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("Pexpacks Content CMS Module", () => {
  it("verifies migration 00087 defines all 4 CMS tables and RLS policies", () => {
    const migration = readRepoFile(
      "supabase/migrations/00087_create_cms_content.sql",
    );
    expect(migration).toContain(
      "CREATE TABLE IF NOT EXISTS public.cms_announcements",
    );
    expect(migration).toContain("CREATE TABLE IF NOT EXISTS public.cms_faqs");
    expect(migration).toContain(
      "CREATE TABLE IF NOT EXISTS public.cms_testimonials",
    );
    expect(migration).toContain(
      "CREATE TABLE IF NOT EXISTS public.cms_resources",
    );
    expect(migration).toContain(
      "ALTER TABLE public.cms_announcements ENABLE ROW LEVEL SECURITY",
    );
    expect(migration).toContain(
      "ALTER TABLE public.cms_faqs ENABLE ROW LEVEL SECURITY",
    );
    expect(migration).toContain(
      "ALTER TABLE public.cms_testimonials ENABLE ROW LEVEL SECURITY",
    );
    expect(migration).toContain(
      "ALTER TABLE public.cms_resources ENABLE ROW LEVEL SECURITY",
    );
    expect(migration).toContain("Public read active CMS content");
    expect(migration).toContain("Public read published FAQs");
    expect(migration).toContain("Public read featured testimonials");
    expect(migration).toContain("Public read active resources");
  });

  it("validates announcement input schema correctly", () => {
    const valid = cmsAnnouncementSchema.safeParse({
      badge_text: "Pre-Orders Open",
      message: "Save up to 15% on 2027 Grade Stationery Packs",
      link_url: "/schools",
      link_label: "Find Your School",
      display_location: "global_top",
      is_active: true,
    });
    expect(valid.success).toBe(true);

    const invalid = cmsAnnouncementSchema.safeParse({
      badge_text: "",
      message: "",
      display_location: "invalid_slot",
    });
    expect(invalid.success).toBe(false);
  });

  it("validates FAQ input schema correctly", () => {
    const valid = cmsFaqSchema.safeParse({
      category: "Ordering",
      question: "How do I order my child's pack?",
      answer: "Select your school and grade.",
      sort_order: 1,
      is_published: true,
    });
    expect(valid.success).toBe(true);

    const invalid = cmsFaqSchema.safeParse({
      category: "",
      question: "",
      answer: "",
    });
    expect(invalid.success).toBe(false);
  });

  it("validates testimonial rating boundary (1 to 5)", () => {
    const valid5 = cmsTestimonialSchema.safeParse({
      author_name: "Sarah Jenkins",
      author_role: "Parent",
      quote: "Saved me so much time!",
      rating: 5,
    });
    expect(valid5.success).toBe(true);

    const invalidRating = cmsTestimonialSchema.safeParse({
      author_name: "John",
      author_role: "Parent",
      quote: "Great",
      rating: 6,
    });
    expect(invalidRating.success).toBe(false);
  });

  it("validates resource hub schema with file types", () => {
    const valid = cmsResourceSchema.safeParse({
      title: "2027 Readiness Checklist",
      category: "Parent Guides",
      file_url: "/assets/checklist.pdf",
      file_type: "PDF",
      file_size_label: "1.2 MB",
    });
    expect(valid.success).toBe(true);
  });

  it("validates article resources require slug, image, and content", () => {
    const valid = cmsResourceSchema.safeParse({
      kind: "article",
      title: "How to Pack a Stationery Kit",
      category: "Guides",
      slug: "how-to-pack-a-stationery-kit",
      image: "/images/guide.webp",
      author: "Mcebisi Mhayise",
      content: ["## Intro", "Some body text"],
    });
    expect(valid.success).toBe(true);

    const missingArticleFields = cmsResourceSchema.safeParse({
      kind: "article",
      title: "No slug",
      category: "Guides",
    });
    expect(missingArticleFields.success).toBe(false);

    const missingFileUrl = cmsResourceSchema.safeParse({
      kind: "file",
      title: "No file",
      category: "Guides",
    });
    expect(missingFileUrl.success).toBe(false);
  });

  it("ensures CMS_TAGS includes announcements and resources for revalidation", () => {
    expect(CMS_TAGS.announcements).toBe("cms-announcements");
    expect(CMS_TAGS.resources).toBe("cms-resources");
    expect(CMS_TAGS.faqs).toBe("cms-faqs");
    expect(CMS_TAGS.testimonials).toBe("cms-testimonials");
  });

  it("wires storefront FAQ and testimonial readers to public CMS RPCs", () => {
    const cms = readRepoFile("lib/cms.ts");
    expect(cms).toContain('"get_public_cms_faqs" as never');
    expect(cms).toContain('"get_public_cms_testimonials" as never');
    expect(cms).toContain('"get_public_cms_announcements" as never');
    expect(cms).toContain('"get_public_cms_resources" as never');
    expect(cms).toContain('"/blog"');
    expect(cms).toContain('"/schools"');
    expect(cms).toContain('"/partnership"');
  });

  it("links the public blog resource hub to published CMS resources", () => {
    const blogPage = readRepoFile("app/blog/page.tsx");
    const blogStyles = readRepoFile("app/blog/Blog.module.css");
    const cms = readRepoFile("lib/cms.ts");
    const blogLib = readRepoFile("lib/blog.ts");
    const actions = readRepoFile("actions/cms.ts");
    const adminContent = readRepoFile("lib/admin/content.ts");

    // Blog cards are fed by the unified Resource Hub, files by the sidebar.
    expect(blogPage).toContain("listPublicCmsFiles");
    expect(blogPage).toContain("resources.slice(0, 4)");
    expect(blogPage).toContain("href={resource.file_url}");
    expect(cms).toContain("listPublicCmsFiles");
    expect(cms).toContain("listPublicCmsArticles");
    expect(cms).toContain('kind === "article"');
    expect(blogLib).toContain("getPublicCmsResources");
    expect(blogLib).toContain('r.kind === "article"');
    expect(blogStyles).toContain(".resourceHubCard");
    expect(actions).toContain('revalidatePath("/blog")');
    expect(adminContent).toContain('revalidatePath("/blog")');
  });

  it("keeps public page H1 titles and eyebrows connected to website_content", () => {
    for (const page of [
      "app/schools/page.tsx",
      "app/faq/page.tsx",
      "app/track-order/page.tsx",
      "app/add-your-school/page.tsx",
      "app/partnership/page.tsx",
    ]) {
      const source = readRepoFile(page);
      expect(source).toContain("hero.eyebrow");
      expect(source).toContain("hero.title");
      expect(source).toContain("title={heroTitle}");
    }
  });

  it("restricts direct CMS table writes to content managers", () => {
    const migration = readRepoFile(
      "supabase/migrations/00090_harden_cms_admin_policies.sql",
    );
    expect(migration).toContain("public.has_permission('content.manage')");
    expect(migration).toContain(
      'DROP POLICY IF EXISTS "Admin full CMS access"',
    );
    expect(migration).toContain(
      'CREATE POLICY "CMS managers write announcements"',
    );
    expect(migration).toContain('CREATE POLICY "CMS managers write FAQs"');
    expect(migration).toContain(
      'CREATE POLICY "CMS managers write testimonials"',
    );
    expect(migration).toContain('CREATE POLICY "CMS managers write resources"');
  });

  it("migration 00091 adds scheduled publishing, public RPCs, and unique banner rules", () => {
    const migration = readRepoFile(
      "supabase/migrations/00091_cms_public_rpcs_and_scheduled_publishing.sql",
    );
    // scheduled publishing columns
    expect(migration).toContain("status text NOT NULL DEFAULT 'published'");
    expect(migration).toContain("published_at timestamptz");
    expect(migration).toContain("expires_at timestamptz");
    expect(migration).toContain("updated_by uuid");
    // status check constraints
    expect(migration).toContain(
      "CHECK (status IN ('draft', 'published', 'archived'))",
    );
    // public RPCs
    expect(migration).toContain("get_public_cms_announcements");
    expect(migration).toContain("get_public_cms_faqs");
    expect(migration).toContain("get_public_cms_testimonials");
    expect(migration).toContain("get_public_cms_resources");
    // content.view read policy
    expect(migration).toContain("public.has_permission('content.view')");
    // unique active banner rules
    expect(migration).toContain("idx_cms_announcements_one_active_global_top");
    expect(migration).toContain(
      "idx_cms_announcements_one_active_schools_page",
    );
    // revoke anon direct reads
    expect(migration).toContain(
      "REVOKE SELECT ON public.cms_announcements FROM anon",
    );
  });

  it("migration 00094 unifies blog articles into the resource hub", () => {
    const migration = readRepoFile(
      "supabase/migrations/00094_articles_in_resource_hub.sql",
    );
    // article-supporting columns
    expect(migration).toContain(
      "ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'file'",
    );
    expect(migration).toContain("ADD COLUMN IF NOT EXISTS slug TEXT");
    expect(migration).toContain("ADD COLUMN IF NOT EXISTS author TEXT");
    expect(migration).toContain("ADD COLUMN IF NOT EXISTS image TEXT");
    expect(migration).toContain("ADD COLUMN IF NOT EXISTS content JSONB");
    // unique article slug partial index
    expect(migration).toContain("idx_cms_resources_article_slug");
    expect(migration).toContain("WHERE kind = 'article' AND slug IS NOT NULL");
    // backfill from blog_posts
    expect(migration).toContain("FROM public.blog_posts bp");
    // rewritten public RPC exposes article fields
    expect(migration).toContain(
      "CREATE OR REPLACE FUNCTION public.get_public_cms_resources()",
    );
    expect(migration).toContain("r.slug, r.author, r.image, r.content");
  });

  it("admin CMS writes include status, published_at, and updated_by", () => {
    const adminContent = readRepoFile("lib/admin/content.ts");
    // announcements
    expect(adminContent).toContain(
      'status: parsed.data.is_active ? "published" : "draft"',
    );
    expect(adminContent).toContain("published_at: now");
    expect(adminContent).toContain("updated_by: actor.user.id");
    // FAQs
    expect(adminContent).toContain(
      'status: parsed.data.is_published ? "published" : "draft"',
    );
    // testimonials
    expect(adminContent).toContain(
      'status: parsed.data.is_featured ? "published" : "draft"',
    );
    // resources
    expect(adminContent).toContain(
      'status: parsed.data.is_public ? "published" : "draft"',
    );
  });

  it("verifies migration 00092 defines target_page and per-page get_public_cms_faqs RPC", () => {
    const migration = readRepoFile(
      "supabase/migrations/00092_cms_faqs_target_page.sql",
    );
    expect(migration).toContain("target_page text NOT NULL DEFAULT 'all'");
    expect(migration).toContain(
      "CHECK (target_page IN ('all', 'homepage', 'schools'))",
    );
    expect(migration).toContain(
      "CREATE OR REPLACE FUNCTION public.get_public_cms_faqs(p_page text DEFAULT NULL)",
    );
    expect(migration).toContain("f.target_page = p_page");
    expect(migration).toContain("f.target_page = 'all'");
  });

  it("validates FAQ target_page in schema", () => {
    const validHomepage = cmsFaqSchema.safeParse({
      category: "Ordering",
      question: "Homepage question?",
      answer: "Answer.",
      target_page: "homepage",
    });
    expect(validHomepage.success).toBe(true);
    if (validHomepage.success) {
      expect(validHomepage.data.target_page).toBe("homepage");
    }

    const validSchools = cmsFaqSchema.safeParse({
      category: "School Packs",
      question: "Schools question?",
      answer: "Answer.",
      target_page: "schools",
    });
    expect(validSchools.success).toBe(true);

    const validDefault = cmsFaqSchema.safeParse({
      category: "Payments",
      question: "Payment question?",
      answer: "Answer.",
    });
    expect(validDefault.success).toBe(true);
    if (validDefault.success) {
      expect(validDefault.data.target_page).toBe("all");
    }

    const invalidPage = cmsFaqSchema.safeParse({
      category: "Ordering",
      question: "Invalid page question?",
      answer: "Answer.",
      target_page: "invalid_page",
    });
    expect(invalidPage.success).toBe(false);

    // Assert all 7 supported target pages in schema
    const supportedPages = [
      "all",
      "homepage",
      "schools",
      "track_order",
      "happy_pay",
      "add_your_school",
      "partnership",
    ] as const;

    for (const target of supportedPages) {
      const parsed = cmsFaqSchema.safeParse({
        category: "Ordering",
        question: `Question for ${target}?`,
        answer: "Sample answer.",
        target_page: target,
      });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.target_page).toBe(target);
      }
    }
  });

  it("verifies migration 00093 expands target_page check constraint, seeds page FAQs, and configures hero_banner placement", () => {
    const migration = readRepoFile(
      "supabase/migrations/00093_cms_all_pages_faqs_and_announcements.sql",
    );
    expect(migration).toContain(
      "ALTER TABLE public.cms_faqs DROP CONSTRAINT IF EXISTS cms_faqs_target_page_check;",
    );
    expect(migration).toContain("'happy_pay'");
    expect(migration).toContain("'partnership'");
    expect(migration).toContain("'track_order'");
    expect(migration).toContain("'add_your_school'");
    expect(migration).toContain("What is Happy Pay?");
    expect(migration).toContain("Is the website and hosting really 100% free?");
    expect(migration).toContain("How do I track my order delivery?");
    expect(migration).toContain("What if my school is not listed yet?");
    expect(migration).toContain("idx_cms_announcements_one_active_hero_banner");
    expect(migration).toContain(
      "CREATE OR REPLACE FUNCTION public.get_public_cms_faqs(p_page text DEFAULT NULL)",
    );
  });

  it("ensures FAQ admin views use App Page tabs instead of category filter tabs", () => {
    const adminPage = readRepoFile("app/admin/content/page.tsx");
    const faqsTab = readRepoFile("components/admin/content/FaqsTab.tsx");

    // Ensure category filter pills are removed from FAQ tab views
    expect(adminPage).not.toContain(
      "onClick={() => setFaqCategoryFilter(cat)}",
    );
    expect(faqsTab).not.toContain("onClick={() => setSelectedCategory(cat)}");

    // Ensure App Page tabs are present with all pages
    expect(adminPage).toContain('label: "Schools Directory"');
    expect(adminPage).toContain('label: "Track Order"');
    expect(adminPage).toContain('label: "Happy Pay"');
    expect(adminPage).toContain('label: "Add Your School"');
    expect(adminPage).toContain('label: "Partnerships"');

    expect(faqsTab).toContain('label: "Schools Directory"');
    expect(faqsTab).toContain('label: "Track Order"');
    expect(faqsTab).toContain('label: "Happy Pay"');
    expect(faqsTab).toContain('label: "Add Your School"');
    expect(faqsTab).toContain('label: "Partnerships"');
  });

  it("verifies public announcement mapping from DB Content CMS and migration 00096", () => {
    const migration = readRepoFile(
      "supabase/migrations/00096_link_public_cms_announcements.sql",
    );
    expect(migration).toContain("public.get_public_cms_announcements");
    expect(migration).toContain(
      "(p_location = 'site_header' AND a.display_location IN ('global_top', 'hero_banner'))",
    );

    const layout = readRepoFile("app/layout.tsx");
    expect(layout).toContain('getActiveAnnouncement("site_header")');

    const homePage = readRepoFile("app/page.tsx");
    expect(homePage).not.toContain("heroBannerPill");
  });
});

