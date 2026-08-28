import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { listBlogPosts } from "@/lib/admin/blog";
import { setBlogPostPublishedAction, deleteBlogPostAction } from "./actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import adminStyles from "../admin.module.css";
import styles from "./blog.module.css";
import contentStyles from "../content/content.module.css";

export const metadata = {
  title: "Blog & Resource Hub | Admin | Pexpacks",
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" });
}

export default async function BlogPage() {
  const session = await requireAdmin({ permission: "blog.view" });
  const canManage = hasPermission(session, "blog.manage");
  const posts = await listBlogPosts();

  return (
    <div className={adminStyles.adminContainer}>
      <AdminPageHeader
        title="Blog & Resource Hub"
        count={posts.length}
        subtitle="Articles and stationery buying guides published on the public Resource Hub."
        actions={
          canManage ? (
            <AdminButton
              href="/admin/blog/new"
              variant="primary"
              icon={<Plus size={14} />}
            >
              New Post
            </AdminButton>
          ) : undefined
        }
      />

      {posts.length === 0 ? (
        <div className={adminStyles.tableCard}>
          <div className={adminStyles.emptyStateContainer}>
            <div className={adminStyles.emptyStateInner}>
              <div className={adminStyles.emptyStateIconWrapper}>
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="17" rx="2" />
                  <path d="M7 4V2h10v2" />
                  <path d="M8 9h8M8 13h8M8 17h5" />
                </svg>
              </div>
              <h2 className={adminStyles.emptyStateTitle}>No blog posts yet</h2>
              <p className={adminStyles.emptyStateText}>
                Create your first article to share stationery guides and updates.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className={adminStyles.tableCard}>
          <div className={adminStyles.tableWrapper}>
            <table className={adminStyles.table}>
              <thead>
                <tr>
                  <th>Post</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <div className={styles.postCell}>
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.postTitle}
                        >
                          {post.title}
                        </Link>
                        <p className={styles.excerpt}>{post.excerpt || "—"}</p>
                      </div>
                    </td>
                    <td>
                      {post.category ? (
                        <StatusBadge status={post.category} tone="blue" />
                      ) : (
                        <span className={contentStyles.emptyNote}>—</span>
                      )}
                    </td>
                    <td>{post.author || "—"}</td>
                    <td>
                      <span className={styles.date}>{formatDate(post.created_at)}</span>
                    </td>
                    <td>
                      <StatusBadge
                        status={post.published ? "Published" : "Draft"}
                        tone={post.published ? "emerald" : "slate"}
                        showDot
                      />
                    </td>
                    <td>
                      {canManage ? (
                        <div className={contentStyles.actions}>
                          <Link
                            href={`/admin/blog/${post.id}`}
                            className={adminStyles.actionLink}
                          >
                            Edit
                          </Link>
                          <form action={setBlogPostPublishedAction.bind(null, post.id, !post.published)}>
                            <button
                              type="submit"
                              className={`${adminStyles.rowButton} ${
                                post.published
                                  ? contentStyles.rowButtonHide
                                  : contentStyles.rowButtonShow
                              }`}
                            >
                              {post.published ? "Unpublish" : "Publish"}
                            </button>
                          </form>
                          <form action={deleteBlogPostAction.bind(null, post.id)}>
                            <ConfirmButton
                              label="Delete"
                              confirmText={`Permanently delete "${post.title}"?`}
                              busyLabel="Deleting…"
                              className={`${adminStyles.rowButton} ${adminStyles.rowButtonDelete}`}
                            />
                          </form>
                        </div>
                      ) : (
                        <span className={contentStyles.mutedAction}>View only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
