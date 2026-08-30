"use client";

import Link from "next/link";
import { useCallback } from "react";
import { CompleteListTable } from "./CompleteListTable";
import { Drawer } from "@/components/ui/Drawer";
import type { CompleteListPack } from "./packListTypes";
import styles from "./CompleteListModal.module.css";

type CompleteListModalProps = {
  pack: CompleteListPack | null;
  onClose: () => void;
  onAddToOrder?: () => void;
};

function safeId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

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
        <span className={styles.itemCountSubtitle}>{subtitleText}</span>
      }
      footer={
        <>
          <p className={styles.price}>{pack.priceLabel}</p>
          {onAddToOrder ? (
            <button
              type="button"
              className={styles.addToOrderButton}
              onClick={onAddToOrder}
            >
              Add to Order
            </button>
          ) : pack.fullPackHref ? (
            <Link href={pack.fullPackHref} className={styles.addToOrderButton}>
              Add to Order
            </Link>
          ) : (
            <button type="button" className={styles.addToOrderButton} disabled>
              Add to Order
            </button>
          )}
          {pack.customiseTargetId ? (
            <button
              type="button"
              className={styles.customiseButton}
              onClick={handleCustomise}
            >
              Customise This Pack
            </button>
          ) : (
            <button type="button" className={styles.customiseButton} disabled>
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
