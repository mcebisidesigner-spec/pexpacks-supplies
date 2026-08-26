"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileSpreadsheet,
  Plus,
  Search,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ExternalLink,
  Download,
  ArrowRight,
  ShoppingCart,
} from "lucide-react";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import type { QuotationsListResult, QuotationRow, QuotationStatus } from "@/lib/admin/quotations";
import styles from "./Quotations.module.css";
import adminStyles from "@/app/admin/admin.module.css";

function formatMoney(amount: number): string {
  return `R ${Number(amount || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function SparklineWave({ color, direction = "up" }: { color: string; direction?: "up" | "down" }) {
  const path =
    direction === "up"
      ? "M 0 18 Q 15 22 30 14 T 50 8 T 72 2"
      : "M 0 4 Q 15 2 30 10 T 50 16 T 72 22";
  return (
    <svg className={adminStyles.kpiSparkline} viewBox="0 0 72 24" fill="none">
      <path d={path} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const STATUS_CONFIG: Record<
  QuotationStatus,
  { label: string; tone: "slate" | "amber" | "emerald" | "red" | "teal" }
> = {
  draft: { label: "Draft", tone: "slate" },
  sent: { label: "Sent / Pending", tone: "amber" },
  accepted: { label: "Accepted", tone: "emerald" },
  declined: { label: "Declined", tone: "red" },
  converted_to_order: { label: "Converted", tone: "teal" },
};

export function QuotationsListView({ initialData }: { initialData: QuotationsListResult }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const filteredQuotes = useMemo(() => {
    return initialData.quotations.filter((q) => {
      const matchSearch =
        q.quote_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.recipient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.recipient_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.school?.name && q.school.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === "all" || q.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [initialData.quotations, searchQuery, statusFilter]);

  const totalFiltered = filteredQuotes.length;
  const paginated = useMemo(() => {
    const from = (currentPage - 1) * pageSize;
    return filteredQuotes.slice(from, from + pageSize);
  }, [filteredQuotes, currentPage, pageSize]);

  return (
    <div className={styles.container}>
      {/* 1. Header Toolbar */}
      <div className={adminStyles.headerRow}>
        <div>
          <h1 className={adminStyles.pageTitle}>
            Quotations{" "}
            <span className={adminStyles.badgeCount}>({initialData.stats.total})</span>
          </h1>
          <p className={adminStyles.pageSubtitle}>
            Create branded A4 quotations, track quote statuses, and convert to official orders.
          </p>
        </div>

        <Link
          href="/admin/quotations/new"
          className={adminStyles.button}
          style={{
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "#ffffff",
            borderColor: "rgba(16, 185, 129, 0.4)",
            fontWeight: 600,
            boxShadow: "0 2px 10px rgba(16, 185, 129, 0.25)",
          }}
        >
          <Plus size={15} /> New Quotation
        </Link>
      </div>

      {/* 2. 5 KPI Summary Cards */}
      <div className={adminStyles.metricsGrid5}>
        {/* Card 1: Total Quotes */}
        <div className={adminStyles.kpiCard}>
          <div className={adminStyles.kpiTop}>
            <div className={`${adminStyles.kpiIconWrapper} ${adminStyles.kpiIconTeal}`}>
              <FileSpreadsheet size={18} />
            </div>
            <div className={adminStyles.kpiHeaderInfo}>
              <span className={adminStyles.kpiLabel}>Total Quotations</span>
              <span className={adminStyles.kpiValue}>{initialData.stats.total}</span>
            </div>
          </div>
          <div className={adminStyles.kpiFooter}>
            <span className={`${adminStyles.kpiTrend} ${adminStyles.kpiTrendUp}`}>
              <TrendingUp size={12} /> {formatMoney(initialData.stats.totalValue)}
            </span>
            <SparklineWave color="#2dd4bf" direction="up" />
          </div>
        </div>

        {/* Card 2: Draft */}
        <div className={adminStyles.kpiCard}>
          <div className={adminStyles.kpiTop}>
            <div className={`${adminStyles.kpiIconWrapper} ${adminStyles.kpiIconSlate}`}>
              <FileText size={18} />
            </div>
            <div className={adminStyles.kpiHeaderInfo}>
              <span className={adminStyles.kpiLabel}>Draft</span>
              <span className={adminStyles.kpiValue}>{initialData.stats.draft}</span>
            </div>
          </div>
          <div className={adminStyles.kpiFooter}>
            <span className={adminStyles.kpiTrend}>In preparation</span>
            <SparklineWave color="#94a3b8" direction="up" />
          </div>
        </div>

        {/* Card 3: Sent */}
        <div className={adminStyles.kpiCard}>
          <div className={adminStyles.kpiTop}>
            <div className={`${adminStyles.kpiIconWrapper} ${adminStyles.kpiIconAmber}`}>
              <Clock size={18} />
            </div>
            <div className={adminStyles.kpiHeaderInfo}>
              <span className={adminStyles.kpiLabel}>Sent / Pending</span>
              <span className={adminStyles.kpiValue}>{initialData.stats.sent}</span>
            </div>
          </div>
          <div className={adminStyles.kpiFooter}>
            <span className={`${adminStyles.kpiTrend} ${adminStyles.kpiTrendUp}`}>
              Awaiting decision
            </span>
            <SparklineWave color="#f59e0b" direction="up" />
          </div>
        </div>

        {/* Card 4: Accepted */}
        <div className={adminStyles.kpiCard}>
          <div className={adminStyles.kpiTop}>
            <div className={`${adminStyles.kpiIconWrapper} ${adminStyles.kpiIconEmerald}`}>
              <CheckCircle2 size={18} />
            </div>
            <div className={adminStyles.kpiHeaderInfo}>
              <span className={adminStyles.kpiLabel}>Accepted</span>
              <span className={adminStyles.kpiValue}>{initialData.stats.accepted}</span>
            </div>
          </div>
          <div className={adminStyles.kpiFooter}>
            <span className={`${adminStyles.kpiTrend} ${adminStyles.kpiTrendUp}`}>
              Ready to convert
            </span>
            <SparklineWave color="#10b981" direction="up" />
          </div>
        </div>

        {/* Card 5: Converted */}
        <div className={adminStyles.kpiCard}>
          <div className={adminStyles.kpiTop}>
            <div className={`${adminStyles.kpiIconWrapper} ${adminStyles.kpiIconCyan}`}>
              <ShoppingCart size={18} />
            </div>
            <div className={adminStyles.kpiHeaderInfo}>
              <span className={adminStyles.kpiLabel}>Converted</span>
              <span className={adminStyles.kpiValue}>{initialData.stats.converted}</span>
            </div>
          </div>
          <div className={adminStyles.kpiFooter}>
            <span className={`${adminStyles.kpiTrend} ${adminStyles.kpiTrendUp}`}>
              Live orders
            </span>
            <SparklineWave color="#06b6d4" direction="up" />
          </div>
        </div>
      </div>

      {/* 3. Search & Status Tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", minWidth: "280px" }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#64748b",
            }}
          />
          <input
            type="text"
            placeholder="Search Quote #, recipient, or school..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className={adminStyles.inputField}
            style={{ paddingLeft: "36px", width: "100%", height: "38px" }}
          />
        </div>

        <div className={styles.statusTabs}>
          {[
            { id: "all", label: "All" },
            { id: "draft", label: "Draft" },
            { id: "sent", label: "Sent" },
            { id: "accepted", label: "Accepted" },
            { id: "declined", label: "Declined" },
            { id: "converted_to_order", label: "Converted" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`${styles.statusTab} ${statusFilter === tab.id ? styles.statusTabActive : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Quotations Data Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Quote Number</th>
                <th>Client / School</th>
                <th>Created</th>
                <th>Valid Until</th>
                <th>Items</th>
                <th>Total (ZAR)</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className={adminStyles.emptyCell} style={{ textAlign: "center", padding: "40px" }}>
                    No quotations found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((quote) => {
                  const cfg = STATUS_CONFIG[quote.status] || { label: quote.status, tone: "slate" };
                  return (
                    <tr
                      key={quote.id}
                      className={styles.dataRow}
                      onClick={() => router.push(`/admin/quotations/${quote.quote_number}`)}
                    >
                      <td>
                        <Link
                          href={`/admin/quotations/${quote.quote_number}`}
                          className={styles.quoteNumLink}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {quote.quote_number}
                        </Link>
                      </td>
                      <td>
                        <div className={styles.recipientCell}>
                          <span className={styles.recipientName}>{quote.recipient_name}</span>
                          <span className={styles.schoolSubtext}>
                            {quote.school?.name || quote.recipient_email}
                          </span>
                        </div>
                      </td>
                      <td className={styles.textMuted}>
                        {new Date(quote.created_at).toLocaleDateString("en-GB")}
                      </td>
                      <td className={styles.textMuted}>
                        {new Date(quote.valid_until).toLocaleDateString("en-GB")}
                      </td>
                      <td className={styles.textMuted}>
                        {quote.items_count} {quote.items_count === 1 ? "item" : "items"}
                      </td>
                      <td className={styles.priceText}>{formatMoney(quote.total_amount)}</td>
                      <td>
                        <StatusBadge status={cfg.label} tone={cfg.tone} showDot />
                      </td>
                      <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                          <Link
                            href={`/admin/quotations/${quote.quote_number}`}
                            className={adminStyles.button}
                            style={{ height: "28px", padding: "0 8px", fontSize: "11px" }}
                          >
                            View
                          </Link>
                          {quote.pdf_storage_path ? (
                            <a
                              href={quote.pdf_storage_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={adminStyles.button}
                              style={{ height: "28px", padding: "0 8px", fontSize: "11px" }}
                            >
                              <Download size={12} /> PDF
                            </a>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
