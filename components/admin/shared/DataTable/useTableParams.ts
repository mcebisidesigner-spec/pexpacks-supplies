"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

export interface TableParams {
  page: number;
  pageSize: number;
  q: string;
  sort?: string;
  order?: "asc" | "desc";
  status?: string;
  category?: string;
  tab?: string;
}

export function useTableParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.max(10, Math.min(100, parseInt(searchParams.get("pageSize") || "10", 10)));
  const q = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || undefined;
  const order = (searchParams.get("order") as "asc" | "desc") || undefined;
  const status = searchParams.get("status") || "all";
  const category = searchParams.get("category") || "all";
  const tab = searchParams.get("tab") || undefined;

  const setParams = useCallback(
    (newParams: Partial<TableParams>, resetPage = false) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));

      Object.entries(newParams).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "" || value === "all") {
          current.delete(key);
        } else {
          current.set(key, String(value));
        }
      });

      if (resetPage && !newParams.page) {
        current.set("page", "1");
      }

      const search = current.toString();
      const query = search ? `?${search}` : "";

      startTransition(() => {
        router.push(`${pathname}${query}`, { scroll: false });
      });
    },
    [router, pathname, searchParams]
  );

  return {
    params: { page, pageSize, q, sort, order, status, category, tab },
    setParams,
    isPending,
  };
}
