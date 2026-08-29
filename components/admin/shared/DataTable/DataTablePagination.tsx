"use client";

import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AdminDropdown } from "@/components/admin/ui/AdminDropdown";
import styles from "./DataTablePagination.module.css";
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
    <div className={`${styles.paginationFooter} ${className || ""}`}>
      <div className={styles.paginationLeft}>
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

      <div className={styles.paginationRight}>
        <div className={styles.rangeText}>
          Showing <span className={styles.rangeHighlight}>{formatCount(fromRecord)}</span> to{" "}
          <span className={styles.rangeHighlight}>{formatCount(toRecord)}</span> of{" "}
          <span className={styles.rangeHighlight}>{formatCount(total)}</span> records
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage <= 1}
            className={styles.pageBtn}
            aria-label="Previous Page"
          >
            <ChevronLeft size={13} />
          </button>

          {pageNumbers.map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`ellipsis-${idx}`} className={styles.ellipsis}>
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
                className={`${styles.pageBtn} ${isActive ? styles.pageBtnActive : ""}`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className={styles.pageBtn}
            aria-label="Next Page"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
