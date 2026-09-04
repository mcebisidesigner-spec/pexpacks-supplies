import { Package } from "lucide-react";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { listPurchaseOrdersForReceiving } from "@/lib/admin/operations";
import { createSupplierReceiptAction } from "../../operations-actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import adminStyles from "@/app/admin/admin.module.css";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";

export const dynamic = "force-dynamic";

export default async function ReceivingPage() {
  const [session, purchaseOrders] = await Promise.all([
    requireAdmin({ permission: "procurement.view" }),
    listPurchaseOrdersForReceiving(),
  ]);

  return (
    <div className={adminStyles.page}>
      <AdminPageHeader
        backHref="/admin/procurement"
        backLabel="Back to Procurement"
        title="Receive Goods"
        subtitle="Record incoming stock from suppliers against purchase orders."
      />

      {purchaseOrders.length === 0 ? (
        <div className={adminStyles.sidebarCard}>
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
            <section key={po.id} className={adminStyles.sidebarCard}>
              <h2>
                {po.purchase_order_number}
                <StatusBadge
                  status={po.status}
                  tone={
                    po.status === "received"
                      ? "emerald"
                      : po.status === "partially_received"
                        ? "amber"
                        : "slate"
                  }
                  className={adminStyles.ml8}
                />
              </h2>
              <p className={adminStyles.muted}>
                {po.suppliers?.name || "Unknown supplier"} ·{" "}
                {po.expected_on
                  ? `Expected ${new Date(po.expected_on).toLocaleDateString("en-ZA")}`
                  : "No expected date"}{" "}
                · {percentReceived}% received
              </p>

              <div className={adminStyles.tableCard}>
                <div className={adminStyles.tableWrapper}>
                  <table className={adminStyles.table}>
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
                          <td className={adminStyles.mono}>
                            {item.master_products?.sku || "-"}
                          </td>
                          <td>{item.master_products?.name || "Unknown"}</td>
                          <td>{item.ordered_quantity}</td>
                          <td>{item.received_quantity}</td>
                          <td>
                            {hasPermission(session, "procurement.manage") ? (
                              <input
                                className={adminStyles.inputField}
                                type="number"
                                min="0"
                                max={
                                  item.ordered_quantity - item.received_quantity
                                }
                                defaultValue="0"
                                name={`received_${item.id}`}
                                aria-label={`Qty received for ${item.master_products?.name || item.id}`}
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
                  className={adminStyles.stack}
                >
                  <input type="hidden" name="purchaseOrderId" value={po.id} />
                  <div className={adminStyles.grid2equal}>
                    <div>
                      <label className={adminStyles.formLabel}>
                        Delivery Note / Invoice Ref
                      </label>
                      <input
                        className={adminStyles.inputField}
                        name="reference"
                        placeholder="Delivery note / invoice ref"
                      />
                    </div>
                    <div>
                      <label className={adminStyles.formLabel}>Notes</label>
                      <input
                        className={adminStyles.inputField}
                        name="notes"
                        placeholder="Notes (condition, discrepancies, etc.)"
                      />
                    </div>
                  </div>
                  <div>
                    <AdminButton type="submit" variant="primary" size="md">
                      Record receipt
                    </AdminButton>
                  </div>
                </form>
              ) : null}
            </section>
          );
        })
      )}
    </div>
  );
}
