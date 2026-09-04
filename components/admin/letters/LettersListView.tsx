"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Eye,
  Download,
  Mail,
  FileText,
  Building2,
  User,
  Trash2,
  Clock,
  CheckCircle2,
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
import { LetterPreviewModal } from "./LetterPreviewModal";
import { EmailDispatchModal } from "./EmailDispatchModal";
import { deleteLetterAction } from "@/app/admin/letters/actions";
import type { AdminLetterRecord, ListLettersResult } from "@/lib/admin/letters";
import type { BadgeTone } from "@/components/admin/ui";
import styles from "../views/CorePagesView.module.css";

const STATUS_CONFIG: Record<string, { label: string; tone: BadgeTone }> = {
  draft: { label: "Draft", tone: "slate" },
  generated: { label: "Generated", tone: "blue" },
  emailed: { label: "Emailed", tone: "emerald" },
  archived: { label: "Archived", tone: "amber" },
};

export function LettersListView({
  initialData,
}: {
  initialData: ListLettersResult;
}) {
  const router = useRouter();
  const { params, setParams, isPending } = useTableParams();
  const [letters, setLetters] = useState<AdminLetterRecord[]>(
    initialData.letters || [],
  );

  // Modals state
  const [previewLetter, setPreviewLetter] = useState<AdminLetterRecord | null>(
    null,
  );
  const [emailLetter, setEmailLetter] = useState<AdminLetterRecord | null>(
    null,
  );

  // Metrics
  const totalLetters = letters.length;
  const draftLetters = letters.filter((l) => l.status === "draft").length;
  const emailedLetters = letters.filter((l) => l.status === "emailed").length;
  const schoolLetters = letters.filter(
    (l) => l.recipient_type === "registered_school",
  ).length;

  const metrics: QuickMetricItem[] = [
    {
      label: "TOTAL LETTERS",
      value: totalLetters,
      subtitle: "All correspondence",
      trendDirection: "up",
      tone: "cyan",
      icon: <FileText size={16} />,
    },
    {
      label: "DRAFTS",
      value: draftLetters,
      subtitle: "Awaiting finalization",
      trendDirection: "neutral",
      tone: draftLetters > 0 ? "amber" : "slate",
      icon: <Clock size={16} />,
    },
    {
      label: "DISPATCHED",
      value: emailedLetters,
      subtitle: "Delivered via Resend",
      trendDirection: "up",
      tone: "emerald",
      icon: <CheckCircle2 size={16} />,
    },
    {
      label: "INSTITUTIONAL",
      value: schoolLetters,
      subtitle: "School database linked",
      trendDirection: "up",
      tone: "purple",
      icon: <Building2 size={16} />,
    },
  ];

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "Are you sure you want to delete this official letter? This action cannot be undone.",
      )
    ) {
      return;
    }

    const res = await deleteLetterAction(id);
    if (res.ok) {
      setLetters((prev) => prev.filter((l) => l.id !== id));
    } else {
      alert(res.error || "Failed to delete letter.");
    }
  };

  const columns: ColumnDef<AdminLetterRecord>[] = [
    {
      key: "reference_number",
      header: "REFERENCE",
      sortable: true,
      width: "170px",
      render: (row) => (
        <span className={styles.skuBadge}>{row.reference_number}</span>
      ),
    },
    {
      key: "recipient_organization",
      header: "RECIPIENT / ORGANIZATION",
      sortable: true,
      render: (row) => (
        <div className={styles.productCell}>
          <div className="flex items-center gap-1.5">
            {row.recipient_type === "registered_school" ? (
              <Building2
                size={13}
                className="text-emerald-400 shrink-0"
                aria-label="Registered School"
              />
            ) : (
              <User
                size={13}
                className="text-sky-400 shrink-0"
                aria-label="Private Client"
              />
            )}
            <Link
              href={`/admin/letters/${row.id}`}
              className={styles.schoolNameTitle}
              onClick={(e) => e.stopPropagation()}
            >
              {row.recipient_organization}
            </Link>
          </div>
          <span className={styles.productBrand}>
            {row.recipient_name}
            {row.recipient_email ? ` • ${row.recipient_email}` : ""}
          </span>
        </div>
      ),
    },
    {
      key: "subject",
      header: "SUBJECT / PROPOSAL",
      sortable: true,
      render: (row) => (
        <div className={styles.productCell}>
          <span className="text-[var(--db-text-primary,#f8fafc)] font-medium text-[13.5px] line-clamp-1">
            {row.subject}
          </span>
          {row.include_quotation && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
              <FileText size={11} />
              Includes Quotation Schedule
            </span>
          )}
        </div>
      ),
    },
    {
      key: "created_at",
      header: "DATE",
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
      key: "status",
      header: "STATUS",
      sortable: true,
      align: "center",
      width: "130px",
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
      width: "150px",
      render: (row) => (
        <div
          className={styles.actionsCell}
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            href={`/admin/letters/${row.id}`}
            className={styles.actionEditBtn}
            data-db-tooltip={`Edit ${row.reference_number}`}
            aria-label={`Edit ${row.reference_number}`}
          >
            <Eye size={14} />
          </Link>
          <button
            type="button"
            className={styles.actionEditBtn}
            data-db-tooltip="Preview / Download PDF"
            aria-label={`Preview ${row.reference_number}`}
            onClick={() => setPreviewLetter(row)}
          >
            <Download size={14} />
          </button>
          <button
            type="button"
            className={styles.actionEditBtn}
            data-db-tooltip="Send via Email"
            aria-label={`Email ${row.reference_number}`}
            onClick={() => setEmailLetter(row)}
          >
            <Mail size={14} />
          </button>
          <button
            type="button"
            className={styles.actionDeleteBtn}
            data-db-tooltip="Delete Letter"
            aria-label={`Delete ${row.reference_number}`}
            onClick={(e) => handleDelete(row.id, e)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  // Filtering and Sorting
  const filteredAndSorted = useMemo(() => {
    let list = [...letters];

    if (params.status && params.status !== "all") {
      list = list.filter((l) => l.status === params.status);
    }

    if (params.category && params.category !== "all") {
      list = list.filter((l) => l.recipient_type === params.category);
    }

    if (params.q?.trim()) {
      const query = params.q.toLowerCase();
      list = list.filter((l) => {
        const refMatch = l.reference_number?.toLowerCase().includes(query);
        const orgMatch = l.recipient_organization
          ?.toLowerCase()
          .includes(query);
        const nameMatch = l.recipient_name?.toLowerCase().includes(query);
        const emailMatch = l.recipient_email?.toLowerCase().includes(query);
        const subjectMatch = l.subject?.toLowerCase().includes(query);
        return Boolean(
          refMatch || orgMatch || nameMatch || emailMatch || subjectMatch,
        );
      });
    }

    if (params.sort) {
      const multiplier = params.order === "desc" ? -1 : 1;
      list.sort((a, b) => {
        if (params.sort === "reference_number") {
          return (
            multiplier *
            (a.reference_number || "").localeCompare(b.reference_number || "")
          );
        }
        if (params.sort === "recipient_organization") {
          return (
            multiplier *
            (a.recipient_organization || "").localeCompare(
              b.recipient_organization || "",
            )
          );
        }
        if (params.sort === "subject") {
          return multiplier * (a.subject || "").localeCompare(b.subject || "");
        }
        if (params.sort === "created_at") {
          return (
            multiplier *
            (new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime())
          );
        }
        if (params.sort === "status") {
          return multiplier * (a.status || "").localeCompare(b.status || "");
        }
        return 0;
      });
    }

    return list;
  }, [
    letters,
    params.status,
    params.category,
    params.q,
    params.sort,
    params.order,
  ]);

  const totalRecords =
    initialData.total || totalLetters || filteredAndSorted.length;

  return (
    <div className={styles.container}>
      {/* 1. Header Toolbar */}
      <AdminPageHeader
        title="Official Letters & Correspondence"
        count={totalLetters}
        subtitle="Draft institutional partnership proposals, formal cover letters, and quotation schedules on official letterhead."
        actions={
          <AdminButton
            variant="primary"
            href="/admin/letters/new"
            icon={<Plus size={14} />}
          >
            Draft Official Letter
          </AdminButton>
        }
      />

      {/* 2. KPI Summary Cards */}
      <QuickMetricsGrid metrics={metrics} />

      {/* 3. DataTable Toolbar with DB Search & Filter Dropdowns */}
      <DataTableToolbar
        searchPlaceholder="Search reference, recipient, school, or subject..."
        filters={
          <div className={styles.filterGroup}>
            <AdminSelect
              value={params.status || "all"}
              onChange={(e) => setParams({ status: e.target.value }, true)}
              className={styles.toolbarSelect}
            >
              <option value="all">Status: All</option>
              <option value="draft">Draft</option>
              <option value="generated">Generated</option>
              <option value="emailed">Emailed</option>
              <option value="archived">Archived</option>
            </AdminSelect>

            <AdminSelect
              value={params.category || "all"}
              onChange={(e) => setParams({ category: e.target.value }, true)}
              className={styles.toolbarSelect}
            >
              <option value="all">Recipient: All Types</option>
              <option value="registered_school">Schools Only</option>
              <option value="private_client">Private Clients</option>
            </AdminSelect>
          </div>
        }
      />

      {/* 4. Unified DB DataTable */}
      <DataTable
        data={filteredAndSorted}
        columns={columns}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => router.push(`/admin/letters/${row.id}`)}
        isLoading={isPending}
        emptyTitle="No official letters found"
        emptySubtitle="Try adjusting your search filters or draft a new official letter."
        footer={
          <DataTablePagination
            total={totalRecords}
            pageSize={params.pageSize}
            currentPage={params.page}
          />
        }
      />

      {/* 5. Modals */}
      {previewLetter && (
        <LetterPreviewModal
          isOpen={Boolean(previewLetter)}
          onClose={() => setPreviewLetter(null)}
          letter={previewLetter}
        />
      )}

      {emailLetter && (
        <EmailDispatchModal
          isOpen={Boolean(emailLetter)}
          onClose={() => setEmailLetter(null)}
          letter={emailLetter}
          onSuccess={() => {
            setLetters((prev) =>
              prev.map((l) =>
                l.id === emailLetter.id
                  ? {
                      ...l,
                      status: "emailed",
                      last_emailed_at: new Date().toISOString(),
                    }
                  : l,
              ),
            );
          }}
        />
      )}
    </div>
  );
}
