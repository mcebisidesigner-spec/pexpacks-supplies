"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import styles from "./CorePagesView.module.css";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import {
  DataTable,
  DataTableToolbar,
  DataTablePagination,
  useTableParams,
  type ColumnDef,
} from "@/components/admin/shared/DataTable";
import type { SchoolListResult, SchoolRow } from "@/lib/admin/schools";

interface SchoolsPageViewProps {
  initialData?: SchoolListResult;
}

export function SchoolsPageView({ initialData }: SchoolsPageViewProps) {
  const router = useRouter();
  const { params, setParams, isPending } = useTableParams();

  const data = initialData || {
    schools: [],
    total: 0,
    page: 1,
    pageCount: 1,
    cities: [],
    provinces: [],
  };

  const columns: ColumnDef<SchoolRow>[] = [
    {
      key: "code",
      header: "SKU",
      sortable: true,
      width: "160px",
      render: (row) => (
        <span className={styles.skuBadge}>
          SCH-{row.slug ? row.slug.slice(0, 10).toUpperCase() : row.id.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      key: "name",
      header: "SCHOOL NAME",
      sortable: true,
      render: (row) => (
        <Link
          href={`/admin/schools/${row.id}`}
          className={styles.schoolNameTitle}
          onClick={(e) => e.stopPropagation()}
        >
          {row.name}
        </Link>
      ),
    },
    {
      key: "city",
      header: "LOCATION",
      sortable: true,
      render: (row) => (
        <span className={styles.textMuted}>
          {row.city || "Johannesburg"}, {row.province || "Gauteng"}
        </span>
      ),
    },
    {
      key: "email",
      header: "CONTACT",
      render: (row) => (
        <span className={styles.textMuted}>
          {row.email || row.telephone || "—"}
        </span>
      ),
    },
    {
      key: "published",
      header: "STATUS",
      sortable: true,
      align: "center",
      width: "130px",
      render: (row) => (
        <StatusBadge
          status={row.published ? "Active" : "Hidden"}
          tone={row.published ? "emerald" : "slate"}
          showDot
        />
      ),
    },
    {
      key: "actions",
      header: "ACTIONS",
      align: "right",
      width: "90px",
      render: (row) => (
        <div className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={styles.actionDeleteBtn}
            title={`Delete ${row.name}`}
            aria-label={`Delete ${row.name}`}
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete "${row.name}"?`)) {
                // Trigger deletion
              }
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <AdminPageHeader
        title="Schools Directory"
        count={data.total}
        subtitle="Manage partner schools, locations, contact records, and pack listings."
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

      <DataTableToolbar
        searchPlaceholder="Search schools by name, city, province..."
        filters={
          <div className={styles.filterGroup}>
            <AdminSelect
              value={params.status || "all"}
              onChange={(e) => setParams({ status: e.target.value }, true)}
              className={styles.toolbarSelect}
            >
              <option value="all">Status: All</option>
              <option value="published">Active</option>
              <option value="hidden">Hidden</option>
            </AdminSelect>
          </div>
        }
      />

      <DataTable
        data={data.schools}
        columns={columns}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => router.push(`/admin/schools/${row.id}`)}
        isLoading={isPending}
        emptyTitle="No schools found"
        emptySubtitle="Try adjusting your search filters."
        footer={
          <DataTablePagination
            total={data.total}
            pageSize={data.schools.length || 25}
            currentPage={data.page}
          />
        }
      />
    </div>
  );
}
