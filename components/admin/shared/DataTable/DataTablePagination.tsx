"use client";

import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AdminDropdown } from "@/components/admin/ui/AdminDropdown";
import { cn } from "@/lib/utils";
import { useTableParams } from "./useTableParams";

export interface DataTablePaginationProps {
  total: number;
  pageSize?: number;
  currentPage?: number;
  className?: string;
  onPageSizeChange?: (pageSize: number) => void;
  onPageChange?: (page: number) => void;
}

function formatCount(val: number): string {
  return Number(val || 0).toLocaleString("en-US");
}

export function DataTablePagination({
  total,
  pageSize: propPageSize,
  currentPage: propCurrentPage,
  className,
  onPageSizeChange,
  onPageChange,
}: DataTablePaginationProps) {
  const { params, setParams } = useTableParams();

  const currentPage = propCurrentPage ?? params.page;
  const pageSize = propPageSize ?? params.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const fromRecord = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const toRecord = Math.min(total, currentPage * pageSize);

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        start = 2;
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
      }

      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  const handlePageClick = (page: number) => {
    if (page === currentPage) return;
    if (onPageChange) {
      onPageChange(page);
    } else {
      setParams({ page });
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    } else {
      setParams({ pageSize: newSize, page: 1 });
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between p-3 sm:px-4.5 sm:py-3 bg-[var(--db-surface-inner,#090e17)] border-t border-[var(--db-border,rgba(30,41,59,0.8))] text-xs text-[var(--db-text-muted,#94a3b8)] w-full gap-4 flex-wrap",
        className,
      )}
    >
      <div className="flex items-center w-full sm:w-auto justify-between sm:justify-start">
        <AdminDropdown
          value={pageSize}
          options={[10, 20, 25, 50, 100].map((opt) => ({
            value: opt,
            label: `${opt} per page`,
          }))}
          onChange={handlePageSizeChange}
          pill
          openUpwards
          ariaLabel="Records per page"
        />
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4.5 flex-wrap w-full sm:w-auto sm:ml-auto">
        <div className="text-xs font-medium text-[var(--db-text-muted,#94a3b8)] whitespace-nowrap">
          Showing{" "}
          <span className="text-[var(--db-text-primary,#ffffff)] font-bold">
            {formatCount(fromRecord)}
          </span>{" "}
          to{" "}
          <span className="text-[var(--db-text-primary,#ffffff)] font-bold">
            {formatCount(toRecord)}
          </span>{" "}
          of{" "}
          <span className="text-[var(--db-text-primary,#ffffff)] font-bold">
            {formatCount(total)}
          </span>{" "}
          records
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage <= 1}
            className="inline-flex items-center justify-center min-w-7 h-7 px-2 border border-slate-700/80 rounded-md bg-transparent text-slate-300 text-xs font-medium cursor-pointer transition-colors hover:bg-slate-700/50 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Previous Page"
          >
            <ChevronLeft size={13} />
          </button>

          {pageNumbers.map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1 text-slate-500 text-xs select-none"
                >
                  ...
                </span>
              );
            }

            const pageNum = p as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={`page-${pageNum}`}
                type="button"
                onClick={() => handlePageClick(pageNum)}
                className={cn(
                  "inline-flex items-center justify-center min-w-7 h-7 px-2 border border-slate-700/80 rounded-md bg-transparent text-slate-300 text-xs font-medium cursor-pointer transition-colors hover:bg-slate-700/50 hover:text-white",
                  isActive &&
                    "border-emerald-500 bg-emerald-500/18 text-emerald-400 font-bold hover:bg-emerald-500/25 hover:text-emerald-300",
                )}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="inline-flex items-center justify-center min-w-7 h-7 px-2 border border-slate-700/80 rounded-md bg-transparent text-slate-300 text-xs font-medium cursor-pointer transition-colors hover:bg-slate-700/50 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Next Page"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
