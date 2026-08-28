"use client";

import React, { useCallback, useMemo, useState } from "react";
import { AlertTriangle, Clock, MoreVertical, Truck, CheckCircle2 } from "lucide-react";
import styles from "./ProcurementPageView.module.css";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { ZarIcon } from "@/components/admin/ui/ZarIcon";
import { QuickMetricsGrid } from "@/components/admin/ui/QuickMetricsGrid";

interface KanbanCard {
  id: string;
  poNumber: string;
  supplier: string;
  itemsCount: number;
  value: number;
  assignee: string;
  dueLabel: string;
  category: string;
  stage: "Needs Procurement" | "Partially Secured" | "Fully Secured" | "Completed";
}

const SEED_KANBAN: KanbanCard[] = [
  { id: "po-1", poNumber: "PO-10056", supplier: "Makro Trade", itemsCount: 68, value: 54780.0, assignee: "MN", dueLabel: "Due 02 Sep", category: "Exclusive", stage: "Needs Procurement" },
  { id: "po-2", poNumber: "PO-10057", supplier: "BSC Stationers", itemsCount: 92, value: 82140.0, assignee: "JW", dueLabel: "Due 05 Sep", category: "Stationery", stage: "Partially Secured" },
  { id: "po-3", poNumber: "PO-10058", supplier: "Makro Trade", itemsCount: 34, value: 38431.0, assignee: "MN", dueLabel: "Due 09 Sep", category: "Exclusive", stage: "Fully Secured" },
  { id: "po-4", poNumber: "PO-10059", supplier: "BSC Stationers", itemsCount: 31, value: 28100.12, assignee: "JW", dueLabel: "Due 12 Sep", category: "Stationery", stage: "Completed" },
];

const STAGES: KanbanCard["stage"][] = [
  "Needs Procurement",
  "Partially Secured",
  "Fully Secured",
  "Completed",
];

export function ProcurementPageView() {
  const [cards, setCards] = useState<KanbanCard[]>(SEED_KANBAN);

  const { committedSpend, outstandingPOValue, revenueAtRisk } = useMemo(() => {
    let committed = 0, outstanding = 0, atRisk = 0;
    for (const c of cards) {
      committed += c.value;
      if (c.stage !== "Completed") outstanding += c.value;
      if (c.stage === "Needs Procurement") atRisk += c.value;
    }
    return { committedSpend: committed, outstandingPOValue: outstanding, revenueAtRisk: atRisk };
  }, [cards]);

  const moveStage = useCallback((id: string) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const idx = STAGES.indexOf(c.stage);
          const nextStage = STAGES[(idx + 1) % STAGES.length];
          return { ...c, stage: nextStage };
        }
        return c;
      })
    );
  }, []);

  return (
    <div className={styles.container}>
      <AdminPageHeader
        title="Procurement & Purchase Orders"
        count={cards.length}
        subtitle="Manage aggregate stationery demand, purchase orders, and supplier allocations."
        actions={
          <AdminButton
            href="/admin/procurement/receiving"
            variant="secondary"
            icon={<Truck size={14} />}
          >
            Goods Receiving
          </AdminButton>
        }
      />

      {/* Metrics Row */}
      <QuickMetricsGrid
        metrics={[
          {
            label: "COMMITTED SPEND",
            value: `R ${committedSpend.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`,
            subtitle: "Total PO value generated",
            trendDirection: "up",
            tone: "emerald",
            icon: <ZarIcon size={16} />,
          },
          {
            label: "OUTSTANDING DELIVERIES",
            value: `R ${outstandingPOValue.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`,
            subtitle: "Pending goods receipt",
            trendDirection: "up",
            tone: "amber",
            icon: <Clock size={16} />,
          },
          {
            label: "DEMAND AT RISK",
            value: `R ${revenueAtRisk.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`,
            subtitle: "Needs urgent supplier PO",
            trendDirection: "down",
            tone: "red",
            icon: <AlertTriangle size={16} />,
          },
          {
            label: "FULFILLED POs",
            value: cards.filter((c) => c.stage === "Completed").length,
            subtitle: "Goods checked in & stored",
            trendDirection: "up",
            tone: "purple",
            icon: <CheckCircle2 size={16} />,
          },
        ]}
      />

      {/* Kanban Board */}
      <div className={styles.kanbanGrid}>
        {STAGES.map((stg) => {
          const stageCards = cards.filter((c) => c.stage === stg);
          return (
            <div key={stg} className={styles.kanbanColumn}>
              <div className={styles.kanbanColumnHeader}>
                <span className={styles.columnTitle}>{stg}</span>
                <span className={styles.columnCount}>{stageCards.length}</span>
              </div>
              <div className={styles.kanbanCardsList}>
                {stageCards.map((card) => (
                  <div
                    key={card.id}
                    className={styles.kanbanCard}
                    onClick={() => moveStage(card.id)}
                  >
                    <div className={styles.cardZoneTop}>
                      <span className={styles.poNumber}>{card.poNumber}</span>
                      <button
                        type="button"
                        className={styles.optionsButton}
                        aria-label={`Options for ${card.poNumber}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>
                    <div className={styles.cardZoneMiddle}>
                      <span className={styles.supplierName}>{card.supplier}</span>
                      <span className={styles.supplierMeta}>{card.category}</span>
                    </div>
                    <div className={styles.cardZoneFooter}>
                      <span className={styles.footerMeta}>
                        <span className={styles.footerAvatar} aria-hidden="true">
                          {card.assignee}
                        </span>
                        <span className={styles.footerDate}>{card.dueLabel}</span>
                      </span>
                      <span className={styles.cardValue}>
                        {card.itemsCount} SKU · R{" "}
                        {card.value.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ))}
                {stageCards.length === 0 && (
                  <div className={styles.kanbanEmpty}>No purchase orders</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
