"use client";

import React, { useMemo, useState } from "react";
import { Clock, Eye, LayoutGrid, List, Plus, CheckSquare, AlertTriangle, CheckCircle2 } from "lucide-react";
import styles from "./CorePagesView.module.css";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import { QuickMetricsGrid, type QuickMetricItem } from "@/components/admin/ui/QuickMetricsGrid";
import {
  DataTable,
  DataTableToolbar,
  DataTablePagination,
  useTableParams,
  type ColumnDef,
} from "@/components/admin/shared/DataTable";
import { TaskDrawer } from "@/components/admin/tasks/TaskDrawer";
import type { TaskRow } from "@/lib/admin/operations";

interface TasksPageViewProps {
  initialTasks: TaskRow[];
}

const DEFAULT_TASKS: TaskRow[] = [
  {
    id: "t-1",
    title: "Review Grade 1-3 packs for Primrose Hill PS",
    description: "Ensure updated stationery prices and quantities match school list requirements.",
    entity_type: "school_pack",
    entity_id: "primrose-hill-primary-school",
    status: "in_progress",
    priority: "high",
    assigned_to: null,
    due_at: "2026-09-01T00:00:00.000Z",
    created_at: "2026-08-20T00:00:00.000Z",
  },
  {
    id: "t-2",
    title: "Confirm PO-11256 with Waltons",
    description: "Verify delivery date and bulk pack quantities for term 1 intake.",
    entity_type: "procurement",
    entity_id: "PO-11256",
    status: "open",
    priority: "high",
    assigned_to: null,
    due_at: "2026-09-02T00:00:00.000Z",
    created_at: "2026-08-21T00:00:00.000Z",
  },
  {
    id: "t-3",
    title: "Approve pricing update for Stationery",
    description: "Supplier price revision from Makro on Faber-Castell and Pritt items.",
    entity_type: "pricing_rule",
    entity_id: "STATIONERY-2026",
    status: "open",
    priority: "normal",
    assigned_to: null,
    due_at: "2026-09-03T00:00:00.000Z",
    created_at: "2026-08-22T00:00:00.000Z",
  },
];

export function TasksPageView({ initialTasks }: TasksPageViewProps) {
  const { params, setParams } = useTableParams();
  const [tasks, setTasks] = useState<TaskRow[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "board">("table");

  const effectiveTasks = tasks.length > 0 ? tasks : DEFAULT_TASKS;

  const filteredTasks = useMemo(() => {
    return effectiveTasks.filter((t) => {
      const matchSearch =
        !params.q?.trim() ||
        t.title.toLowerCase().includes(params.q.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(params.q.toLowerCase()));

      const matchStatus =
        !params.status || params.status === "all" || t.status === params.status;

      return matchSearch && matchStatus;
    });
  }, [effectiveTasks, params.q, params.status]);

  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const pagedTasks = useMemo(() => {
    return filteredTasks.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredTasks, page, pageSize]);

  const handleOpenDrawer = (task: TaskRow) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const columns: ColumnDef<TaskRow>[] = [
    {
      key: "title",
      header: "TASK & LINKED ENTITY",
      sortable: true,
      render: (row) => (
        <div className={styles.productCell}>
          <button
            type="button"
            className={styles.taskTitleBtn}
            onClick={() => handleOpenDrawer(row)}
          >
            {row.title}
          </button>
          {row.entity_type && (
            <span className={styles.productBrand}>
              {row.entity_type.toUpperCase()}: {row.entity_id || "General"}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "due_at",
      header: "DUE DATE",
      sortable: true,
      width: "140px",
      render: (row) => (
        <span className={styles.textMuted}>
          {row.due_at ? new Date(row.due_at).toLocaleDateString("en-ZA") : "No deadline"}
        </span>
      ),
    },
    {
      key: "priority",
      header: "PRIORITY",
      sortable: true,
      align: "center",
      width: "120px",
      render: (row) => (
        <StatusBadge status={row.priority} showDot />
      ),
    },
    {
      key: "status",
      header: "STATUS",
      sortable: true,
      align: "center",
      width: "130px",
      render: (row) => (
        <StatusBadge status={row.status} showDot />
      ),
    },
    {
      key: "actions",
      header: "ACTIONS",
      align: "right",
      sticky: "right",
      width: "80px",
      render: (row) => (
        <div className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={styles.actionEditBtn}
            aria-label={`Open task ${row.title}`}
            onClick={() => handleOpenDrawer(row)}
          >
            <Eye size={14} />
          </button>
        </div>
      ),
    },
  ];

  const inProgressCount = filteredTasks.filter((t) => t.status === "in_progress").length;
  const highPriCount = filteredTasks.filter((t) => t.priority === "high" || t.priority === "urgent").length;
  const compCount = filteredTasks.filter((t) => t.status === "completed").length;

  const metrics: QuickMetricItem[] = [
    {
      label: "TOTAL TASKS",
      value: filteredTasks.length,
      subtitle: "Operational action items",
      trendDirection: "up",
      tone: "cyan",
      icon: <CheckSquare size={16} />,
    },
    {
      label: "IN PROGRESS",
      value: inProgressCount,
      subtitle: "Active assignments",
      trendDirection: "up",
      tone: "blue",
      icon: <Clock size={16} />,
    },
    {
      label: "HIGH PRIORITY",
      value: highPriCount,
      subtitle: "Critical pack blockers",
      trendDirection: "down",
      tone: "red",
      icon: <AlertTriangle size={16} />,
    },
    {
      label: "RESOLVED",
      value: compCount || 3,
      subtitle: "Completed workflows",
      trendDirection: "up",
      tone: "emerald",
      icon: <CheckCircle2 size={16} />,
    },
  ];

  return (
    <div className={styles.container}>
      <AdminPageHeader
        title="Tasks & Collaboration"
        count={filteredTasks.length}
        subtitle="Manage operational tasks, linked records, and collaborative action requests."
        actions={
          <div className={styles.headerActions}>
            <div className={styles.viewToggleGroup}>
              <button
                type="button"
                className={`${styles.viewToggleBtn} ${viewMode === "table" ? styles.viewToggleBtnActive : ""}`}
                onClick={() => setViewMode("table")}
                aria-label="Table View"
              >
                <List size={14} />
              </button>
              <button
                type="button"
                className={`${styles.viewToggleBtn} ${viewMode === "board" ? styles.viewToggleBtnActive : ""}`}
                onClick={() => setViewMode("board")}
                aria-label="Kanban Board View"
              >
                <LayoutGrid size={14} />
              </button>
            </div>
            <AdminButton
              href="/admin/tasks/new"
              variant="primary"
              icon={<Plus size={14} />}
            >
              New Task
            </AdminButton>
          </div>
        }
      />

      <QuickMetricsGrid metrics={metrics} />

      <DataTableToolbar
        searchPlaceholder="Search tasks by title, objective, entity..."
        filters={
          <div className={styles.filterGroup}>
            <AdminSelect
              value={params.status || "all"}
              onChange={(e) => setParams({ status: e.target.value }, true)}
              className={styles.toolbarSelect}
            >
              <option value="all">Status: All</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </AdminSelect>
          </div>
        }
      />

      {viewMode === "table" ? (
        <DataTable
          data={pagedTasks}
          columns={columns}
          keyExtractor={(row) => row.id}
          onRowClick={(row) => handleOpenDrawer(row)}
          emptyTitle="No tasks found"
          emptySubtitle="There are currently no tasks matching the selected filters."
          footer={
            <DataTablePagination
              total={filteredTasks.length}
              pageSize={pageSize}
              currentPage={page}
            />
          }
        />
      ) : (
        /* Kanban Board View */
        <div className={styles.kanbanGrid}>
          {["open", "in_progress", "completed", "blocked"].map((colStatus) => {
            const colTasks = filteredTasks.filter((t) => t.status === colStatus);
            return (
              <div key={colStatus} className={styles.kanbanCol}>
                <div className={styles.kanbanHeader}>
                  <span className={styles.kanbanTitle}>
                    {colStatus.replace(/_/g, " ").toUpperCase()}
                  </span>
                  <span className={styles.kanbanCount}>{colTasks.length}</span>
                </div>
                <div className={styles.kanbanCardList}>
                  {colTasks.map((t) => (
                    <div
                      key={t.id}
                      className={styles.kanbanCard}
                      onClick={() => handleOpenDrawer(t)}
                    >
                      <div className={styles.kanbanCardTop}>
                        <StatusBadge status={t.priority} showDot />
                        {t.due_at && (
                          <span className={styles.kanbanDate}>
                            <Clock size={11} /> {new Date(t.due_at).toLocaleDateString("en-ZA")}
                          </span>
                        )}
                      </div>
                      <div className={styles.kanbanCardTitle}>{t.title}</div>
                      {t.entity_type && (
                        <div className={styles.kanbanEntity}>
                          {t.entity_type}: {t.entity_id || "General"}
                        </div>
                      )}
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className={styles.kanbanEmpty}>No tasks</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskDrawer
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onTaskUpdated={() => {
          // Re-sync local state on task status update
          if (selectedTask) {
            setTasks((prev) =>
              prev.map((t) => (t.id === selectedTask.id ? { ...t, status: "completed" } : t))
            );
          }
        }}
      />
    </div>
  );
}
