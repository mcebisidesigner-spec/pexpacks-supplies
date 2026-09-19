"use client";

import React, { useMemo } from "react";
import { Inbox } from "lucide-react";
import {
  useTable,
  flexRender,
  createColumnHelper,
  tableFeatures,
  rowSortingFeature,
  columnVisibilityFeature,
  createSortedRowModel,
  sortFns,
  type ColumnDef as TanStackColumnDef,
} from "@tanstack/react-table";
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

/**
 * Universal TanStack Table v9 Data Table for Pexpacks.
 * Adopts the dark midnight canvas with neon-teal header accents,
 * pixel-matched to the official reference design.
 */
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

  const columnHelper = useMemo(() => createColumnHelper<any, any>(), []);

  const tanstackColumns = useMemo(() => {
    return columns.map((col) => {
      const isActions =
        col.key === "actions" || col.header.toUpperCase() === "ACTIONS";
      return columnHelper.display({
        id: col.key,
        header: () => (
          <div
            className={cn(
              "inline-flex items-center gap-1.5",
              col.align === "center" || isActions
                ? "justify-center"
                : col.align === "right"
                  ? "justify-end"
                  : "justify-start",
            )}
          >
            <span>{col.header}</span>
            {!isActions && (
              <span className="text-[#00dfb6] text-xs font-semibold">↑↓</span>
            )}
          </div>
        ),
        cell: (info) => col.render(info.row.original as T, info.row.index),
      });
    });
  }, [columns, columnHelper]);

  const features = useMemo(
    () =>
      tableFeatures({
        rowSortingFeature,
        columnVisibilityFeature,
        sortedRowModel: createSortedRowModel(),
        sortFns,
      }),
    [],
  );

  const table = useTable({
    features,
    columns: tanstackColumns as any,
    data: data as any,
  });

  return (
    <div
      className={cn(
        "rounded-[28px] border border-slate-800/80 bg-[#040812] shadow-2xl overflow-hidden flex flex-col",
        className,
      )}
    >
      <div className="w-full overflow-auto max-h-[68vh] relative [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-track]:bg-[#040812] [&::-webkit-scrollbar-thumb]:bg-[#00dfb6] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#00dfb6]/80">
        <table className="w-full border-collapse border-spacing-0 text-left text-xs font-sans text-slate-200">
          <thead className="sticky top-0 z-20">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-slate-800/60 bg-[#040812]"
              >
                {headerGroup.headers.map((header, colIndex) => {
                  const origCol = columns[colIndex];
                  const isActions =
                    origCol?.key === "actions" ||
                    origCol?.header.toUpperCase() === "ACTIONS";
                  const alignClass =
                    origCol?.align === "center" || isActions
                      ? "text-center"
                      : origCol?.align === "right"
                        ? "text-right"
                        : "text-left";
                  const widthClass = origCol?.width
                    ? WIDTH_CLASS[origCol.width] || `w-[${origCol.width}]`
                    : undefined;
                  const stickyClass =
                    origCol?.sticky === "right" || isActions
                      ? "sticky right-0 bg-[#040812] border-l border-slate-800/40 z-30"
                      : origCol?.sticky === "left"
                        ? "sticky left-0 bg-[#040812] border-r border-slate-800/40 z-30"
                        : undefined;

                  return (
                    <th
                      key={header.id}
                      scope="col"
                      className={cn(
                        "px-5 py-4 text-xs font-bold text-[#00dfb6] uppercase tracking-wider whitespace-nowrap select-none",
                        alignClass,
                        widthClass,
                        stickyClass,
                        origCol?.sortable &&
                          "cursor-pointer transition-colors hover:text-[#00dfb6]/80",
                      )}
                      onClick={() =>
                        handleSort(origCol?.key ?? header.id, origCol?.sortable)
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-800/30 bg-[#040812]">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="p-12 flex flex-col items-center justify-center gap-3 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-[#00dfb6] border-r-transparent rounded-full animate-spin" />
                    <span>Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="p-12 flex flex-col items-center justify-center gap-3 text-center text-slate-400">
                    <Inbox size={32} className="text-slate-600" />
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
              table.getRowModel().rows.map((row) => {
                const rowKey = keyExtractor(row.original as T);
                const cells =
                  typeof (row as any).getVisibleCells === "function"
                    ? (row as any).getVisibleCells()
                    : ((row as any).getAllCells?.() ?? []);

                return (
                  <tr
                    key={rowKey}
                    className={cn(
                      "hover:bg-[#071324] transition-colors duration-150 group",
                      Boolean(onRowClick) && "cursor-pointer",
                    )}
                    onClick={() => onRowClick?.(row.original as T)}
                  >
                    {cells.map((cell: any, colIndex: number) => {
                      const origCol = columns[colIndex];
                      const isActions =
                        origCol?.key === "actions" ||
                        origCol?.header.toUpperCase() === "ACTIONS";
                      const alignClass =
                        origCol?.align === "center" || isActions
                          ? "text-center"
                          : origCol?.align === "right"
                            ? "text-right"
                            : "text-left";
                      const widthClass = origCol?.width
                        ? WIDTH_CLASS[origCol.width] || `w-[${origCol.width}]`
                        : undefined;
                      const stickyClass =
                        origCol?.sticky === "right" || isActions
                          ? "sticky right-0 bg-[#040812] group-hover:bg-[#071324] border-l border-slate-800/40 z-10"
                          : origCol?.sticky === "left"
                            ? "sticky left-0 bg-[#040812] group-hover:bg-[#071324] border-r border-slate-800/40 z-10"
                            : undefined;

                      return (
                        <td
                          key={cell.id}
                          className={cn(
                            "px-5 py-4.5 text-slate-300 align-middle",
                            alignClass,
                            widthClass,
                            stickyClass,
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
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
