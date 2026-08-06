import Link from "next/link";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { listFaqs } from "@/lib/admin/content";
import { setFaqVisibleAction, deleteFaqAction } from "../actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import adminStyles from "../../admin.module.css";
import styles from "../content.module.css";

export const metadata = {
  title: "FAQs | Admin | Pexpacks",
};

function linkCount(links: unknown): number {
  return Array.isArray(links) ? links.length : 0;
}

export default async function FaqsPage() {
  const session = await requireAdmin({ permission: "content.view" });
  const canManage = hasPermission(session, "content.manage");
  const faqs = await listFaqs();

  return (
    <div className={adminStyles.adminContainer}>
      <div className={styles.toolbar}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>
              FAQs
              <span className={styles.count}>
                {faqs.length} {faqs.length === 1 ? "item" : "items"}
              </span>
            </h1>
            <p className={styles.subtitle}>
              Questions shown on the FAQ page and in the site FAQ marquees.
            </p>
          </div>
          {canManage ? (
            <Link href="/admin/content/faqs/new" className={styles.addButton}>
              + New FAQ
            </Link>
          ) : null}
        </div>
        <Link href="/admin/content" className={styles.backLink}>
          ← Website content
        </Link>
      </div>

      {faqs.length === 0 ? (
        <div className={adminStyles.tableCard}>
          <div className={adminStyles.emptyStateContainer}>
            <div className={adminStyles.emptyStateInner}>
              <div className={adminStyles.emptyIconWrapper}>
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <path d="M12 17h.01" />
                </svg>
              </div>
              <h2 className={adminStyles.emptyStateTitle}>No FAQs yet</h2>
              <p className={adminStyles.emptyStateText}>
                Add your first question to start building the FAQ content.
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
                  <th>Slug</th>
                  <th>Question</th>
                  <th>Category</th>
                  <th>Links</th>
                  <th>Sort</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {faqs.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <span className={styles.slug}>{f.slug ?? "—"}</span>
                    </td>
                    <td>{f.question}</td>
                    <td>
                      <span className={adminStyles.badge + " " + adminStyles.badgeInfo}>
                        {f.category}
                      </span>
                    </td>
                    <td>
                      <div className={styles.linksList}>
                        {linkCount(f.links) > 0
                          ? `${linkCount(f.links)} link${linkCount(f.links) === 1 ? "" : "s"}`
                          : "—"}
                      </div>
                    </td>
                    <td>{f.sort_order}</td>
                    <td>
                      <span
                        className={`${adminStyles.badge} ${
                          f.visible ? adminStyles.badgePaid : adminStyles.badgeMuted
                        }`}
                      >
                        {f.visible ? "Live" : "Hidden"}
                      </span>
                    </td>
                    <td>
                      {canManage ? (
                        <div className={styles.actions}>
                          <Link
                            href={`/admin/content/faqs/${f.id}`}
                            className={styles.actionLink}
                          >
                            Edit
                          </Link>
                          <form action={setFaqVisibleAction.bind(null, f.id, !f.visible)}>
                            <button
                              type="submit"
                              className={`${styles.rowButton} ${
                                f.visible ? styles.rowButtonHide : styles.rowButtonShow
                              }`}
                            >
                              {f.visible ? "Hide" : "Show"}
                            </button>
                          </form>
                          <form action={deleteFaqAction.bind(null, f.id)}>
                            <ConfirmButton
                              label="Delete"
                              confirmText={`Delete the FAQ "${f.question}"? This cannot be undone.`}
                              busyLabel="Deleting…"
                              className={`${styles.rowButton} ${styles.rowButtonDelete}`}
                            />
                          </form>
                        </div>
                      ) : (
                        <span className={styles.emptyNote}>View only</span>
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
