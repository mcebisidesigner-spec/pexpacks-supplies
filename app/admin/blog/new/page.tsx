import Link from "next/link";
import { requireAdmin } from "@/lib/admin/rbac";
import { BlogForm } from "@/components/admin/blog/BlogForm";
import adminStyles from "../../admin.module.css";
import styles from "../../content/content.module.css";

export const metadata = {
  title: "New Post | Admin | Pexpacks",
};

export default async function NewBlogPostPage() {
  await requireAdmin({ permission: "blog.manage" });

  return (
    <div className={adminStyles.adminContainer}>
      <p className={styles.backRow}>
        <Link href="/admin/blog" className={styles.backLink}>
          ← Back to Blog
        </Link>
      </p>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>New post</h1>
          <p className={styles.subtitle}>
            Write an article for the public Resource Hub at /blog.
          </p>
        </div>
      </div>
      <div className={styles.card}>
        <BlogForm id={null} />
      </div>
    </div>
  );
}
