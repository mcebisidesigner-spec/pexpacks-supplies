"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  FileSpreadsheet,
  Plus,
  Search,
  ShoppingCart,
  TrendingUp,
  Truck,
  Zap,
} from "lucide-react";
import styles from "./CorePagesView.module.css";
import adminStyles from "@/app/admin/admin.module.css";
import viewStyles from "@/components/admin/views/CorePagesView.module.css";

interface KanbanCard {
  id: string;
  poNumber: string;
  supplier: string;
  itemsCount: number;
  value: number;
  stage: "Needs Procurement" | "Partially Secured" | "Fully Secured" | "Completed";
}

const SEED_KANBAN: KanbanCard[] = [
  { id: "po-1", poNumber: "PO-10056", supplier: "Waltons Stationery", itemsCount: 68, value: 54780.00, stage: "Needs Procurement" },
  { id: "po-2", poNumber: "PO-10057", supplier: "Bidvest Waltons", itemsCount: 92, value: 82140.00, stage: "Partially Secured" },
  { id: "po-3", poNumber: "PO-10058", supplier: "Croxley Paper", itemsCount: 34, value: 38431.00, stage: "Fully Secured" },
  { id: "po-4", poNumber: "PO-10059", supplier: "Staedtler SA", itemsCount: 31, value: 28100.12, stage: "Completed" },
];

export function ProcurementPageView() {
  const [cards, setCards] = useState<KanbanCard[]>(SEED_KANBAN);
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);

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
    const stages: KanbanCard["stage"][] = ["Needs Procurement", "Partially Secured", "Fully Secured", "Completed"];
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const idx = stages.indexOf(c.stage);
          const nextStage = stages[(idx + 1) % stages.length];
          return { ...c, stage: nextStage };
        }
        return c;
      })
    );
  }, []);

  const handleGeneratePO = useCallback((supplier: string) => {
    const poNum = `PO-${Math.floor(10000 + Math.random() * 90000)}`;
    const newCard: KanbanCard = {
      id: `po-${Date.now()}`,
      poNumber: poNum,
      supplier,
      itemsCount: 45,
      value: 32500.00,
      stage: "Needs Procurement",
    };
    setCards((prev) => [newCard, ...prev]);
    setGeneratedMessage(`Generated 1-Click Purchase Order ${poNum} for ${supplier}!`);
    setTimeout(() => setGeneratedMessage(null), 4000);
  }, []);

  const kanbanColumns = useMemo(() => {
    const stages = ["Needs Procurement", "Partially Secured", "Fully Secured", "Completed"] as const;
    return stages.map((stage) => ({
      stage,
      cards: cards.filter((c) => c.stage === stage),
    }));
  }, [cards]);

  return (
    <div className={styles.container}>
      <div className={adminStyles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>Procurement Pipeline & PO Workspace</h1>
          <p className={styles.headerSubtitle}>Financial exposure & 4-stage procurement workflow</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.primaryBtn} type="button" onClick={() => handleGeneratePO("Waltons Stationery")}>
            <Zap size={14} /> 1-Click PO Generator
          </button>
        </div>
      </div>

      {generatedMessage && (
        <div className={`${adminStyles.badgeGreen} ${adminStyles.badgeGreenPadded}`}>
          <CheckCircle2 size={16} /> {generatedMessage}
        </div>
      )}

      {/* Financial Exposure Cards */}
      <div className={adminStyles.metricsGrid4}>
        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Committed Spend</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconTeal}`}>
              <DollarSign size={16} />
            </div>
          </div>
          <div className={adminStyles.metricValue}>R {committedSpend.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</div>
          <div className={adminStyles.kanbanMetricCaption}>Total supplier commitment</div>
        </div>

        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Outstanding PO Value</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconAmber}`}>
              <ShoppingCart size={16} />
            </div>
          </div>
          <div className={`${adminStyles.metricValue} ${adminStyles.kanbanMetricValueAmber}`}>
            R {outstandingPOValue.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
          </div>
          <div className={adminStyles.kanbanMetricCaption}>In-flight open POs</div>
        </div>

        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Revenue at Risk</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconRed}`}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className={`${adminStyles.metricValue} ${adminStyles.kanbanMetricValueRed}`}>
            R {revenueAtRisk.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
          </div>
          <div className={adminStyles.kanbanMetricCaption}>Unsecured procurement items</div>
        </div>

        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Quick Bulk PO Generators</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconBlue}`}>
              <FileSpreadsheet size={16} />
            </div>
          </div>
          <div className={`${adminStyles.flex} ${adminStyles.gap6} ${adminStyles.mt8}`}>
            <button className={`${styles.secondaryBtn} ${adminStyles.poBtnSmall}`} onClick={() => handleGeneratePO("Waltons")} type="button">
              + Waltons
            </button>
            <button className={`${styles.secondaryBtn} ${adminStyles.poBtnSmall}`} onClick={() => handleGeneratePO("Croxley")} type="button">
              + Croxley
            </button>
            <button className={`${styles.secondaryBtn} ${adminStyles.poBtnSmall}`} onClick={() => handleGeneratePO("Bidvest")} type="button">
              + Bidvest
            </button>
          </div>
        </div>
      </div>

      {/* 4-Stage Kanban Board */}
      <div className={adminStyles.kanbanGrid}>
        {kanbanColumns.map(({ stage, cards: stageCards }) => {
          return (
            <div
              key={stage}
              className={`${adminStyles.sidebarCard} ${adminStyles.kanbanCol}`}
            >
              <div className={adminStyles.sidebarCardHeader}>
                <span>{stage}</span>
                <span className={adminStyles.badgeTeal}>{stageCards.length}</span>
              </div>

              <div className={adminStyles.kanbanItems}>
                {stageCards.map((c) => (
                  <div
                    key={c.id}
                    className={`${adminStyles.quickActionItem} ${adminStyles.kanbanCard}`}
                  >
                    <div className={adminStyles.kanbanCardTop}>
                      <strong className={adminStyles.kanbanPoNumber}>{c.poNumber}</strong>
                      <span className={adminStyles.kanbanValue}>
                        R {c.value.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className={adminStyles.kanbanMeta}>{c.supplier} • {c.itemsCount} items</div>
                    <button
                      className={`${styles.secondaryBtn} ${adminStyles.kanbanAdvance}`}
                      onClick={() => moveStage(c.id)}
                      type="button"
                    >
                      Advance Stage <ArrowRight size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
