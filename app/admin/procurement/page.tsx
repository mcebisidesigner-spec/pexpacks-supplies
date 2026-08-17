import { ShoppingCart } from "lucide-react";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { DateField } from "@/components/admin/DateField";
import {
  listProcurementRequirements,
  listSupplierPurchaseOrders,
  listSuppliers,
} from "@/lib/admin/operations";
import {
  createSupplierPurchaseOrderAction,
  updateProcurementRequirementAction,
} from "../operations-actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import admin from "../admin.module.css";
import styles from "../operations.module.css";

export const dynamic = "force-dynamic";

export default async function ProcurementPage() {
  const session = await requireAdmin({ permission: "procurement.view" });
  const [rows, suppliers, purchaseOrders] = await Promise.all([
    listProcurementRequirements(),
    listSuppliers(),
    listSupplierPurchaseOrders(),
  ]);
  const required = rows.reduce(
    (sum, row) => sum + Number(row.required_quantity),
    0,
  );
  const secured = rows.reduce(
    (sum, row) => sum + Number(row.secured_quantity),
    0,
  );
  const outstanding = rows.reduce(
    (sum, row) => sum + Number(row.outstanding_quantity),
    0,
  );
  return (
    <div className={styles.page}>
      <AdminPageHeader
        title="Procurement"
        subtitle="Committed demand from fully paid orders. Supplier availability is not Pexpacks stock."
      />
      <div className={styles.kpis}>
        <div className={styles.kpi}>
          <span>Required units</span>
          <strong>{required}</strong>
        </div>
        <div className={styles.kpi}>
          <span>Secured units</span>
          <strong>{secured}</strong>
        </div>
        <div className={styles.kpi}>
          <span>Outstanding units</span>
          <strong>{outstanding}</strong>
        </div>
        <div className={styles.kpi}>
          <span>Coverage</span>
          <strong>
            {required
              ? `${Math.min(100, (secured / required) * 100).toFixed(1)}%`
              : "100%"}
          </strong>
        </div>
      </div>
      {hasPermission(session, "procurement.manage") ? (
        <section className={styles.formPanel}>
          <h2>Create supplier purchase order</h2>
          <form
            action={createSupplierPurchaseOrderAction}
            className={styles.formGrid}
          >
            <select className={styles.field} name="supplierId" required>
              <option value="">Supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.code} · {supplier.name}
                </option>
              ))}
            </select>
            <select
              className={`${styles.field} ${styles.wide}`}
              name="requirementId"
              required
            >
              <option value="">Outstanding product</option>
              {rows
                .filter((row) => row.outstanding_quantity > 0)
                .map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.sku} · {row.product_name} · {row.outstanding_quantity}{" "}
                    outstanding
                  </option>
                ))}
            </select>
            <input
              className={styles.field}
              name="orderedQuantity"
              type="number"
              min="1"
              placeholder="Order quantity"
              required
            />
            <input
              className={styles.field}
              name="purchaseUnitCost"
              type="number"
              min="0"
              step="0.01"
              placeholder="Unit cost"
              required
            />
            <DateField
              className={styles.field}
              name="expectedOn"
              ariaLabel="Expected date"
              placeholder="Expected date"
            />
            <input
              className={`${styles.field} ${styles.wide}`}
              name="notes"
              placeholder="Purchase notes"
            />
            <button className={styles.button}>Create purchase order</button>
          </form>
        </section>
      ) : null}
      <div className={admin.tableCard}>
        {rows.length ? (
          <div className={admin.tableWrapper}>
            <table className={admin.table}>
              <thead>
                <tr>
                  <th>SKU / Product</th>
                  <th>Required</th>
                  <th>Requested</th>
                  <th>Confirmed</th>
                  <th>Secured</th>
                  <th>Received</th>
                  <th>Outstanding</th>
                  <th>Coverage</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className={styles.name}>{row.product_name}</div>
                      <div className={styles.mono}>{row.sku}</div>
                    </td>
                    <td>{row.required_quantity}</td>
                    <td>{row.requested_quantity}</td>
                    <td>{row.supplier_confirmed_quantity}</td>
                    <td>{row.secured_quantity}</td>
                    <td>{row.received_quantity}</td>
                    <td
                      className={
                        row.outstanding_quantity > 0
                          ? styles.danger
                          : styles.good
                      }
                    >
                      {row.outstanding_quantity}
                    </td>
                    <td>
                      <div
                        className={styles.progress}
                        aria-label={`${row.procurement_coverage_percent}% secured`}
                      >
                        <span
                          style={{
                            width: `${Math.min(100, row.procurement_coverage_percent)}%`,
                          }}
                        />
                      </div>
                      <div className={styles.muted}>
                        {row.procurement_coverage_percent}%
                      </div>
                    </td>
                    <td>
                      {hasPermission(session, "procurement.manage") ? (
                        <form
                          action={updateProcurementRequirementAction.bind(
                            null,
                            row.id,
                          )}
                          className={styles.inlineForm}
                        >
                          <input
                            className={`${styles.field} ${styles.compact}`}
                            name="requestedQuantity"
                            type="number"
                            min="0"
                            defaultValue={row.requested_quantity}
                            title="Requested"
                            aria-label="Requested quantity"
                          />
                          <input
                            className={`${styles.field} ${styles.compact}`}
                            name="confirmedQuantity"
                            type="number"
                            min="0"
                            defaultValue={row.supplier_confirmed_quantity}
                            title="Supplier confirmed"
                            aria-label="Supplier confirmed quantity"
                          />
                          <input
                            className={`${styles.field} ${styles.compact}`}
                            name="securedQuantity"
                            type="number"
                            min="0"
                            defaultValue={row.secured_quantity}
                            title="Secured"
                            aria-label="Secured quantity"
                          />
                          <input
                            className={`${styles.field} ${styles.compact}`}
                            name="receivedQuantity"
                            type="number"
                            min="0"
                            defaultValue={row.received_quantity}
                            title="Received"
                            aria-label="Received quantity"
                          />
                          <button className={styles.buttonSecondary}>
                            Save
                          </button>
                        </form>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<ShoppingCart aria-hidden="true" />}
            title="No procurement demand"
            text="No committed procurement demand. Requirements appear after verified full payment."
          />
        )}
      </div>
      <div className={admin.tableCard}>
        {purchaseOrders.length ? (
          <div className={admin.tableWrapper}>
            <table className={admin.table}>
              <thead>
                <tr>
                  <th>Purchase order</th>
                  <th>Supplier</th>
                  <th>Items</th>
                  <th>Value</th>
                  <th>Expected</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map((purchase) => (
                  <tr key={purchase.id}>
                    <td className={styles.mono}>
                      {purchase.purchase_order_number}
                    </td>
                    <td className={styles.name}>{purchase.suppliers.name}</td>
                    <td>
                      {purchase.supplier_purchase_items.map((item) => (
                        <div
                          key={`${item.master_products.sku}-${item.ordered_quantity}`}
                        >
                          {item.ordered_quantity} × {item.master_products.name}
                        </div>
                      ))}
                    </td>
                    <td className={styles.money}>
                      R{" "}
                      {purchase.supplier_purchase_items
                        .reduce(
                          (sum, item) =>
                            sum +
                            Number(item.unit_cost) *
                              Number(item.ordered_quantity),
                          0,
                        )
                        .toFixed(2)}
                    </td>
                    <td>{purchase.expected_on || "-"}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${purchase.status === "received" ? styles.good : styles.warn}`}
                      >
                        {purchase.status.replaceAll("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
