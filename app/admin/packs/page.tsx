import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import {
  listPacks,
  listSchoolGroupedSummary,
  type PackListFilters,
} from "@/lib/admin/packs";
import {
  deletePackAction,
  deleteSchoolPacksAction,
} from "./actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { DuplicateButton } from "@/components/admin/packs/DuplicateButton";
import { VisibleToggle } from "@/components/admin/packs/VisibleToggle";
import { SchoolVisibleToggle } from "@/components/admin/packs/SchoolVisibleToggle";
import shared from "../schools/schools.module.css";
import adminStyles from "../admin.module.css";
import styles from "./packs.module.css";

interface PacksPageProps {
  searchParams: Promise<{
    q?: string;
    school_id?: string;
    delivery_type?: string;
    featured?: string;
    visible?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 20;

function buildHref(
  params: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>
): string {
  const merged = { ...params, ...overrides };
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value) qs.set(key, value);
  }
  const s = qs.toString();
  return s ? `/admin/packs?${s}` : "/admin/packs";
}

function money(v: number): string {
  return `R ${v.toFixed(2)}`;
}

function formatShortDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  } catch {
    return "—";
  }
}

function extractGradePackSublabel(title: string, slug?: string | null): string {
  const text = `${title} ${slug ?? ""}`;
  const match = text.match(/grade\s*([r\d]+)/i);
  if (match) {
    const val = match[1].toUpperCase();
    return val === "R" ? "Grade R – Stationery Pack" : `Grade ${val} – Stationery Pack`;
  }
  return title;
}

export default async function PacksPage({ searchParams }: PacksPageProps) {
  await requireAdmin({ permission: "packs.view" });
  const params = await searchParams;

  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const filters: PackListFilters = {
    q: params.q?.trim() || undefined,
    school_id: params.school_id || undefined,
    delivery_type: params.delivery_type || undefined,
    featured: params.featured || undefined,
    visible: params.visible || undefined,
    page,
    pageSize: PAGE_SIZE,
  };

  const isSchoolFiltered = Boolean(filters.school_id);
  const baseParams = {
    q: filters.q,
    school_id: filters.school_id,
    delivery_type: filters.delivery_type,
    featured: filters.featured,
    visible: filters.visible,
  };

  const hasFilters = Boolean(
    filters.q || filters.school_id || filters.delivery_type || filters.featured || filters.visible
  );

  // Fetch summary vs individual packs
  const groupedResult = !isSchoolFiltered ? await listSchoolGroupedSummary(filters) : null;
  const packResult = isSchoolFiltered ? await listPacks(filters) : null;

  const schools = groupedResult?.schools ?? packResult?.schools ?? [];
  const deliveryTypes = groupedResult?.deliveryTypes ?? packResult?.deliveryTypes ?? [];
  const displayTotal = groupedResult?.totalGradePacks ?? packResult?.total ?? 0;
  const pageCount = groupedResult?.pageCount ?? packResult?.pageCount ?? 1;

  return (
    <div className={adminStyles.adminContainer}>
      {isSchoolFiltered ? (
        <p style={{ marginBottom: 12 }}>
          <Link href="/admin/packs" className={shared.resetLink}>
            <ArrowLeft aria-hidden="true" /> Back to grade packs
          </Link>
        </p>
      ) : null}
      <div className={shared.toolbar}>
        <div className={shared.headerRow}>
          <h1 className={shared.pageTitle}>
            School Grade Packs
            <span className={shared.count}>
              {displayTotal} {displayTotal === 1 ? "Grade pack" : "Grade packs"}
            </span>
          </h1>
          {isSchoolFiltered ? (
            <Link
              href={`/admin/packs/${
                schools.find((s) => s.id === filters.school_id || s.slug === filters.school_id)?.slug ||
                filters.school_id
              }/add-pack`}
              className={shared.addButton}
            >
              + Add pack
            </Link>
          ) : null}
        </div>

        <form method="get" action="/admin/packs" className={shared.filterForm}>
          <input
            type="search"
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder="Search by School name…"
            className={`${shared.filterInput} ${shared.searchInput}`}
            aria-label="Search packs"
          />
          <button type="submit" className={shared.applyButton}>
            Apply
          </button>
          {hasFilters ? (
            <Link href="/admin/packs" className={shared.resetLink}>
              Reset
            </Link>
          ) : null}
        </form>
      </div>

      {!isSchoolFiltered && groupedResult ? (
        // ═══════════════════════════════════════════════
        // VIEW 1: MAIN LANDING VIEW (GROUPS BY SCHOOL - SCREENSHOT 1 PATTERN)
        // ═══════════════════════════════════════════════
        groupedResult.schoolsSummary.length === 0 ? (
          <div className={adminStyles.tableCard}>
            <div className={adminStyles.emptyStateContainer}>
              <div className={adminStyles.emptyStateInner}>
                <div className={adminStyles.emptyIconWrapper}>
                  <svg viewBox="0 0 24 24">
                    <path d="M4 7h16v13H4z" />
                    <path d="M8 3h8l2 4H6l2-4z" />
                  </svg>
                </div>
                <h2 className={adminStyles.emptyStateTitle}>
                  {hasFilters ? "No packs match your filters" : "No packs yet"}
                </h2>
                <p className={adminStyles.emptyStateText}>
                  {hasFilters
                    ? "Try clearing your filters, or add a new pack."
                    : "Add your first school pack to start building the catalogue."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className={adminStyles.tableCard}>
            <div className={adminStyles.tableWrapper}>
              <table className={adminStyles.table}>
                <thead>
                  <tr>
                    <th>SCHOOL NAME</th>
                    <th>GRADE PACKS</th>
                    <th>LAST EDITED</th>
                    <th>VISIBILITY</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedResult.schoolsSummary.map((item) => (
                    <tr key={item.school_id}>
                      <td>
                        <div className={`${styles.packCell} ${styles.packName}`}>
                          <Link
                            href={`/admin/packs/${item.school_slug || item.school_id}`}
                            className={styles.schoolNameLink}
                          >
                            {item.school_name}
                          </Link>
                        </div>
                      </td>
                      <td className={styles.sortCell}>{item.grade_packs_count}</td>
                      <td>{formatShortDate(item.last_edited)}</td>
                      <td>
                        <span
                          className={`${shared.flag} ${
                            item.visible ? styles.badgeVisible : styles.badgeHidden
                          }`}
                        >
                          {item.visible ? "Visible" : "Hidden"}
                        </span>
                      </td>
                      <td>
                        <div className={shared.actions}>
                          <SchoolVisibleToggle
                            schoolId={item.school_id}
                            schoolName={item.school_name}
                            visible={item.visible}
                          />
                          <form action={deleteSchoolPacksAction.bind(null, item.school_id)}>
                            <ConfirmButton
                              label="Delete"
                              title="Delete School Packs Permanently"
                              confirmLabel="Delete School Packs"
                              confirmText={`Permanently delete all grade packs for "${item.school_name}"? This cannot be undone.`}
                              busyLabel="Deleting…"
                              className={`${shared.rowButton} ${shared.rowButtonDelete}`}
                            />
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : packResult ? (
        // ═══════════════════════════════════════════════
        // VIEW 2: FILTERED SCHOOL VIEW (SHOWS INDIVIDUAL GRADE PACKS - SCREENSHOT 2 PATTERN)
        // ═══════════════════════════════════════════════
        packResult.packs.length === 0 ? (
          <div className={adminStyles.tableCard}>
            <div className={adminStyles.emptyStateContainer}>
              <div className={adminStyles.emptyStateInner}>
                <div className={adminStyles.emptyIconWrapper}>
                  <svg viewBox="0 0 24 24">
                    <path d="M4 7h16v13H4z" />
                    <path d="M8 3h8l2 4H6l2-4z" />
                  </svg>
                </div>
                <h2 className={adminStyles.emptyStateTitle}>
                  {hasFilters ? "No packs match your filters" : "No packs yet"}
                </h2>
                <p className={adminStyles.emptyStateText}>
                  {hasFilters
                    ? "Try clearing your filters, or add a new pack."
                    : "Add your first school pack to start building the catalogue."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className={adminStyles.tableCard}>
            <div className={adminStyles.tableWrapper}>
              <table className={adminStyles.table}>
                <thead>
                  <tr>
                    <th>SCHOOL NAME</th>
                    <th>PRICE</th>
                    <th>ITEMS</th>
                    <th>FLAGS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {packResult.packs.map((pack) => {
                    const rawSchoolName = pack.school_name || pack.title;
                    const schoolName = rawSchoolName
                      .replace(/\s*grade\s*[r\d]+\s*pack/i, "")
                      .trim();
                    const gradeSublabel = extractGradePackSublabel(pack.title, pack.slug);

                    return (
                      <tr key={pack.id}>
                        <td>
                          <div>
                            <div>
                              <Link
                                href={`/admin/packs/${pack.id}`}
                                className={styles.schoolNameLink}
                              >
                                {schoolName}
                              </Link>
                            </div>
                            <div className={styles.gradeSublabel}>
                              {gradeSublabel}
                            </div>
                          </div>
                        </td>
                        <td className={styles.priceCell}>{money(pack.price)}</td>
                        <td className={styles.itemCount}>{pack.item_count}</td>
                        <td>
                          <div className={shared.flags}>
                            <span
                              className={`${shared.flag} ${
                                pack.visible ? styles.badgeVisible : styles.badgeHidden
                              }`}
                            >
                              {pack.visible ? "Visible" : "Hidden"}
                            </span>
                            {pack.featured ? (
                              <span className={`${shared.flag} ${styles.badgeFeatured}`}>
                                Featured
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td>
                          <div className={shared.actions}>
                            <Link
                              href={`/admin/packs/${pack.id}`}
                              className={shared.actionLink}
                            >
                              Edit
                            </Link>
                            <VisibleToggle id={pack.id} visible={pack.visible} />
                            <DuplicateButton id={pack.id} title={pack.title} />
                            <form action={deletePackAction.bind(null, pack.id)}>
                              <ConfirmButton
                                label="Delete"
                                title="Delete Pack Permanently"
                                confirmLabel="Delete Pack"
                                confirmText={`Permanently delete "${pack.title}"`}
                                busyLabel="Deleting…"
                                className={`${shared.rowButton} ${shared.rowButtonDelete}`}
                              />
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : null}

      {pageCount > 1 ? (
        <div className={shared.pagination}>
          <span className={shared.paginationInfo}>
            Page {page} of {pageCount} · {displayTotal} Grade packs
          </span>
          <div className={shared.pageNav}>
            <Link
              href={buildHref(baseParams, { page: String(page - 1) })}
              className={shared.pageButton}
              aria-disabled={page <= 1}
              aria-label="Previous page"
            >
              ← Prev
            </Link>
            <Link
              href={buildHref(baseParams, { page: String(page + 1) })}
              className={shared.pageButton}
              aria-disabled={page >= pageCount}
              aria-label="Next page"
            >
              Next →
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
