import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getBlogPost } from "@/lib/admin/blog";
import { BlogForm } from "@/components/admin/blog/BlogForm";
import adminStyles from "../../admin.module.css";
import styles from "../../content/content.module.css";

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
      <p className={styles.backRow}>
        <Link href="/admin/blog" className={styles.backLink}>
          ← Back to Blog
        </Link>
      </p>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Edit post</h1>
          <p className={styles.subtitle}>{row.title}</p>
        </div>
      </div>
      <div className={styles.card}>
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
