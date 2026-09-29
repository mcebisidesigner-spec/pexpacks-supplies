"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setSchoolPacksVisibleAction } from "@/app/admin/packs/actions";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useAdminDialog } from "@/components/admin/ui/AdminDialogContext";

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
  const dialog = useAdminDialog();
  const [busy, setBusy] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleToggle() {
    if (busy) return;
    setBusy(true);
    const result = await setSchoolPacksVisibleAction(schoolId, !visible);
    if (!result.ok) {
      await dialog.alert({
        title: "School Packs Publication Blocked",
        message:
          result.message ||
          "Some packs stayed in draft because they are not ready to publish.",
        variant: "warning",
        buttonLabel: "Understood",
      });
    }
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
        className="bg-transparent border border-slate-700 hover:border-emerald-500 rounded-md px-2 py-0.5 text-xs font-bold text-slate-300 hover:text-emerald-400 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-default"
        aria-pressed={visible}
        data-db-tooltip={
          visible
            ? `Hide all packs for ${schoolName || "this school"}`
            : `Publish all packs for ${schoolName || "this school"}`
        }
      >
        {busy ? "…" : visible ? "Hide all" : "Publish all"}
      </button>

      <ConfirmModal
        isOpen={showConfirm}
        title="Hide all school packs?"
        message={`Are you sure you want to hide all stationery packs for ${
          schoolName || "this school"
        }? Parents and students will not be able to browse or order these packs until published again.`}
        confirmLabel="Yes, hide all"
        cancelLabel="Keep published"
        onConfirm={() => void handleToggle()}
        onCancel={() => setShowConfirm(false)}
        variant="primary"
      />
    </>
  );
}
