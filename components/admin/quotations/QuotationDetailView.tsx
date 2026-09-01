"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  ShoppingCart,
  Clock,
  Building2,
  FileText,
  Trash2,
  Loader2,
  ExternalLink,
  Landmark,
  AlertCircle,
  CheckCircle2,
  Receipt,
} from "lucide-react";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import {
  updateQuotationStatusAction,
  convertQuotationToOrderAction,
  regenerateQuotationPdfAction,
  deleteQuotationAction,
} from "@/app/admin/quotations/actions";
import type { QuotationRow, QuotationStatus } from "@/lib/admin/quotations";
import styles from "./Quotations.module.css";

function formatZAR(amount: number): string {
  const formatted = Number(amount || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `R\u00a0${formatted}`;
}

const STATUS_CONFIG: Record<
  QuotationStatus,
  { label: string; tone: "slate" | "blue" | "emerald" | "red" | "amber" | "teal" }
> = {
  draft: { label: "Draft", tone: "slate" },
  sent: { label: "Sent", tone: "blue" },
  viewed: { label: "Viewed", tone: "blue" },
  accepted: { label: "Accepted", tone: "emerald" },
  declined: { label: "Declined", tone: "red" },
  expired: { label: "Expired", tone: "amber" },
  converted_to_order: { label: "Converted", tone: "teal" },
};

export function QuotationDetailView({ quotation }: { quotation: QuotationRow }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(quotation.pdf_storage_path);
  const [status, setStatus] = useState<QuotationStatus>(quotation.status);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);

  const cfg = STATUS_CONFIG[status] || { label: status, tone: "slate" };

  async function handleStatusChange(newStatus: QuotationStatus) {
    setBusy(true);
    setErrorMsg("");
    setSuccessMsg("");
    const res = await updateQuotationStatusAction(quotation.id, newStatus);
    setBusy(false);
    if (res.ok) {
      setStatus(newStatus);
      setSuccessMsg(`Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}.`);
      setTimeout(() => setSuccessMsg(""), 3000);
      router.refresh();
    } else {
      setErrorMsg(res.error || "Failed to update status.");
    }
  }

  async function handleExecuteConvert() {
    setShowConvertModal(false);
    setBusy(true);
    setErrorMsg("");
    const res = await convertQuotationToOrderAction(quotation.id);
    setBusy(false);
    if (res.ok) {
      router.push(`/admin/orders`);
    } else {
      setErrorMsg(res.error || "Failed to convert quotation to order.");
    }
  }

  async function handleDownloadPdf() {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank");
      return;
    }
    setPdfBusy(true);
    setErrorMsg("");
    const res = await regenerateQuotationPdfAction(quotation.id);
    setPdfBusy(false);
    if (res.ok && res.pdfUrl) {
      setPdfUrl(res.pdfUrl);
      window.open(res.pdfUrl, "_blank");
    } else {
      setErrorMsg(res.error || "Failed to generate PDF letterhead.");
    }
  }

  async function handleExecuteDelete() {
    setShowDeleteModal(false);
    setBusy(true);
    setErrorMsg("");
    const res = await deleteQuotationAction(quotation.id);
    setBusy(false);
    if (res.ok) {
      router.push("/admin/quotations");
    } else {
      setErrorMsg(res.error || "Failed to delete quotation.");
    }
  }

  let preparedBy: string | null = null;
  let displayNotes = quotation.notes || "";
  if (quotation.notes) {
    const match = quotation.notes.match(/Prepared by:\s*([^\n\r]+)/i);
    if (match) {
      preparedBy = match[1].trim();
      displayNotes = quotation.notes.replace(/Prepared by:\s*[^\n\r]+/i, "").trim();
    }
  }

  const createdDateFormatted = new Date(quotation.created_at).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const validUntilFormatted = new Date(quotation.valid_until).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const lineCount = quotation.items?.length || 0;

  return (
    <div className={styles.container}>
      {/* Back button */}
      <Link href="/admin/quotations" className={styles.backButton}>
        <ArrowLeft size={14} />
        Back to Quotations
      </Link>

      {/* Header Row */}
      <div className={`${styles.headerRow} ${styles.detailHeaderRow}`}>
        <div>
          <div className={styles.detailTitleRow}>
            <h1 className={styles.pageTitle}>{quotation.quote_number}</h1>
            <StatusBadge status={cfg.label} tone={cfg.tone} showDot />
          </div>
          <p className={styles.pageSubtitle}>
            Created&nbsp;{createdDateFormatted}&nbsp;&middot;&nbsp;Valid until&nbsp;{validUntilFormatted}
            {preparedBy ? <>&nbsp;&middot;&nbsp;Prepared by&nbsp;<strong>{preparedBy}</strong></> : null}
            {quotation.pdf_version ? <>&nbsp;&middot;&nbsp;PDF&nbsp;v{quotation.pdf_version}</> : null}
          </p>
        </div>

        <div className={styles.detailActions}>
          <AdminButton
            variant="secondary"
            icon={
              pdfBusy
                ? <Loader2 size={14} className={styles.spinIcon} />
                : <Download size={14} />
            }
            onClick={handleDownloadPdf}
            disabled={pdfBusy}
          >
            Download PDF
          </AdminButton>

          <AdminButton
            variant="danger"
            icon={<Trash2 size={14} />}
            onClick={() => setShowDeleteModal(true)}
            disabled={busy}
          >
            Delete Quotation
          </AdminButton>

          <AdminButton
            variant="primary"
            icon={<ShoppingCart size={14} />}
            onClick={() => setShowConvertModal(true)}
            disabled={busy || status === "converted_to_order"}
          >
            {status === "converted_to_order" ? "Converted to Order" : "Convert to Official Order"}
          </AdminButton>
        </div>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className={styles.errorBanner}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className={styles.successBanner}>
          <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid: left content | right sidebar */}
      <div className={styles.topGrid}>

        {/* ── LEFT COLUMN ── */}
        <div className={styles.detailStack}>

          {/* Card 1 — Recipient & School */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <Building2 size={16} className={styles.cardIcon} />
                Recipient &amp; School Information
              </h2>
            </div>
            <div className={styles.formRow2}>
              <div className={styles.infoStack}>
                <span className={styles.infoLabel}>Recipient Contact</span>
                <span className={styles.infoValue}>{quotation.recipient_name}</span>
                <span className={styles.infoMeta}>
                  {quotation.recipient_email}
                  {quotation.recipient_phone ? ` · ${quotation.recipient_phone}` : ""}
                </span>
              </div>

              <div className={styles.infoStack}>
                <span className={styles.infoLabel}>School / Entity</span>
                <span className={styles.infoValue}>
                  {quotation.school?.name || "Direct Client / Private Buyer"}
                </span>
                <span className={styles.infoMeta}>
                  {quotation.school
                    ? [quotation.school.city, quotation.school.province]
                        .filter(Boolean)
                        .join(", ") || "South Africa"
                    : "Non-Partner Institutional Client"}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2 — Itemized Lines */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <Receipt size={16} className={styles.cardIcon} />
                Itemized Quotation Lines
                <span
                  style={{
                    marginLeft: 4,
                    background: "var(--db-surface-inner)",
                    border: "1px solid var(--db-border)",
                    borderRadius: 999,
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    color: "var(--db-text-muted)",
                    padding: "1px 8px",
                  }}
                >
                  {lineCount}
                </span>
              </h2>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.detailTable}>
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>SKU</th>
                    <th>Unit</th>
                    <th>Qty</th>
                    <th>Unit Price (ZAR)</th>
                    <th>Total (ZAR)</th>
                  </tr>
                </thead>
                <tbody>
                  {(quotation.items || []).map((item) => (
                    <tr key={item.id} className={styles.detailTableRow}>
                      <td className={styles.detailCell}>{item.item_title}</td>
                      <td className={styles.detailCellSku}>{item.sku || "—"}</td>
                      <td className={styles.detailCellCenter}>{item.unit || "Each"}</td>
                      <td className={styles.detailCellCenter}>{item.quantity}</td>
                      <td className={styles.detailCellCenter}>{formatZAR(item.unit_price)}</td>
                      <td className={styles.detailCellTotal}>{formatZAR(item.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom 2-col: Notes | Banking */}
          <div className={styles.bottomGrid}>
            {/* Terms & Notes */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <FileText size={16} className={styles.cardIcon} />
                  Terms &amp; Delivery Notes
                </h2>
              </div>
              <div style={{ padding: "16px 22px" }}>
                <div className={styles.notesContainer}>
                  <p className={styles.notesText}>
                    {displayNotes || "Standard settlement: 30 days from official invoice."}
                  </p>
                </div>
              </div>
            </div>

            {/* Banking Info */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <Landmark size={16} className={styles.cardIcon} />
                  Settlement Banking Info
                </h2>
              </div>
              <div style={{ padding: "16px 22px" }}>
                <div className={styles.bankingBox}>
                  <p className={styles.bankingText}>Bank: FNB / RMB</p>
                  <p className={styles.bankingText}>Account Holder: Pexpacks</p>
                  <p className={styles.bankingText}>Account Type: Current Account</p>
                  <p className={styles.bankingTextBold}>Account Number: 63215756991</p>
                  <p className={styles.bankingTextBold}>Branch Code: 250655</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className={styles.detailStack}>

          {/* Total Breakdown */}
          <div className={styles.summaryCard}>
            <div className={styles.summaryList}>
              <h2 className={styles.summaryTitle}>Total Breakdown</h2>

              <div className={styles.summaryRow}>
                <span>Subtotal (Excl. VAT)</span>
                <span className={styles.summaryRowValue}>{formatZAR(quotation.subtotal)}</span>
              </div>

              {Number(quotation.discount_amount || 0) > 0 && (
                <div className={styles.summaryRow}>
                  <span>Discount Applied</span>
                  <span className={styles.discountValue}>
                    &minus;&nbsp;{formatZAR(Number(quotation.discount_amount))}
                  </span>
                </div>
              )}

              {Number(quotation.delivery_fee || 0) > 0 && (
                <div className={styles.summaryRow}>
                  <span>Delivery Fee</span>
                  <span className={styles.summaryRowValue}>
                    {formatZAR(Number(quotation.delivery_fee))}
                  </span>
                </div>
              )}

              <div className={styles.summaryRow}>
                <span>VAT ({quotation.vat_rate}%)</span>
                <span className={styles.summaryRowValue}>{formatZAR(quotation.vat_amount)}</span>
              </div>

              <div className={styles.summaryDivider} />

              <div className={styles.summaryRowGrand}>
                <span className={styles.grandTotalLabel}>Grand Total</span>
                <span className={styles.grandTotalAmount}>{formatZAR(quotation.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Lifecycle Status */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <Clock size={16} className={styles.cardIcon} />
                Lifecycle Status
              </h2>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Update Quote Status</label>
              <select
                value={status}
                disabled={busy}
                onChange={(e) => handleStatusChange(e.target.value as QuotationStatus)}
                className={styles.statusSelect}
              >
                <option value="draft">Draft (Internal)</option>
                <option value="sent">Sent to Client</option>
                <option value="viewed">Viewed by Client</option>
                <option value="accepted">Accepted / Approved</option>
                <option value="declined">Declined / Rejected</option>
                <option value="expired">Expired</option>
                <option value="converted_to_order">Converted to Order</option>
              </select>
            </div>

            {status === "converted_to_order" && quotation.converted_order_id && (
              <div className={styles.convertedLinkWrap} style={{ paddingInline: 22, paddingBottom: 18 }}>
                <Link
                  href="/admin/orders"
                  className={`${styles.convertLink} ${styles.convertLinkInline}`}
                >
                  <ExternalLink size={13} />
                  View Converted Order in Orders Hub
                </Link>
              </div>
            )}
          </div>

          {/* Quote Metadata */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <FileText size={16} className={styles.cardIcon} />
                Quote Metadata
              </h2>
            </div>
            <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div className={styles.infoStack}>
                <span className={styles.infoLabel}>Quote Number</span>
                <span className={styles.infoValue}>{quotation.quote_number}</span>
              </div>
              <div className={styles.infoStack}>
                <span className={styles.infoLabel}>Date Issued</span>
                <span className={styles.infoValue}>{createdDateFormatted}</span>
              </div>
              <div className={styles.infoStack}>
                <span className={styles.infoLabel}>Valid Until</span>
                <span className={styles.infoValue}>{validUntilFormatted}</span>
              </div>
              {preparedBy && (
                <div className={styles.infoStack}>
                  <span className={styles.infoLabel}>Prepared By</span>
                  <span className={styles.infoValue}>{preparedBy}</span>
                </div>
              )}
              {quotation.pdf_version && (
                <div className={styles.infoStack}>
                  <span className={styles.infoLabel}>PDF Version</span>
                  <span className={styles.infoValue}>v{quotation.pdf_version}</span>
                </div>
              )}
              <div className={styles.infoStack}>
                <span className={styles.infoLabel}>Line Items</span>
                <span className={styles.infoValue}>{lineCount} item{lineCount !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Quotation"
        message={`Are you sure you want to permanently delete quotation ${quotation.quote_number}? This action cannot be undone.`}
        confirmLabel="Delete Quotation"
        variant="danger"
        onConfirm={handleExecuteDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      <ConfirmModal
        isOpen={showConvertModal}
        title="Convert Quotation to Official Order"
        message={`Convert quotation ${quotation.quote_number} (Total: ${formatZAR(quotation.total_amount)}) into an active canonical order? This will create order items and update status.`}
        confirmLabel="Convert to Order"
        variant="primary"
        onConfirm={handleExecuteConvert}
        onCancel={() => setShowConvertModal(false)}
      />
    </div>
  );
}
