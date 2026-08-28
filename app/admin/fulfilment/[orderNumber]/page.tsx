import { ArrowLeft, Barcode, Save } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import adminStyles from "@/app/admin/admin.module.css";
import styles from "@/components/admin/views/CorePagesView.module.css";

interface FulfilmentDetailPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function FulfilmentDetailPage({ params }: FulfilmentDetailPageProps) {
  await requireAdmin({ permission: "fulfilment.view" });
  const { orderNumber } = await params;

  const steps = [
    { stage: "Queued", active: false, done: true },
    { stage: "Picking", active: false, done: true },
    { stage: "Packed", active: true, done: false },
    { stage: "Quality Check", active: false, done: false },
    { stage: "Ready for Dispatch", active: false, done: false },
    { stage: "Completed", active: false, done: false },
  ];

  const items = [
    { name: "A4 Counter Book (Quad 192p)", qty: "4", unit: "Each", checked: true, packed: true },
    { name: "Staedtler HB Pencils (Box 12)", qty: "1", unit: "Box", checked: true, packed: true },
    { name: "Pritt Glue Stick 43g", qty: "2", unit: "Each", checked: true, packed: true },
    { name: "Flip File 40 Pocket", qty: "2", unit: "Each", checked: true, packed: true },
    { name: "Ruler 30cm Shatterproof (Substituted: Clear)", qty: "1", unit: "Each", checked: false, packed: false, substitute: true },
  ];

  return (
    <div className={styles.container}>
      <AdminPageHeader
        title={`Fulfilment: ${orderNumber}`}
        subtitle="School: Primrose Hill Primary • Grade 4 Pack • Learner: Ethan Morgan"
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <StatusBadge status="In Packing" tone="blue" showDot />
            <AdminButton
              href="/admin/fulfilment"
              variant="secondary"
              icon={<ArrowLeft size={14} />}
            >
              Back to Packing Queue
            </AdminButton>
          </div>
        }
      />

      {/* 6-Stage Stepper Bar */}
      <div className={`${adminStyles.tableCard} ${adminStyles.pCard}`}>
        <div className={`${styles.text11} ${adminStyles.fw700} ${adminStyles.uppercase} ${adminStyles.lsWide} ${adminStyles.cSubtle} ${adminStyles.mb12}`}>
          Packing Lifecycle Stepper
        </div>
        <div className={adminStyles.grid6}>
          {steps.map((item, idx) => {
            const btnCls = item.active
              ? `${styles.primaryBtn} ${styles.text11} ${adminStyles.justifyCenter} ${adminStyles.stepBtnActive}`
              : item.done
                ? `${styles.secondaryBtn} ${styles.text11} ${adminStyles.justifyCenter} ${adminStyles.stepBtnDone}`
                : `${styles.secondaryBtn} ${styles.text11} ${adminStyles.justifyCenter} ${adminStyles.opacity50}`;

            return (
              <button key={idx} className={btnCls}>
                {item.done ? "✓ " : `${idx + 1}. `} {item.stage}
              </button>
            );
          })}
        </div>
      </div>

      {/* Packing Checklist */}
      <div className={`${adminStyles.tableCard} ${adminStyles.tableCardPadded18} ${adminStyles.mt18}`}>
        <div className={`${adminStyles.headerRow} ${adminStyles.mb16}`}>
          <div>
            <h2 className={styles.sectionHeaderTitle}>Item Pack-Out &amp; Barcode Verification</h2>
            <p className={styles.sectionSubtitle}>
              Scan barcodes or manually verify stationery items into the school box.
            </p>
          </div>
          <StatusBadge
            status="In Progress"
            tone="teal"
            label="4 / 5 Items Packed (80%)"
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
                <th className={adminStyles.w120}>Format</th>
                <th className={adminStyles.w140}>Verification</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, idx) => (
                <tr key={idx}>
                  <td>
                    <input
                      type="checkbox"
                      defaultChecked={row.checked}
                      className={adminStyles.checkboxAccented}
                    />
                  </td>
                  <td>
                    <div className={adminStyles.fw600}>
                      {row.name}
                      {row.substitute && (
                        <StatusBadge
                          status="Substituted"
                          tone="amber"
                          className={adminStyles.ml8}
                        />
                      )}
                    </div>
                  </td>
                  <td>
                    <strong className={adminStyles.fw700}>{row.qty}</strong>
                  </td>
                  <td className={adminStyles.cMuted}>{row.unit}</td>
                  <td>
                    {row.packed ? (
                      <StatusBadge status="Verified" tone="emerald" />
                    ) : (
                      <StatusBadge status="Scan SKU" tone="amber" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={`${adminStyles.flex} ${adminStyles.justifyBetween} ${adminStyles.itemsCenter} ${adminStyles.mt18} ${adminStyles.pt14} ${adminStyles.borderTopDark}`}>
          <button className={styles.secondaryBtn}>
            <Barcode size={14} /> Scan Next Item
          </button>
          <button className={`${styles.primaryBtn} ${adminStyles.px24}`}>
            <Save size={14} /> Complete Pack-Out &amp; Print Box Label
          </button>
        </div>
      </div>
    </div>
  );
}