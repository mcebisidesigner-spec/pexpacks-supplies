"use client";

import { Laptop, X } from "lucide-react";

interface DeviceActivityPromptProps {
  onContinue: () => void;
  onDismiss: () => void;
}

export function DeviceActivityPrompt({
  onContinue,
  onDismiss,
}: DeviceActivityPromptProps) {
  return (
    <div
      className="fixed top-6 left-6 z-[999999] w-[min(400px,calc(100vw-32px))] p-5 border border-[var(--db-border,#1e293b)] border-l-4 border-l-emerald-500 rounded-xl bg-gradient-to-br from-[#0d1627] to-[#080d17] shadow-[0_24px_60px_rgba(0,0,0,0.85),0_0_25px_rgba(16,185,129,0.2)] backdrop-blur-xl text-[var(--db-text-primary,#ffffff)] animate-in fade-in zoom-in-95 duration-200"
      role="dialog"
      aria-labelledby="device-prompt-title"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[var(--db-border,#1e293b)]">
        <span
          id="device-prompt-title"
          className="flex items-center gap-1.5 text-[var(--db-text-muted,#94a3b8)] text-[11px] font-extrabold tracking-wider uppercase"
        >
          <span className="text-emerald-400 font-black">Pexpacks</span> Security
        </span>
        <button
          type="button"
          onClick={onDismiss}
          className="grid place-items-center w-8 h-8 border border-[var(--db-border-strong,#334155)] rounded-lg bg-[var(--db-border,#1e293b)] text-[var(--db-text-secondary,#94a3b8)] cursor-pointer transition-colors hover:bg-slate-700 hover:text-white"
          aria-label="Close prompt"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex items-start gap-3.5 py-4.5">
        <div className="grid place-items-center w-10.5 h-10.5 shrink-0 border border-emerald-400/40 rounded-xl bg-emerald-500/16 text-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.18)]">
          <Laptop size={20} />
        </div>
        <p className="m-0 text-[var(--db-text-primary,#ffffff)] text-[13.5px] font-semibold leading-relaxed drop-shadow-xs">
          Pexpacks shields sensitive dashboard data after 15 minutes without
          activity and closes standard sessions after 40 minutes.
        </p>
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-1">
        <button
          type="button"
          onClick={onContinue}
          className="min-h-[38px] px-4.5 rounded-lg font-inherit text-[12.5px] font-extrabold cursor-pointer transition-all border border-[#ff6f59]/40 bg-[#ff6f59] text-white shadow-[0_4px_14px_rgba(255,111,89,0.35)] hover:-translate-y-px hover:bg-[#e85e4b] hover:shadow-[0_6px_18px_rgba(255,111,89,0.5)] focus-visible:ring-3 focus-visible:ring-emerald-400 focus-visible:outline-hidden"
        >
          Continue
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="min-h-[38px] px-4.5 rounded-lg font-inherit text-[12.5px] font-extrabold cursor-pointer transition-all border border-[var(--db-border-strong,#334155)] bg-[var(--db-border,#1e293b)] text-[var(--db-text-secondary,#94a3b8)] hover:bg-slate-700 hover:text-white focus-visible:ring-3 focus-visible:ring-emerald-400 focus-visible:outline-hidden"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
