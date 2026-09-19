"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, Eye, PackageCheck, Truck, CheckCircle2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPage } from "@/components/admin/ui";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import { QuickMetricsGrid } from "@/components/admin/ui/QuickMetricsGrid";
import {
  DataTable,
  DataTableToolbar,
  DataTablePagination,
  useTableParams,
  type ColumnDef,
} from "@/components/admin/shared/DataTable";
import type { FulfilmentRow } from "@/lib/admin/operations";

interface FulfilmentPageViewProps {
  initialData: FulfilmentRow[];
}

function formatDate(value: string | null): string {
  if (!value) return "No target";
  return new Date(value).toLocaleDateString("en-ZA");
}

function orderRef(row: FulfilmentRow): string {
  return row.orders?.order_reference || row.order_id;
}

function schoolName(row: FulfilmentRow): string {
  return row.orders?.school_name || "Unassigned school";
}

function statusForRow(row: FulfilmentRow): string {
  return (
    row.packing_records[0]?.status ||
    (row.orders as { packing_status?: string } | undefined)?.packing_status ||
    row.status ||
    "pending"
  );
}

export function FulfilmentPageView({ initialData }: FulfilmentPageViewProps) {
  const router = useRouter();
  const { params, setParams } = useTableParams();
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;

  const filtered = useMemo(() => {
    return initialData.filter((row) => {
      if (params.q) {
        const query = params.q.toLowerCase();
        const ref = orderRef(row).toLowerCase();
        const school = schoolName(row).toLowerCase();
        const method = row.method.toLowerCase();
        if (
          !ref.includes(query) &&
          !school.includes(query) &&
          !method.includes(query)
        ) {
          return false;
        }
      }
      if (params.status && params.status !== "all") {
        if (statusForRow(row) !== params.status) return false;
      }
      return true;
    });
  }, [initialData, params.q, params.status]);

  const pagedFulfilment = useMemo(() => {
    return filtered.slice((page - 1) * pageSize, page * pageSize);
  }, [filtered, page, pageSize]);

  const columns: ColumnDef<FulfilmentRow>[] = [
    {
      key: "order_id",
      header: "ORDER & METHOD",
      sortable: true,
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <Link
            href={`/admin/fulfilment/${orderRef(row)}`}
            className="text-slate-100 font-semibold text-xs hover:text-emerald-400 transition-colors no-underline"
            onClick={(e) => e.stopPropagation()}
          >
            {orderRef(row)}
          </Link>
          <span className="text-[11px] text-slate-400 capitalize">
            {row.method.replaceAll("_", " ")}
          </span>
        </div>
      ),
    },
    {
      key: "method",
      header: "DESTINATION SCHOOL",
      sortable: true,
      render: (row) => (
        <span className="text-slate-400 text-xs">{schoolName(row)}</span>
      ),
    },
    {
      key: "readiness",
      header: "READINESS",
      sortable: true,
      align: "center",
      width: "130px",
      render: (row) => (
        <span className="text-slate-300 text-xs font-semibold">
          {Math.round(row.readiness)}%
        </span>
      ),
    },
    {
      key: "target_date",
      header: "TARGET DATE",
      sortable: true,
      width: "140px",
      render: (row) => (
        <span className="text-slate-400 text-xs">{formatDate(row.target_date)}</span>
      ),
    },
    {
      key: "status",
      header: "PACKING STATUS",
      sortable: true,
      align: "center",
      width: "150px",
      render: (row) => <StatusBadge status={statusForRow(row)} showDot />,
    },
    {
      key: "actions",
      header: "ACTIONS",
      align: "right",
      sticky: "right",
      width: "80px",
      render: (row) => (
        <div
          className="flex items-center justify-end gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            href={`/admin/fulfilment/${orderRef(row)}`}
            className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            data-db-tooltip={`View pack sheet for ${orderRef(row)}`}
          >
            <Eye size={14} />
          </Link>
        </div>
      ),
    },
  ];

  const readyToPack = initialData.filter(
    (row) =>
      row.readiness >= 100 &&
      !["dispatched", "delivered", "collected"].includes(row.status),
  ).length;
  const inAssembly = initialData.filter((row) =>
    ["packing", "quality_check", "packed"].includes(statusForRow(row)),
  ).length;
  const qualityChecked = initialData.filter((row) =>
    ["quality_check", "packed"].includes(statusForRow(row)),
  ).length;
  const dispatched = initialData.filter((row) =>
    ["dispatched", "delivered", "collected"].includes(row.status),
  ).length;

  return (
    <AdminPage fullWidth className="gap-6">
      <AdminPageHeader
        title="Packing & Fulfilment"
        count={filtered.length}
        subtitle="School pack assembly queues, box labeling, and courier dispatch management."
      />

      <QuickMetricsGrid
        metrics={[
          {
            label: "READY TO PACK",
            value: readyToPack,
            subtitle: "Stock fully secured",
            trendDirection: "neutral",
            tone: "emerald",
            icon: <PackageCheck size={16} />,
          },
          {
            label: "IN ASSEMBLY",
            value: inAssembly,
            subtitle: "Workstation queue",
            trendDirection: "neutral",
            tone: "cyan",
            icon: <Clock size={16} />,
          },
          {
            label: "QUALITY CHECKED",
            value: qualityChecked,
            subtitle: "Packed or checking",
            trendDirection: "neutral",
            tone: "blue",
            icon: <CheckCircle2 size={16} />,
          },
          {
            label: "DISPATCHED",
            value: dispatched,
            subtitle: "En route / delivered",
            trendDirection: "neutral",
            tone: "purple",
            icon: <Truck size={16} />,
          },
        ]}
      />

      <DataTableToolbar
        searchPlaceholder="Search packing queue by order, school, method..."
        filters={
          <div className="flex items-center gap-2">
            <AdminSelect
              value={params.status || "all"}
              onChange={(e) => setParams({ status: e.target.value }, true)}
              className="min-w-[140px]"
            >
              <option value="all">Status: All</option>
              <option value="not_ready">Not Ready</option>
              <option value="pending">Pending</option>
              <option value="packing">Packing</option>
              <option value="quality_check">Quality Check</option>
              <option value="packed">Packed</option>
              <option value="dispatched">Dispatched</option>
              <option value="delivered">Delivered</option>
              <option value="collected">Collected</option>
            </AdminSelect>
          </div>
        }
      />

      <DataTable
        data={pagedFulfilment}
        columns={columns}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => router.push(`/admin/fulfilment/${orderRef(row)}`)}
        emptyTitle="No packing jobs found"
        emptySubtitle="Try adjusting your search query."
        footer={
          <DataTablePagination
            total={filtered.length}
            pageSize={pageSize}
            currentPage={page}
          />
        }
      />
    </AdminPage>
  );
}
