"use client";

import React, { useState } from "react";
import {
  X,
  Mail,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { sendLetterEmailAction } from "@/app/admin/letters/actions";
import type { AdminLetterRecord } from "@/lib/admin/letters";

interface EmailDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  letter: AdminLetterRecord;
  onSuccess?: () => void;
}

export function EmailDispatchModal({
  isOpen,
  onClose,
  letter,
  onSuccess,
}: EmailDispatchModalProps) {
  const [recipientEmail, setRecipientEmail] = useState(letter.recipient_email);
  const [customMessage, setCustomMessage] = useState(
    `Dear ${letter.recipient_name},\n\nPlease find attached our official institutional document (${letter.reference_number}.pdf) regarding "${letter.subject}".\n\nKind regards,\n${letter.signatory_name}\n${letter.signatory_title}\nPexpacks Supplies (Pty) Ltd`,
  );
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null,
  );

  if (!isOpen) return null;

  const handleSend = async () => {
    try {
      setSending(true);
      setResult(null);
      const res = await sendLetterEmailAction({
        letterId: letter.id,
        recipientEmail,
        customMessage,
      });

      if (res.ok) {
        setResult({
          ok: true,
          message: res.message || "Document dispatched successfully.",
        });
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1500);
        }
      } else {
        setResult({
          ok: false,
          message: res.error || "Failed to dispatch email.",
        });
      }
    } catch (err: unknown) {
      setResult({
        ok: false,
        message:
          err instanceof Error
            ? err.message
            : "Unexpected error during dispatch.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-[var(--db-surface,#0c1322)] border border-[var(--db-border,rgba(30,41,59,0.9))] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--db-border,rgba(30,41,59,0.9))] bg-[var(--db-surface-inner,#111a2e)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Mail size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Email Official Letter
              </h2>
              <p className="text-xs text-[var(--db-text-muted,#94a3b8)]">
                Direct dispatch with PDF attachment via Resend API
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--db-text-muted,#94a3b8)] hover:text-white hover:bg-[var(--db-surface,#0c1322)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Form */}
        <div className="p-6 space-y-4">
          {result && (
            <div
              className={`p-3.5 rounded-lg text-xs flex items-center gap-2.5 font-medium ${
                result.ok
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {result.ok ? (
                <CheckCircle2 size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span>{result.message}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[var(--db-text-muted,#94a3b8)] mb-1 uppercase tracking-wider">
              Recipient Email Address
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-[var(--db-canvas,#070b12)] border border-[var(--db-border,rgba(30,41,59,0.9))] text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="recipient@school.co.za"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--db-text-muted,#94a3b8)] mb-1 uppercase tracking-wider">
              Email Subject Line
            </label>
            <input
              type="text"
              readOnly
              value={`[${letter.reference_number}] ${letter.subject}`}
              className="w-full px-3.5 py-2 rounded-lg bg-[var(--db-surface-inner,#111a2e)] border border-[var(--db-border,rgba(30,41,59,0.9))] text-sm text-[var(--db-text-muted,#94a3b8)] cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--db-text-muted,#94a3b8)] mb-1 uppercase tracking-wider">
              Cover Note &amp; Introduction
            </label>
            <textarea
              rows={5}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--db-canvas,#070b12)] border border-[var(--db-border,rgba(30,41,59,0.9))] text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono text-xs leading-relaxed resize-none"
              placeholder="Enter custom introductory notes..."
            />
          </div>

          <div className="p-3 rounded-lg bg-[var(--db-surface-inner,#111a2e)] border border-[var(--db-border,rgba(30,41,59,0.9))] flex items-center justify-between text-xs text-[var(--db-text-muted,#94a3b8)]">
            <span>Attachment:</span>
            <span className="font-bold font-mono text-emerald-400">
              {letter.reference_number}.pdf
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--db-border,rgba(30,41,59,0.9))] bg-[var(--db-surface-inner,#111a2e)]">
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            className="px-4 py-2 rounded-lg text-sm text-[var(--db-text-muted,#94a3b8)] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !recipientEmail}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all"
          >
            {sending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Sending via Resend...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Send Document</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
