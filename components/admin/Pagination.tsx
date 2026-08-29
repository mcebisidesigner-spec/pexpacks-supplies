"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AdminDropdown } from "./ui/AdminDropdown";
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
        <AdminDropdown
          value={pageSize}
          options={[10, 20, 25, 50, 100].map((opt) => ({
            value: opt,
            label: `${opt} per page`,
          }))}
          onChange={(newSize) => {
            const url = buildHref(basePath, params, {
              pageSize: newSize,
              page: 1,
            });
            router.push(url);
          }}
          pill
          openUpwards
          ariaLabel="Records per page"
        />
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
