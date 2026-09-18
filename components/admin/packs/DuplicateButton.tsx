"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { duplicatePackAction } from "@/app/admin/packs/actions";

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
      className="bg-transparent border-0 p-0 text-xs font-bold text-slate-400 hover:text-emerald-400 hover:underline cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-default"
      data-db-tooltip={`Duplicate ${title}`}
    >
      {busy ? "Duplicating…" : "Duplicate"}
    </button>
  );
}
