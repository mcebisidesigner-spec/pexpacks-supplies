import { z } from "zod";
import { revalidatePath, revalidateTag } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/types";
import {
  getAdminUser,
  hasPermission,
  writeAuditLog,
  type PermissionKey,
  type AdminSession,
} from "@/lib/admin/rbac";
import { CMS_BLOG_TAG } from "@/lib/blog";

/**
 * Blog module. Writes go through the service-role client, are audit-logged,
 * and revalidate the public Resource Hub routes so saved posts go live.
 */

export type BlogPostRow = Database["public"]["Tables"]["blog_posts"]["Row"];

export type BlogPostFormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
};

async function assertCan(permission: PermissionKey): Promise<AdminSession> {
  const session = await getAdminUser();
  if (!session || !hasPermission(session, permission)) {
    const err = new Error("You don't have permission to do that.");
    (err as Error & { status?: number }).status = 403;
    throw err;
  }
  return session;
}

export const blogPostInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only")
    .max(120, "Too long"),
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  excerpt: z.string().trim().max(400, "Excerpt is too long"),
  content: z
    .array(z.string().max(5000, "A content line is too long"))
    .min(1, "Add at least one content line")
    .max(500, "Too many content lines"),
  author: z.string().trim().max(120, "Author is too long"),
  category: z.string().trim().max(60, "Category is too long"),
  image: z.string().trim().max(500, "Image URL is too long"),
  published: z.boolean(),
});

export type BlogPostInput = z.infer<typeof blogPostInputSchema>;

export async function listBlogPosts(): Promise<BlogPostRow[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("blog_posts")
    .select("id,slug,title,excerpt,content,author,category,image,published,created_at,updated_at")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[blog] list posts failed:", error);
    return [];
  }
  return data ?? [];
}

export async function getBlogPost(id: string): Promise<BlogPostRow | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("blog_posts")
    .select("id,slug,title,excerpt,content,author,category,image,published,created_at,updated_at")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[blog] get post failed:", error);
    return null;
  }
  return data;
}

async function slugTaken(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  slug: string,
  excludeId?: string
): Promise<boolean> {
  let query = admin.from("blog_posts").select("id, title").eq("slug", slug);
  if (excludeId) query = query.neq("id", excludeId);
  const { data, error } = await query.maybeSingle();
  if (error) return false;
  return data !== null;
}

function revalidatePublicBlog(slug?: string) {
  revalidateTag(CMS_BLOG_TAG, { expire: 0 });
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function saveBlogPost(
  input: BlogPostInput,
  id?: string
): Promise<BlogPostFormState> {
  const actor = await assertCan("blog.manage");
  const admin = createSupabaseAdminClient();

  if (await slugTaken(admin, input.slug, id)) {
    return { ok: false, errors: { slug: "A post with that slug already exists." } };
  }

  const payload = {
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt || null,
    content: input.content as Json,
    author: input.author || null,
    category: input.category || null,
    image: input.image || null,
    published: input.published,
  };

  try {
    if (id) {
      const { error } = await admin.from("blog_posts").update(payload).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await admin.from("blog_posts").insert({
        ...payload,
        id: input.slug,
      });
      if (error) throw error;
    }
  } catch (err) {
    console.error("[blog] save post failed:", err);
    return { ok: false, message: "Failed to save the post." };
  }

  revalidatePublicBlog(input.slug);
  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: id ? "blog.post.update" : "blog.post.create",
    entityType: "blog_post",
    entityId: id ?? null,
    summary: `${id ? "Updated" : "Created"} blog post ${input.title}`,
  });
  return { ok: true, message: id ? "Post updated." : "Post created." };
}

export async function setBlogPostPublished(
  id: string,
  published: boolean
): Promise<BlogPostFormState> {
  const actor = await assertCan("blog.manage");
  const admin = createSupabaseAdminClient();
  try {
    const { data, error } = await admin
      .from("blog_posts")
      .update({ published })
      .eq("id", id)
      .select("slug, title")
      .maybeSingle();
    if (error) throw error;
    if (!data) return { ok: false, message: "Post not found." };

    revalidatePublicBlog(data.slug);
    void writeAuditLog({
      actorId: actor.user.id,
      actorName: actor.user.email,
      action: published ? "blog.post.publish" : "blog.post.unpublish",
      entityType: "blog_post",
      entityId: id,
      summary: `${published ? "Published" : "Unpublished"} blog post ${data.title}`,
    });
    return { ok: true, message: published ? "Post published on the site." : "Post taken offline." };
  } catch (err) {
    console.error("[blog] toggle post failed:", err);
    return { ok: false, message: "Failed to update the post." };
  }
}

export async function deleteBlogPost(id: string): Promise<BlogPostFormState> {
  const actor = await assertCan("blog.manage");
  const admin = createSupabaseAdminClient();
  try {
    const { data, error } = await admin
      .from("blog_posts")
      .delete()
      .eq("id", id)
      .select("slug, title")
      .maybeSingle();
    if (error) throw error;
    if (!data) return { ok: false, message: "Post not found." };

    revalidatePublicBlog(data.slug);
    void writeAuditLog({
      actorId: actor.user.id,
      actorName: actor.user.email,
      action: "blog.post.delete",
      entityType: "blog_post",
      entityId: id,
      summary: `Deleted blog post ${data.title}`,
    });
    return { ok: true, message: "Post deleted." };
  } catch (err) {
    console.error("[blog] delete post failed:", err);
    return { ok: false, message: "Failed to delete the post." };
  }
}
