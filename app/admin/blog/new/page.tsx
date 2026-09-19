import { requireAdmin } from "@/lib/admin/rbac";
import { BlogForm } from "@/components/admin/blog/BlogForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import adminStyles from "../../adminStyles";

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
      <div className="bg-[var(--db-surface)] border border-[var(--db-border)] rounded-[var(--db-radius-card)] p-5 flex flex-col gap-3">
        <BlogForm id={null} />
      </div>
    </div>
  );
}
