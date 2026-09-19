import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getBlogPost } from "@/lib/admin/blog";
import { BlogForm } from "@/components/admin/blog/BlogForm";
import adminStyles from "../../adminStyles";

export const metadata = {
  title: "Edit Post | Admin | Pexpacks",
};

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin({ permission: "blog.manage" });
  const { id } = await params;
  const row = await getBlogPost(id);
  if (!row) notFound();

  return (
    <div className={adminStyles.adminContainer}>
      <p className="mb-4">
        <Link href="/admin/blog" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--db-text-muted)] hover:text-white transition-colors">
          <ArrowLeft aria-hidden="true" size={14} /> Back to Blog
        </Link>
      </p>
      <div className={adminStyles.headerRow}>
        <div>
          <h1 className={adminStyles.pageTitle}>Edit post</h1>
          <p className="text-xs text-[var(--db-text-muted)] mt-1">{row.title}</p>
        </div>
      </div>
      <div className="bg-[var(--db-surface)] border border-[var(--db-border)] rounded-[var(--db-radius-card)] p-5 flex flex-col gap-3">
        <BlogForm
          id={row.id}
          defaults={{
            slug: row.slug,
            title: row.title,
            excerpt: row.excerpt ?? "",
            content: Array.isArray(row.content)
              ? (row.content as unknown[]).map(String)
              : [],
            author: row.author ?? "",
            category: row.category ?? "",
            image: row.image ?? "",
            published: row.published,
          }}
        />
      </div>
    </div>
  );
}
