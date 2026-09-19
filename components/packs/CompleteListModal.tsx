"use client";

import Link from "next/link";
import { useCallback } from "react";
import { CompleteListTable } from "./CompleteListTable";
import { Drawer } from "@/components/ui/Drawer";
import type { CompleteListPack } from "./packListTypes";

type CompleteListModalProps = {
  pack: CompleteListPack | null;
  onClose: () => void;
  onAddToOrder?: () => void;
};

function safeId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

// Shared button class strings
const addToOrderCls =
  "w-full min-h-[52px] border-0 rounded-full bg-[var(--pex-coral)] text-[var(--pex-bg)] font-inherit text-[17px] font-extrabold cursor-pointer flex items-center justify-center gap-[var(--space-2)] no-underline transition-[var(--button-transition)] hover:brightness-110 hover:[transform:var(--button-hover-transform)] hover:[box-shadow:var(--button-hover-shadow)] active:brightness-100 active:[transform:var(--button-active-transform)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:brightness-100 disabled:shadow-none focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]";

const customiseCls =
  "w-full min-h-[48px] border border-[var(--pex-border)] rounded-full bg-[var(--pex-bg)] text-[var(--pex-primary)] font-inherit text-[15px] font-bold cursor-pointer flex items-center justify-center gap-[var(--space-2)] transition-[var(--button-transition)] hover:border-[var(--pex-keppel)] hover:text-[var(--pex-keppel)] hover:[transform:var(--button-hover-transform)] focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]";

export function CompleteListModal({
  pack,
  onClose,
  onAddToOrder,
}: CompleteListModalProps) {
  const handleCustomise = useCallback(() => {
    const targetId = pack?.customiseTargetId;
    if (!targetId) return;
    onClose();
    window.setTimeout(() => {
      const trigger = document.getElementById(
        targetId,
      ) as HTMLButtonElement | null;
      trigger?.click();
    }, 0);
  }, [onClose, pack]);

  if (!pack) return null;

  const idBase = safeId(pack.id);
  const titleId = `${idBase}-complete-list-title`;
  const countFormatted = String(pack.items.length).padStart(2, "0");
  const itemWord =
    pack.items.length === 1 ? "Stationery product" : "Stationery products";
  const subtitleText = `${countFormatted} ${itemWord}`;

  return (
    <Drawer
      isOpen={Boolean(pack)}
      onClose={onClose}
      title={pack.modalTitle}
      titleId={titleId}
      subtitle={
        <span className="block mt-[6px] text-[var(--pex-keppel)] text-[14px] font-bold tracking-[-0.01em]">
          {subtitleText}
        </span>
      }
      footer={
        <>
          <p className="m-0 mb-[4px] text-[var(--pex-primary)] text-[26px] font-black font-[var(--font-heading)] leading-[1.2]">
            {pack.priceLabel}
          </p>
          {onAddToOrder ? (
            <button
              type="button"
              className={addToOrderCls}
              onClick={onAddToOrder}
            >
              Add to Order
            </button>
          ) : pack.fullPackHref ? (
            <Link href={pack.fullPackHref} className={addToOrderCls}>
              Add to Order
            </Link>
          ) : (
            <button type="button" className={addToOrderCls} disabled>
              Add to Order
            </button>
          )}
          {pack.customiseTargetId ? (
            <button
              type="button"
              className={customiseCls}
              onClick={handleCustomise}
            >
              Customise This Pack
            </button>
          ) : (
            <button type="button" className={customiseCls} disabled>
              Customise This Pack
            </button>
          )}
        </>
      }
    >
      <CompleteListTable
        items={pack.items}
        label={`${pack.gradeLabel} complete stationery list`}
      />
    </Drawer>
  );
}
