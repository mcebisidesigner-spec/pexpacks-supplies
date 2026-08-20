import Link from "next/link";
import { ArrowLeft, Calendar, CheckSquare, Clock, Flag, Save, UserCheck, Tag } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import styles from "@/components/admin/views/CorePagesView.module.css";

export const metadata = {
  title: "New Task | Admin | Pexpacks",
};

export default async function NewTaskPage() {
  await requireAdmin({ permission: "tasks.manage" });

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <div>
        <Link
          href="/admin/tasks"
          className={styles.secondaryBtn}
          style={{
            height: 32,
            fontSize: 11,
            background: "transparent",
            border: "none",
            color: "#94a3b8",
            paddingLeft: 0,
          }}
        >
          <ArrowLeft size={14} /> Back to Tasks
        </Link>
      </div>

      {/* Header */}
      <div className={styles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>Create New Task</h1>
          <p className={styles.headerSubtitle}>
            Assign operational action items across procurement, pricing, school approval, and packing.
          </p>
        </div>
      </div>

      <form action="/admin/tasks" method="GET" className={styles.detailLayout}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Task Details */}
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <CheckSquare size={16} style={{ color: "#2dd4bf" }} />
                <span>Task Overview & Description</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  Task Title *
                </label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Confirm PO-11256 supplier delivery dates"
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "10px 14px",
                    color: "#ffffff",
                    fontSize: 14,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  Detailed Description
                </label>
                <textarea
                  name="description"
                  rows={5}
                  placeholder="Outline requirements, affected school codes, and expected deliverables..."
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "10px 14px",
                    color: "#ffffff",
                    fontSize: 13,
                    resize: "vertical",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className={styles.sidebarColumn}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <Tag size={16} style={{ color: "#60a5fa" }} />
                <span>Assignment & Priority</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  Category
                </label>
                <select
                  name="category"
                  defaultValue="Procurement"
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                  }}
                >
                  <option value="Procurement">Procurement</option>
                  <option value="Pricing">Pricing</option>
                  <option value="School Approval">School Approval</option>
                  <option value="Packing">Packing</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  Priority Level
                </label>
                <select
                  name="priority"
                  defaultValue="High"
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                  }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  Assignee
                </label>
                <select
                  name="assignee"
                  defaultValue="Kwanele G."
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                  }}
                >
                  <option value="Mcebisi M.">Mcebisi M. (Operations Manager)</option>
                  <option value="Kwanele G.">Kwanele G. (Procurement Lead)</option>
                  <option value="Liam M.">Liam M. (General Manager)</option>
                  <option value="Warehouse Team">Warehouse Packing Team</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  Due Date
                </label>
                <input
                  type="date"
                  name="due_date"
                  defaultValue="2026-08-30"
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                  }}
                />
              </div>

              <div style={{ paddingTop: 8 }}>
                <button
                  type="submit"
                  className={styles.primaryBtn}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <Save size={14} /> Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
