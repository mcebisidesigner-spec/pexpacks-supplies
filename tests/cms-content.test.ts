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
    const migration = readRepoFile("supabase/migrations/00087_create_cms_content.sql");
    expect(migration).toContain("CREATE TABLE IF NOT EXISTS public.cms_announcements");
    expect(migration).toContain("CREATE TABLE IF NOT EXISTS public.cms_faqs");
    expect(migration).toContain("CREATE TABLE IF NOT EXISTS public.cms_testimonials");
    expect(migration).toContain("CREATE TABLE IF NOT EXISTS public.cms_resources");
    expect(migration).toContain("ALTER TABLE public.cms_announcements ENABLE ROW LEVEL SECURITY");
    expect(migration).toContain("ALTER TABLE public.cms_faqs ENABLE ROW LEVEL SECURITY");
    expect(migration).toContain("ALTER TABLE public.cms_testimonials ENABLE ROW LEVEL SECURITY");
    expect(migration).toContain("ALTER TABLE public.cms_resources ENABLE ROW LEVEL SECURITY");
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

  it("ensures CMS_TAGS includes announcements and resources for revalidation", () => {
    expect(CMS_TAGS.announcements).toBe("cms-announcements");
    expect(CMS_TAGS.resources).toBe("cms-resources");
    expect(CMS_TAGS.faqs).toBe("cms-faqs");
    expect(CMS_TAGS.testimonials).toBe("cms-testimonials");
  });

  it("wires storefront FAQ and testimonial readers to the unified CMS tables first", () => {
    const cms = readRepoFile("lib/cms.ts");
    expect(cms).toContain('.from("cms_faqs")');
    expect(cms).toContain('.eq("is_published", true)');
    expect(cms).toContain('.from("cms_testimonials")');
    expect(cms).toContain('.eq("is_featured", true)');
    expect(cms).toContain('"/blog"');
    expect(cms).toContain('"/schools"');
    expect(cms).toContain('"/partnership"');
  });

  it("links the public blog resource hub to published CMS resources", () => {
    const blogPage = readRepoFile("app/blog/page.tsx");
    const blogStyles = readRepoFile("app/blog/Blog.module.css");
    const actions = readRepoFile("actions/cms.ts");
    const adminContent = readRepoFile("lib/admin/content.ts");

    expect(blogPage).toContain("getPublicCmsResources");
    expect(blogPage).toContain("resources.slice(0, 4)");
    expect(blogPage).toContain("href={resource.file_url}");
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
    expect(migration).toContain('public.has_permission(''content.manage'')');
    expect(migration).toContain('DROP POLICY IF EXISTS "Admin full CMS access"');
    expect(migration).toContain('CREATE POLICY "CMS managers write announcements"');
    expect(migration).toContain('CREATE POLICY "CMS managers write FAQs"');
    expect(migration).toContain('CREATE POLICY "CMS managers write testimonials"');
    expect(migration).toContain('CREATE POLICY "CMS managers write resources"');
  });});
