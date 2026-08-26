"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Send,
  ShoppingCart,
  CheckCircle2,
  Clock,
  Building2,
  FileText,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import {
  updateQuotationStatusAction,
  convertQuotationToOrderAction,
  regenerateQuotationPdfAction,
} from "@/app/admin/quotations/actions";
import type { QuotationRow, QuotationStatus } from "@/lib/admin/quotations";
import styles from "./Quotations.module.css";
import adminStyles from "@/app/admin/admin.module.css";

function formatMoney(amount: number): string {
  return `R ${Number(amount || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const STATUS_CONFIG: Record<
  QuotationStatus,
  { label: string; tone: "slate" | "amber" | "emerald" | "red" | "teal" }
> = {
  draft: { label: "Draft", tone: "slate" },
  sent: { label: "Sent / Pending", tone: "amber" },
  accepted: { label: "Accepted", tone: "emerald" },
  declined: { label: "Declined", tone: "red" },
  converted_to_order: { label: "Converted to Order", tone: "teal" },
};

export function QuotationDetailView({ quotation }: { quotation: QuotationRow }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(quotation.pdf_storage_path);
  const [status, setStatus] = useState<QuotationStatus>(quotation.status);
  const [msg, setMsg] = useState("");

  const cfg = STATUS_CONFIG[status] || { label: status, tone: "slate" };
  const isConverted = status === "converted_to_order";

  // Status Change Handler
  async function handleStatusChange(newStatus: QuotationStatus) {
    setBusy(true);
    const res = await updateQuotationStatusAction(quotation.id, newStatus);
    setBusy(false);
    if (res.ok) {
      setStatus(newStatus);
      setMsg(`Status updated to ${newStatus}.`);
      router.refresh();
    }
  }

  // Convert to Order Handler
  async function handleConvertToOrder() {
    if (!confirm(`Convert Quotation ${quotation.quote_number} to an official order?`)) return;

    setBusy(true);
    const res = await convertQuotationToOrderAction(quotation.id);
    setBusy(false);

    if (res.ok && res.orderId) {
      alert(`Quotation successfully converted to Order! Redirecting to orders...`);
      router.push(`/admin/orders`);
    } else {
      alert(res.error || "Failed to convert quotation to order.");
    }
  }

  // Regenerate PDF Handler
  async function handleRegeneratePdf() {
    setPdfBusy(true);
    const res = await regenerateQuotationPdfAction(quotation.id);
    setPdfBusy(false);
    if (res.ok && res.pdfUrl) {
      setPdfUrl(res.pdfUrl);
      window.open(res.pdfUrl, "_blank");
    } else {
      alert(res.error || "Failed to generate PDF letterhead.");
    }
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={adminStyles.headerRow}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href="/admin/quotations"
            className={adminStyles.button}
            style={{ width: "32px", height: "32px", padding: 0 }}
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 className={adminStyles.pageTitle}>{quotation.quote_number}</h1>
              <StatusBadge status={cfg.label} tone={cfg.tone} showDot />
            </div>
            <p className={adminStyles.pageSubtitle}>
              Created on {new Date(quotation.created_at).toLocaleDateString("en-GB")} • Valid until{" "}
              {new Date(quotation.valid_until).toLocaleDateString("en-GB")}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {pdfUrl ? (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={adminStyles.button}
            >
              <Download size={14} /> Download PDF
            </a>
          ) : (
            <button
              type="button"
              disabled={pdfBusy}
              onClick={handleRegeneratePdf}
              className={adminStyles.button}
            >
              <RefreshCw size={14} className={pdfBusy ? "animate-spin" : ""} />
              {pdfBusy ? "Generating..." : "Generate PDF"}
            </button>
          )}

          {!isConverted ? (
            <button
              type="button"
              disabled={busy}
              onClick={handleConvertToOrder}
              className={adminStyles.button}
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#ffffff",
                borderColor: "rgba(16, 185, 129, 0.4)",
                fontWeight: 600,
              }}
            >
              <ShoppingCart size={14} /> Convert to Official Order
            </button>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "0 12px",
                height: "36px",
                borderRadius: "6px",
                background: "rgba(45, 212, 191, 0.12)",
                color: "#2dd4bf",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={14} /> Converted to Order
            </div>
          )}
        </div>
      </div>

      {msg ? (
        <div
          style={{
            padding: "10px 14px",
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "6px",
            color: "#10b981",
            fontSize: "13px",
          }}
        >
          {msg}
        </div>
      ) : null}

      <div className={styles.builderGrid}>
        {/* Left Column: Details & Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Client & School Meta */}
          <div className={styles.formCard}>
            <div className={styles.formSectionTitle}>
              <Building2 size={16} color="#10b981" />
              Recipient &amp; School Information
            </div>

            <div className={styles.formRow2}>
              <div>
                <span className={styles.formLabel}>Recipient Contact</span>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#f8fafc", marginTop: "2px" }}>
                  {quotation.recipient_name}
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>{quotation.recipient_email}</div>
                {quotation.recipient_phone ? (
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>{quotation.recipient_phone}</div>
                ) : null}
              </div>

              <div>
                <span className={styles.formLabel}>School / Entity</span>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#f8fafc", marginTop: "2px" }}>
                  {quotation.school?.name || "Custom Client"}
                </div>
                {quotation.school ? (
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {quotation.school.city || "Johannesburg"}, {quotation.school.province || "Gauteng"}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className={styles.formCard}>
            <div className={styles.formSectionTitle}>
              <FileText size={16} color="#10b981" />
              Itemized Quotation Lines ({quotation.items?.length || 0})
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>SKU</th>
                    <th>Unit</th>
                    <th style={{ textAlign: "center" }}>Qty</th>
                    <th style={{ textAlign: "right" }}>Unit Price (ZAR)</th>
                    <th style={{ textAlign: "right" }}>Total (ZAR)</th>
                  </tr>
                </thead>
                <tbody>
                  {(quotation.items || []).map((item) => (
                    <tr key={item.id} className={styles.dataRow}>
                      <td style={{ fontWeight: 600, color: "#f8fafc" }}>{item.item_title}</td>
                      <td className={styles.textMuted}>{item.sku || "-"}</td>
                      <td className={styles.textMuted}>{item.unit || "Each"}</td>
                      <td style={{ textAlign: "center" }}>{item.quantity}</td>
                      <td style={{ textAlign: "right" }}>{formatMoney(item.unit_price)}</td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "#f8fafc" }}>
                        {formatMoney(item.total_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Terms & Banking */}
          <div className={styles.formRow2}>
            <div className={styles.formCard}>
              <div className={styles.formSectionTitle}>Terms &amp; Delivery Notes</div>
              <p style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.5, whiteSpace: "pre-line" }}>
                {quotation.notes || "Standard 30-day quotation validity terms apply."}
              </p>
            </div>

            <div className={styles.formCard}>
              <div className={styles.formSectionTitle}>Settlement Banking Info</div>
              <p style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.5 }}>
                Bank: Standard Bank of South Africa{"\n"}
                Account: Pexpacks Supplies (Pty) Ltd{"\n"}
                Acc No: 023 948 109 | Branch: 051001{"\n"}
                Ref: {quotation.quote_number}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Totals & Lifecycle Control */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Summary Card */}
          <div className={styles.summaryCard} style={{ position: "static" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#f8fafc", borderBottom: "1px solid rgba(30, 41, 59, 0.6)", paddingBottom: "10px" }}>
              Total Breakdown
            </div>

            <div className={styles.summaryRow}>
              <span>Subtotal (Excl. VAT)</span>
              <span>{formatMoney(quotation.subtotal)}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>VAT ({quotation.vat_rate}%)</span>
              <span>{formatMoney(quotation.vat_amount)}</span>
            </div>

            <div className={styles.summaryRowGrand}>
              <span>Grand Total</span>
              <span className={styles.grandTotalAmount}>{formatMoney(quotation.total_amount)}</span>
            </div>
          </div>

          {/* Lifecycle Status Updater */}
          <div className={styles.formCard}>
            <div className={styles.formSectionTitle}>
              <Clock size={16} color="#10b981" />
              Lifecycle Status
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Update Quote Status</label>
              <select
                className={styles.formInput}
                value={status}
                disabled={busy}
                onChange={(e) => handleStatusChange(e.target.value as QuotationStatus)}
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent / Pending</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
                <option value="converted_to_order" disabled>
                  Converted to Order
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
