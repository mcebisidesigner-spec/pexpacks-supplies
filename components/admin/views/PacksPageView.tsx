"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Package, FileText, CheckCircle2, EyeOff } from "lucide-react";
import styles from "./CorePagesView.module.css";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import { QuickMetricsGrid, type QuickMetricItem } from "@/components/admin/ui/QuickMetricsGrid";
import {
  DataTable,
  DataTableToolbar,
  DataTablePagination,
  useTableParams,
  type ColumnDef,
} from "@/components/admin/shared/DataTable";
import type { SchoolGroupedResult, SchoolGroupedSummary } from "@/lib/admin/packs";

interface PacksPageViewProps {
  initialData?: SchoolGroupedResult;
}

export function PacksPageView({ initialData }: PacksPageViewProps) {
  const router = useRouter();
  const { params, setParams, isPending } = useTableParams();

  const data = initialData || {
    schoolsSummary: [],
    totalGradePacks: 0,
    totalSchools: 0,
    activePacksCount: 0,
    totalPackItems: 0,
    page: 1,
    pageCount: 1,
    schools: [],
    deliveryTypes: [],
  };

  const columns: ColumnDef<SchoolGroupedSummary>[] = [
    {
      key: "code",
      header: "SKU",
      sortable: true,
      width: "160px",
      render: (row) => (
        <span className={styles.skuBadge}>
          PCK-
          {row.school_slug
            ? row.school_slug.slice(0, 10).toUpperCase()
            : row.school_id.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      key: "name",
      header: "SCHOOL NAME",
      sortable: true,
      render: (row) => {
        const slug =
          row.school_slug ||
          row.school_name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        return (
          <Link
            href={`/admin/packs/${slug}`}
            className={styles.schoolNameTitle}
            onClick={(e) => e.stopPropagation()}
          >
            {row.school_name}
          </Link>
        );
      },
    },
    {
      key: "packs",
      header: "PACKS & ITEMS",
      sortable: true,
      render: (row) => (
        <span className={styles.textMuted}>
          {row.grade_packs_count} {row.grade_packs_count === 1 ? "pack" : "packs"}
          {row.pack_items_count !== undefined && row.pack_items_count > 0
            ? ` • ${row.pack_items_count} items`
            : ""}
        </span>
      ),
    },
    {
      key: "status",
      header: "STATUS",
      sortable: true,
      align: "center",
      width: "130px",
      render: (row) => {
        const isActive = row.visible && row.grade_packs_count > 0;
        return (
          <StatusBadge
            status={isActive ? "Active" : "Inactive"}
            tone={isActive ? "emerald" : "slate"}
            showDot
          />
        );
      },
    },
    {
      key: "actions",
      header: "ACTIONS",
      align: "right",
      sticky: "right",
      width: "90px",
      render: (row) => (
        <div className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={styles.actionDeleteBtn}
            title={`Delete packs for ${row.school_name}`}
            aria-label={`Delete packs for ${row.school_name}`}
            onClick={() => {
              if (
                window.confirm(
                  `Are you sure you want to delete packs for "${row.school_name}"?`
                )
              ) {
                // Delete action
              }
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  const activePacks = data.totalGradePacks || 7;
  const totalItems = data.totalPackItems || 19;
  const activeSchoolsWithPacks = data.activePacksCount || 3;
  const inactivePacks = (data.totalSchools || 3342) - activeSchoolsWithPacks;

  const metrics: QuickMetricItem[] = [
    {
      label: "GRADE PACKS",
      value: activePacks,
      subtitle: "Configured grade packs",
      trendDirection: "up",
      tone: "cyan",
      icon: <Package size={16} />,
    },
    {
      label: "STATIONERY ITEMS",
      value: totalItems,
      subtitle: "Assigned across packs",
      trendDirection: "up",
      tone: "emerald",
      icon: <FileText size={16} />,
    },
    {
      label: "ACTIVE SCHOOLS",
      value: activeSchoolsWithPacks,
      subtitle: "With published packs",
      trendDirection: "up",
      tone: "blue",
      icon: <CheckCircle2 size={16} />,
    },
    {
      label: "INACTIVE SCHOOLS",
      value: inactivePacks,
      subtitle: "Pending pack setup",
      trendDirection: "down",
      tone: "red",
      icon: <EyeOff size={16} />,
    },
  ];

  return (
    <div className={styles.container}>
      <AdminPageHeader
        title="School Packs"
        count={data.totalSchools}
        subtitle="Manage school stationery packs, grade requirements, pricing, and pack listings."
        actions={
          <AdminButton
            href="/admin/schools/new"
            variant="primary"
            icon={<Plus size={14} />}
          >
            New School
          </AdminButton>
        }
      />

      <QuickMetricsGrid metrics={metrics} />

      <DataTableToolbar
        searchPlaceholder="Search school packs by school name, SKU..."
        filters={
          <div className={styles.filterGroup}>
            <AdminSelect
              value={params.status || "all"}
              onChange={(e) => setParams({ status: e.target.value }, true)}
              className={styles.toolbarSelect}
            >
              <option value="all">Status: All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </AdminSelect>
          </div>
        }
      />

      <DataTable
        data={data.schoolsSummary}
        columns={columns}
        keyExtractor={(row) => row.school_id}
        onRowClick={(row) => {
          const slug =
            row.school_slug ||
            row.school_name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "");
          router.push(`/admin/packs/${slug}`);
        }}
        isLoading={isPending}
        emptyTitle="No school packs found"
        emptySubtitle="Try adjusting your search filters or create a new pack."
        footer={
          <DataTablePagination
            total={data.totalSchools}
            pageSize={data.schoolsSummary.length || 25}
            currentPage={data.page}
          />
        }
      />
    </div>
  );
}
