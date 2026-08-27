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
  CheckCircle2,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Percent,
  Truck,
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
  return `R ${formatted}`;
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

  const createdDateFormatted = new Date(quotation.created_at).toLocaleDateString("en-GB");
  const validUntilFormatted = new Date(quotation.valid_until).toLocaleDateString("en-GB");

  return (
    <div className={styles.container}>
      {/* 1. Top Back Button */}
      <Link href="/admin/quotations" className={styles.backButton}>
        <ArrowLeft size={14} />
        Back to Quotations
      </Link>

      {/* 2. Top Header Row */}
      <div className={styles.headerRow} style={{ alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h1 className={styles.pageTitle}>{quotation.quote_number}</h1>
            <StatusBadge status={cfg.label} tone={cfg.tone} showDot />
          </div>
          <p className={styles.pageSubtitle} style={{ marginTop: "4px" }}>
            Created on {createdDateFormatted} • Valid until {validUntilFormatted}
            {preparedBy ? ` • Prepared by ${preparedBy}` : ""}
            {quotation.pdf_version ? ` • PDF v${quotation.pdf_version}` : ""}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <AdminButton
            variant="secondary"
            icon={pdfBusy ? <Loader2 size={14} className={styles.spinIcon} /> : <Download size={14} />}
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

      {errorMsg ? (
        <div className={styles.errorBanner}>
          <span>{errorMsg}</span>
        </div>
      ) : null}

      {successMsg ? (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "8px",
            color: "#10b981",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          {successMsg}
        </div>
      ) : null}

      {/* 3. Main 2-Column Grid */}
      <div className={styles.topGrid}>
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Card 1: Recipient & School Information */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <Building2 size={16} color="#10b981" />
                Recipient &amp; School Information
              </h2>
            </div>

            <div className={styles.formRow2}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>
                  Recipient Contact
                </span>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>
                  {quotation.recipient_name}
                </span>
                <span style={{ fontSize: "12.5px", color: "#94a3b8" }}>
                  {quotation.recipient_email}
                  {quotation.recipient_phone ? ` • ${quotation.recipient_phone}` : ""}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>
                  School / Entity
                </span>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>
                  {quotation.school?.name || "Direct Client / Private Buyer"}
                </span>
                <span style={{ fontSize: "12.5px", color: "#94a3b8" }}>
                  {quotation.school
                    ? [quotation.school.city, quotation.school.province].filter(Boolean).join(", ") ||
                      "South Africa"
                    : "Non-Partner Institutional Client"}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Itemized Quotation Lines */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <FileText size={16} color="#10b981" />
                Itemized Quotation Lines ({quotation.items?.length || 0})
              </h2>
            </div>

            <div className={styles.tableWrapper}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 10px" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", padding: "6px 12px" }}>
                      ITEM DESCRIPTION
                    </th>
                    <th style={{ textAlign: "center", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", padding: "6px 12px" }}>
                      SKU
                    </th>
                    <th style={{ textAlign: "center", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", padding: "6px 12px" }}>
                      UNIT
                    </th>
                    <th style={{ textAlign: "center", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", padding: "6px 12px" }}>
                      QTY
                    </th>
                    <th style={{ textAlign: "center", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", padding: "6px 12px" }}>
                      UNIT PRICE (ZAR)
                    </th>
                    <th style={{ textAlign: "right", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", padding: "6px 12px" }}>
                      TOTAL (ZAR)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(quotation.items || []).map((item) => (
                    <tr key={item.id} style={{ background: "#060b13", borderRadius: "8px" }}>
                      <td style={{ padding: "12px 14px", color: "#ffffff", fontWeight: 600, fontSize: "13.5px" }}>
                        {item.item_title}
                      </td>
                      <td style={{ textAlign: "center", padding: "12px 14px", color: "#38bdf8", fontFamily: "ui-monospace, monospace", fontSize: "12px" }}>
                        {item.sku || "-"}
                      </td>
                      <td style={{ textAlign: "center", padding: "12px 14px", color: "#94a3b8", fontSize: "13px" }}>
                        {item.unit || "Each"}
                      </td>
                      <td style={{ textAlign: "center", padding: "12px 14px", color: "#f8fafc", fontWeight: 700, fontSize: "13px" }}>
                        {item.quantity}
                      </td>
                      <td style={{ textAlign: "center", padding: "12px 14px", color: "#94a3b8", fontSize: "13px" }}>
                        {formatZAR(item.unit_price)}
                      </td>
                      <td style={{ textAlign: "right", padding: "12px 14px", color: "#ffffff", fontWeight: 700, fontSize: "13.5px" }}>
                        {formatZAR(item.total_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom 2-Column Section */}
          <div className={styles.bottomGrid}>
            {/* Notes & Delivery Terms */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <FileText size={16} color="#10b981" />
                  Terms &amp; Delivery Notes
                </h2>
              </div>
              <div className={styles.notesContainer}>
                <p style={{ margin: 0, fontSize: "12.5px", color: "#e2e8f0", lineHeight: "1.6", whiteSpace: "pre-line" }}>
                  {displayNotes || "Standard settlement: 30 days from official invoice."}
                </p>
              </div>
            </div>

            {/* Settlement Banking Info */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <FileText size={16} color="#10b981" />
                  Settlement Banking Info
                </h2>
              </div>
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

        {/* Right Column (Total Breakdown & Lifecycle Status) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
                  <span style={{ color: "#ef4444", fontWeight: 600 }}>
                    - {formatZAR(Number(quotation.discount_amount))}
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

              <div className={styles.summaryRowGrand}>
                <span className={styles.grandTotalLabel}>Grand Total</span>
                <span className={styles.grandTotalAmount}>{formatZAR(quotation.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Lifecycle Status Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <Clock size={16} color="#10b981" />
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
              <div style={{ marginTop: "12px" }}>
                <Link
                  href="/admin/orders"
                  className={styles.convertLink}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#10b981",
                    fontSize: "12.5px",
                    fontWeight: 600,
                  }}
                >
                  <ExternalLink size={13} />
                  View Converted Order in Orders Hub
                </Link>
              </div>
            )}
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
