"use client";

import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

export interface WarningBannerModalProps {
  isOpen: boolean;
  schoolName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function WarningBannerModal({
  isOpen,
  schoolName = "This school",
  onConfirm,
  onCancel,
}: WarningBannerModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] grid p-4 sm:p-5 place-items-center bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="warning-modal-title"
      aria-describedby="warning-modal-description"
      onClick={onCancel}
    >
      <div
        className="flex flex-col gap-4.5 w-full max-w-[520px] p-4.5 sm:px-6 sm:py-5.5 border border-amber-500/35 rounded-xl bg-[#0b1329] shadow-[0_28px_72px_rgba(0,0,0,0.75),0_0_30px_rgba(245,158,11,0.1)] animate-in zoom-in-95 duration-150 box-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400 text-[10.5px] font-extrabold tracking-wider uppercase">
          <span>
            <strong className="text-amber-400 font-extrabold">Pexpacks</strong>{" "}
            Partnership Notice
          </span>
          <button
            type="button"
            className="grid place-items-center w-7 h-7 border border-slate-700/60 rounded-md bg-slate-900/60 text-slate-400 cursor-pointer transition-colors hover:bg-slate-700/80 hover:text-white hover:border-slate-500"
            onClick={onCancel}
            aria-label="Close warning"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-start gap-4">
          <div className="grid w-11 h-11 shrink-0 place-items-center rounded-xl border border-amber-500/40 bg-amber-500/12 text-amber-500 shadow-[0_0_16px_rgba(245,158,11,0.2)]">
            <AlertTriangle size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id="warning-modal-title"
              className="m-0 mb-1.5 text-slate-50 text-[17px] font-extrabold tracking-tight"
            >
              Refused Partnership Mode
            </h2>
            <p
              id="warning-modal-description"
              className="m-0 text-slate-300 text-[13px] leading-relaxed"
            >
              You are setting <strong>{schoolName}</strong> to &ldquo;Refused
              Partnership&rdquo;.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 bg-slate-900/70 border border-slate-700/60 rounded-lg p-3 sm:px-3.5 sm:py-3">
          <div className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-400">
            <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
            <span>
              <strong className="text-slate-100">Public Web Page:</strong> The
              public storefront will switch to display the dedicated{" "}
              <strong>&ldquo;Not yet an official partner&rdquo;</strong> layout
              with stationery list upload and WhatsApp actions. Grade pack
              cards will not be shown.
            </span>
          </div>
          <div className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-400">
            <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
            <span>
              <strong className="text-slate-100">Search Discovery:</strong> This
              school <strong>remains fully discoverable</strong> in the search
              discovery tray/drawer for parents looking up this school.
            </span>
          </div>
          <div className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-400">
            <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
            <span>
              <strong className="text-slate-100">Reversible:</strong> You can
              switch back to &ldquo;Partner&rdquo; or &ldquo;Non-partner&rdquo;
              at any time to re-enable pack cards.
            </span>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-2.5 pt-2.5 border-t border-slate-800">
          <button
            type="button"
            className="w-full sm:w-auto h-8.5 px-3.5 border border-slate-700/80 rounded-md bg-transparent text-slate-300 text-xs font-semibold cursor-pointer transition-colors hover:bg-slate-700/40 hover:text-white"
            onClick={onCancel}
          >
            Revert to Non-partner
          </button>
          <button
            type="button"
            className="w-full sm:w-auto h-8.5 px-4.5 border border-emerald-500 rounded-md bg-emerald-500 text-emerald-950 text-xs font-bold cursor-pointer transition-colors hover:bg-emerald-600 hover:border-emerald-600 hover:text-white shadow-[0_2px_10px_rgba(16,185,129,0.3)]"
            onClick={onConfirm}
            autoFocus
          >
            Got it, Keep Refused Partnership
          </button>
        </div>
      </div>
    </div>
  );
}
