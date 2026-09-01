"use client";

import React, { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  deleteItemAction,
  updatePackItemQuantityAction,
} from "@/app/admin/items/actions";
import { formatCurrency } from "@/lib/formatCurrency";
import type { ItemRow } from "@/lib/admin/items";
import {
  DataTable,
  DataTablePagination,
  useTableParams,
  type ColumnDef,
} from "@/components/admin/shared/DataTable";
import { ItemIcon } from "@/components/ui/ItemIcon";
import { inferIcon } from "@/lib/packs/normalisePackItems";
import coreStyles from "@/components/admin/views/CorePagesView.module.css";
import { useAdminDialog } from "@/components/admin/ui/AdminDialogContext";
import { useDbNotice } from "@/components/admin/ui/DbNotice";
import styles from "./ItemsManager.module.css";

interface ItemsManagerProps {
  items: ItemRow[];
}

export function ItemsManager({ items }: ItemsManagerProps) {
  const router = useRouter();
  const dialog = useAdminDialog();
  const { notifySuccess, notifyError } = useDbNotice();
  const { params } = useTableParams();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isPending, startTransition] = useTransition();

  // Local optimistic quantities state
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const item of items) {
      map[item.id] = item.quantity;
    }
    return map;
  });

  // Keep quantities in sync when props update
  React.useEffect(() => {
    setQuantities((prev) => {
      const next = { ...prev };
      for (const item of items) {
        if (!(item.id in next)) {
          next[item.id] = item.quantity;
        }
      }
      return next;
    });
  }, [items]);

  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const handleQtyChange = async (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    const previousQty = quantities[itemId] ?? 1;
    if (newQty === previousQty) return;

    // Optimistic update
    setQuantities((prev) => ({ ...prev, [itemId]: newQty }));
    setUpdatingIds((prev) => new Set(prev).add(itemId));

    try {
      const res = await updatePackItemQuantityAction(itemId, newQty);
      if (res.ok) {
        notifySuccess("Pack item quantity updated.");
        startTransition(() => {
          router.refresh();
        });
      } else {
        notifyError(res.message || "Failed to update quantity.");
        setQuantities((prev) => ({ ...prev, [itemId]: previousQty }));
      }
    } catch {
      notifyError("Failed to update quantity. Please try again.");
      setQuantities((prev) => ({ ...prev, [itemId]: previousQty }));
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const sortedItems = useMemo(() => {
    const list = [...items];
    const sort = params.sort;
    const order = params.order;
    if (!sort) return list;

    return list.sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      if (sort === "sku") {
        aVal = a.sku || "";
        bVal = b.sku || "";
      } else if (sort === "name") {
        aVal = a.name || "";
        bVal = b.name || "";
      } else if (sort === "description") {
        aVal = a.description || "";
        bVal = b.description || "";
      } else if (sort === "quantity") {
        aVal = quantities[a.id] ?? a.quantity ?? 0;
        bVal = quantities[b.id] ?? b.quantity ?? 0;
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
  }, [items, params.sort, params.order, quantities]);

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const visibleItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedItems.slice(start, start + pageSize);
  }, [currentPage, pageSize, sortedItems]);

  const columns: ColumnDef<ItemRow>[] = [
    {
      key: "sku",
      header: "SKU",
      sortable: true,
      width: "150px",
      render: (row) => {
        const sku = row.sku?.trim() || "—";
        return <span className={coreStyles.itemSkuBadge}>{sku}</span>;
      },
    },
    {
      key: "name",
      header: "Product name",
      sortable: true,
      render: (row) => {
        const iconName = row.icon || inferIcon(row.name);
        return (
          <div
            className={coreStyles.productCell}
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div className={coreStyles.productIconSlot}>
              <ItemIcon name={iconName} size={16} />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                minWidth: 0,
              }}
            >
              <span className={coreStyles.schoolNameTitle}>{row.name}</span>
              {row.specification && (
                <span className={coreStyles.productBrand}>
                  {row.specification}
                </span>
              )}
            </div>
          </div>
        );
      },
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
      width: "130px",
      render: (row) => {
        const currentQty = quantities[row.id] ?? row.quantity ?? 1;
        const isSaving = updatingIds.has(row.id);

        return (
          <div
            className={`${styles.qtyControl} ${isSaving ? styles.qtySaving : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.qtyBtn}
              onClick={() => handleQtyChange(row.id, currentQty - 1)}
              disabled={currentQty <= 1 || isSaving}
              aria-label={`Decrease quantity of ${row.name}`}
              title="Decrease quantity"
            >
              −
            </button>
            <input
              type="number"
              min="1"
              max="999"
              className={styles.qtyInput}
              value={currentQty}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 1) {
                  setQuantities((prev) => ({ ...prev, [row.id]: val }));
                } else if (e.target.value === "") {
                  setQuantities((prev) => ({ ...prev, [row.id]: 0 }));
                }
              }}
              onBlur={() => {
                const val = quantities[row.id] || 1;
                handleQtyChange(row.id, Math.max(1, val));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
              }}
              disabled={isSaving}
              aria-label={`Quantity for ${row.name}`}
            />
            <button
              type="button"
              className={styles.qtyBtn}
              onClick={() => handleQtyChange(row.id, currentQty + 1)}
              disabled={isSaving}
              aria-label={`Increase quantity of ${row.name}`}
              title="Increase quantity"
            >
              +
            </button>
          </div>
        );
      },
    },
    {
      key: "price",
      header: "PRICE",
      sortable: true,
      align: "right",
      width: "120px",
      render: (row) => {
        const unitPrice = row.unit_price;
        if (unitPrice == null) {
          return <span style={{ color: "var(--text-muted)" }}>—</span>;
        }
        const currentQty = quantities[row.id] ?? row.quantity ?? 1;
        const lineTotal = unitPrice * currentQty;
        return (
          <span
            style={{
              fontWeight: 800,
              color: "var(--db-text-primary, #ffffff)",
              fontSize: "14px",
            }}
          >
            {formatCurrency(lineTotal)}
          </span>
        );
      },
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
          <button
            type="button"
            className={coreStyles.actionDeleteBtn}
            data-db-tooltip={`Delete ${row.name}`}
            aria-label={`Delete ${row.name}`}
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              const confirmed = await dialog.confirm({
                title: "Delete Pack Item",
                message: `Are you sure you want to delete "${row.name}" from this pack?`,
                confirmLabel: "Delete Item",
                variant: "danger",
              });
              if (!confirmed) return;
              startTransition(async () => {
                await deleteItemAction(row.id);
                notifySuccess(`"${row.name}" removed from this pack.`);
                router.refresh();
              });
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.scrollableWrapper}>
        <DataTable
          data={visibleItems}
          columns={columns}
          keyExtractor={(row) => row.id}
          isLoading={isPending}
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
    </div>
  );
}
