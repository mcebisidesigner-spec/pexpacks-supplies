"use client";

import { useState } from "react";
import { Check, CheckCircle2, FileDown, Printer, RotateCcw } from "lucide-react";
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
      className="my-10 rounded-2xl border-2 border-slate-200 bg-slate-50/90 p-6 sm:p-8 shadow-sm print:m-0 print:border-none print:p-0 print:bg-white print:shadow-none"
    >
      {/* ── Screen-only header actions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 print:pb-3 print:border-b-2 print:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-extrabold uppercase tracking-wide mb-2 print:hidden">
            <FileDown className="size-3.5" />
            <span>Interactive Printable Tool</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 m-0">
            {checklist.title}
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 m-0">
            {checklist.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5 print:hidden">
          {completedItems > 0 ? (
            <button
              type="button"
              onClick={resetChecklist}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 transition-colors cursor-pointer"
              title="Reset all checkboxes"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset</span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-extrabold tracking-wide shadow-sm hover:shadow transition-all active:scale-[0.98] cursor-pointer"
          >
            <Printer className="size-4 text-orange-400" />
            <span>Print Checklist</span>
          </button>
        </div>
      </div>

      {/* ── Progress bar (screen only) ── */}
      <div className="mt-4 mb-6 print:hidden">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1.5">
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
            className="rounded-xl bg-white p-4 sm:p-5 border border-slate-200 shadow-2xs print:border-none print:p-0 print:shadow-none"
          >
            <h4 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2 print:text-black print:mb-1.5 print:text-sm">
              <span className="flex size-5 items-center justify-center rounded-full bg-slate-900 text-white text-[11px] font-extrabold print:bg-black">
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
                        ? "bg-teal-50/60 text-slate-500"
                        : "hover:bg-slate-50 text-slate-800"
                    } print:p-0 print:hover:bg-transparent print:cursor-default`}
                  >
                    <div
                      className={`mt-0.5 size-5 shrink-0 rounded-md border flex items-center justify-center transition-all ${
                        isChecked
                          ? "bg-pex-keppel border-pex-keppel text-white shadow-xs"
                          : "border-slate-300 bg-white group-hover:border-slate-400"
                      } print:border-black print:bg-white print:text-black print:size-3.5 print:rounded-xs`}
                    >
                      {isChecked ? (
                        <Check className="size-3.5 stroke-[3] print:hidden" />
                      ) : null}
                    </div>

                    <span
                      className={`text-xs sm:text-sm leading-relaxed ${
                        isChecked
                          ? "line-through text-slate-400 font-medium"
                          : "font-semibold text-slate-800"
                      } print:no-underline print:text-black print:text-xs print:font-normal`}
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

      {/* ── Tip Callout ── */}
      {checklist.schoolTip ? (
        <div className="mt-6 rounded-xl bg-orange-50/70 border border-orange-200/80 p-4 text-xs text-orange-950 font-medium flex items-start gap-2.5 print:mt-3 print:bg-white print:border-slate-300 print:text-black">
          <CheckCircle2 className="size-4 text-orange-600 shrink-0 mt-0.5 print:text-black" />
          <span>{checklist.schoolTip}</span>
        </div>
      ) : null}
    </div>
  );
}
