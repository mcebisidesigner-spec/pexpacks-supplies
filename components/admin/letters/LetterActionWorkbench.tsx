"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  Download,
  Mail,
  FileText,
  ExternalLink,
  Loader2,
  Send,
  CheckCircle2,
  AlertCircle,
  Edit3,
} from "lucide-react";
import type { AdminLetterRecord } from "@/lib/admin/letters";
import { sendLetterEmailAction } from "@/app/admin/letters/actions";
import styles from "./LetterActionWorkbench.module.css";

export interface LetterActionWorkbenchProps {
  letter: AdminLetterRecord;
  mode: "preview" | "email";
  onModeChange: (mode: "preview" | "email") => void;
  onClose: () => void;
  onEmailSent?: () => void;
}

export function LetterActionWorkbench({
  letter,
  mode,
  onModeChange,
  onClose,
  onEmailSent,
}: LetterActionWorkbenchProps) {
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [recipientEmail, setRecipientEmail] = useState(letter.recipient_email);
  const [customMessage, setCustomMessage] = useState(
    `Dear ${letter.recipient_name},\n\nPlease find attached our official institutional document (${letter.reference_number}.pdf) regarding "${letter.subject}".\n\nKind regards,\n${letter.signatory_name}\n${letter.signatory_title}\nPexpacks Supplies (Pty) Ltd`,
  );
  const [sending, setSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  // Sync recipient state when selected letter changes
  useEffect(() => {
    setRecipientEmail(letter.recipient_email);
    setCustomMessage(
      `Dear ${letter.recipient_name},\n\nPlease find attached our official institutional document (${letter.reference_number}.pdf) regarding "${letter.subject}".\n\nKind regards,\n${letter.signatory_name}\n${letter.signatory_title}\nPexpacks Supplies (Pty) Ltd`,
    );
    setEmailStatus(null);
    setLoadingPdf(true);
  }, [letter]);

  const pdfUrl = `/api/admin/letters/${encodeURIComponent(letter.reference_number || letter.id)}/pdf`;
  const editUrl = `/admin/letters/${encodeURIComponent(letter.reference_number || letter.id)}`;

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail) return;

    try {
      setSending(true);
      setEmailStatus(null);
      const res = await sendLetterEmailAction({
        letterId: letter.id,
        recipientEmail,
        customMessage,
      });

      if (res.ok) {
        setEmailStatus({
          ok: true,
          message: res.message || "Document dispatched successfully via Resend.",
        });
        if (onEmailSent) {
          onEmailSent();
        }
      } else {
        setEmailStatus({
          ok: false,
          message: res.error || "Failed to dispatch email.",
        });
      }
    } catch (err: unknown) {
      setEmailStatus({
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
    <section
      id="letter-workbench"
      className={styles.workbenchContainer}
      aria-label="Official Letter Workbench"
    >
      {/* Workbench Header */}
      <header className={styles.workbenchHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.iconBadge}>
            {mode === "preview" ? <FileText size={18} /> : <Mail size={18} />}
          </div>
          <div className={styles.headerTitles}>
            <div className={styles.titleRow}>
              <span className={styles.refBadge}>{letter.reference_number}</span>
              <h3 className={styles.titleText}>{letter.subject}</h3>
            </div>
            <p className={styles.subtitleText}>
              To: {letter.recipient_organization} ({letter.recipient_name}) •{" "}
              {letter.recipient_email || "No email on record"}
            </p>
          </div>
        </div>

        {/* Action Buttons & View Toggles */}
        <div className={styles.headerActions}>
          <button
            type="button"
            className={`${styles.tabBtn} ${mode === "preview" ? styles.tabBtnActive : ""}`}
            onClick={() => onModeChange("preview")}
            aria-pressed={mode === "preview"}
          >
            <FileText size={14} />
            <span>Document Preview</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${mode === "email" ? styles.tabBtnActive : ""}`}
            onClick={() => onModeChange("email")}
            aria-pressed={mode === "email"}
          >
            <Mail size={14} />
            <span>Email Dispatch</span>
          </button>

          {mode === "preview" && (
            <>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.tabBtn}
                title="Open PDF in new browser tab"
              >
                <ExternalLink size={14} />
                <span>Open in Tab</span>
              </a>

              <a
                href={pdfUrl}
                download={`${letter.reference_number}.pdf`}
                className={styles.btnPrimary}
                title="Download PDF to device"
              >
                <Download size={14} />
                <span>Download PDF</span>
              </a>
            </>
          )}

          <Link href={editUrl} className={styles.tabBtn} title="Edit Letter">
            <Edit3 size={14} />
            <span>Edit</span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className={styles.closeBtn}
            aria-label="Close workbench"
            title="Close action workbench"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Mode 1: PDF Viewer */}
      {mode === "preview" && (
        <div className={styles.pdfViewerWrapper}>
          {loadingPdf && (
            <div className={styles.pdfLoadingOverlay}>
              <Loader2 size={36} className={styles.spinner} />
              <p className="text-sm font-medium">
                Rendering A4 letterhead document ({letter.reference_number})...
              </p>
            </div>
          )}
          <iframe
            key={letter.id}
            src={`${pdfUrl}#toolbar=1&navpanes=0`}
            title={`Preview of ${letter.reference_number}`}
            className={styles.pdfIframe}
            onLoad={() => setLoadingPdf(false)}
          />
        </div>
      )}

      {/* Mode 2: Email Dispatch Form */}
      {mode === "email" && (
        <form onSubmit={handleSendEmail} className={styles.emailFormWrapper}>
          {emailStatus && (
            <div
              className={
                emailStatus.ok
                  ? styles.statusMessageSuccess
                  : styles.statusMessageError
              }
              role="alert"
            >
              {emailStatus.ok ? (
                <CheckCircle2 size={18} className="shrink-0" />
              ) : (
                <AlertCircle size={18} className="shrink-0" />
              )}
              <span>{emailStatus.message}</span>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="letter-recipient-email" className={styles.formLabel}>
              Recipient Email Address
            </label>
            <input
              id="letter-recipient-email"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className={styles.formInput}
              placeholder="recipient@school.co.za"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="letter-email-subject" className={styles.formLabel}>
              Email Subject Line
            </label>
            <input
              id="letter-email-subject"
              type="text"
              readOnly
              value={`[${letter.reference_number}] ${letter.subject}`}
              className={`${styles.formInput} ${styles.formInputReadOnly}`}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="letter-cover-message" className={styles.formLabel}>
              Cover Note &amp; Introduction
            </label>
            <textarea
              id="letter-cover-message"
              rows={6}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className={styles.formTextarea}
              placeholder="Enter custom introductory notes..."
            />
          </div>

          <div className={styles.attachmentCard}>
            <span>Attached Document:</span>
            <span className={styles.attachmentBadge}>
              {letter.reference_number}.pdf
            </span>
          </div>

          <footer className={styles.formFooter}>
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className={styles.btnSecondary}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending || !recipientEmail.trim()}
              className={styles.btnPrimary}
            >
              {sending ? (
                <>
                  <Loader2 size={16} className={styles.spinner} />
                  <span>Dispatching via Resend...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Send Document</span>
                </>
              )}
            </button>
          </footer>
        </form>
      )}
    </section>
  );
}
