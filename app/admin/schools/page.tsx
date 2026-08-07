import Link from "next/link";
import { requireAdmin } from "@/lib/admin/rbac";
import { listSchools, type SchoolListFilters } from "@/lib/admin/schools";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { SchoolLogoPlaceholder } from "@/components/schools/SchoolLogoPlaceholder";
import {
  archiveSchoolAction,
  restoreSchoolAction,
  deleteSchoolAction,
} from "./actions";
import adminStyles from "../admin.module.css";
import styles from "./schools.module.css";

interface SchoolsPageProps {
  searchParams: Promise<{
    q?: string;
    city?: string;
    province?: string;
    status?: string;
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
  return s ? `/admin/schools?${s}` : "/admin/schools";
}

export default async function SchoolsPage({ searchParams }: SchoolsPageProps) {
  await requireAdmin({ permission: "schools.view" });
  const params = await searchParams;

  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const filters: SchoolListFilters = {
    q: params.q?.trim() || undefined,
    city: params.city || undefined,
    province: params.province || undefined,
    status: params.status || undefined,
    page,
    pageSize: PAGE_SIZE,
  };

  const { schools, total, pageCount, cities, provinces } = await listSchools(filters);
  const baseParams = {
    q: filters.q,
    city: filters.city,
    province: filters.province,
    status: filters.status,
  };

  const hasFilters = Boolean(filters.q || filters.city || filters.province || filters.status);

  return (
    <div className={adminStyles.adminContainer}>
      <div className={styles.toolbar}>
        <div className={styles.headerRow}>
          <h1 className={styles.pageTitle}>
            Schools
            <span className={styles.count}>
              {total} {total === 1 ? "school" : "schools"}
            </span>
          </h1>
          <Link href="/admin/schools/new" className={styles.addButton}>
            + Add school
          </Link>
        </div>

        <form method="get" action="/admin/schools" className={styles.filterForm}>
          <input
            type="search"
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder="Search name, city or province…"
            className={`${styles.filterInput} ${styles.searchInput}`}
            aria-label="Search schools"
          />
          <select name="city" defaultValue={filters.city ?? ""} className={styles.filterInput}>
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select name="province" defaultValue={filters.province ?? ""} className={styles.filterInput}>
            <option value="">All provinces</option>
            {provinces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select name="status" defaultValue={filters.status ?? ""} className={styles.filterInput}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
          <button type="submit" className={styles.applyButton}>
            Apply
          </button>
          {hasFilters ? (
            <Link href="/admin/schools" className={styles.resetLink}>
              Reset
            </Link>
          ) : null}
        </form>
      </div>

      {schools.length === 0 ? (
        <div className={adminStyles.tableCard}>
          <div className={adminStyles.emptyStateContainer}>
            <div className={adminStyles.emptyStateInner}>
              <div className={adminStyles.emptyIconWrapper}>
                <svg viewBox="0 0 24 24">
                  <path d="M3 9l9-6 9 6-9 6-9-6z" />
                  <path d="M9 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />
                </svg>
              </div>
              <h2 className={adminStyles.emptyStateTitle}>
                {hasFilters ? "No schools match your filters" : "No schools yet"}
              </h2>
              <p className={adminStyles.emptyStateText}>
                {hasFilters
                  ? "Try clearing your filters, or add a new school."
                  : "Add your first school to start building the catalogue."}
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
                  <th>School</th>
                  <th>City</th>
                  <th>Province</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((school) => {
                  const statusClass =
                    school.status === "active"
                      ? styles.badgeActive
                      : school.status === "pending"
                        ? styles.badgePending
                        : school.status === "inactive"
                          ? styles.badgeInactive
                          : styles.badgeArchived;
                  return (
                    <tr key={school.id}>
                      <td>
                        <div className={styles.schoolCell}>
                          {school.logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={school.logo}
                              alt=""
                              className={styles.logoThumb}
                            />
                          ) : (
                            <SchoolLogoPlaceholder
                              className={styles.logoThumb}
                              width={40}
                              height={40}
                            />
                          )}
                          <div>
                            <div className={styles.schoolName}>{school.name}</div>
                          </div>
                        </div>
                      </td>
                      <td>{school.city ?? "—"}</td>
                      <td>{school.province ?? "—"}</td>
                      <td>
                        <span className={`${adminStyles.badge} ${statusClass}`}>
                          {school.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <Link
                            href={`/admin/schools/${school.id}`}
                            className={styles.actionLink}
                          >
                            Edit
                          </Link>
                          {school.status === "archived" ? (
                            <form action={restoreSchoolAction.bind(null, school.id)}>
                              <ConfirmButton
                                label="Restore"
                                confirmText={`Restore ${school.name}?`}
                                busyLabel="Restoring…"
                                className={`${styles.rowButton} ${styles.rowButtonRestore}`}
                              />
                            </form>
                          ) : (
                            <form action={archiveSchoolAction.bind(null, school.id)}>
                              <ConfirmButton
                                label="Archive"
                                confirmText={`Archive ${school.name}?`}
                                busyLabel="Archiving…"
                                className={`${styles.rowButton} ${styles.rowButtonArchive}`}
                              />
                            </form>
                          )}
                          <form action={deleteSchoolAction.bind(null, school.id)}>
                            <ConfirmButton
                              label="Delete"
                              confirmText={`Permanently delete ${school.name}? This cannot be undone.`}
                              busyLabel="Deleting…"
                              className={`${styles.rowButton} ${styles.rowButtonDelete}`}
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
      )}

      {pageCount > 1 ? (
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            Page {page} of {pageCount} · {total} schools
          </span>
          <div className={styles.pageNav}>
            <Link
              href={buildHref(baseParams, { page: String(page - 1) })}
              className={styles.pageButton}
              aria-disabled={page <= 1}
              aria-label="Previous page"
            >
              ← Prev
            </Link>
            <Link
              href={buildHref(baseParams, { page: String(page + 1) })}
              className={styles.pageButton}
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
