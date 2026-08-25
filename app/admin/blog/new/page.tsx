import { requireAdmin } from "@/lib/admin/rbac";
import { BlogForm } from "@/components/admin/blog/BlogForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import adminStyles from "../../admin.module.css";
import styles from "../../content/content.module.css";

export const metadata = {
  title: "New Post | Admin | Pexpacks",
};

export default async function NewBlogPostPage() {
  await requireAdmin({ permission: "blog.manage" });

  return (
    <div className={adminStyles.adminContainer}>
      <AdminPageHeader
        backHref="/admin/blog"
        backLabel="Back to Blog"
        title="New post"
        subtitle="Write an article for the public Resource Hub at /blog."
      />
      <div className={styles.card}>
        <BlogForm id={null} />
      </div>
    </div>
  );
}
