"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  AlertTriangle,
  Clock,
  Truck,
} from "lucide-react";
import styles from "./CorePagesView.module.css";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { MetricCard } from "@/components/admin/ui/AdminCard";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ZarIcon } from "@/components/admin/ui/ZarIcon";

interface KanbanCard {
  id: string;
  poNumber: string;
  supplier: string;
  itemsCount: number;
  value: number;
  stage: "Needs Procurement" | "Partially Secured" | "Fully Secured" | "Completed";
}

const SEED_KANBAN: KanbanCard[] = [
  { id: "po-1", poNumber: "PO-10056", supplier: "Makro Trade", itemsCount: 68, value: 54780.00, stage: "Needs Procurement" },
  { id: "po-2", poNumber: "PO-10057", supplier: "BSC Stationers", itemsCount: 92, value: 82140.00, stage: "Partially Secured" },
  { id: "po-3", poNumber: "PO-10058", supplier: "Makro Trade", itemsCount: 34, value: 38431.00, stage: "Fully Secured" },
  { id: "po-4", poNumber: "PO-10059", supplier: "BSC Stationers", itemsCount: 31, value: 28100.12, stage: "Completed" },
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginBottom: "20px" }}>
        <MetricCard
          label="Committed Spend"
          value={`R ${committedSpend.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`}
          subtext="Total PO value generated"
          icon={<ZarIcon size={16} />}
          iconTone="green"
        />
        <MetricCard
          label="Outstanding Deliveries"
          value={`R ${outstandingPOValue.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`}
          subtext="Pending goods receipt"
          icon={<Clock size={16} />}
          iconTone="amber"
        />
        <MetricCard
          label="Demand At Risk"
          value={`R ${revenueAtRisk.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`}
          subtext="Needs urgent supplier PO"
          icon={<AlertTriangle size={16} />}
          iconTone="red"
        />
      </div>

      {/* Kanban Board */}
      <div className={styles.kanbanGrid}>
        {STAGES.map((stg) => {
          const stageCards = cards.filter((c) => c.stage === stg);
          return (
            <div key={stg} className={styles.kanbanCol}>
              <div className={styles.kanbanHeader}>
                <span className={styles.kanbanTitle}>{stg}</span>
                <span className={styles.kanbanCount}>{stageCards.length}</span>
              </div>
              <div className={styles.kanbanCardList}>
                {stageCards.map((c) => (
                  <div key={c.id} className={styles.kanbanCard} onClick={() => moveStage(c.id)}>
                    <div className={styles.kanbanCardTop}>
                      <span className={styles.itemSkuBadge}>{c.poNumber}</span>
                      <StatusBadge status={c.stage} showDot />
                    </div>
                    <div className={styles.kanbanCardTitle}>{c.supplier}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "#94a3b8" }}>
                      <span>{c.itemsCount} Items</span>
                      <span className={styles.priceHighlight}>R {c.value.toFixed(2)}</span>
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
