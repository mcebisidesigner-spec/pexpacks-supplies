"use client";

import React from "react";
import clsx from "clsx";
import { ArrowDown, ArrowUp, ArrowUpDown, Inbox } from "lucide-react";
import styles from "./DataTable.module.css";
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
  "80px": styles.col80,
  "90px": styles.col90,
  "110px": styles.col110,
  "120px": styles.col120,
  "130px": styles.col130,
  "140px": styles.col140,
  "150px": styles.col150,
  "160px": styles.col160,
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
    <div className={clsx(styles.tableCard, className)}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => {
                const isCurrentSort = params.sort === col.key;
                const alignClass =
                  col.align === "center"
                    ? styles.alignCenter
                    : col.align === "right"
                      ? styles.alignRight
                      : styles.alignLeft;
                const widthClass = col.width ? WIDTH_CLASS[col.width] : undefined;
                const stickyClass =
                  col.sticky === "right"
                    ? styles.stickyRightHeader
                    : col.sticky === "left"
                      ? styles.stickyLeftHeader
                      : undefined;

                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={clsx(
                      alignClass,
                      widthClass,
                      stickyClass,
                      { [styles.sortableHeader]: col.sortable }
                    )}
                    onClick={() => handleSort(col.key, col.sortable)}
                  >
                    <div className={styles.headerContent}>
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className={styles.sortIcon}>
                          {isCurrentSort ? (
                            params.order === "asc" ? (
                              <ArrowUp size={13} />
                            ) : (
                              <ArrowDown size={13} />
                            )
                          ) : (
                            <ArrowUpDown size={12} className={styles.mutedSortIcon} />
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
                  <div className={styles.stateContainer}>
                    <div className={styles.loadingSpinner} />
                    <span>Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className={styles.stateContainer}>
                    <Inbox size={32} />
                    <div className={styles.stateTitle}>{emptyTitle}</div>
                    <div className={styles.stateSubtitle}>{emptySubtitle}</div>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => {
                const rowKey = keyExtractor(row);
                return (
                  <tr
                    key={rowKey}
                    className={clsx({ [styles.clickableRow]: Boolean(onRowClick) })}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col) => {
                      const alignClass =
                        col.align === "center"
                          ? styles.alignCenter
                          : col.align === "right"
                            ? styles.alignRight
                            : styles.alignLeft;
                      const widthClass = col.width ? WIDTH_CLASS[col.width] : undefined;
                      const stickyClass =
                        col.sticky === "right"
                          ? styles.stickyRight
                          : col.sticky === "left"
                            ? styles.stickyLeft
                            : undefined;

                      return (
                        <td key={col.key} className={clsx(alignClass, widthClass, stickyClass)}>
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
