"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AdminDropdown } from "./ui/AdminDropdown";
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
    <div className="flex flex-col sm:flex-row items-center justify-between p-3 sm:px-4.5 sm:py-3 bg-[var(--db-surface-inner,#090e17)] border-t border-[var(--db-border,rgba(30,41,59,0.8))] text-xs text-[var(--db-text-muted,#94a3b8)] w-full gap-4 flex-wrap">
      <div className="flex items-center w-full sm:w-auto justify-between sm:justify-start">
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

      <div className="flex items-center justify-between sm:justify-end gap-4.5 flex-wrap w-full sm:w-auto sm:ml-auto">
        <div className="text-xs font-medium text-[var(--db-text-muted,#94a3b8)] whitespace-nowrap">
          Page <span className="text-[var(--db-text-primary,#ffffff)] font-bold">{currentPage}</span> of{" "}
          <span className="text-[var(--db-text-primary,#ffffff)] font-bold">{totalPages}</span>
        </div>
        <div className="flex items-center gap-1">
          <Link
            className="inline-flex items-center justify-center min-w-7 h-7 px-2 border border-slate-700/80 rounded-md bg-transparent text-slate-300 text-xs font-medium cursor-pointer transition-colors hover:bg-slate-700/50 hover:text-white aria-disabled:opacity-40 aria-disabled:pointer-events-none"
            aria-disabled={prevDisabled}
            href={prevDisabled ? "#" : buildHref(basePath, params, { page: currentPage - 1 })}
          >
            <ChevronLeft size={13} />
          </Link>
          <Link
            className="inline-flex items-center justify-center min-w-7 h-7 px-2 border border-slate-700/80 rounded-md bg-transparent text-slate-300 text-xs font-medium cursor-pointer transition-colors hover:bg-slate-700/50 hover:text-white aria-disabled:opacity-40 aria-disabled:pointer-events-none"
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
