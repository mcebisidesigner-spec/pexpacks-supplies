import Link from "next/link";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { listBlogPosts } from "@/lib/admin/blog";
import { setBlogPostPublishedAction, deleteBlogPostAction } from "./actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import adminStyles from "../admin.module.css";
import styles from "./blog.module.css";
import contentStyles from "../content/content.module.css";

export const metadata = {
  title: "Blog | Admin | Pexpacks",
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
      <div className={adminStyles.toolbar}>
        <div className={adminStyles.headerRow}>
          <div>
            <h1 className={adminStyles.pageTitle}>
              Blog
              <span className={adminStyles.count}>
                {posts.length} {posts.length === 1 ? "post" : "posts"}
              </span>
            </h1>
            <p className={contentStyles.subtitle}>
              Articles shown on the public Resource Hub at /blog.
            </p>
          </div>
          {canManage ? (
            <Link href="/admin/blog/new" className={adminStyles.addButton}>
              + New post
            </Link>
          ) : null}
        </div>
      </div>

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
                Write your first article to start building the Resource Hub.
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
                  <th>Title</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Published</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <div className={styles.titleCell}>
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.titleLink}
                        >
                          {post.title}
                        </Link>
                        <p className={styles.excerpt}>{post.excerpt || "—"}</p>
                      </div>
                    </td>
                    <td>
                      {post.category ? (
                        <span className={adminStyles.badge + " " + adminStyles.badgeInfo}>
                          {post.category}
                        </span>
                      ) : (
                        <span className={contentStyles.emptyNote}>—</span>
                      )}
                    </td>
                    <td>{post.author || "—"}</td>
                    <td>
                      <span className={styles.date}>{formatDate(post.created_at)}</span>
                    </td>
                    <td>
                      <span
                        className={`${adminStyles.badge} ${
                          post.published ? adminStyles.badgePaid : adminStyles.badgeMuted
                        }`}
                      >
                        {post.published ? "Live" : "Draft"}
                      </span>
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
                              confirmText={`Delete the post "${post.title}"? This cannot be undone.`}
                              busyLabel="Deleting…"
                              className={`${adminStyles.rowButton} ${adminStyles.rowButtonDelete}`}
                            />
                          </form>
                        </div>
                      ) : (
                        <span className={contentStyles.emptyNote}>View only</span>
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
