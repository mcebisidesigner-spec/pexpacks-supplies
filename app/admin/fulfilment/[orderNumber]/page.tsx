import { ArrowLeft, Barcode, Save } from "lucide-react";
import { notFound } from "next/navigation";
import { hasPermission, requireAdmin } from "@/lib/admin/rbac";
import { getOrder } from "@/lib/admin/orders";
import { getFulfilmentWorkflow, listOrderItems } from "@/lib/admin/operations";
import {
  normalisePexcoverPaperStyle,
  pexcoverPaperStyleLabel,
} from "@/lib/pricing/pexcover-paper-style";
import { advanceFulfilmentStageAction } from "../actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import adminStyles from "@/app/admin/admin.module.css";
import styles from "@/components/admin/views/CorePagesView.module.css";

interface FulfilmentDetailPageProps {
  params: Promise<{ orderNumber: string }>;
}

interface PackEntry {
  learner_name?: string | null;
  pack_name?: string | null;
  grade?: string | null;
  wants_pexcover?: boolean | null;
  pexcover_price?: number | null;
  pexcover_paper_style?: string | null;
}

function money(value: number | null | undefined): string {
  return value == null || !Number.isFinite(value)
    ? "-"
    : `R ${value.toFixed(2)}`;
}

const STEPS = [
  { key: "queued", stage: "Queued" },
  { key: "packing", stage: "Picking" },
  { key: "quality_check", stage: "Quality Check" },
  { key: "packed", stage: "Packed" },
  { key: "dispatched", stage: "Ready for Dispatch" },
  { key: "delivered", stage: "Completed" },
] as const;

type FulfilmentStage = (typeof STEPS)[number]["key"];

function stepIndex(packingStatus: string, fulfilmentStatus: string) {
  if (["delivered", "collected"].includes(fulfilmentStatus)) return 5;
  if (["dispatched", "in_transit"].includes(fulfilmentStatus)) return 4;
  if (packingStatus === "packed") return 3;
  if (packingStatus === "quality_check") return 2;
  if (packingStatus === "packing") return 1;
  return 0;
}

function canAdvanceStage(
  stage: FulfilmentStage,
  packingStatus: string,
  fulfilmentStatus: string,
): boolean {
  if (stage === "packing") return packingStatus === "ready";
  if (stage === "quality_check") return packingStatus === "packing";
  if (stage === "packed") return packingStatus === "quality_check";
  if (stage === "dispatched")
    return packingStatus === "packed" && fulfilmentStatus !== "dispatched";
  if (stage === "delivered") return fulfilmentStatus === "dispatched";
  return false;
}
export default async function FulfilmentDetailPage({
  params,
}: FulfilmentDetailPageProps) {
  const session = await requireAdmin({ permission: "fulfilment.view" });
  const { orderNumber } = await params;
  const [order, items] = await Promise.all([
    getOrder(orderNumber),
    listOrderItems(orderNumber),
  ]);

  if (!order) {
    notFound();
  }

  const workflow = await getFulfilmentWorkflow(order.id);
  const packingStatus = workflow.packing?.status ?? "not_ready";
  const fulfilmentStatus = workflow.fulfilment?.status ?? "pending";
  const currentStep = stepIndex(packingStatus, fulfilmentStatus);
  const canManageFulfilment = hasPermission(session, "fulfilment.manage");
  const packedCount = items.filter((item) => item.product_id).length;
  const totalCount = items.length;
  const packedPercent =
    totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;
  const metadata = (order.metadata ?? {}) as { packs?: unknown };
  const packEntries = Array.isArray(metadata.packs)
    ? (metadata.packs as PackEntry[])
    : [];
  const pexcoverPacks = packEntries.filter((pack) => pack.wants_pexcover);

  return (
    <div className={styles.container}>
      <AdminPageHeader
        title={`Fulfilment: ${order.order_reference}`}
        subtitle={`School: ${order.school_name || "-"} - ${order.grade || "-"} - Customer: ${order.buyer_name || "-"}`}
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <StatusBadge
              status={order.status || "pending"}
              tone="blue"
              showDot
            />
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

      {pexcoverPacks.length > 0 ? (
        <div
          className={`${adminStyles.tableCard} ${adminStyles.tableCardPadded18}`}
        >
          <div className={`${adminStyles.headerRow} ${adminStyles.mb16}`}>
            <div>
              <h2 className={styles.sectionHeaderTitle}>
                Pexcover covering instructions
              </h2>
              <p className={styles.sectionSubtitle}>
                Apply the selected covering style only to these paid pack
                services.
              </p>
            </div>
            <StatusBadge
              status="Required"
              tone="teal"
              label={`${pexcoverPacks.length} pack${pexcoverPacks.length === 1 ? "" : "s"}`}
              className={adminStyles.fw700}
            />
          </div>
          <div className={adminStyles.tableWrapper}>
            <table className={adminStyles.table}>
              <thead>
                <tr>
                  <th>Pack</th>
                  <th>Learner</th>
                  <th>Covering style</th>
                  <th className={adminStyles.w120}>Service charge</th>
                </tr>
              </thead>
              <tbody>
                {pexcoverPacks.map((pack, index) => (
                  <tr key={`${pack.pack_name ?? "pack"}-${index}`}>
                    <td className={adminStyles.fw600}>
                      {pack.pack_name ?? `Pack ${index + 1}`}
                      {pack.grade ? ` (${pack.grade})` : ""}
                    </td>
                    <td>{pack.learner_name || "-"}</td>
                    <td>
                      {pexcoverPaperStyleLabel(
                        normalisePexcoverPaperStyle(pack.pexcover_paper_style),
                      )}
                    </td>
                    <td>{money(pack.pexcover_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      <div className={`${adminStyles.tableCard} ${adminStyles.pCard}`}>
        <div
          className={`${styles.text11} ${adminStyles.fw700} ${adminStyles.uppercase} ${adminStyles.lsWide} ${adminStyles.cSubtle} ${adminStyles.mb12}`}
        >
          Packing Lifecycle Stepper
        </div>
        <div className={adminStyles.grid6}>
          {STEPS.map((item, idx) => {
            const done = idx < currentStep;
            const active = idx === currentStep;
            const enabled =
              canManageFulfilment &&
              canAdvanceStage(item.key, packingStatus, fulfilmentStatus);
            const btnCls = active
              ? `${styles.primaryBtn} ${styles.text11} ${adminStyles.justifyCenter} ${adminStyles.stepBtnActive}`
              : done
                ? `${styles.secondaryBtn} ${styles.text11} ${adminStyles.justifyCenter} ${adminStyles.stepBtnDone}`
                : `${styles.secondaryBtn} ${styles.text11} ${adminStyles.justifyCenter} ${adminStyles.opacity50}`;

            return (
              <form
                key={item.key}
                action={advanceFulfilmentStageAction.bind(null, order.id)}
              >
                <input type="hidden" name="stage" value={item.key} />
                <button type="submit" className={btnCls} disabled={!enabled}>
                  {done ? "Done " : `${idx + 1}. `} {item.stage}
                </button>
              </form>
            );
          })}
        </div>
      </div>

      <div
        className={`${adminStyles.tableCard} ${adminStyles.tableCardPadded18} ${adminStyles.mt18}`}
      >
        <div className={`${adminStyles.headerRow} ${adminStyles.mb16}`}>
          <div>
            <h2 className={styles.sectionHeaderTitle}>
              Item Pack-Out &amp; Barcode Verification
            </h2>
            <p className={styles.sectionSubtitle}>
              Verify normalized order items against the paid commercial
              snapshot.
            </p>
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
                    <input
                      type="checkbox"
                      defaultChecked={Boolean(row.product_id)}
                      className={adminStyles.checkboxAccented}
                    />
                  </td>
                  <td>
                    <div className={adminStyles.fw600}>
                      {row.product_name_snapshot}
                    </div>
                    {row.requires_pexcover ? (
                      <div className={adminStyles.cMuted}>
                        Pexcover covering required
                      </div>
                    ) : null}
                    <div className={adminStyles.cMuted}>
                      {row.school_name_snapshot || order.school_name}{" "}
                      {row.grade_snapshot || order.grade}
                    </div>
                  </td>
                  <td>
                    <strong className={adminStyles.fw700}>
                      {row.quantity}
                    </strong>
                  </td>
                  <td className={adminStyles.cMuted}>{row.sku_snapshot}</td>
                  <td>
                    {row.product_id ? (
                      <StatusBadge status="Matched" tone="emerald" />
                    ) : (
                      <StatusBadge status="Unmatched" tone="amber" />
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className={adminStyles.cMuted}>
                    No normalized order items found for this order.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          className={`${adminStyles.flex} ${adminStyles.justifyBetween} ${adminStyles.itemsCenter} ${adminStyles.mt18} ${adminStyles.pt14} ${adminStyles.borderTopDark}`}
        >
          <button className={styles.secondaryBtn} type="button">
            <Barcode size={14} /> Scan Next Item
          </button>
          <form action={advanceFulfilmentStageAction.bind(null, order.id)}>
            <input type="hidden" name="stage" value="packed" />
            <button
              className={`${styles.primaryBtn} ${adminStyles.px24}`}
              type="submit"
              disabled={
                !canManageFulfilment || packingStatus !== "quality_check"
              }
            >
              <Save size={14} /> Complete Pack-Out &amp; Print Box Label
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
