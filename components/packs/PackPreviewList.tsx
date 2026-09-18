"use client";

import type { MouseEventHandler } from "react";
import { ItemIcon } from "@/components/ui/ItemIcon";
import type { PackListItem } from "./packListTypes";
import { ViewCompleteListButton } from "./ViewCompleteListButton";

type PackPreviewListProps = {
  items: PackListItem[];
  listLabel: string;
  previewLimit?: number;
  viewCompleteAriaLabel: string;
  onViewCompleteList: MouseEventHandler<HTMLButtonElement>;
};

export function PackPreviewList({
  items,
  listLabel,
  previewLimit = 5,
  viewCompleteAriaLabel,
  onViewCompleteList,
}: PackPreviewListProps) {
  const visibleItems = items.slice(0, previewLimit);
  const remainingCount = Math.max(items.length - visibleItems.length, 0);

  return (
    <div className="grid gap-3">
      {visibleItems.length ? (
        <ul className="grid gap-2.5 mt-0.5 mb-0 p-0 text-[var(--pex-text-muted,#4d5a5d)] text-sm leading-[1.45] list-none" aria-label={listLabel}>
          {visibleItems.map((item, index) => (
            <li key={`${item.id}-${index}`} className="flex items-start min-w-0 gap-2.5">
              <ItemIcon name={item.icon} size={17} className="shrink-0 text-[var(--pex-keppel,#1a7a77)]" />
              <span className="grid gap-0.5 min-w-0">
                <span>{item.name}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 text-[var(--pex-text-muted,#4d5a5d)] text-sm leading-[1.45]">The stationery list is being finalised.</p>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-3.5 min-w-0">
        {remainingCount > 0 ? (
          <span className="min-w-0 text-[var(--pex-navy,#1a2a40)] text-[15px] font-extrabold leading-[1.2]">
            +{remainingCount} more essentials
          </span>
        ) : null}
        <ViewCompleteListButton
          ariaLabel={viewCompleteAriaLabel}
          onClick={onViewCompleteList}
        />
      </div>
    </div>
  );
}
