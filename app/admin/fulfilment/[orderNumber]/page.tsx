import { ArrowLeft, Barcode, Save } from "lucide-react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getOrder } from "@/lib/admin/orders";
import { listOrderItems } from "@/lib/admin/operations";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import adminStyles from "@/app/admin/admin.module.css";
import styles from "@/components/admin/views/CorePagesView.module.css";

interface FulfilmentDetailPageProps {
  params: Promise<{ orderNumber: string }>;
}

const STEPS = [
  { key: "paid", stage: "Queued" },
  { key: "packing", stage: "Picking" },
  { key: "packed", stage: "Packed" },
  { key: "quality_check", stage: "Quality Check" },
  { key: "dispatched", stage: "Ready for Dispatch" },
  { key: "delivered", stage: "Completed" },
];

function stepIndex(status: string | null | undefined) {
  const value = (status || "").toLowerCase();
  if (["completed", "delivered", "collected"].includes(value)) return 5;
  if (["dispatched", "in_transit", "out_for_delivery"].includes(value)) return 4;
  if (["quality_check"].includes(value)) return 3;
  if (["packed", "ready_to_pack"].includes(value)) return 2;
  if (["packing", "processing"].includes(value)) return 1;
  return 0;
}

export default async function FulfilmentDetailPage({ params }: FulfilmentDetailPageProps) {
  await requireAdmin({ permission: "fulfilment.view" });
  const { orderNumber } = await params;
  const [order, items] = await Promise.all([getOrder(orderNumber), listOrderItems(orderNumber)]);

  if (!order) {
    notFound();
  }

  const currentStep = stepIndex(order.status);
  const packedCount = items.filter((item) => item.product_id).length;
  const totalCount = items.length;
  const packedPercent = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  return (
    <div className={styles.container}>
      <AdminPageHeader
        title={`Fulfilment: ${order.order_reference}`}
        subtitle={`School: ${order.school_name || "-"} - ${order.grade || "-"} - Customer: ${order.buyer_name || "-"}`}
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <StatusBadge status={order.status || "pending"} tone="blue" showDot />
            <AdminButton href="/admin/fulfilment" variant="secondary" icon={<ArrowLeft size={14} />}>
              Back to Packing Queue
            </AdminButton>
          </div>
        }
      />

      <div className={`${adminStyles.tableCard} ${adminStyles.pCard}`}>
        <div className={`${styles.text11} ${adminStyles.fw700} ${adminStyles.uppercase} ${adminStyles.lsWide} ${adminStyles.cSubtle} ${adminStyles.mb12}`}>
          Packing Lifecycle Stepper
        </div>
        <div className={adminStyles.grid6}>
          {STEPS.map((item, idx) => {
            const done = idx < currentStep;
            const active = idx === currentStep;
            const btnCls = active
              ? `${styles.primaryBtn} ${styles.text11} ${adminStyles.justifyCenter} ${adminStyles.stepBtnActive}`
              : done
                ? `${styles.secondaryBtn} ${styles.text11} ${adminStyles.justifyCenter} ${adminStyles.stepBtnDone}`
                : `${styles.secondaryBtn} ${styles.text11} ${adminStyles.justifyCenter} ${adminStyles.opacity50}`;

            return (
              <button key={item.key} type="button" className={btnCls}>
                {done ? "Done " : `${idx + 1}. `} {item.stage}
              </button>
            );
          })}
        </div>
      </div>

      <div className={`${adminStyles.tableCard} ${adminStyles.tableCardPadded18} ${adminStyles.mt18}`}>
        <div className={`${adminStyles.headerRow} ${adminStyles.mb16}`}>
          <div>
            <h2 className={styles.sectionHeaderTitle}>Item Pack-Out &amp; Barcode Verification</h2>
            <p className={styles.sectionSubtitle}>Verify normalized order items against the paid commercial snapshot.</p>
          </div>
          <StatusBadge
            status="Snapshot"
            tone="teal"
            label={`${packedCount} / ${totalCount} Lines Matched (${packedPercent}%)`}
            className={adminStyles.fw700}
          />
        </div>

        <div className={adminStyles.tableWrapper}>
          <table className={adminStyles.table}>
            <thead>
              <tr>
                <th className={adminStyles.w40}>Pack</th>
                <th>Stationery Item</th>
                <th className={adminStyles.w100}>Target Qty</th>
                <th className={adminStyles.w120}>SKU</th>
                <th className={adminStyles.w140}>Verification</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id}>
                  <td>
                    <input type="checkbox" defaultChecked={Boolean(row.product_id)} className={adminStyles.checkboxAccented} />
                  </td>
                  <td>
                    <div className={adminStyles.fw600}>{row.product_name_snapshot}</div>
                    <div className={adminStyles.cMuted}>{row.school_name_snapshot || order.school_name} {row.grade_snapshot || order.grade}</div>
                  </td>
                  <td>
                    <strong className={adminStyles.fw700}>{row.quantity}</strong>
                  </td>
                  <td className={adminStyles.cMuted}>{row.sku_snapshot}</td>
                  <td>
                    {row.product_id ? <StatusBadge status="Matched" tone="emerald" /> : <StatusBadge status="Unmatched" tone="amber" />}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className={adminStyles.cMuted}>No normalized order items found for this order.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={`${adminStyles.flex} ${adminStyles.justifyBetween} ${adminStyles.itemsCenter} ${adminStyles.mt18} ${adminStyles.pt14} ${adminStyles.borderTopDark}`}>
          <button className={styles.secondaryBtn} type="button">
            <Barcode size={14} /> Scan Next Item
          </button>
          <button className={`${styles.primaryBtn} ${adminStyles.px24}`} type="button">
            <Save size={14} /> Complete Pack-Out &amp; Print Box Label
          </button>
        </div>
      </div>
    </div>
  );
}