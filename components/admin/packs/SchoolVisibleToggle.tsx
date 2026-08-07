"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setSchoolPacksVisibleAction } from "@/app/admin/packs/actions";
import styles from "./rowActions.module.css";

export function SchoolVisibleToggle({ schoolId, visible }: { schoolId: string; visible: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (busy) return;
    setBusy(true);
    await setSchoolPacksVisibleAction(schoolId, !visible);
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={styles.toggle}
      aria-pressed={visible}
    >
      {busy ? "…" : visible ? "Hide" : "Show"}
    </button>
  );
}
