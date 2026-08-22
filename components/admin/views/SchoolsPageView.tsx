"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  GraduationCap,
  Plus,
  Search,
} from "lucide-react";
import styles from "./CorePagesView.module.css";
import adminStyles from "@/app/admin/admin.module.css";
import {
  listSchoolsAction,
  toggleSchoolVisibilityAction,
} from "@/app/admin/schools/actions";
import type { SchoolListResult } from "@/lib/admin/schools";

interface SchoolsPageViewProps {
  initialData?: SchoolListResult;
}

function formatCount(value: number): string {
  return Math.trunc(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function SchoolsPageView({ initialData }: SchoolsPageViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [schoolsResult, setSchoolsResult] = useState<SchoolListResult>(
    initialData ?? {
      schools: [],
      total: 0,
      page: 1,
      pageCount: 1,
      cities: [],
      provinces: [],
    }
  );

  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch updated data from Supabase when page, pageSize, or filters change
  const loadSchools = (
    page: number,
    size: number,
    qStr: string,
    city: string,
    province: string,
    status: string
  ) => {
    startTransition(async () => {
      const res = await listSchoolsAction({
        page,
        pageSize: size,
        q: qStr || undefined,
        city: city === "all" ? undefined : city,
        province: province === "all" ? undefined : province,
        status: status === "all" ? undefined : status,
      });
      setSchoolsResult(res);
    });
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
    loadSchools(1, pageSize, val, cityFilter, provinceFilter, statusFilter);
  };

  const handleCityChange = (val: string) => {
    setCityFilter(val);
    setCurrentPage(1);
    loadSchools(1, pageSize, search, val, provinceFilter, statusFilter);
  };

  const handleProvinceChange = (val: string) => {
    setProvinceFilter(val);
    setCurrentPage(1);
    loadSchools(1, pageSize, search, cityFilter, val, statusFilter);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
    loadSchools(1, pageSize, search, cityFilter, provinceFilter, val);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    loadSchools(1, size, search, cityFilter, provinceFilter, statusFilter);
  };

  const handlePageChange = (p: number) => {
    const targetPage = Math.max(1, Math.min(p, schoolsResult.pageCount || 1));
    setCurrentPage(targetPage);
    loadSchools(targetPage, pageSize, search, cityFilter, provinceFilter, statusFilter);
  };

  const handleApplyClick = () => {
    setCurrentPage(1);
    loadSchools(1, pageSize, search, cityFilter, provinceFilter, statusFilter);
  };

  const handleToggleHide = async (id: string, currentStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await toggleSchoolVisibilityAction(id);
      if (res.ok) {
        setSchoolsResult((prev) => ({
          ...prev,
          schools: prev.schools.map((s) =>
            s.id === id
              ? { ...s, status: s.status === "active" ? "inactive" : "active" }
              : s
          ),
        }));
      }
    } catch (err) {
      console.error("Toggle school status failed:", err);
    }
  };

  const { schools, total, pageCount } = schoolsResult;
  const fromRecord = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const toRecord = Math.min(total, currentPage * pageSize);

  // Pagination number buttons logic
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    const end = Math.min(pageCount, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, pageCount]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={adminStyles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>
            Schools{" "}
            <span className={styles.headerCount}>
              ({formatCount(total)})
            </span>
          </h1>
          <p className={styles.headerSubtitle}>
            Central directory of all registered partner and non-partner schools in South Africa.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/admin/schools/new" className={styles.primaryBtn}>
            <Plus size={14} /> Add School
          </Link>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className={adminStyles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchBox}>
            <Search />
            <input
              className={adminStyles.searchInput}
              placeholder="Search by school name, city or province..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          {/* Cities Dropdown (Populated from DB) */}
          <select
            className={styles.selectInput}
            value={cityFilter}
            onChange={(e) => handleCityChange(e.target.value)}
          >
            <option value="all">All cities ({schoolsResult.cities?.length ?? 0})</option>
            {(schoolsResult.cities ?? []).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Provinces Dropdown (Populated from DB) */}
          <select
            className={styles.selectInput}
            value={provinceFilter}
            onChange={(e) => handleProvinceChange(e.target.value)}
          >
            <option value="all">All provinces ({schoolsResult.provinces?.length ?? 0})</option>
            {(schoolsResult.provinces ?? []).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            className={styles.selectInput}
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Hidden</option>
          </select>

          <button
            className={styles.primaryBtn}
            type="button"
            onClick={handleApplyClick}
          >
            Apply
          </button>
        </div>
      </div>

      {/* Data Table Card */}
      <div className={adminStyles.tableCard} style={{ opacity: isPending ? 0.7 : 1 }}>
        <div className={adminStyles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th className={adminStyles.textCenter} style={{ width: 36 }}></th>
                <th>School Name</th>
                <th>City</th>
                <th>Province</th>
                <th>Partner Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schools.length === 0 ? (
                <tr>
                  <td colSpan={6} className={`${adminStyles.textCenter} ${adminStyles.cMuted}`} style={{ padding: "32px" }}>
                    No matching schools found in the database.
                  </td>
                </tr>
              ) : (
                schools.map((school) => {
                  const isPartner = school.is_partner;
                  const isActive = school.status === "active";
                  const targetSlugOrId = school.slug || school.id;
                  return (
                    <tr
                      key={school.id}
                      className={styles.dataRow}
                      onClick={() => router.push(`/admin/schools/${targetSlugOrId}/info`)}
                    >
                      <td>
                        <div
                          className={`${adminStyles.avatarBadge} ${adminStyles.iconBlue}`}
                        >
                          <GraduationCap size={14} />
                        </div>
                      </td>
                      <td>
                        <Link
                          href={`/admin/schools/${targetSlugOrId}/info`}
                          className={`${adminStyles.cWhite} ${adminStyles.fw700}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {school.name}
                        </Link>
                      </td>
                      <td>{school.city || "—"}</td>
                      <td>{school.province || "—"}</td>
                      <td>
                        <span className={isPartner ? adminStyles.badgeGreen : adminStyles.badgeDark}>
                          ● {isPartner ? "Partner" : "Non-partner"}
                        </span>
                      </td>
                      <td>
                        <div
                          className={`${adminStyles.flex} ${adminStyles.itemsCenter} ${styles["gap-8"]}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className={isActive ? adminStyles.badgeTeal : adminStyles.badgeDark}>
                            {isActive ? "Active" : "Inactive"}
                          </span>
                          <button
                            className={`${adminStyles.actionBtnDots} ${styles["text-11"]} ${styles["px-8"]}`}
                            type="button"
                            onClick={(e) => handleToggleHide(school.id, school.status, e)}
                          >
                            {isActive ? <EyeOff size={12} /> : <Eye size={12} />}
                            {isActive ? "Hide" : "Show"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination & Working "Show Per Page" Selector */}
        <div className={styles.paginationFooter}>
          <span>
            Showing {formatCount(fromRecord)} to {formatCount(toRecord)} of{" "}
            {formatCount(total)} schools
          </span>

          {/* Page Controls */}
          <div className={adminStyles.paginationControls}>
            <button
              className={styles.pageBtn}
              disabled={currentPage <= 1 || isPending}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              &lt;
            </button>

            {pageNumbers.map((p) => (
              <button
                key={p}
                className={`${styles.pageBtn} ${
                  p === currentPage ? styles.pageBtnActive : ""
                }`}
                disabled={isPending}
                onClick={() => handlePageChange(p)}
              >
                {p}
              </button>
            ))}

            <button
              className={styles.pageBtn}
              disabled={currentPage >= pageCount || isPending}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              &gt;
            </button>
          </div>

          {/* Working Show per page selector */}
          <div className={`${adminStyles.flex} ${adminStyles.itemsCenter} ${styles["gap-6"]}`}>
            <span>Show</span>
            <select
              className={`${styles.selectInput} ${styles["h-28"]} ${styles["text-11"]} ${styles["bg-surface-strong"]}`}
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
            </select>
            <span>per page</span>
          </div>
        </div>
      </div>
    </div>
  );
}
