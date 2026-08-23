"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit2, Eye, EyeOff, Plus } from "lucide-react";
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
import { toggleSchoolVisibilityAction } from "@/app/admin/schools/actions";
import type { SchoolListResult, SchoolRow } from "@/lib/admin/schools";

interface SchoolsPageViewProps {
  initialData?: SchoolListResult;
}

export function SchoolsPageView({ initialData }: SchoolsPageViewProps) {
  const router = useRouter();
  const { params, setParams, isPending } = useTableParams();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const data = initialData || {
    schools: [],
    total: 0,
    page: 1,
    pageCount: 1,
    cities: [],
    provinces: [],
  };

  const handleToggleVisibility = async (id: string, currentVal: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    setTogglingId(id);
    await toggleSchoolVisibilityAction(id);
    setTogglingId(null);
    router.refresh();
  };

  const columns: ColumnDef<SchoolRow>[] = [
    {
      key: "name",
      header: "School Name",
      sortable: true,
      render: (row) => (
        <div className={styles.productCell}>
          <Link
            href={`/admin/schools/${row.id}`}
            className={styles.productNameLink}
            onClick={(e) => e.stopPropagation()}
          >
            {row.name}
          </Link>
          <span className={styles.productBrand}>
            {row.city || "Johannesburg"}, {row.province || "Gauteng"}
          </span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Contact Email & Phone",
      render: (row) => (
        <div className={styles.productCell}>
          <span>{row.email || "—"}</span>
          <span className={styles.productBrand}>{row.telephone || "—"}</span>
        </div>
      ),
    },
    {
      key: "city",
      header: "Location",
      sortable: true,
      width: "140px",
      render: (row) => <span>{row.city || "—"}</span>,
    },
    {
      key: "published",
      header: "Status",
      sortable: true,
      align: "center",
      width: "120px",
      render: (row) => (
        <StatusBadge
          status={row.published ? "Published" : "Hidden"}
          tone={row.published ? "emerald" : "slate"}
          showDot
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      width: "100px",
      render: (row) => (
        <div className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
          <AdminButton
            type="button"
            variant="icon"
            size="sm"
            aria-label={row.published ? "Hide school" : "Publish school"}
            loading={togglingId === row.id}
            onClick={(e) => handleToggleVisibility(row.id, Boolean(row.published), e)}
            icon={row.published ? <EyeOff size={13} /> : <Eye size={13} />}
          />
          <AdminButton
            href={`/admin/schools/${row.id}/edit`}
            variant="iconTeal"
            size="sm"
            aria-label={`Edit ${row.name}`}
            icon={<Edit2 size={13} />}
          />
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
              <option value="published">Published</option>
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
