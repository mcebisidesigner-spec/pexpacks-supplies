"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Clock,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import styles from "./CorePagesView.module.css";

interface TaskRow {
  id: string;
  task: string;
  assignee: string;
  assigneeAvatar: "MC" | "KG" | "LM" | "WB" | "FT";
  dueDate: string;
  priority: "High" | "Medium" | "Low";
  status: "In Progress" | "Pending" | "Completed";
}

const SEED_TASKS: TaskRow[] = [
  { id: "t-1", task: "Review Grade 1-3 packs for Primrose Hill PS", assignee: "Mcebisi M.", assigneeAvatar: "MC", dueDate: "May 28, 2024", priority: "High", status: "In Progress" },
  { id: "t-2", task: "Confirm PO-11256 with Waltons", assignee: "Kwanele G.", assigneeAvatar: "KG", dueDate: "May 28, 2024", priority: "High", status: "Pending" },
  { id: "t-3", task: "Approve pricing update for Stationery", assignee: "Liam M.", assigneeAvatar: "LM", dueDate: "May 29, 2024", priority: "Medium", status: "Pending" },
  { id: "t-4", task: "Follow up on late payment - ORD-10524", assignee: "Kwanele G.", assigneeAvatar: "KG", dueDate: "May 29, 2024", priority: "Medium", status: "In Progress" },
  { id: "t-5", task: "Prepare dispatch wave for May 29", assignee: "Warehouse Team", assigneeAvatar: "WB", dueDate: "May 29, 2024", priority: "High", status: "Pending" },
  { id: "t-6", task: "Update supplier lead times", assignee: "Mcebisi M.", assigneeAvatar: "MC", dueDate: "May 30, 2024", priority: "Low", status: "Completed" },
  { id: "t-7", task: "Monthly procurement review", assignee: "Liam M.", assigneeAvatar: "LM", dueDate: "May 31, 2024", priority: "Medium", status: "Pending" },
  { id: "t-8", task: "Reconcile payments (May)", assignee: "Finance Team", assigneeAvatar: "FT", dueDate: "Jun 02, 2024", priority: "High", status: "Pending" },
];

export function TasksPageView() {
  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>Tasks</h1>
          <p className={styles.headerSubtitle}>Track tasks and get things done.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.primaryBtn}><Plus size={14} /> + New Task</button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <select className={styles.selectInput}><option>All Tasks</option></select>
          <select className={styles.selectInput}><option>Status: All</option></select>
          <select className={styles.selectInput}><option>Assignee: All</option></select>
          <select className={styles.selectInput}><option>Due: This Month</option></select>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Task</th>
                <th>Assignee</th>
                <th>Due Date</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {SEED_TASKS.map((t) => (
                <tr key={t.id} className={styles.dataRow}>
                  <td><strong style={{ color: "#ffffff" }}>{t.task}</strong></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className={styles.avatarBadge} style={{ background: t.assigneeAvatar === "MC" ? "#0d9488" : t.assigneeAvatar === "KG" ? "#d97706" : "#2563eb" }}>
                        {t.assigneeAvatar}
                      </span>
                      <span>{t.assignee}</span>
                    </div>
                  </td>
                  <td>{t.dueDate}</td>
                  <td>
                    <span style={{ color: t.priority === "High" ? "#f87171" : t.priority === "Medium" ? "#fbbf24" : "#34d399", fontWeight: 600 }}>
                      ● {t.priority}
                    </span>
                  </td>
                  <td>
                    <span className={t.status === "Completed" ? styles.badgeGreen : t.status === "In Progress" ? styles.badgeBlue : styles.badgeAmber}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.paginationFooter}>
          <span>Showing 1 to 8 of 32 tasks</span>
          <div className={styles.paginationControls}>
            <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.pageBtn}>3</button>
            <button className={styles.pageBtn}>4</button>
          </div>
        </div>
      </div>
    </div>
  );
}
