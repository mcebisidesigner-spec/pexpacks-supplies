import Link from "next/link";
import { requireAdmin } from "@/lib/admin/rbac";
import { listSchools, type SchoolListFilters } from "@/lib/admin/schools";
import { buildHref, PAGE_SIZE } from "@/lib/admin/ui-utils";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { SchoolLogoPlaceholder } from "@/components/schools/SchoolLogoPlaceholder";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Pagination } from "@/components/admin/Pagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  hideSchoolAction,
  showSchoolAction,
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
      <AdminPageHeader
        title="Schools"
        count={total}
        actions={
          <Link href="/admin/schools/new" className={adminStyles.addButton}>
            + Add school
          </Link>
        }
      />

      <form method="get" action="/admin/schools" className={adminStyles.filterForm}>
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
            <option value="archived">Hidden</option>
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

      {schools.length === 0 ? (
        <div className={adminStyles.tableCard}>
          <EmptyState
            icon={
              <svg viewBox="0 0 24 24">
                <path d="M3 9l9-6 9 6-9 6-9-6z" />
                <path d="M9 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />
              </svg>
            }
            title={hasFilters ? "No schools match your filters" : "No schools yet"}
            text={
              hasFilters
                ? "Try clearing your filters, or add a new school."
                : "Add your first school to start building the catalogue."
            }
          />
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
                {schools.map((school) => (
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
                          <div className={styles.schoolIdentity}>
                            <Link
                              href={`/admin/schools/${school.slug || school.id}/profile`}
                              className={styles.schoolName}
                            >
                              {school.name}
                            </Link>
                            <span
                              className={`${styles.partnershipStatus} ${
                                school.is_partner
                                  ? styles.partnershipOfficial
                                  : school.has_orderable_grade_packs
                                    ? styles.partnershipParticipating
                                    : styles.partnershipDeclined
                              }`}
                            >
                              {school.is_partner ? "Official Partner" : "Non-partner"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>{school.city ?? "—"}</td>
                      <td>{school.province ?? "—"}</td>
                      <td>
                        <StatusBadge status={school.status === "archived" ? "hidden" : school.status} />
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <Link
                            href={`/admin/schools/${school.slug || school.id}`}
                            className={styles.actionLink}
                          >
                            Edit
                          </Link>
                          {school.status === "archived" ? (
                            <form action={showSchoolAction.bind(null, school.id)}>
                              <ConfirmButton
                                label="Show"
                                confirmText={`Show ${school.name} and its visible grade packs on the public website?`}
                                busyLabel="Showing…"
                                className={`${styles.rowButton} ${styles.rowButtonShow}`}
                              />
                            </form>
                          ) : (
                            <form action={hideSchoolAction.bind(null, school.id)}>
                              <ConfirmButton
                                label="Hide"
                                confirmText={`Hide ${school.name} and all its grade packs from the public website?`}
                                busyLabel="Hiding…"
                                className={`${styles.rowButton} ${styles.rowButtonHide}`}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination
        basePath="/admin/schools"
        params={baseParams}
        currentPage={page}
        totalPages={pageCount}
      />
    </div>
  );
}
