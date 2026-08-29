"use client";

import React, { useMemo } from "react";
import { AlertTriangle, Clock, MoreVertical, Truck, CheckCircle2 } from "lucide-react";
import styles from "./ProcurementPageView.module.css";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { ZarIcon } from "@/components/admin/ui/ZarIcon";
import { QuickMetricsGrid } from "@/components/admin/ui/QuickMetricsGrid";
import type { ProcurementRow } from "@/lib/admin/operations";

interface ProcurementPageViewProps {
  initialData: ProcurementRow[];
}

type ProcurementStage = "Needs Procurement" | "Partially Secured" | "Fully Secured" | "Completed";

const STAGES: ProcurementStage[] = [
  "Needs Procurement",
  "Partially Secured",
  "Fully Secured",
  "Completed",
];

function stageForRequirement(row: ProcurementRow): ProcurementStage {
  if (row.received_quantity >= row.required_quantity && row.required_quantity > 0) return "Completed";
  if (row.outstanding_quantity <= 0 || row.status === "secured") return "Fully Secured";
  if (row.secured_quantity > 0 || row.status === "partially_secured") return "Partially Secured";
  return "Needs Procurement";
}

function dueLabel(value: string): string {
  return `Updated ${new Date(value).toLocaleDateString("en-ZA", { day: "2-digit", month: "short" })}`;
}

function estimateRequirementValue(row: ProcurementRow): number {
  return Math.max(0, Number(row.outstanding_quantity || 0));
}

export function ProcurementPageView({ initialData }: ProcurementPageViewProps) {
  const cards = useMemo(
    () =>
      initialData.map((row) => ({
        ...row,
        stage: stageForRequirement(row),
        value: estimateRequirementValue(row),
      })),
    [initialData],
  );

  const { committedUnits, outstandingUnits, atRiskUnits, completedCount } = useMemo(() => {
    let committed = 0;
    let outstanding = 0;
    let atRisk = 0;
    let completed = 0;
    for (const row of cards) {
      committed += Number(row.required_quantity || 0);
      outstanding += Math.max(0, Number(row.outstanding_quantity || 0));
      if (row.stage === "Needs Procurement") atRisk += Math.max(0, Number(row.outstanding_quantity || 0));
      if (row.stage === "Completed") completed += 1;
    }
    return { committedUnits: committed, outstandingUnits: outstanding, atRiskUnits: atRisk, completedCount: completed };
  }, [cards]);

  return (
    <div className={styles.container}>
      <AdminPageHeader
        title="Procurement & Purchase Orders"
        count={cards.length}
        subtitle="Manage aggregate stationery demand, purchase orders, and supplier allocations."
        actions={
          <AdminButton href="/admin/procurement/receiving" variant="secondary" icon={<Truck size={14} />}>
            Goods Receiving
          </AdminButton>
        }
      />

      <QuickMetricsGrid
        metrics={[
          {
            label: "COMMITTED UNITS",
            value: committedUnits.toLocaleString("en-ZA"),
            subtitle: "From paid order demand",
            trendDirection: "neutral",
            tone: "emerald",
            icon: <ZarIcon size={16} />,
          },
          {
            label: "OUTSTANDING UNITS",
            value: outstandingUnits.toLocaleString("en-ZA"),
            subtitle: "Still requiring supply",
            trendDirection: "neutral",
            tone: "amber",
            icon: <Clock size={16} />,
          },
          {
            label: "DEMAND AT RISK",
            value: atRiskUnits.toLocaleString("en-ZA"),
            subtitle: "No secured quantity yet",
            trendDirection: "neutral",
            tone: "red",
            icon: <AlertTriangle size={16} />,
          },
          {
            label: "COMPLETED LINES",
            value: completedCount,
            subtitle: "Received in full",
            trendDirection: "neutral",
            tone: "purple",
            icon: <CheckCircle2 size={16} />,
          },
        ]}
      />

      <div className={styles.kanbanGrid}>
        {STAGES.map((stage) => {
          const stageCards = cards.filter((card) => card.stage === stage);
          return (
            <div key={stage} className={styles.kanbanColumn}>
              <div className={styles.kanbanColumnHeader}>
                <span className={styles.columnTitle}>{stage}</span>
                <span className={styles.columnCount}>{stageCards.length}</span>
              </div>
              <div className={styles.kanbanCardsList}>
                {stageCards.map((card) => (
                  <div key={card.id} className={styles.kanbanCard}>
                    <div className={styles.cardZoneTop}>
                      <span className={styles.poNumber}>{card.sku || card.product_name}</span>
                      <button
                        type="button"
                        className={styles.optionsButton}
                        aria-label={`Options for ${card.product_name}`}
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>
                    <div className={styles.cardZoneMiddle}>
                      <span className={styles.supplierName}>{card.product_name}</span>
                      <span className={styles.supplierMeta}>{card.category || card.status}</span>
                    </div>
                    <div className={styles.cardZoneFooter}>
                      <span className={styles.footerMeta}>
                        <span className={styles.footerAvatar} aria-hidden="true">
                          {Math.round(card.procurement_coverage_percent)}%
                        </span>
                        <span className={styles.footerDate}>{dueLabel(card.updated_at)}</span>
                      </span>
                      <span className={styles.cardValue}>
                        {card.outstanding_quantity} open / {card.required_quantity} units
                      </span>
                    </div>
                  </div>
                ))}
                {stageCards.length === 0 && <div className={styles.kanbanEmpty}>No procurement requirements</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}