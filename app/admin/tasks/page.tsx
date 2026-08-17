import { ClipboardCheck } from "lucide-react";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { DateField } from "@/components/admin/DateField";
import { listOperationalTasks } from "@/lib/admin/operations";
import {
  createOperationalTaskAction,
  updateOperationalTaskStatusAction,
} from "../operations-actions";
import admin from "../admin.module.css";
import styles from "../operations.module.css";

export const dynamic = "force-dynamic";
const STATUSES = ["open", "in_progress", "blocked", "completed", "cancelled"];

export default async function TasksPage() {
  const session = await requireAdmin({ permission: "tasks.view" });
  const tasks = await listOperationalTasks();
  const open = tasks.filter((task) =>
    ["open", "in_progress"].includes(task.status),
  ).length;
  const blocked = tasks.filter((task) => task.status === "blocked").length;
  const overdue = tasks.filter(
    (task) =>
      task.due_at &&
      new Date(task.due_at) < new Date() &&
      task.status !== "completed",
  ).length;
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Operational Tasks</h1>
          <p>
            Assign and track work connected to orders, products, suppliers and
            fulfilment exceptions.
          </p>
        </div>
      </header>
      <div className={styles.kpis}>
        <div className={styles.kpi}>
          <span>Open</span>
          <strong>{open}</strong>
        </div>
        <div className={styles.kpi}>
          <span>Blocked</span>
          <strong>{blocked}</strong>
        </div>
        <div className={styles.kpi}>
          <span>Overdue</span>
          <strong>{overdue}</strong>
        </div>
        <div className={styles.kpi}>
          <span>Completed</span>
          <strong>
            {tasks.filter((task) => task.status === "completed").length}
          </strong>
        </div>
      </div>
      {hasPermission(session, "tasks.manage") ? (
        <section className={styles.formPanel}>
          <h2>Create task</h2>
          <form
            action={createOperationalTaskAction}
            className={styles.formGrid}
          >
            <input
              className={`${styles.field} ${styles.wide}`}
              name="title"
              placeholder="Task title"
              required
            />
            <select
              className={styles.field}
              name="priority"
              defaultValue="normal"
            >
              <option>low</option>
              <option>normal</option>
              <option>high</option>
              <option>urgent</option>
            </select>
            <DateField
              className={styles.field}
              name="dueAt"
              mode="datetime-local"
              ariaLabel="Task due date and time"
              placeholder="Due date and time"
            />
            <input
              className={`${styles.field} ${styles.wide}`}
              name="description"
              placeholder="Description"
            />
            <input
              className={styles.field}
              name="entityType"
              placeholder="Entity type, e.g. order"
            />
            <input
              className={styles.field}
              name="entityId"
              placeholder="Entity reference"
            />
            <button className={styles.button}>Create task</button>
          </form>
        </section>
      ) : null}
      <div className={admin.tableCard}>
        {tasks.length ? (
          <div className={admin.tableWrapper}>
            <table className={admin.table}>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Priority</th>
                  <th>Linked record</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <div className={styles.name}>{task.title}</div>
                      {task.description ? (
                        <div className={styles.muted}>{task.description}</div>
                      ) : null}
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${task.priority === "urgent" ? styles.danger : task.priority === "high" ? styles.warn : ""}`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      {task.entity_type || "-"}
                      <div className={styles.mono}>{task.entity_id || ""}</div>
                    </td>
                    <td>
                      {task.due_at
                        ? new Date(task.due_at).toLocaleString("en-ZA")
                        : "-"}
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${task.status === "completed" ? styles.good : task.status === "blocked" ? styles.danger : styles.warn}`}
                      >
                        {task.status.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td>
                      {hasPermission(session, "tasks.manage") ? (
                        <form
                          action={updateOperationalTaskStatusAction.bind(
                            null,
                            task.id,
                          )}
                          className={styles.inlineForm}
                        >
                          <select
                            className={`${styles.field} ${styles.compact}`}
                            name="status"
                            defaultValue={task.status}
                          >
                            {STATUSES.map((status) => (
                              <option key={status}>{status}</option>
                            ))}
                          </select>
                          <button className={styles.buttonSecondary}>
                            Save
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
        ) : (
          <div className={styles.empty}>
            <ClipboardCheck aria-hidden="true" />
            <p>No operational tasks have been created.</p>
          </div>
        )}
      </div>
    </div>
  );
}
