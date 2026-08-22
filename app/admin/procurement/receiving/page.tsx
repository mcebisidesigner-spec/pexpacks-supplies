import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import {
  listPurchaseOrdersForReceiving,
  listSupplierReceipts,
} from "@/lib/admin/operations";
import { createSupplierReceiptAction } from "../../operations-actions";
import admin from "../../admin.module.css";
import styles from "../../operations.module.css";
import viewStyles from "@/components/admin/views/CorePagesView.module.css";

export const dynamic = "force-dynamic";

export default async function ReceivingPage() {
  const [session, purchaseOrders] = await Promise.all([
    requireAdmin({ permission: "procurement.view" }),
    listPurchaseOrdersForReceiving(),
  ]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <Link href="/admin/procurement" className={admin.backLink}>
            <ArrowLeft aria-hidden="true" />
            <span>Back to procurement</span>
          </Link>
          <h1>Receive Goods</h1>
          <p>
            Record incoming stock from suppliers against purchase orders.
          </p>
        </div>
      </header>

      {purchaseOrders.length === 0 ? (
        <div className={styles.formPanel}>
          <Package aria-hidden="true" />
          <p>No purchase orders are awaiting receipt.</p>
        </div>
      ) : (
        purchaseOrders.map((po) => {
          const totalOrdered = po.supplier_purchase_items.reduce(
            (sum, item) => sum + item.ordered_quantity,
            0,
          );
          const totalReceived = po.supplier_purchase_items.reduce(
            (sum, item) => sum + item.received_quantity,
            0,
          );
          const percentReceived = totalOrdered
            ? Math.round((totalReceived / totalOrdered) * 100)
            : 0;

          return (
            <section key={po.id} className={styles.formPanel}>
              <h2>
                {po.purchase_order_number}
                <span
                  className={`${styles.badge} ${po.status === "received" ? styles.good : po.status === "partially_received" ? styles.warn : ""} ${viewStyles.ml8}`}
                >
                  {po.status.replace(/_/g, " ")}
                </span>
              </h2>
              <p className={styles.muted}>
                {po.suppliers?.name || "Unknown supplier"} ·{" "}
                {po.expected_on
                  ? `Expected ${new Date(po.expected_on).toLocaleDateString("en-ZA")}`
                  : "No expected date"}
                · {percentReceived}% received
              </p>

              <div className={admin.tableCard}>
                <div className={admin.tableWrapper}>
                  <table className={admin.table}>
                    <thead>
                      <tr>
                        <th>SKU</th>
                        <th>Product</th>
                        <th>Ordered</th>
                        <th>Previously Received</th>
                        <th>Receiving Now</th>
                      </tr>
                    </thead>
                    <tbody>
                      {po.supplier_purchase_items.map((item) => (
                        <tr key={item.id}>
                          <td className={styles.mono}>
                            {item.master_products?.sku || "-"}
                          </td>
                          <td>{item.master_products?.name || "Unknown"}</td>
                          <td>{item.ordered_quantity}</td>
                          <td>{item.received_quantity}</td>
                          <td>
                            {hasPermission(session, "procurement.manage") ? (
                              <input
                                className={`${styles.field} ${viewStyles.w80}`}
                                type="number"
                                min="0"
                                max={item.ordered_quantity - item.received_quantity}
                                defaultValue="0"
                                name={`received_${item.id}`}
                              />
                            ) : (
                              item.received_quantity
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {hasPermission(session, "procurement.manage") ? (
                <form
                  action={createSupplierReceiptAction}
                  className={`${styles.formGrid} ${viewStyles.mt16}`}
                >
                  <input type="hidden" name="purchaseOrderId" value={po.id} />
                  <input
                    className={styles.field}
                    name="reference"
                    placeholder="Delivery note / invoice ref"
                  />
                  <input
                    className={`${styles.field} ${styles.wide}`}
                    name="notes"
                    placeholder="Notes (condition, discrepancies, etc.)"
                  />
                  <button className={styles.button}>Record receipt</button>
                </form>
              ) : null}
            </section>
          );
        })
      )}
    </div>
  );
}
