"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { duplicatePackAction } from "@/app/admin/packs/actions";
import styles from "./rowActions.module.css";

export function DuplicateButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (busy) return;
    setBusy(true);
    const result = await duplicatePackAction(id);
    setBusy(false);
    if (result.ok && result.packId) {
      router.push(`/admin/packs/${result.packId}`);
      router.refresh();
    } else {
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={styles.button}
      data-db-tooltip={`Duplicate ${title}`}
    >
      {busy ? "Duplicating…" : "Duplicate"}
    </button>
  );
}
