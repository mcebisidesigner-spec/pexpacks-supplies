import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { listTestimonials } from "@/lib/admin/content";
import { setTestimonialVisibleAction, deleteTestimonialAction } from "../actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import adminStyles from "../../admin.module.css";
import styles from "../content.module.css";

export const metadata = {
  title: "Testimonials | Admin | Pexpacks",
};

export default async function TestimonialsPage() {
  const session = await requireAdmin({ permission: "content.view" });
  const canManage = hasPermission(session, "content.manage");
  const testimonials = await listTestimonials();

  return (
    <div className={adminStyles.adminContainer}>
      <AdminPageHeader
        title="Testimonials"
        count={testimonials.length}
        subtitle="Shown in the homepage testimonial marquee, newest first by sort order."
        actions={
          <div style={{ display: "flex", gap: "8px" }}>
            <AdminButton
              href="/admin/content"
              variant="secondary"
              icon={<ArrowLeft size={14} />}
            >
              Back to Content
            </AdminButton>
            {canManage && (
              <AdminButton
                href="/admin/content/testimonials/new"
                variant="primary"
                icon={<Plus size={14} />}
              >
                New Testimonial
              </AdminButton>
            )}
          </div>
        }
      />

      {testimonials.length === 0 ? (
        <div className={adminStyles.tableCard}>
          <div className={adminStyles.emptyStateContainer}>
            <div className={adminStyles.emptyStateInner}>
              <div className={adminStyles.emptyIconWrapper}>
                <svg viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h2 className={adminStyles.emptyStateTitle}>No testimonials yet</h2>
              <p className={adminStyles.emptyStateText}>
                Add your first testimonial to show social proof on the homepage.
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
                  <th>Author</th>
                  <th>Quote</th>
                  <th>Context / School</th>
                  <th>Sort</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {testimonials.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className={styles.authorCell}>
                        <div className={styles.authorName}>{item.name}</div>
                        {item.role ? (
                          <div className={styles.authorRole}>{item.role}</div>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <p className={styles.quoteSnippet}>“{item.quote}”</p>
                    </td>
                    <td>{item.context ?? "—"}</td>
                    <td>{item.sort_order}</td>
                    <td>
                        <StatusBadge
                          status={item.visible ? "Live" : "Hidden"}
                          showDot
                        />
                    </td>
                    <td>
                      <div className={styles.actions}>
                        {canManage ? (
                          <>
                            <Link
                              href={`/admin/content/testimonials/${item.id}`}
                              className={adminStyles.actionLink}
                            >
                              Edit
                            </Link>
                            <form
                              action={setTestimonialVisibleAction.bind(
                                null,
                                item.id,
                                !item.visible
                              )}
                            >
                              <button
                                type="submit"
                                className={`${adminStyles.rowButton} ${styles.rowButtonToggle}`}
                              >
                                {item.visible ? "Hide" : "Show"}
                              </button>
                            </form>
                            <form action={deleteTestimonialAction.bind(null, item.id)}>
                              <ConfirmButton
                                label="Delete"
                                confirmText={`Delete testimonial by ${item.name}?`}
                                busyLabel="Deleting…"
                                className={`${adminStyles.rowButton} ${adminStyles.rowButtonDelete}`}
                              />
                            </form>
                          </>
                        ) : (
                          <span className={styles.mutedAction}>View only</span>
                        )}
                      </div>
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
