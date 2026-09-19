"use client";

import React, { useMemo } from "react";
import { AlertTriangle, Clock, MoreVertical, Truck, CheckCircle2 } from "lucide-react";
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
    <div className="flex flex-col gap-6 w-full text-slate-200">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {STAGES.map((stage) => {
          const stageCards = cards.filter((card) => card.stage === stage);
          return (
            <div key={stage} className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  {stage}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 text-[10px] font-bold border border-slate-800">
                  {stageCards.length}
                </span>
              </div>
              <div className="flex flex-col gap-2 min-h-[80px]">
                {stageCards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 transition-all duration-150 flex flex-col gap-2 hover:-translate-y-0.5 hover:border-slate-700 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-100 truncate min-w-0">
                        {card.sku || card.product_name}
                      </span>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center w-6 h-6 border-0 bg-transparent text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-md cursor-pointer transition-colors"
                        aria-label={`Options for ${card.product_name}`}
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-xs font-semibold text-slate-200 truncate leading-snug">
                        {card.product_name}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate">
                        {card.category || card.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <span className="inline-flex items-center gap-1.5 shrink-0 min-w-0">
                        <span
                          className="inline-flex items-center justify-center shrink-0 w-5.5 h-5.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/25"
                          aria-hidden="true"
                        >
                          {Math.round(card.procurement_coverage_percent)}%
                        </span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {dueLabel(card.updated_at)}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-semibold text-slate-200 whitespace-nowrap shrink-0">
                        {card.outstanding_quantity} open / {card.required_quantity} units
                      </span>
                    </div>
                  </div>
                ))}
                {stageCards.length === 0 && (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No procurement requirements
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}