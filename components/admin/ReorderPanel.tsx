"use client";

import { useState, useTransition } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export type ReorderItem = {
  id: string;
  label: string;
  visible: boolean;
};

export function ReorderPanel({
  title,
  subtitle,
  items,
  onReorder,
}: {
  title: string;
  subtitle: string;
  items: ReorderItem[];
  onReorder: (id: string, direction: "up" | "down") => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const [moving, setMoving] = useState<{
    id: string;
    direction: "up" | "down";
  } | null>(null);

  function handleReorder(id: string, direction: "up" | "down") {
    if (moving) return;
    setMoving({ id, direction });
    startTransition(async () => {
      try {
        await onReorder(id, direction);
      } finally {
        setMoving(null);
      }
    });
  }

  return (
    <aside className="sticky top-6 bg-gradient-to-b from-[var(--db-brand)] to-[#156966] text-white rounded-[18px] p-[18px] shadow-[0_12px_28px_var(--db-brand-subtle)] max-h-[calc(100dvh-48px)] overflow-y-auto max-[1100px]:static max-[1100px]:max-h-none max-[1100px]:-order-1" aria-label="Reorder content">
      <div className="flex items-start gap-3 pb-3.5 mb-3 border-b border-white/[0.22]">
        <div className="flex flex-col gap-0.5 mt-0.5 text-white/90 shrink-0">
          <ChevronUp size={16} />
          <ChevronDown size={16} />
        </div>
        <div>
          <h2 className="m-0 text-base font-extrabold text-white">{title}</h2>
          <p className="mt-1 mb-0 text-xs leading-[1.45] text-white/[0.78]">{subtitle}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="mt-3 mb-0 text-[13px] text-white/[0.78]">Nothing to order yet.</p>
      ) : (
        <ol className="list-none m-0 p-0 flex flex-col gap-2">
          {items.map((item, index) => {
            const atTop = index === 0;
            const atBottom = index === items.length - 1;
            const isBusy = moving?.id === item.id;
            return (
              <li key={item.id} className="relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.14] border border-white/[0.12]">
                <span className="shrink-0 w-[22px] h-[22px] inline-flex items-center justify-center rounded-full bg-white/[0.22] text-white text-[11px] font-extrabold">{index + 1}</span>
                <div className="min-w-0 flex-1 flex flex-col gap-[3px]">
                  <span
                    className="text-[13px] font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis"
                    data-db-tooltip={item.label}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`self-start text-[9px] font-extrabold uppercase tracking-[0.06em] px-[7px] py-0.5 rounded-full ${
                      item.visible
                        ? "bg-white/[0.26] text-white"
                        : "bg-black/[0.22] text-white/80"
                    }`}
                  >
                    {item.visible ? "Live" : "Hidden"}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center w-[30px] h-[26px] border-none rounded-lg bg-white/[0.16] text-white cursor-pointer transition-colors hover:enabled:bg-white/[0.32] disabled:opacity-35 disabled:cursor-not-allowed"
                    onClick={() => handleReorder(item.id, "up")}
                    disabled={atTop || isPending || moving !== null}
                    aria-label={`Move up ${item.label}`}
                    aria-disabled={atTop || isPending}
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center w-[30px] h-[26px] border-none rounded-lg bg-white/[0.16] text-white cursor-pointer transition-colors hover:enabled:bg-white/[0.32] disabled:opacity-35 disabled:cursor-not-allowed"
                    onClick={() => handleReorder(item.id, "down")}
                    disabled={atBottom || isPending || moving !== null}
                    aria-label={`Move down ${item.label}`}
                    aria-disabled={atBottom || isPending}
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
                {isBusy ? (
                  <span className="absolute inset-0 rounded-xl bg-white/[0.14] border border-white/30 pointer-events-none" aria-live="polite" />
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </aside>
  );
}
