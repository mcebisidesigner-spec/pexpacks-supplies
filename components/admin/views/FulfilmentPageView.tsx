"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, Eye, PackageCheck, Truck } from "lucide-react";
import styles from "./CorePagesView.module.css";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { MetricCard } from "@/components/admin/ui/AdminCard";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import {
  DataTable,
  DataTableToolbar,
  DataTablePagination,
  useTableParams,
  type ColumnDef,
} from "@/components/admin/shared/DataTable";

interface FulfilmentRow {
  id: string;
  orderNumber: string;
  school: string;
  status: string;
  batchWave: string;
  itemsCount: number;
  estDispatch: string;
}

const SEED_FULFILMENT: FulfilmentRow[] = [
  { id: "f-1", orderNumber: "ORD-10528", school: "Primrose Hill Primary", status: "ready_to_pack", batchWave: "BATCH-064", itemsCount: 128, estDispatch: "2026-05-28" },
  { id: "f-2", orderNumber: "ORD-10527", school: "Wit Deep Primary", status: "packing", batchWave: "BATCH-063", itemsCount: 76, estDispatch: "2026-05-28" },
  { id: "f-3", orderNumber: "ORD-10526", school: "Buzy Bee Primary", status: "procurement", batchWave: "WAVE-025", itemsCount: 192, estDispatch: "2026-05-26" },
  { id: "f-4", orderNumber: "ORD-10525", school: "St Dominic's Catholic", status: "ready_to_pack", batchWave: "BATCH-062", itemsCount: 102, estDispatch: "2026-05-25" },
  { id: "f-5", orderNumber: "ORD-10524", school: "Crescent Primary", status: "dispatched", batchWave: "BATCH-061", itemsCount: 58, estDispatch: "2026-05-24" },
  { id: "f-6", orderNumber: "ORD-10523", school: "Daleview Secondary", status: "delivered", batchWave: "BATCH-060", itemsCount: 148, estDispatch: "2026-05-23" },
];

export function FulfilmentPageView() {
  const router = useRouter();
  const { params, setParams } = useTableParams();

  const filtered = useMemo(() => {
    return SEED_FULFILMENT.filter((f) => {
      const matchSearch =
        !params.q.trim() ||
        f.orderNumber.toLowerCase().includes(params.q.toLowerCase()) ||
        f.school.toLowerCase().includes(params.q.toLowerCase()) ||
        f.batchWave.toLowerCase().includes(params.q.toLowerCase());

      const matchStatus =
        !params.status || params.status === "all" || f.status === params.status;

      return matchSearch && matchStatus;
    });
  }, [params.q, params.status]);

  const columns: ColumnDef<FulfilmentRow>[] = [
    {
      key: "orderNumber",
      header: "Order & Batch",
      sortable: true,
      render: (row) => (
        <div className={styles.productCell}>
          <Link
            href={`/admin/fulfilment/${row.orderNumber}`}
            className={styles.productNameLink}
            onClick={(e) => e.stopPropagation()}
          >
            {row.orderNumber}
          </Link>
          <span className={styles.productBrand}>{row.batchWave}</span>
        </div>
      ),
    },
    {
      key: "school",
      header: "Destination School",
      sortable: true,
      render: (row) => <span>{row.school}</span>,
    },
    {
      key: "itemsCount",
      header: "Total Items",
      sortable: true,
      align: "center",
      width: "120px",
      render: (row) => <span>{row.itemsCount} units</span>,
    },
    {
      key: "estDispatch",
      header: "Target Date",
      sortable: true,
      width: "130px",
      render: (row) => <span>{row.estDispatch}</span>,
    },
    {
      key: "status",
      header: "Packing Status",
      sortable: true,
      align: "center",
      width: "140px",
      render: (row) => <StatusBadge status={row.status} showDot />,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      width: "80px",
      render: (row) => (
        <div className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
          <AdminButton
            href={`/admin/fulfilment/${row.orderNumber}`}
            variant="icon"
            size="sm"
            aria-label={`View pack sheet for ${row.orderNumber}`}
            icon={<Eye size={13} />}
          />
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <AdminPageHeader
        title="Packing & Fulfilment"
        count={filtered.length}
        subtitle="School pack assembly queues, box labeling, and courier dispatch management."
      />

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginBottom: "20px" }}>
        <MetricCard
          label="Ready to Pack"
          value="356"
          subtext="Stock fully secured"
          icon={<PackageCheck size={16} />}
          iconTone="green"
        />
        <MetricCard
          label="In Assembly"
          value="84"
          subtext="Active packing line"
          icon={<Clock size={16} />}
          iconTone="blue"
        />
        <MetricCard
          label="Dispatched"
          value="1,420"
          subtext="En route / Delivered"
          icon={<Truck size={16} />}
          iconTone="purple"
        />
      </div>

      <DataTableToolbar
        searchPlaceholder="Search packing queue by order, school, batch..."
      />

      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => router.push(`/admin/fulfilment/${row.orderNumber}`)}
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
