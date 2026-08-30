"use client";

import { useCallback } from "react";
import clsx from "clsx";
import type { TrayPackItem } from "@/store/usePackTrayStore";
import { usePackTrayStore } from "@/store/usePackTrayStore";
import { formatCurrency } from "@/lib/formatCurrency";
import { calculatePexcoverTotal } from "@/lib/pricing/pexcover";
import styles from "./GlobalPackTray.module.css";

type PackTrayItemProps = {
  pack: TrayPackItem;
};

export function PackTrayItem({ pack }: PackTrayItemProps) {
  const updatePackDetails = usePackTrayStore((s) => s.updatePackDetails);
  const removePack = usePackTrayStore((s) => s.removePack);

  const pexcoverInfo = calculatePexcoverTotal(pack.items);

  const handleLearnerNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updatePackDetails(pack.id, e.target.value, pack.wantsPexcover || false);
    },
    [pack.id, pack.wantsPexcover, updatePackDetails],
  );

  const handlePexcoverToggle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!pexcoverInfo.hasEligibleBooks) return;
      updatePackDetails(pack.id, pack.learnerName || "", e.target.checked);
    },
    [
      pack.id,
      pack.learnerName,
      updatePackDetails,
      pexcoverInfo.hasEligibleBooks,
    ],
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
    <article className={styles.packCard}>
      <div className={styles.packCardBody}>
        <div className={styles.packCardHeader}>
          <div>
            {pack.schoolName ? (
              <p className={styles.packSchool}>{pack.schoolName}</p>
            ) : null}
            <h3 className={styles.packName}>{pack.packName}</h3>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "start" }}>
            <span
              className={clsx(
                styles.packModeBadge,
                pack.packMode === "full"
                  ? styles.packModeFull
                  : styles.packModeCustomised,
              )}
            >
              {pack.packMode === "full" ? "Full Pack" : "Customised"}
            </span>
            <button
              type="button"
              className={styles.removeButton}
              onClick={handleRemove}
              aria-label={`Remove ${pack.packName} from order`}
              data-tooltip="Remove pack"
              data-tooltip-pos="left"
            >
              &times;
            </button>
          </div>
        </div>

        <div className={styles.learnerField}>
          <label className={styles.learnerLabel} htmlFor={`learner-${pack.id}`}>
            Who is this pack for?
          </label>
          <input
            id={`learner-${pack.id}`}
            className={styles.learnerInput}
            type="text"
            placeholder="Learner's First & Last Name"
            value={pack.learnerName ?? ""}
            onChange={handleLearnerNameChange}
            autoComplete="name"
          />
        </div>

        {/* Pexcover Book Covering Section */}
        <label
          className={clsx(
            styles.pexcoverToggleLabel,
            !pexcoverInfo.hasEligibleBooks && styles.pexcoverDisabled,
          )}
          htmlFor={`pexcover-${pack.id}`}
        >
          <input
            id={`pexcover-${pack.id}`}
            name={`pexcover-${pack.id}`}
            type="checkbox"
            checked={
              (pack.wantsPexcover && pexcoverInfo.hasEligibleBooks) || false
            }
            disabled={!pexcoverInfo.hasEligibleBooks}
            className={styles.pexcoverCheckbox}
            onChange={handlePexcoverToggle}
          />
          <div className={styles.pexcoverDetails}>
            <p className={styles.pexcoverTitle}>Book Covering by Pexcover</p>
            <p className={styles.pexcoverDesc}>
              {pexcoverInfo.hasEligibleBooks
                ? `${pexcoverInfo.coverableItemCount} book${pexcoverInfo.coverableItemCount === 1 ? "" : "s"} covered with protective wrap`
                : "No coverable books in this pack"}
            </p>
          </div>
          <span
            className={clsx(
              styles.pexcoverPrice,
              !pexcoverInfo.hasEligibleBooks && styles.pexcoverPriceDisabled,
            )}
          >
            {pexcoverInfo.hasEligibleBooks
              ? formatCurrency(pexcoverInfo.pexcoverTotalRands)
              : "—"}
          </span>
        </label>

        <div className={styles.packSummaryRow}>
          <span className={styles.itemCount}>
            {pack.items.length} {pack.items.length === 1 ? "item" : "items"}
            {pack.addOns && pack.addOns.length > 0
              ? ` + ${pack.addOns.length} add-on${pack.addOns.length === 1 ? "" : "s"}`
              : ""}
          </span>
          <span className={styles.packPrice}>
            {formatCurrency(lineItemTotal)}
          </span>
        </div>
      </div>
    </article>
  );
}
