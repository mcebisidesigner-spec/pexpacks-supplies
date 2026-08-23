"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import styles from "./DataTableToolbar.module.css";
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
    <div className={`${styles.toolbar} ${className || ""}`}>
      <div className={styles.leftGroup}>
        {showSearch && (
          <div className={styles.searchContainer}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className={styles.searchInput}
            />
          </div>
        )}
        {filters}
      </div>
      {actions && <div className={styles.rightGroup}>{actions}</div>}
    </div>
  );
}
