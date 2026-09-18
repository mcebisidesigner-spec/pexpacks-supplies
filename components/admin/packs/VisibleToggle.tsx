"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setPackVisibleAction } from "@/app/admin/packs/actions";

export function VisibleToggle({ id, visible }: { id: string; visible: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (busy) return;
    setBusy(true);
    await setPackVisibleAction(id, !visible);
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="bg-transparent border border-slate-700 hover:border-emerald-500 rounded-md px-2 py-0.5 text-xs font-bold text-slate-300 hover:text-emerald-400 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-default"
      aria-pressed={visible}
    >
      {busy ? "…" : visible ? "Hide" : "Show"}
    </button>
  );
}
