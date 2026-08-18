"use client";

import { useState } from "react";
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

  const committedSpend = cards.reduce((sum, c) => sum + c.value, 0);
  const outstandingPOValue = cards.filter((c) => c.stage !== "Completed").reduce((sum, c) => sum + c.value, 0);
  const revenueAtRisk = cards.filter((c) => c.stage === "Needs Procurement").reduce((sum, c) => sum + c.value, 0);

  const moveStage = (id: string) => {
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
  };

  const handleGeneratePO = (supplier: string) => {
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
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
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
        <div className={styles.badgeGreen} style={{ padding: "10px 14px", fontSize: 13 }}>
          <CheckCircle2 size={16} /> {generatedMessage}
        </div>
      )}

      {/* Financial Exposure Cards */}
      <div className={styles.metricsGrid4}>
        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Committed Spend</span>
            <div className={`${styles.metricIconWrapper} ${styles.metricIconTeal}`}>
              <DollarSign size={16} />
            </div>
          </div>
          <div className={styles.metricValue}>R {committedSpend.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>Total supplier commitment</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Outstanding PO Value</span>
            <div className={`${styles.metricIconWrapper} ${styles.metricIconAmber}`}>
              <ShoppingCart size={16} />
            </div>
          </div>
          <div className={styles.metricValue} style={{ color: "#fbbf24" }}>
            R {outstandingPOValue.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: 11, color: "#64748b" }}>In-flight open POs</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Revenue at Risk</span>
            <div className={`${styles.metricIconWrapper} ${styles.metricIconRed}`}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className={styles.metricValue} style={{ color: "#f87171" }}>
            R {revenueAtRisk.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: 11, color: "#64748b" }}>Unsecured procurement items</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Quick Bulk PO Generators</span>
            <div className={`${styles.metricIconWrapper} ${styles.metricIconBlue}`}>
              <FileSpreadsheet size={16} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <button className={styles.secondaryBtn} style={{ height: 26, fontSize: 10 }} onClick={() => handleGeneratePO("Waltons")} type="button">
              + Waltons
            </button>
            <button className={styles.secondaryBtn} style={{ height: 26, fontSize: 10 }} onClick={() => handleGeneratePO("Croxley")} type="button">
              + Croxley
            </button>
            <button className={styles.secondaryBtn} style={{ height: 26, fontSize: 10 }} onClick={() => handleGeneratePO("Bidvest")} type="button">
              + Bidvest
            </button>
          </div>
        </div>
      </div>

      {/* 4-Stage Kanban Board */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 12 }}>
        {(["Needs Procurement", "Partially Secured", "Fully Secured", "Completed"] as const).map((stage) => {
          const stageCards = cards.filter((c) => c.stage === stage);
          return (
            <div
              key={stage}
              className={styles.sidebarCard}
              style={{ minHeight: 380, background: "#0c1322", border: "1px solid #1e293b" }}
            >
              <div className={styles.sidebarCardHeader}>
                <span>{stage}</span>
                <span className={styles.badgeTeal}>{stageCards.length}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {stageCards.map((c) => (
                  <div
                    key={c.id}
                    className={styles.quickActionItem}
                    style={{ flexDirection: "column", alignItems: "flex-start", gap: 6 }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                      <strong style={{ color: "#ffffff", fontSize: 13 }}>{c.poNumber}</strong>
                      <span style={{ color: "#2dd4bf", fontWeight: 700 }}>
                        R {c.value.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{c.supplier} • {c.itemsCount} items</div>
                    <button
                      className={styles.secondaryBtn}
                      style={{ height: 24, fontSize: 10, alignSelf: "flex-end", marginTop: 4 }}
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
