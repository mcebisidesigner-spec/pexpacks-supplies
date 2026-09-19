"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTableParams } from "./useTableParams";

export interface DataTableToolbarProps {
  searchPlaceholder?: string;
  showSearch?: boolean;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function DataTableToolbar({
  searchPlaceholder = "Search records...",
  showSearch = true,
  filters,
  actions,
  className,
}: DataTableToolbarProps) {
  const { params, setParams } = useTableParams();
  const [searchTerm, setSearchTerm] = useState(params.q);

  useEffect(() => {
    setSearchTerm(params.q);
  }, [params.q]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== params.q) {
        setParams({ q: searchTerm }, true);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, params.q, setParams]);

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 mb-4 w-full flex-wrap",
        className,
      )}
    >
      <div className="flex items-center gap-3 flex-1 max-w-[440px] min-w-[260px]">
        {showSearch && (
          <div className="relative w-full">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-10 bg-slate-900/75 border border-slate-800/85 rounded-full pl-10 pr-4 font-inherit text-[13px] font-medium text-slate-100 placeholder:text-slate-500 outline-none transition-colors transition-shadow focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/20"
            />
          </div>
        )}
      </div>
      {(filters || actions) && (
        <div className="flex items-center gap-3 ml-auto flex-wrap">
          {filters}
          {actions}
        </div>
      )}
    </div>
  );
}
