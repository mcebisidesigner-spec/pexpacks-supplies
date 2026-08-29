"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, Eye, PackageCheck, Truck, CheckCircle2 } from "lucide-react";
import styles from "./CorePagesView.module.css";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
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
  return row.packing_records[0]?.status || row.status || row.orders?.status || "pending";
}

export function FulfilmentPageView({ initialData }: FulfilmentPageViewProps) {
  const router = useRouter();
  const { params, setParams } = useTableParams();

  const filtered = useMemo(() => {
    const q = params.q.trim().toLowerCase();
    return initialData.filter((row) => {
      const status = statusForRow(row);
      const matchSearch =
        !q ||
        orderRef(row).toLowerCase().includes(q) ||
        schoolName(row).toLowerCase().includes(q) ||
        row.method.toLowerCase().includes(q);
      const matchStatus = !params.status || params.status === "all" || status === params.status || row.status === params.status;
      return matchSearch && matchStatus;
    });
  }, [initialData, params.q, params.status]);

  const columns: ColumnDef<FulfilmentRow>[] = [
    {
      key: "order_id",
      header: "ORDER & METHOD",
      sortable: true,
      render: (row) => (
        <div className={styles.productCell}>
          <Link
            href={`/admin/fulfilment/${orderRef(row)}`}
            className={styles.schoolNameTitle}
            onClick={(e) => e.stopPropagation()}
          >
            {orderRef(row)}
          </Link>
          <span className={styles.productBrand}>{row.method.replaceAll("_", " ")}</span>
        </div>
      ),
    },
    {
      key: "method",
      header: "DESTINATION SCHOOL",
      sortable: true,
      render: (row) => <span className={styles.textMuted}>{schoolName(row)}</span>,
    },
    {
      key: "readiness",
      header: "READINESS",
      sortable: true,
      align: "center",
      width: "130px",
      render: (row) => <span className={styles.textMuted}>{Math.round(row.readiness)}%</span>,
    },
    {
      key: "target_date",
      header: "TARGET DATE",
      sortable: true,
      width: "140px",
      render: (row) => <span className={styles.textMuted}>{formatDate(row.target_date)}</span>,
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
        <div className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/admin/fulfilment/${orderRef(row)}`}
            className={styles.actionEditBtn}
            title={`View pack sheet for ${orderRef(row)}`}
          >
            <Eye size={14} />
          </Link>
        </div>
      ),
    },
  ];

  const readyToPack = initialData.filter((row) => row.readiness >= 100 && !["dispatched", "delivered", "collected"].includes(row.status)).length;
  const inAssembly = initialData.filter((row) => ["packing", "quality_check", "packed"].includes(statusForRow(row))).length;
  const qualityChecked = initialData.filter((row) => ["quality_check", "packed"].includes(statusForRow(row))).length;
  const dispatched = initialData.filter((row) => ["dispatched", "delivered", "collected"].includes(row.status)).length;

  return (
    <div className={styles.container}>
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
          <div className={styles.filterGroup}>
            <AdminSelect
              value={params.status || "all"}
              onChange={(e) => setParams({ status: e.target.value }, true)}
              className={styles.toolbarSelect}
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
        data={filtered}
        columns={columns}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => router.push(`/admin/fulfilment/${orderRef(row)}`)}
        emptyTitle="No packing jobs found"
        emptySubtitle="Try adjusting your search query."
        footer={
          <DataTablePagination
            total={filtered.length}
            pageSize={filtered.length || 25}
            currentPage={1}
          />
        }
      />
    </div>
  );
}