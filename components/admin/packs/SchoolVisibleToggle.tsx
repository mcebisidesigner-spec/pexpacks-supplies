"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setSchoolPacksVisibleAction } from "@/app/admin/packs/actions";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import styles from "./rowActions.module.css";

export function SchoolVisibleToggle({
  schoolId,
  schoolName,
  visible,
}: {
  schoolId: string;
  schoolName?: string;
  visible: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleToggle() {
    if (busy) return;
    setBusy(true);
    await setSchoolPacksVisibleAction(schoolId, !visible);
    setBusy(false);
    setShowConfirm(false);
    router.refresh();
  }

  const handleClick = () => {
    if (visible) {
      setShowConfirm(true);
    } else {
      void handleToggle();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className={styles.toggle}
        aria-pressed={visible}
      >
        {busy ? "…" : visible ? "Hide" : "Show"}
      </button>

      <ConfirmModal
        isOpen={showConfirm}
        title="Confirm Action"
        message={
          schoolName
            ? `Hide ${schoolName} and all its grade packs from public view?`
            : "Hide this school and all its grade packs from public view?"
        }
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        variant="primary"
        onConfirm={handleToggle}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
