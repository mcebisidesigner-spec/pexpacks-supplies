import Link from "next/link";
import { Warehouse } from "lucide-react";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { listFulfilmentRecords } from "@/lib/admin/operations";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { updateFulfilmentAction } from "../operations-actions";
import admin from "../admin.module.css";
import styles from "../operations.module.css";

export const dynamic = "force-dynamic";

const STATUSES = [
  "pending",
  "scheduled",
  "ready",
  "dispatched",
  "collected",
  "delivered",
  "failed",
  "cancelled",
];
const PACKING_STATUSES = [
  "not_ready",
  "ready",
  "packing",
  "quality_check",
  "packed",
  "exception",
];

export default async function FulfilmentPage() {
  const session = await requireAdmin({ permission: "fulfilment.view" });
  const records = await listFulfilmentRecords();
  const ready = records.filter((record) => record.readiness >= 100).length;
  const completed = records.filter((record) =>
    ["collected", "delivered"].includes(record.status),
  ).length;
  return (
    <div className={styles.page}>
      <AdminPageHeader
        title="Fulfilment"
        subtitle="Packing readiness, quality control, school collection and delivery."
      />
      <div className={styles.kpis}>
        <div className={styles.kpi}>
          <span>Orders in fulfilment</span>
          <strong>{records.length}</strong>
        </div>
        <div className={styles.kpi}>
          <span>Procurement ready</span>
          <strong>{ready}</strong>
        </div>
        <div className={styles.kpi}>
          <span>Completed</span>
          <strong>{completed}</strong>
        </div>
        <div className={styles.kpi}>
          <span>Blocked</span>
          <strong>{records.length - ready - completed}</strong>
        </div>
      </div>
      <div className={admin.tableCard}>
        {records.length ? (
          <div className={admin.tableWrapper}>
            <table className={admin.table}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Parent / School</th>
                  <th>Method</th>
                  <th>Readiness</th>
                  <th>Packing</th>
                  <th>Fulfilment</th>
                  <th>Target</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <Link
                        className={styles.name}
                        href={`/admin/orders/${record.orders.order_reference}`}
                      >
                        {record.orders.order_reference}
                      </Link>
                    </td>
                    <td>
                      {record.orders.buyer_name}
                      <div className={styles.muted}>
                        {record.orders.school_name} · {record.orders.grade}
                      </div>
                    </td>
                    <td>
                      <span className={styles.badge}>
                        {record.method.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td>
                      <div className={styles.progress}>
                        <span
                          style={{
                            width: `${Math.min(100, record.readiness)}%`,
                          }}
                        />
                      </div>
                      <div className={styles.muted}>{record.readiness}%</div>
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${record.packing_records?.[0]?.status === "packed" ? styles.good : styles.warn}`}
                      >
                        {record.packing_records?.[0]?.status?.replaceAll(
                          "_",
                          " ",
                        ) || "not ready"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${["collected", "delivered"].includes(record.status) ? styles.good : record.status === "failed" ? styles.danger : styles.warn}`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td>{record.target_date || "-"}</td>
                    <td>
                      {hasPermission(session, "fulfilment.manage") ? (
                        <form
                          action={updateFulfilmentAction.bind(null, record.id)}
                          className={styles.inlineForm}
                        >
                          <input
                            type="hidden"
                            name="packingId"
                            value={record.packing_records?.[0]?.id || ""}
                          />
                          <select
                            className={`${styles.field} ${styles.compact}`}
                            name="packingStatus"
                            defaultValue={
                              record.packing_records?.[0]?.status || "not_ready"
                            }
                            aria-label="Packing status"
                          >
                            {PACKING_STATUSES.map((status) => (
                              <option key={status}>{status}</option>
                            ))}
                          </select>
                          <select
                            className={`${styles.field} ${styles.compact}`}
                            name="status"
                            defaultValue={record.status}
                            aria-label="Fulfilment status"
                          >
                            {STATUSES.map((status) => (
                              <option key={status}>{status}</option>
                            ))}
                          </select>
                          <input
                            className={`${styles.field} ${styles.compact}`}
                            name="courierName"
                            defaultValue={record.courier_name || ""}
                            placeholder="Courier"
                            aria-label="Courier"
                          />
                          <input
                            className={`${styles.field} ${styles.compact}`}
                            name="waybillNumber"
                            defaultValue={record.waybill_number || ""}
                            placeholder="Waybill"
                            aria-label="Waybill"
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
            icon={<Warehouse aria-hidden="true" />}
            title="No fulfilment records"
            text="No paid orders are awaiting fulfilment."
          />
        )}
      </div>
    </div>
  );
}
