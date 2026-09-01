"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Eye,
  Download,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  TrendingUp,
  SlidersHorizontal,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import {
  QuickMetricsGrid,
  type QuickMetricItem,
} from "@/components/admin/ui/QuickMetricsGrid";
import {
  DataTable,
  DataTableToolbar,
  DataTablePagination,
  useTableParams,
  type ColumnDef,
} from "@/components/admin/shared/DataTable";
import type { BadgeTone } from "@/components/admin/ui";
import type { QuotationsListResult, QuotationRow } from "@/lib/admin/quotations";
import styles from "../views/CorePagesView.module.css";

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
  const { params, setParams, isPending } = useTableParams();

  const pendingCount =
    (initialData.stats.sent || 0) + (initialData.stats.draft || 0);

  const columns: ColumnDef<QuotationRow>[] = [
    {
      key: "quote_number",
      header: "QUOTE NUMBER",
      sortable: true,
      width: "160px",
      render: (row) => (
        <span className={styles.skuBadge}>
          {row.quote_number}
        </span>
      ),
    },
    {
      key: "recipient_name",
      header: "CLIENT / SCHOOL",
      sortable: true,
      render: (row) => (
        <div className={styles.productCell}>
          <Link
            href={`/admin/quotations/${row.quote_number}`}
            className={styles.schoolNameTitle}
            onClick={(e) => e.stopPropagation()}
          >
            {row.recipient_name}
          </Link>
          <span className={styles.productBrand}>
            {row.school?.name || row.recipient_email}
          </span>
        </div>
      ),
    },
    {
      key: "created_at",
      header: "CREATED",
      sortable: true,
      width: "130px",
      render: (row) => (
        <span className={styles.textMuted}>
          {row.created_at
            ? new Date(row.created_at).toLocaleDateString("en-ZA")
            : "—"}
        </span>
      ),
    },
    {
      key: "valid_until",
      header: "VALID UNTIL",
      sortable: true,
      width: "130px",
      render: (row) => (
        <span className={styles.textMuted}>
          {row.valid_until
            ? new Date(row.valid_until).toLocaleDateString("en-ZA")
            : "—"}
        </span>
      ),
    },
    {
      key: "items_count",
      header: "ITEMS",
      sortable: true,
      align: "center",
      width: "100px",
      render: (row) => (
        <span className={styles.textMuted}>
          {row.items_count ?? 0}{" "}
          {(row.items_count ?? 0) === 1 ? "item" : "items"}
        </span>
      ),
    },
    {
      key: "total_amount",
      header: "TOTAL (ZAR)",
      sortable: true,
      align: "right",
      width: "140px",
      render: (row) => (
        <span className={styles.priceHighlight}>
          {formatMoney(row.total_amount)}
        </span>
      ),
    },
    {
      key: "status",
      header: "STATUS",
      sortable: true,
      align: "center",
      width: "140px",
      render: (row) => {
        const cfg = STATUS_CONFIG[row.status] || {
          label: row.status,
          tone: "slate" as BadgeTone,
        };
        return <StatusBadge status={cfg.label} tone={cfg.tone} showDot />;
      },
    },
    {
      key: "actions",
      header: "ACTIONS",
      align: "right",
      sticky: "right",
      width: "100px",
      render: (row) => (
        <div
          className={styles.actionsCell}
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            href={`/admin/quotations/${row.quote_number}`}
            className={styles.actionEditBtn}
            data-db-tooltip={`View ${row.quote_number}`}
            aria-label={`View ${row.quote_number}`}
          >
            <Eye size={14} />
          </Link>
          {row.pdf_storage_path && (
            <a
              href={row.pdf_storage_path}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.actionEditBtn}
              data-db-tooltip="Download PDF"
              aria-label="Download PDF"
            >
              <Download size={14} />
            </a>
          )}
        </div>
      ),
    },
  ];

  const filteredAndSorted = useMemo(() => {
    let list = [...(initialData.quotations || [])];

    if (params.status && params.status !== "all") {
      list = list.filter((q) => q.status === params.status);
    }
    if (params.q?.trim()) {
      const query = params.q.toLowerCase();
      list = list.filter((q) => {
        const numMatch = q.quote_number?.toLowerCase().includes(query);
        const nameMatch = q.recipient_name?.toLowerCase().includes(query);
        const emailMatch = q.recipient_email?.toLowerCase().includes(query);
        const schoolMatch = q.school?.name?.toLowerCase().includes(query);
        return Boolean(numMatch || nameMatch || emailMatch || schoolMatch);
      });
    }

    if (params.sort) {
      const multiplier = params.order === "desc" ? -1 : 1;
      list.sort((a, b) => {
        if (params.sort === "quote_number") {
          return (
            multiplier *
            (a.quote_number || "").localeCompare(b.quote_number || "")
          );
        }
        if (params.sort === "recipient_name") {
          return (
            multiplier *
            (a.recipient_name || "").localeCompare(b.recipient_name || "")
          );
        }
        if (params.sort === "created_at") {
          return (
            multiplier *
            (new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          );
        }
        if (params.sort === "valid_until") {
          return (
            multiplier *
            (new Date(a.valid_until).getTime() - new Date(b.valid_until).getTime())
          );
        }
        if (params.sort === "items_count") {
          return multiplier * ((a.items_count || 0) - (b.items_count || 0));
        }
        if (params.sort === "total_amount") {
          return multiplier * ((a.total_amount || 0) - (b.total_amount || 0));
        }
        if (params.sort === "status") {
          return multiplier * (a.status || "").localeCompare(b.status || "");
        }
        return 0;
      });
    }

    return list;
  }, [initialData.quotations, params.status, params.q, params.sort, params.order]);

  const metrics: QuickMetricItem[] = [
    {
      label: "TOTAL QUOTES",
      value: initialData.stats.total,
      subtitle: "Generated in season",
      trendDirection: "up",
      tone: "cyan",
      icon: <FileSpreadsheet size={16} />,
    },
    {
      label: "AWAITING ACCEPTANCE",
      value: pendingCount,
      subtitle: "Sent to clients",
      trendDirection: "neutral",
      tone: "amber",
      icon: <Clock size={16} />,
    },
    {
      label: "ACCEPTED QUOTES",
      value: initialData.stats.accepted,
      subtitle: "Ready for conversion",
      trendDirection: "up",
      tone: "emerald",
      icon: <CheckCircle2 size={16} />,
    },
    {
      label: "CONVERTED TO ORDERS",
      value: initialData.stats.converted,
      subtitle: "Converted to live orders",
      trendDirection: "up",
      tone: "blue",
      icon: <TrendingUp size={16} />,
    },
  ];

  const totalRecords = initialData.totalCount || initialData.stats.total || filteredAndSorted.length;

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
              icon={<Plus size={14} />}
            >
              New Quotation
            </AdminButton>
          </>
        }
      />

      {/* 2. KPI Summary Cards with Graphs */}
      <QuickMetricsGrid metrics={metrics} />

      {/* 3. DataTable Toolbar with DB Search & Filter Dropdown */}
      <DataTableToolbar
        searchPlaceholder="Search quote #, recipient, or school..."
        filters={
          <div className={styles.filterGroup}>
            <AdminSelect
              value={params.status || "all"}
              onChange={(e) => setParams({ status: e.target.value }, true)}
              className={styles.toolbarSelect}
            >
              <option value="all">Status: All</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
              <option value="converted_to_order">Converted to Order</option>
              <option value="expired">Expired</option>
            </AdminSelect>
          </div>
        }
      />

      {/* 4. Unified DB DataTable */}
      <DataTable
        data={filteredAndSorted}
        columns={columns}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => router.push(`/admin/quotations/${row.quote_number}`)}
        isLoading={isPending}
        emptyTitle="No quotations found"
        emptySubtitle="Try adjusting your search filters or create a new quotation."
        footer={
          <DataTablePagination
            total={totalRecords}
            pageSize={params.pageSize}
            currentPage={params.page}
          />
        }
      />
    </div>
  );
}
