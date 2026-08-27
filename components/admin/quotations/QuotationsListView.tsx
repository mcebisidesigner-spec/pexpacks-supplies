"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Download,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import {
  AdminPageHeader,
  AdminButton,
  MetricCard,
  StatusBadge,
  type BadgeTone,
} from "@/components/admin/ui";
import { FloatingInput } from "@/components/ui/FloatingInput";
import type { QuotationsListResult, QuotationRow } from "@/lib/admin/quotations";
import styles from "./Quotations.module.css";

const STATUS_CONFIG: Record<string, { label: string; tone: BadgeTone }> = {
  draft: { label: "Draft", tone: "slate" },
  sent: { label: "Sent", tone: "blue" },
  accepted: { label: "Accepted", tone: "emerald" },
  declined: { label: "Declined", tone: "red" },
  expired: { label: "Expired", tone: "amber" },
  converted_to_order: { label: "Converted", tone: "teal" },
};

function formatMoney(amount: number): string {
  return `R ${Number(amount || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function QuotationsListView({
  initialData,
}: {
  initialData: QuotationsListResult;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const pendingCount = (initialData.stats.sent || 0) + (initialData.stats.draft || 0);

  const filtered = useMemo(() => {
    return initialData.quotations.filter((q) => {
      // 1. Status Filter
      if (statusFilter !== "all" && q.status !== statusFilter) {
        return false;
      }
      // 2. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const numMatch = q.quote_number.toLowerCase().includes(query);
        const nameMatch = q.recipient_name.toLowerCase().includes(query);
        const emailMatch = q.recipient_email.toLowerCase().includes(query);
        const schoolMatch = q.school?.name?.toLowerCase().includes(query);
        return numMatch || nameMatch || emailMatch || Boolean(schoolMatch);
      }
      return true;
    });
  }, [initialData.quotations, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  return (
    <div className={styles.container}>
      {/* 1. Header Toolbar */}
      <AdminPageHeader
        title="Quotations"
        count={initialData.stats.total}
        subtitle="Create branded A4 quotations, track quote statuses, and convert to official orders."
        actions={
          <>
            <AdminButton
              variant="secondary"
              href="/admin/quotations/pexpacks-details"
              icon={<SlidersHorizontal size={14} />}
            >
              Pexpacks Details
            </AdminButton>
            <AdminButton
              variant="primary"
              href="/admin/quotations/new"
              icon={<Plus size={15} />}
            >
              New Quotation
            </AdminButton>
          </>
        }
      />

      {/* 2. 5 KPI Summary Cards */}
      <div className={styles.kpiGrid5}>
        <MetricCard
          label="Total Quotes"
          value={initialData.stats.total}
          icon={<FileSpreadsheet size={16} />}
          iconTone="blue"
          subtext="Generated in season"
        />
        <MetricCard
          label="Awaiting Acceptance"
          value={pendingCount}
          icon={<Clock size={16} />}
          iconTone="amber"
          subtext="Sent to clients"
        />
        <MetricCard
          label="Accepted Quotes"
          value={initialData.stats.accepted}
          icon={<CheckCircle2 size={16} />}
          iconTone="green"
          subtext="Ready for conversion"
        />
        <MetricCard
          label="Declined"
          value={initialData.stats.declined}
          icon={<XCircle size={16} />}
          iconTone="red"
          subtext="Unsuccessful quotes"
        />
        <MetricCard
          label="Converted to Orders"
          value={initialData.stats.converted}
          icon={<TrendingUp size={16} />}
          iconTone="green"
          subtext="Live orders"
        />
      </div>

      {/* 3. Search & Status Tabs */}
      <div className={styles.toolbarRow}>
        <div className={styles.searchWrapper}>
          <FloatingInput
            label="Search Quote #, recipient, or school..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            icon={<Search size={15} />}
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
                  <td colSpan={8} className={styles.emptyTableState}>
                    No quotations found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((quote) => {
                  const cfg = STATUS_CONFIG[quote.status] || { label: quote.status, tone: "slate" as BadgeTone };
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
                        {new Date(quote.created_at).toLocaleDateString("en-ZA")}
                      </td>
                      <td className={styles.textMuted}>
                        {new Date(quote.valid_until).toLocaleDateString("en-ZA")}
                      </td>
                      <td className={styles.textMuted}>
                        {quote.items_count} {quote.items_count === 1 ? "item" : "items"}
                      </td>
                      <td className={styles.priceText}>{formatMoney(quote.total_amount)}</td>
                      <td>
                        <StatusBadge status={cfg.label} tone={cfg.tone} showDot />
                      </td>
                      <td onClick={(e) => e.stopPropagation()} className={styles.tableActionsCell}>
                        <div className={styles.tableActionsGroup}>
                          <AdminButton
                            variant="secondary"
                            size="sm"
                            href={`/admin/quotations/${quote.quote_number}`}
                            icon={<Eye size={12} />}
                          >
                            View
                          </AdminButton>
                          {quote.pdf_storage_path ? (
                            <AdminButton
                              variant="outline"
                              size="sm"
                              href={quote.pdf_storage_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              icon={<Download size={12} />}
                            >
                              PDF
                            </AdminButton>
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
