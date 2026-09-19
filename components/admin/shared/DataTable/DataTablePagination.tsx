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
        "flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-[#040812] border-t border-slate-800/60 text-xs text-slate-400 w-full gap-4 flex-wrap",
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

      <div className="flex items-center justify-between sm:justify-end gap-5 flex-wrap w-full sm:w-auto sm:ml-auto">
        <div className="text-xs font-medium text-slate-400 whitespace-nowrap">
          Showing <span className="text-white font-bold">{formatCount(fromRecord)}</span> to{" "}
          <span className="text-white font-bold">{formatCount(toRecord)}</span> of{" "}
          <span className="text-white font-bold">{formatCount(total)}</span> records
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage <= 1}
            className="w-8 h-8 rounded-full border border-slate-800 bg-transparent text-slate-400 hover:text-white hover:border-slate-700 flex items-center justify-center transition-colors disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Previous Page"
          >
            <ChevronLeft size={14} />
          </button>

          {pageNumbers.map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1.5 text-slate-500 text-xs select-none"
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
                  "w-8 h-8 rounded-full border border-slate-800 bg-transparent text-slate-300 text-xs font-medium flex items-center justify-center transition-colors hover:border-slate-700 hover:text-white cursor-pointer",
                  isActive &&
                    "w-9 h-9 border-2 border-[#00dfb6] bg-transparent text-[#00dfb6] font-bold shadow-[0_0_12px_rgba(0,223,182,0.25)] hover:border-[#00dfb6] hover:text-[#00dfb6]",
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
            className="w-8 h-8 rounded-full border border-slate-800 bg-transparent text-slate-400 hover:text-white hover:border-slate-700 flex items-center justify-center transition-colors disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Next Page"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
