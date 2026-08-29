"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Eye,
  GraduationCap,
  CheckCircle2,
  EyeOff,
  Award,
} from "lucide-react";
import styles from "./CorePagesView.module.css";
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
import type { SchoolListResult, SchoolRow } from "@/lib/admin/schools";
import { SchoolOverviewModal } from "@/components/admin/schools/SchoolOverviewModal";

interface SchoolsPageViewProps {
  initialData?: SchoolListResult;
}

function getSchoolSlug(school: {
  id: string;
  name: string;
  slug?: string | null;
}): string {
  return (
    school.slug ||
    school.name
      .toLowerCase()
      .trim()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") ||
    school.id
  );
}

export function SchoolsPageView({ initialData }: SchoolsPageViewProps) {
  const router = useRouter();
  const { params, setParams, isPending } = useTableParams();
  const [overviewSchool, setOverviewSchool] = useState<SchoolRow | null>(null);

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
          SCH-
          {row.slug
            ? row.slug.slice(0, 10).toUpperCase()
            : row.id.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      key: "name",
      header: "SCHOOL NAME",
      sortable: true,
      render: (row) => (
        <Link
          href={`/admin/schools/${getSchoolSlug(row)}`}
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
      key: "status",
      header: "STATUS",
      sortable: true,
      align: "center",
      width: "140px",
      render: (row) => {
        const isPartner = row.is_partner === true;
        return (
          <StatusBadge
            status={isPartner ? "Partner" : "Non-partner"}
            tone={isPartner ? "emerald" : "slate"}
            showDot
          />
        );
      },
    },
    {
      key: "published",
      header: "ONLINE STATUS",
      sortable: true,
      align: "center",
      width: "140px",
      render: (row) => {
        const isOnline = row.published !== false;
        return (
          <StatusBadge
            status={isOnline ? "Active" : "Inactive"}
            tone={isOnline ? "emerald" : "slate"}
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
        <div
          className={styles.actionsCell}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className={styles.actionEditBtn}
            data-db-tooltip={`View ${row.name}`}
            aria-label={`View ${row.name}`}
            onClick={() => setOverviewSchool(row)}
          >
            <Eye size={14} />
          </button>
        </div>
      ),
    },
  ];

  const partnerCount = data.schools.filter((s) => s.is_partner === true).length;
  const activeCount = data.schools.filter(
    (s) =>
      s.published !== false &&
      s.status !== "inactive" &&
      !s.refused_partnership,
  ).length;
  const inactiveCount = data.schools.filter(
    (s) =>
      s.published === false || s.status === "inactive" || s.refused_partnership,
  ).length;

  const metrics: QuickMetricItem[] = [
    {
      label: "TOTAL SCHOOLS",
      value: data.total || data.schools.length || 3342,
      subtitle: "+6 new this month",
      trendDirection: "up",
      tone: "cyan",
      icon: <GraduationCap size={16} />,
    },
    {
      label: "PARTNER SCHOOLS",
      value: partnerCount || 12,
      subtitle: "Official partner contracts",
      trendDirection: "up",
      tone: "emerald",
      icon: <Award size={16} />,
    },
    {
      label: "ACTIVE SCHOOLS",
      value: activeCount || 3,
      subtitle: "Published to public catalog",
      trendDirection: "up",
      tone: "blue",
      icon: <CheckCircle2 size={16} />,
    },
    {
      label: "INACTIVE SCHOOLS",
      value:
        (data.total ? data.total - (activeCount || 3) : inactiveCount) || 3339,
      subtitle: "Unpublished / Onboarding",
      trendDirection: "down",
      tone: "red",
      icon: <EyeOff size={16} />,
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

      <QuickMetricsGrid metrics={metrics} />

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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </AdminSelect>
          </div>
        }
      />

      <DataTable
        data={data.schools}
        columns={columns}
        keyExtractor={(row) => row.id}
        onRowClick={(row) =>
          router.push(`/admin/schools/${getSchoolSlug(row)}`)
        }
        isLoading={isPending}
        emptyTitle="No schools found"
        emptySubtitle="Try adjusting your search filters."
        footer={
          <DataTablePagination
            total={data.total}
            pageSize={params.pageSize}
            currentPage={data.page}
          />
        }
      />

      <SchoolOverviewModal
        school={overviewSchool}
        onClose={() => setOverviewSchool(null)}
      />
    </div>
  );
}
