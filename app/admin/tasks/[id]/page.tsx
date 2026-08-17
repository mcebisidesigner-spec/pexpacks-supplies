import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { getTask, listTaskComments } from "@/lib/admin/operations";
import {
  updateOperationalTaskStatusAction,
  createTaskCommentAction,
  deleteTaskCommentAction,
} from "../../operations-actions";
import admin from "../../admin.module.css";
import styles from "../../operations.module.css";

export const dynamic = "force-dynamic";
const STATUSES = ["open", "in_progress", "blocked", "completed", "cancelled"];

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAdmin({ permission: "tasks.view" });
  
  const task = await getTask(id);
  if (!task) notFound();
  
  const comments = await listTaskComments(id);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <Link href="/admin/tasks" className={admin.backLink}>
            <ArrowLeft aria-hidden="true" />
            <span>Back to tasks</span>
          </Link>
          <h1>{task.title}</h1>
          {task.description ? (
            <p className={styles.muted}>{task.description}</p>
          ) : null}
        </div>
      </header>

      <div className={styles.kpis}>
        <div className={styles.kpi}>
          <span>Status</span>
          <strong className={`${styles.badge} ${task.status === "completed" ? styles.good : task.status === "blocked" ? styles.danger : styles.warn}`}>
            {task.status.replaceAll("_", " ")}
          </strong>
        </div>
        <div className={styles.kpi}>
          <span>Priority</span>
          <strong className={`${styles.badge} ${task.priority === "urgent" ? styles.danger : task.priority === "high" ? styles.warn : ""}`}>
            {task.priority}
          </strong>
        </div>
        <div className={styles.kpi}>
          <span>Due</span>
          <strong>
            {task.due_at
              ? new Date(task.due_at).toLocaleString("en-ZA")
              : "Not set"}
          </strong>
        </div>
        <div className={styles.kpi}>
          <span>Linked record</span>
          <strong>
            {task.entity_type || "-"}
            {task.entity_id ? (
              <div className={styles.mono}>{task.entity_id}</div>
            ) : null}
          </strong>
        </div>
      </div>

      {hasPermission(session, "tasks.manage") ? (
        <section className={styles.formPanel}>
          <h2>Update status</h2>
          <form
            action={updateOperationalTaskStatusAction.bind(null, task.id)}
            className={styles.formGrid}
          >
            <select
              className={styles.field}
              name="status"
              defaultValue={task.status}
            >
              {STATUSES.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
            <button className={styles.button}>Save</button>
          </form>
        </section>
      ) : null}

      <section className={styles.formPanel}>
        <h2>Comments ({comments.length})</h2>
        {comments.length > 0 ? (
          <div className={admin.tableCard}>
            <div className={admin.tableWrapper}>
              <table className={admin.table}>
                <thead>
                  <tr>
                    <th>Author</th>
                    <th>Comment</th>
                    <th>Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.map((comment) => (
                    <tr key={comment.id}>
                      <td className={styles.mono}>{comment.author_id?.slice(0, 8) || "System"}</td>
                      <td>{comment.body}</td>
                      <td className={styles.muted}>
                        {new Date(comment.created_at).toLocaleString("en-ZA")}
                      </td>
                      <td>
                        {hasPermission(session, "tasks.manage") ? (
                          <form
                            action={deleteTaskCommentAction.bind(
                              null,
                              task.id,
                              comment.id,
                            )}
                            className={styles.inlineForm}
                          >
                            <button className={styles.buttonSecondary} type="submit">
                              Delete
                            </button>
                          </form>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className={styles.muted}>No comments yet.</p>
        )}

        {hasPermission(session, "tasks.manage") ? (
          <form
            action={createTaskCommentAction.bind(null, task.id)}
            className={styles.formGrid}
            style={{ marginTop: "1rem" }}
          >
            <input
              className={`${styles.field} ${styles.wide}`}
              name="body"
              placeholder="Add a comment..."
              required
            />
            <button className={styles.button}>Add comment</button>
          </form>
        ) : null}
      </section>
    </div>
  );
}
