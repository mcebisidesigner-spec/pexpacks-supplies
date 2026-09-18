"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Eye, ChevronLeft, ChevronRight, PackageSearch } from "lucide-react";
import {
  useTable,
  flexRender,
  createColumnHelper,
  tableFeatures,
  rowPaginationFeature,
  rowSortingFeature,
  columnFilteringFeature,
  columnVisibilityFeature,
  createPaginatedRowModel,
  createSortedRowModel,
  createFilteredRowModel,
  sortFns,
  filterFns,
  type ColumnDef,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { AdminTableSkeleton, AdminEmptyState, AdminButton } from "@/components/admin/ui";
import { DataTablePagination } from "@/components/admin/shared/DataTable/DataTablePagination";
import type { MasterProductRow } from "@/lib/admin/operations";
import { getProductSlug } from "@/lib/admin/item-constants";

export interface TanStackProductsTableProps {
  data: MasterProductRow[];
  total: number;
  page: number;
  pageSize: number;
  onRowClick: (row: MasterProductRow) => void;
  onCategoryChange?: (value: string) => void;
  categoryOptions?: string[];
  categoryValue?: string;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
}

const columnHelper = createColumnHelper<any, MasterProductRow>();

/**
 * Modernised TanStack Table v9 Data Table for Master Products.
 * Fully Tailwind-native with dark theme token alignment, responsive overflow,
 * integrated skeletons, and empty state support.
 */
export function TanStackProductsTable({
  data,
  total,
  page,
  pageSize,
  onRowClick,
  onCategoryChange,
  categoryOptions = [],
  categoryValue = "all",
  isLoading = false,
  onPageChange,
}: TanStackProductsTableProps) {
  const features = useMemo(
    () =>
      tableFeatures({
        rowPaginationFeature,
        rowSortingFeature,
        columnFilteringFeature,
        columnVisibilityFeature,
        paginatedRowModel: createPaginatedRowModel(),
        sortedRowModel: createSortedRowModel(),
        filteredRowModel: createFilteredRowModel(),
        sortFns,
        filterFns,
      }),
    [],
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("sku", {
        header: () => (
          <span className="inline-flex items-center gap-1.5 text-[#00dfb6] font-bold text-xs uppercase tracking-wider">
            SKU <span className="text-[#00dfb6] text-xs font-semibold">↑↓</span>
          </span>
        ),
        cell: (info) => (
          <span className="inline-flex items-center px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-[#0a1626]/70 text-[#38bdf8] font-mono text-xs font-semibold tracking-wide">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("name", {
        header: () => (
          <span className="inline-flex items-center gap-1.5 text-[#00dfb6] font-bold text-xs uppercase tracking-wider">
            PRODUCT NAME <span className="text-[#00dfb6] text-xs font-semibold">↑↓</span>
          </span>
        ),
        cell: (info) => {
          const row = info.row.original;
          const slug = getProductSlug(row);
          return (
            <div className="flex flex-col gap-0.5 min-w-[220px]">
              <Link
                href={`/admin/products/${slug}`}
                className="text-sm font-bold text-white hover:text-[#00dfb6] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {row.name}
              </Link>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-slate-400 font-normal">
                  {row.brand || "Add-Brand-Name"} {row.packaging || "single"}
                </span>
                {row.requires_pexcover && (
                  <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-emerald-950/40 border border-emerald-800/50 text-emerald-300">
                    📚 Pexcover
                  </span>
                )}
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("category", {
        header: () => (
          <span className="inline-flex items-center gap-1.5 text-[#00dfb6] font-bold text-xs uppercase tracking-wider">
            CATEGORY <span className="text-[#00dfb6] text-xs font-semibold">↑↓</span>
          </span>
        ),
        cell: (info) => (
          <span className="text-sm font-medium text-slate-300">
            {info.getValue() || "Stationery"}
          </span>
        ),
      }),
      columnHelper.accessor("latest_verified_cost", {
        header: () => (
          <span className="inline-flex items-center gap-1.5 text-[#00dfb6] font-bold text-xs uppercase tracking-wider">
            COST PRICE <span className="text-[#00dfb6] text-xs font-semibold">↑↓</span>
          </span>
        ),
        cell: (info) => {
          const v = Number(info.getValue());
          return (
            <div>
              {v > 0 ? (
                <span className="text-xs font-semibold tabular-nums text-slate-200">
                  R {v.toFixed(2)}
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#131d2e]/80 border border-slate-700/50 text-slate-400 text-xs font-medium">
                  Unquoted
                </span>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("current_selling_price", {
        header: () => (
          <span className="inline-flex items-center gap-1.5 text-[#00dfb6] font-bold text-xs uppercase tracking-wider">
            SELLING PRICE <span className="text-[#00dfb6] text-xs font-semibold">↑↓</span>
          </span>
        ),
        cell: (info) => {
          const v = Number(info.getValue());
          return (
            <div>
              {v > 0 ? (
                <span className="text-xs font-bold tabular-nums text-slate-200">
                  R {v.toFixed(2)}
                </span>
              ) : (
                <span className="text-slate-500 font-normal">—</span>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("active", {
        header: () => (
          <span className="inline-flex items-center gap-1.5 text-[#00dfb6] font-bold text-xs uppercase tracking-wider">
            STATUS <span className="text-[#00dfb6] text-xs font-semibold">↑↓</span>
          </span>
        ),
        cell: (info) => (
          <div className="flex items-center">
            <StatusBadge
              status={info.getValue() ? "Active" : "Draft"}
              tone={info.getValue() ? "emerald" : "slate"}
              showDot
            />
          </div>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: () => (
          <span className="text-[#00dfb6] font-bold text-xs uppercase tracking-wider">
            ACTIONS
          </span>
        ),
        cell: (info) => {
          const row = info.row.original;
          const slug = getProductSlug(row);
          return (
            <div
              className="flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                href={`/admin/products/${slug}`}
                className="inline-flex items-center justify-center w-9 h-9 bg-[#0a1626] border border-[#00dfb6]/25 rounded-xl text-[#00dfb6] cursor-pointer no-underline transition-all duration-150 hover:bg-[#00dfb6]/10 hover:border-[#00dfb6]/60 hover:shadow-[0_0_12px_rgba(0,223,182,0.15)]"
                aria-label={`View ${row.name}`}
              >
                <Eye size={15} />
              </Link>
            </div>
          );
        },
      }),
    ],
    [],
  );

  const table = useTable({
    features,
    columns: columns as unknown as ColumnDef<any, MasterProductRow, unknown>[],
    data,
    initialState: {
      pagination: { pageIndex: Math.max(0, page - 1), pageSize },
      sorting: [],
    },
    autoResetPageIndex: false,
    manualSorting: true,
    manualPagination: true,
    rowCount: total,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (isLoading) {
    return <AdminTableSkeleton rows={5} columns={6} />;
  }

  if (data.length === 0) {
    return (
      <AdminEmptyState
        icon={<PackageSearch size={24} />}
        title="No master products found"
        description="Try adjusting your search query, clearing filters, or importing products using the bulk CSV tool below."
      />
    );
  }

  return (
    <div className="flex flex-col rounded-[28px] border border-slate-800/80 bg-[#040812] shadow-2xl overflow-hidden">
      {onCategoryChange && (
        <div className="flex items-center justify-between gap-3 flex-wrap p-4 border-b border-slate-800/60 bg-[#040812]">
          <span className="text-xs font-semibold text-slate-300">Category</span>
          <select
            value={categoryValue}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="h-8 px-3 text-xs font-medium rounded-full bg-[#071120] border border-slate-800 text-slate-200 focus:outline-none focus:border-[#00dfb6]"
          >
            <option value="all">All</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Inner Scroll Table Container with Neon Teal Scrollbar */}
      <div className="w-full overflow-auto max-h-[68vh] relative [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-track]:bg-[#040812] [&::-webkit-scrollbar-thumb]:bg-[#00dfb6] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#00dfb6]/80">
        <table className="w-full border-collapse border-spacing-0 text-left text-xs font-sans text-slate-200">
          <thead className="sticky top-0 z-20">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-slate-800/60 bg-[#040812]"
              >
                {headerGroup.headers.map((header) => {
                  const isActions = header.column.id === "actions";
                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        "px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#00dfb6] whitespace-nowrap select-none",
                        isActions
                          ? "w-24 min-w-24 text-center sticky right-0 bg-[#040812] border-l border-slate-800/40 z-30"
                          : "text-left",
                      )}
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
            {table.getRowModel().rows.map((row) => {
              const cells =
                typeof row.getVisibleCells === "function"
                  ? row.getVisibleCells()
                  : (row.getAllCells?.() ?? []);
              return (
                <tr
                  key={row.id}
                  onClick={() => onRowClick(row.original)}
                  className="hover:bg-[#071324] cursor-pointer transition-colors duration-150 group"
                >
                  {cells.map((cell) => {
                    const isActions = cell.column.id === "actions";
                    return (
                      <td
                        key={cell.id}
                        className={cn(
                          "px-5 py-4.5 align-middle",
                          isActions
                            ? "w-24 min-w-24 text-center sticky right-0 bg-[#040812] group-hover:bg-[#071324] border-l border-slate-800/40 z-10"
                            : "text-left",
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
            })}
          </tbody>
        </table>
      </div>

      {/* Unified Pagination Footer */}
      <DataTablePagination
        total={total}
        pageSize={pageSize}
        currentPage={page}
        onPageChange={onPageChange}
      />
    </div>
  );
}
