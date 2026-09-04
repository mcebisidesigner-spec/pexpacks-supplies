"use client";

import React, { useEffect, useState } from "react";
import { X, Download, Loader2, ExternalLink } from "lucide-react";
import type { AdminLetterRecord } from "@/lib/admin/letters";

interface LetterPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  letter: AdminLetterRecord;
}

export function LetterPreviewModal({
  isOpen,
  onClose,
  letter,
}: LetterPreviewModalProps) {
  const [loading, setLoading] = useState(true);
  const pdfUrl = `/api/admin/letters/${letter.id}/pdf`;

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
    }
  }, [isOpen, letter.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl h-[90vh] flex flex-col bg-[var(--db-surface,#0c1322)] border border-[var(--db-border,rgba(30,41,59,0.9))] rounded-xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--db-border,rgba(30,41,59,0.9))] bg-[var(--db-surface-inner,#111a2e)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {letter.reference_number}
              </span>
              <h2 className="text-base font-bold text-white truncate max-w-md">
                {letter.subject}
              </h2>
            </div>
            <p className="text-xs text-[var(--db-text-muted,#94a3b8)] mt-0.5 font-medium">
              To: {letter.recipient_organization} ({letter.recipient_name})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--db-surface,#0c1322)] border border-[var(--db-border,rgba(30,41,59,0.9))] text-xs font-semibold text-[var(--db-text-secondary,#cbd5e1)] hover:text-white hover:border-slate-600 transition-colors"
            >
              <ExternalLink size={14} />
              <span>Open in Tab</span>
            </a>
            <a
              href={pdfUrl}
              download={`${letter.reference_number}.pdf`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
            >
              <Download size={14} />
              <span>Download PDF</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--db-text-muted,#94a3b8)] hover:text-white hover:bg-[var(--db-surface,#0c1322)] transition-colors ml-1"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PDF Viewer Body */}
        <div className="relative flex-1 bg-[#070b12] w-full overflow-hidden flex items-center justify-center">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#070b12] text-slate-400 z-10">
              <Loader2 size={32} className="animate-spin text-emerald-400" />
              <p className="text-sm font-medium">
                Rendering A4 letterhead document...
              </p>
            </div>
          )}
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0`}
            title={`Preview of ${letter.reference_number}`}
            className="w-full h-full border-0"
            onLoad={() => setLoading(false)}
          />
        </div>
      </div>
    </div>
  );
}
