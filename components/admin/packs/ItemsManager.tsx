"use client";

import { useMemo, useState } from "react";
import type { ItemRow } from "@/lib/admin/items";
import { deleteItemAction } from "@/app/admin/items/actions";
import { formatCurrency } from "@/lib/formatCurrency";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import styles from "./ItemsManager.module.css";

const PAGE_SIZE = 4;

interface ItemsManagerProps {
  items: ItemRow[];
}

export function ItemsManager({ items }: ItemsManagerProps) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [currentPage, items]);

  return (
    <div className={styles.wrapper}>
      {items.length === 0 ? (
        <div className={styles.emptyBanner}>No items in this pack yet.</div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ITEM CODE</th>
                  <th>ITEM NAME</th>
                  <th>DESCRIPTION</th>
                  <th>QTY</th>
                  <th>PRICE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.category || (item as { sku?: string | null }).sku || "-"}</td>
                    <td>
                      <span className={styles.itemName}>{item.name}</span>
                    </td>
                    <td>{item.description?.trim() || "-"}</td>
                    <td>{item.quantity}</td>
                    <td className={styles.priceCell}>
                      {item.unit_price != null ? formatCurrency(item.unit_price) : "-"}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <form action={deleteItemAction.bind(null, item.id)}>
                          <ConfirmButton
                            label="Delete"
                            title="Delete Item"
                            confirmLabel="Delete Item"
                            confirmText={`Delete "${item.name}"?`}
                            busyLabel="Deleting..."
                            className={styles.deleteButton}
                          />
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pager}>
            <span>
              Page {currentPage} of {pageCount} · {items.length}{" "}
              {items.length === 1 ? "item" : "items"}
            </span>
            <div className={styles.pagerButtons}>
              <button
                type="button"
                className={styles.pageButton}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={currentPage <= 1}
              >
                Prev
              </button>
              <button
                type="button"
                className={styles.pageButton}
                onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                disabled={currentPage >= pageCount}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
