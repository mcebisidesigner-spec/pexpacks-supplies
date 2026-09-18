"use client";

import React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTableParams } from "./useTableParams";

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  width?: string;
  sticky?: "right" | "left";
  render: (row: T, index: number) => React.ReactNode;
}

const WIDTH_CLASS: Record<string, string> = {
  "80px": "w-20 min-w-20 max-w-20",
  "90px": "w-[90px] min-w-[90px] max-w-[90px]",
  "110px": "w-[110px] min-w-[110px] max-w-[110px]",
  "120px": "w-[120px] min-w-[120px] max-w-[120px]",
  "130px": "w-[130px] min-w-[130px] max-w-[130px]",
  "140px": "w-[140px] min-w-[140px] max-w-[140px]",
  "150px": "w-[150px] min-w-[150px] max-w-[150px]",
  "160px": "w-40 min-w-40 max-w-40",
};

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
  footer?: React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  isLoading = false,
  emptyTitle = "No records found",
  emptySubtitle = "Try adjusting your search query or filters.",
  footer,
  className,
}: DataTableProps<T>) {
  const { params, setParams } = useTableParams();

  const handleSort = (columnKey: string, isSortable?: boolean) => {
    if (!isSortable) return;
    if (params.sort === columnKey) {
      if (params.order === "asc") {
        setParams({ sort: columnKey, order: "desc" });
      } else {
        setParams({ sort: undefined, order: undefined });
      }
    } else {
      setParams({ sort: columnKey, order: "asc" });
    }
  };

  return (
    <div
      className={cn(
        "bg-[var(--db-surface)] border border-[var(--db-border)] rounded-xl overflow-hidden flex flex-col shadow-sm",
        className,
      )}
    >
      <div className="w-full overflow-auto max-h-[70vh] relative">
        <table className="w-full border-collapse border-spacing-0 text-left text-[13px]">
          <thead className="sticky top-0 z-10">
            <tr>
              {columns.map((col) => {
                const isCurrentSort = params.sort === col.key;
                const alignClass =
                  col.align === "center"
                    ? "text-center"
                    : col.align === "right"
                      ? "text-right"
                      : "text-left";
                const widthClass = col.width
                  ? WIDTH_CLASS[col.width] || `w-[${col.width}]`
                  : undefined;
                const stickyClass =
                  col.sticky === "right"
                    ? "sticky right-0 bg-[var(--db-surface-elevated,#0f172a)] shadow-[-12px_0_12px_-4px_rgba(0,0,0,0.5)] z-20"
                    : col.sticky === "left"
                      ? "sticky left-0 bg-[var(--db-surface-elevated,#0f172a)] shadow-[12px_0_12px_-4px_rgba(0,0,0,0.5)] z-20"
                      : undefined;

                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn(
                      "bg-[var(--db-surface-elevated,#0f172a)] border-b border-[var(--db-border)] px-4.5 py-3.5 text-xs font-bold text-emerald-500 uppercase tracking-wider whitespace-nowrap select-none",
                      alignClass,
                      widthClass,
                      stickyClass,
                      col.sortable &&
                        "cursor-pointer transition-colors hover:text-emerald-400",
                    )}
                    onClick={() => handleSort(col.key, col.sortable)}
                  >
                    <div className="inline-flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="inline-flex items-center text-emerald-500">
                          {isCurrentSort ? (
                            params.order === "asc" ? (
                              <ArrowUp size={13} />
                            ) : (
                              <ArrowDown size={13} />
                            )
                          ) : (
                            <ArrowUpDown
                              size={12}
                              className="text-emerald-500/70"
                            />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="p-12 flex flex-col items-center justify-center gap-3 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-r-transparent rounded-full animate-spin" />
                    <span>Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="p-12 flex flex-col items-center justify-center gap-3 text-center text-slate-400">
                    <Inbox size={32} />
                    <div className="text-base font-bold text-slate-200">
                      {emptyTitle}
                    </div>
                    <div className="text-xs text-slate-400">
                      {emptySubtitle}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => {
                const rowKey = keyExtractor(row);
                return (
                  <tr
                    key={rowKey}
                    className={cn(
                      "border-b border-[var(--db-border-muted)] transition-colors hover:bg-[var(--db-surface-hover)]",
                      Boolean(onRowClick) && "cursor-pointer",
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col) => {
                      const alignClass =
                        col.align === "center"
                          ? "text-center"
                          : col.align === "right"
                            ? "text-right"
                            : "text-left";
                      const widthClass = col.width
                        ? WIDTH_CLASS[col.width] || `w-[${col.width}]`
                        : undefined;
                      const stickyClass =
                        col.sticky === "right"
                          ? "sticky right-0 bg-[var(--db-surface)] shadow-[-12px_0_12px_-4px_rgba(0,0,0,0.5)] z-10"
                          : col.sticky === "left"
                            ? "sticky left-0 bg-[var(--db-surface)] shadow-[12px_0_12px_-4px_rgba(0,0,0,0.5)] z-10"
                            : undefined;

                      return (
                        <td
                          key={col.key}
                          className={cn(
                            "px-4.5 py-4 text-[var(--db-text-secondary)] align-middle",
                            alignClass,
                            widthClass,
                            stickyClass,
                          )}
                        >
                          {col.render(row, idx)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  );
}
