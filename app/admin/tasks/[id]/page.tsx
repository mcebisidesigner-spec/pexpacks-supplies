import Link from "next/link";
import { ArrowLeft, CheckSquare, Clock, MessageSquare, Paperclip, Save, UserCheck, Tag, Send, AlertTriangle } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import styles from "@/components/admin/views/CorePagesView.module.css";

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  await requireAdmin({ permission: "tasks.view" });
  const { id } = await params;

  const formattedTitle = id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

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
          <h1 className={styles.headerTitle}>
            {formattedTitle}
            <span className={styles.badgeBlue}>● In Progress</span>
          </h1>
          <p className={styles.headerSubtitle}>Task Ref: TSK-{id.slice(0, 8).toUpperCase()} • Category: Procurement</p>
        </div>
        <div className={styles.headerActions}>
          <form action="/admin/tasks" method="GET" style={{ display: "flex", gap: 8 }}>
            <select
              name="status"
              defaultValue="In Progress"
              style={{
                background: "#0c1322",
                border: "1px solid #334155",
                borderRadius: 8,
                color: "#ffffff",
                fontSize: 12,
                fontWeight: 700,
                padding: "0 12px",
                height: 36,
              }}
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Blocked">Blocked</option>
              <option value="Completed">Completed</option>
            </select>
          </form>
        </div>
      </div>

      <div className={styles.detailLayout}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Main Task Editor Card */}
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <CheckSquare size={16} style={{ color: "#2dd4bf" }} />
                <span>Task Information & Inline Description</span>
              </div>
            </div>

            <form action="/admin/tasks" method="GET" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  Task Title
                </label>
                <input
                  name="title"
                  defaultValue={formattedTitle}
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  Description & Specifications
                </label>
                <textarea
                  name="description"
                  rows={4}
                  defaultValue="Review Grade 1-3 stationery pack contents for Primrose Hill Primary. Verify manufacturer quantities, confirm Pritt glue stick 43g availability, and update line-item costs."
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "10px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" className={styles.primaryBtn} style={{ height: 34 }}>
                  <Save size={13} /> Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Contextual Activity & Threaded Comments */}
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <MessageSquare size={16} style={{ color: "#60a5fa" }} />
                <span>Activity & Threaded Comments</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className={styles.activityItem}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: "#ffffff", fontSize: 12 }}>Kwanele G.</span>
                  <span style={{ fontSize: 11, color: "#64748b" }}>Yesterday at 14:20</span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: "#cbd5e1" }}>
                  @Mcebisi M. Waltons confirmed quote for Pritt 43g glue sticks at R 19.50 per unit. Updated supplier matrix.
                </p>
              </div>

              <div className={styles.activityItem}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: "#ffffff", fontSize: 12 }}>Mcebisi M.</span>
                  <span style={{ fontSize: 11, color: "#64748b" }}>Today at 09:15</span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: "#cbd5e1" }}>
                  Thanks @Kwanele G. Approved for batch wave 064. Moving status to In Progress.
                </p>
              </div>

              {/* Add Comment Input */}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input
                  placeholder="Write a comment... (use @mention or attach file)"
                  style={{
                    flex: 1,
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 12,
                  }}
                />
                <button className={styles.secondaryBtn} style={{ padding: "0 10px" }} title="Attach file">
                  <Paperclip size={14} />
                </button>
                <button className={styles.primaryBtn} style={{ padding: "0 12px" }}>
                  <Send size={13} /> Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Controls & Audit History */}
        <div className={styles.sidebarColumn}>
          {/* Metadata Card */}
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <Tag size={16} style={{ color: "#2dd4bf" }} />
                <span>Task Metadata</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>Assignee:</span>
                <span className={styles.sidebarStatVal}>Mcebisi M.</span>
              </div>
              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>Priority:</span>
                <span style={{ color: "#f87171", fontWeight: 700 }}>High Priority</span>
              </div>
              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>Due Date:</span>
                <span className={styles.sidebarStatVal}>28 May 2024</span>
              </div>
              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>Created By:</span>
                <span className={styles.sidebarStatVal}>Liam M.</span>
              </div>
            </div>
          </div>

          {/* Audit History Log */}
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <Clock size={16} style={{ color: "#fbbf24" }} />
                <span>Audit History Timeline</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 11 }}>
              <div style={{ borderLeft: "2px solid #2dd4bf", paddingLeft: 10 }}>
                <div style={{ color: "#ffffff", fontWeight: 700 }}>Status changed to In Progress</div>
                <div style={{ color: "#64748b" }}>20 Aug 2026 09:15 • By Mcebisi M.</div>
              </div>
              <div style={{ borderLeft: "2px solid #334155", paddingLeft: 10 }}>
                <div style={{ color: "#ffffff", fontWeight: 700 }}>Priority updated to High</div>
                <div style={{ color: "#64748b" }}>19 Aug 2026 14:20 • By Kwanele G.</div>
              </div>
              <div style={{ borderLeft: "2px solid #334155", paddingLeft: 10 }}>
                <div style={{ color: "#ffffff", fontWeight: 700 }}>Task Created</div>
                <div style={{ color: "#64748b" }}>18 Aug 2026 10:00 • By Liam M.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
