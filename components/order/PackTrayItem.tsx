"use client";

import { useCallback } from "react";
import type { TrayPackItem } from "@/store/usePackTrayStore";
import { usePackTrayStore } from "@/store/usePackTrayStore";
import { formatCurrency } from "@/lib/formatCurrency";
import { calculatePexcoverTotal } from "@/lib/pricing/pexcover";
import {
  PexcoverDrawerCard,
  type PexcoverPaperStyle,
} from "@/components/checkout/PexcoverDrawerCard";
import { cn } from "@/lib/utils";

type PackTrayItemProps = {
  pack: TrayPackItem;
};

export function PackTrayItem({ pack }: PackTrayItemProps) {
  const updatePackDetails = usePackTrayStore((s) => s.updatePackDetails);
  const removePack = usePackTrayStore((s) => s.removePack);

  const pexcoverInfo = calculatePexcoverTotal(pack.items);

  const handleLearnerNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updatePackDetails(
        pack.id,
        e.target.value,
        pack.wantsPexcover || false,
        pack.pexcoverPaperStyle,
      );
    },
    [pack.id, pack.wantsPexcover, pack.pexcoverPaperStyle, updatePackDetails],
  );

  const handlePexcoverToggle = useCallback(
    (_packId: string, enabled: boolean) => {
      if (!pexcoverInfo.hasEligibleBooks) return;
      updatePackDetails(
        pack.id,
        pack.learnerName || "",
        enabled,
        pack.pexcoverPaperStyle || "STANDARD_KRAFT",
      );
    },
    [
      pack.id,
      pack.learnerName,
      pack.pexcoverPaperStyle,
      updatePackDetails,
      pexcoverInfo.hasEligibleBooks,
    ],
  );

  const handleSelectPaperStyle = useCallback(
    (_packId: string, style: PexcoverPaperStyle) => {
      updatePackDetails(
        pack.id,
        pack.learnerName || "",
        true,
        style,
      );
    },
    [pack.id, pack.learnerName, updatePackDetails],
  );

  const handleRemove = useCallback(() => {
    removePack(pack.id);
  }, [pack.id, removePack]);

  const lineItemTotal =
    pack.totalPrice +
    (pack.wantsPexcover && pexcoverInfo.hasEligibleBooks
      ? pexcoverInfo.pexcoverTotalRands
      : 0);

  return (
    <article className="border border-pex-border rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-4 sm:p-4.5 grid gap-2.5">
        <div className="grid grid-cols-[1fr_auto] gap-2 items-start">
          <div>
            {pack.schoolName ? (
              <p className="text-pex-keppel text-xs font-extrabold uppercase tracking-wide m-0 mb-0.5">
                {pack.schoolName}
              </p>
            ) : null}
            <h3 className="m-0 text-pex-navy font-heading text-base sm:text-[17px] font-extrabold leading-snug">
              {pack.packName}
            </h3>
          </div>
          <div className="flex gap-1.5 items-start">
            <span
              className={cn(
                "inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-extrabold leading-none",
                pack.packMode === "full"
                  ? "bg-pex-keppel/10 text-pex-keppel"
                  : "bg-pex-coral/10 text-pex-coral"
              )}
            >
              {pack.packMode === "full" ? "Full Pack" : "Customised"}
            </span>
            <button
              type="button"
              className="w-[30px] h-[30px] border-0 rounded-full bg-transparent hover:bg-destructive/10 text-destructive hover:text-destructive/80 text-xl font-bold flex items-center justify-center cursor-pointer transition-colors"
              onClick={handleRemove}
              aria-label={`Remove ${pack.packName} from order`}
              data-tooltip="Remove pack"
              data-tooltip-pos="left"
            >
              &times;
            </button>
          </div>
        </div>

        <div className="grid gap-1">
          <label
            className="text-xs font-semibold text-pex-navy/80"
            htmlFor={`learner-${pack.id}`}
          >
            Who is this pack for?
          </label>
          <input
            id={`learner-${pack.id}`}
            className="w-full min-h-[42px] border border-pex-border hover:border-pex-border-focus focus:border-pex-keppel rounded-xl px-3 bg-white text-pex-navy text-sm transition-colors outline-none focus:ring-2 focus:ring-pex-keppel/20 placeholder:text-pex-muted/60"
            type="text"
            placeholder="Learner's First & Last Name"
            value={pack.learnerName ?? ""}
            onChange={handleLearnerNameChange}
            autoComplete="name"
          />
        </div>

        {/* Pexcover Book Covering In-Card Selector */}
        <PexcoverDrawerCard
          packId={pack.id}
          coverableCount={pexcoverInfo.coverableItemCount}
          coveringPriceCents={pexcoverInfo.pexcoverTotalCents}
          enabled={Boolean(pack.wantsPexcover && pexcoverInfo.hasEligibleBooks)}
          selectedStyle={pack.pexcoverPaperStyle || "STANDARD_KRAFT"}
          onToggle={handlePexcoverToggle}
          onSelectStyle={handleSelectPaperStyle}
        />

        <div className="flex justify-between items-center gap-2 pt-2 border-t border-pex-border">
          <span className="text-pex-muted text-xs font-semibold">
            {pack.items.length} {pack.items.length === 1 ? "item" : "items"}
            {pack.addOns && pack.addOns.length > 0
              ? ` + ${pack.addOns.length} add-on${pack.addOns.length === 1 ? "" : "s"}`
              : ""}
          </span>
          <span className="text-pex-navy text-base sm:text-lg font-extrabold">
            {formatCurrency(lineItemTotal)}
          </span>
        </div>
      </div>
    </article>
  );
}
