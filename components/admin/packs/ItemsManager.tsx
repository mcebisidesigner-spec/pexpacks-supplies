"use client";

import React, { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteItemAction } from "@/app/admin/items/actions";
import { formatCurrency } from "@/lib/formatCurrency";
import type { ItemRow } from "@/lib/admin/items";
import {
  DataTable,
  DataTablePagination,
  useTableParams,
  type ColumnDef,
} from "@/components/admin/shared/DataTable";
import coreStyles from "@/components/admin/views/CorePagesView.module.css";
import styles from "./ItemsManager.module.css";

interface ItemsManagerProps {
  items: ItemRow[];
}

export function ItemsManager({ items }: ItemsManagerProps) {
  const { params } = useTableParams();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const sortedItems = useMemo(() => {
    const list = [...items];
    const sort = params.sort;
    const order = params.order;
    if (!sort) return list;

    return list.sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      if (sort === "code") {
        aVal = a.sku || a.category || "";
        bVal = b.sku || b.category || "";
      } else if (sort === "name") {
        aVal = a.name || "";
        bVal = b.name || "";
      } else if (sort === "description") {
        aVal = a.description || "";
        bVal = b.description || "";
      } else if (sort === "quantity") {
        aVal = a.quantity || 0;
        bVal = b.quantity || 0;
      } else if (sort === "price") {
        aVal = a.unit_price ?? 0;
        bVal = b.unit_price ?? 0;
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return order === "desc" ? bVal - aVal : aVal - bVal;
      }
      return order === "desc"
        ? String(bVal).localeCompare(String(aVal))
        : String(aVal).localeCompare(String(bVal));
    });
  }, [items, params.sort, params.order]);

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const visibleItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedItems.slice(start, start + pageSize);
  }, [currentPage, pageSize, sortedItems]);

  const columns: ColumnDef<ItemRow>[] = [
    {
      key: "code",
      header: "ITEM CODE",
      sortable: true,
      width: "140px",
      render: (row) => {
        const code =
          row.sku ||
          row.category ||
          (row as { code?: string }).code ||
          "ITEM";
        return <span className={coreStyles.skuBadge}>{code}</span>;
      },
    },
    {
      key: "name",
      header: "ITEM NAME",
      sortable: true,
      render: (row) => (
        <div className={coreStyles.productCell}>
          <span className={coreStyles.schoolNameTitle}>{row.name}</span>
          {row.specification && (
            <span className={coreStyles.productBrand}>
              {row.specification}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "description",
      header: "DESCRIPTION",
      sortable: true,
      render: (row) => (
        <span className={coreStyles.textMuted}>
          {row.description?.trim() || "—"}
        </span>
      ),
    },
    {
      key: "quantity",
      header: "QTY",
      sortable: true,
      align: "center",
      width: "80px",
      render: (row) => (
        <span style={{ fontWeight: 700, color: "var(--db-text-primary, #ffffff)" }}>
          {row.quantity}
        </span>
      ),
    },
    {
      key: "price",
      header: "PRICE",
      sortable: true,
      align: "right",
      width: "120px",
      render: (row) => (
        <span
          style={{
            fontWeight: 800,
            color: "var(--db-text-primary, #ffffff)",
            fontSize: "14px",
          }}
        >
          {row.unit_price != null ? formatCurrency(row.unit_price) : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "ACTIONS",
      align: "right",
      sticky: "right",
      width: "90px",
      render: (row) => (
        <div
          className={coreStyles.actionsCell}
          style={{ justifyContent: "flex-end" }}
          onClick={(e) => e.stopPropagation()}
        >
          <form
            action={async () => {
              await deleteItemAction(row.id);
            }}
            onSubmit={(e) => {
              if (!confirm(`Delete "${row.name}" from this pack?`)) {
                e.preventDefault();
              }
            }}
          >
            <button
              type="submit"
              className={coreStyles.actionDeleteBtn}
              data-db-tooltip={`Delete ${row.name}`}
              aria-label={`Delete ${row.name}`}
            >
              <Trash2 size={14} />
            </button>
          </form>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.wrapper}>
      <DataTable
        data={visibleItems}
        columns={columns}
        keyExtractor={(row) => row.id}
        emptyTitle="No items in this pack yet"
        emptySubtitle="Add stationery items using the selector above or bulk CSV importer below."
        footer={
          items.length > 0 ? (
            <DataTablePagination
              total={sortedItems.length}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1);
              }}
            />
          ) : null
        }
      />
    </div>
  );
}
