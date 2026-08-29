"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./shared/DataTable/DataTablePagination.module.css";
import { buildHref } from "@/lib/admin/ui-utils";

type PaginationProps = {
  basePath: string;
  params: Record<string, string | number | undefined | null>;
  currentPage: number;
  totalPages: number;
};

export function Pagination({
  basePath,
  params,
  currentPage,
  totalPages,
}: PaginationProps) {
  const router = useRouter();
  const pageSize = Number(params.pageSize) || 10;
  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;

  return (
    <div className={styles.paginationFooter}>
      <div className={styles.paginationLeft}>
        <div className={styles.pageSizePill}>
          <select
            value={pageSize}
            onChange={(e) => {
              const url = buildHref(basePath, params, {
                pageSize: e.target.value,
                page: 1,
              });
              router.push(url);
            }}
            className={styles.pageSizeSelect}
            aria-label="Records per page"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
          <ChevronDown size={14} className={styles.pageSizeChevron} aria-hidden="true" />
        </div>
      </div>

      <div className={styles.paginationRight}>
        <div className={styles.rangeText}>
          Page <span className={styles.rangeHighlight}>{currentPage}</span> of{" "}
          <span className={styles.rangeHighlight}>{totalPages}</span>
        </div>
        <div className={styles.controls}>
          <Link
            className={styles.pageBtn}
            aria-disabled={prevDisabled}
            href={prevDisabled ? "#" : buildHref(basePath, params, { page: currentPage - 1 })}
          >
            <ChevronLeft size={13} />
          </Link>
          <Link
            className={styles.pageBtn}
            aria-disabled={nextDisabled}
            href={nextDisabled ? "#" : buildHref(basePath, params, { page: currentPage + 1 })}
          >
            <ChevronRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
