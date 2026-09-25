"use client";

import { useState } from "react";
import { Check, FileDown, Printer, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { PrintableChecklist } from "@/lib/blog-data";

type PrintableChecklistCardProps = {
  checklist: PrintableChecklist;
};

export function PrintableChecklistCard({
  checklist,
}: PrintableChecklistCardProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  function toggleItem(key: string) {
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function handlePrint() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  function resetChecklist() {
    setCheckedItems({});
  }

  const totalItems = checklist.categories.reduce(
    (acc, cat) => acc + cat.items.length,
    0,
  );
  const completedItems = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = Math.round((completedItems / (totalItems || 1)) * 100);

  return (
    <div
      id="printable-checklist-container"
      className="my-10 rounded-card border border-pex-border bg-pex-bg-soft/90 p-6 sm:p-8 shadow-card print:m-0 print:border-none print:p-0 print:bg-white print:shadow-none"
    >
      {/* ── Screen-only header actions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-pex-border print:pb-3 print:border-b-2 print:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pex-coral/10 text-pex-coral border border-pex-coral/20 text-xs font-extrabold uppercase tracking-wide mb-2 print:hidden">
            <FileDown className="size-3.5" />
            <span>Interactive Printable Tool</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-pex-navy m-0">
            {checklist.title}
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-pex-muted m-0">
            {checklist.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5 print:hidden">
          {completedItems > 0 ? (
            <button
              type="button"
              onClick={resetChecklist}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-pex-muted hover:text-pex-navy hover:bg-white transition-colors cursor-pointer"
              title="Reset all checkboxes"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset</span>
            </button>
          ) : null}

          <Button
            type="button"
            variant="navy"
            size="sm"
            onClick={handlePrint}
            className="cursor-pointer"
          >
            <Printer className="size-4 text-pex-coral" />
            <span>Print Checklist</span>
          </Button>
        </div>
      </div>

      {/* ── Progress bar (screen only) ── */}
      <div className="mt-4 mb-6 print:hidden">
        <div className="flex items-center justify-between text-xs font-bold text-pex-muted mb-1.5">
          <span>Your Pack Readiness Progress</span>
          <span className="text-pex-keppel font-extrabold">
            {completedItems} of {totalItems} items ({progressPercent}%)
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-pex-keppel transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ── Printable Header Stamp (Print Only) ── */}
      <div className="hidden print:block mb-4 pt-2">
        <p className="text-xs text-slate-500 font-medium m-0">
          Source: Pexpacks Supplies (https://pexpacks.co.za) • Official South
          African School Stationery Lists
        </p>
      </div>

      {/* ── Checklist Categories ── */}
      <div className="space-y-6">
        {checklist.categories.map((categoryGroup, groupIdx) => (
          <div
            key={categoryGroup.category}
            className="rounded-xl bg-white p-4 sm:p-5 border border-pex-border shadow-2xs print:border-none print:p-0 print:shadow-none"
          >
            <h4 className="text-sm sm:text-base font-extrabold text-pex-navy uppercase tracking-wider mb-3 flex items-center gap-2 print:text-black print:mb-1.5 print:text-sm">
              <span className="flex size-5 items-center justify-center rounded-full bg-pex-navy text-white text-[11px] font-extrabold print:bg-black">
                {groupIdx + 1}
              </span>
              <span>{categoryGroup.category}</span>
            </h4>

            <ul className="space-y-2.5 list-none p-0 m-0 print:space-y-1.5">
              {categoryGroup.items.map((item, itemIdx) => {
                const itemKey = `${groupIdx}-${itemIdx}`;
                const isChecked = Boolean(checkedItems[itemKey]);

                return (
                  <li
                    key={item}
                    onClick={() => toggleItem(itemKey)}
                    className={`group flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors select-none ${
                      isChecked
                        ? "bg-pex-keppel/10 text-pex-muted"
                        : "hover:bg-pex-bg-soft text-pex-navy"
                    } print:p-0 print:hover:bg-transparent print:cursor-default`}
                  >
                    <div
                      className={`mt-0.5 size-5 shrink-0 rounded-md border flex items-center justify-center transition-all ${
                        isChecked
                          ? "bg-pex-keppel border-pex-keppel text-white shadow-2xs"
                          : "border-slate-300 bg-white group-hover:border-pex-keppel"
                      } print:border-black print:bg-white`}
                    >
                      {isChecked ? (
                        <Check className="size-3.5 stroke-[3]" />
                      ) : null}
                    </div>

                    <span
                      className={`text-sm leading-snug print:text-xs print:leading-tight ${
                        isChecked
                          ? "line-through text-pex-muted/80"
                          : "font-semibold text-pex-navy"
                      }`}
                    >
                      {item}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Print Footer Note ── */}
      <div className="mt-8 pt-6 border-t border-pex-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:mt-4 print:pt-2 print:border-t">
        <p className="text-xs text-pex-muted m-0">
          Tip: Every item on this checklist is included in Pexpacks verified
          school stationery packs.
        </p>

        <span className="text-xs font-extrabold text-pex-keppel print:hidden">
          Official CAPS / DBE Aligned
        </span>
      </div>
    </div>
  );
}
