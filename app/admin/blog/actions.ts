"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/rbac";
import {
  saveBlogPost,
  setBlogPostPublished,
  deleteBlogPost,
  blogPostInputSchema,
  type BlogPostFormState,
} from "@/lib/admin/blog";

function raw(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

function zodErrors(issues: z.ZodIssue[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0]);
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

/** One content block per line; keep internal blank lines, drop leading/trailing. */
function parseContentLines(value: string): string[] {
  const lines = value.split(/\r?\n/);
  let start = 0;
  let end = lines.length;
  while (start < end && lines[start].trim() === "") start++;
  while (end > start && lines[end - 1].trim() === "") end--;
  return lines.slice(start, end);
}

export async function saveBlogPostAction(
  id: string | null,
  _prev: BlogPostFormState,
  formData: FormData
): Promise<BlogPostFormState> {
  await requireAdmin({ permission: "blog.manage" });
  const parsed = blogPostInputSchema.safeParse({
    slug: raw(formData, "slug"),
    title: raw(formData, "title"),
    excerpt: raw(formData, "excerpt"),
    content: parseContentLines(raw(formData, "content")),
    author: raw(formData, "author"),
    category: raw(formData, "category"),
    image: raw(formData, "image"),
    published: formData.has("published"),
  });
  if (!parsed.success) {
    return { ok: false, errors: zodErrors(parsed.error.issues) };
  }
  const result = await saveBlogPost(parsed.data, id ?? undefined);
  if (result.ok) {
    revalidatePath("/admin/blog");
    if (id) revalidatePath(`/admin/blog/${id}`);
  }
  return result;
}

export async function setBlogPostPublishedAction(
  id: string,
  published: boolean
): Promise<void> {
  await requireAdmin({ permission: "blog.manage" });
  const result = await setBlogPostPublished(id, published);
  if (result.ok) revalidatePath("/admin/blog");
}

export async function deleteBlogPostAction(id: string): Promise<void> {
  await requireAdmin({ permission: "blog.manage" });
  const result = await deleteBlogPost(id);
  if (result.ok) revalidatePath("/admin/blog");
}
