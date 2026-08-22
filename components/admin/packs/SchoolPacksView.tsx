"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  EyeOff,
  FileText,
  Filter,
  GraduationCap,
  Grid,
  Info,
  LayoutGrid,
  List,
  MoreHorizontal,
  Package,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import styles from "./SchoolPacksView.module.css";
import viewStyles from "@/components/admin/views/CorePagesView.module.css";
import adminStyles from "@/app/admin/admin.module.css";

export interface SchoolPackRowData {
  id: string;
  code: string;
  name: string;
  gradePacksCount: number;
  season: string;
  lastEdited: string;
  lastEditedBy: string;
  visibility: "visible" | "hidden";
  status: "published" | "draft" | "review";
  health: "good" | "needs_work";
  owner: "MC" | "KG" | "LM" | "SB";
  ownerName: string;
  avatarColor: string;
}

const SEED_SCHOOL_ROWS: SchoolPackRowData[] = [
  {
    id: "sch-1",
    code: "SCH-1001",
    name: "3d Christian Academy",
    gradePacksCount: 2,
    season: "2024",
    lastEdited: "17/08/26",
    lastEditedBy: "Mcebisi M.",
    visibility: "visible",
    status: "published",
    health: "good",
    owner: "MC",
    ownerName: "Mcebisi M.",
    avatarColor: "rgba(45, 212, 191, 0.18)",
  },
  {
    id: "sch-2",
    code: "SCH-1002",
    name: "A Re Tlabeng Primary School",
    gradePacksCount: 2,
    season: "2024",
    lastEdited: "17/08/26",
    lastEditedBy: "Mcebisi M.",
    visibility: "visible",
    status: "published",
    health: "good",
    owner: "MC",
    ownerName: "Mcebisi M.",
    avatarColor: "rgba(168, 85, 247, 0.18)",
  },
  {
    id: "sch-3",
    code: "SCH-1003",
    name: "Aa Academy",
    gradePacksCount: 7,
    season: "2024",
    lastEdited: "15/08/26",
    lastEditedBy: "Kwanele G.",
    visibility: "visible",
    status: "published",
    health: "good",
    owner: "KG",
    ownerName: "Kwanele G.",
    avatarColor: "rgba(249, 115, 22, 0.18)",
  },
  {
    id: "sch-4",
    code: "SCH-1004",
    name: "Ab Phokompe Secondary School",
    gradePacksCount: 5,
    season: "2024",
    lastEdited: "15/08/26",
    lastEditedBy: "Mcebisi M.",
    visibility: "visible",
    status: "published",
    health: "good",
    owner: "MC",
    ownerName: "Mcebisi M.",
    avatarColor: "rgba(59, 130, 246, 0.18)",
  },
  {
    id: "sch-5",
    code: "SCH-1005",
    name: "Buhle High School",
    gradePacksCount: 6,
    season: "2024",
    lastEdited: "14/08/26",
    lastEditedBy: "Kwanele G.",
    visibility: "hidden",
    status: "draft",
    health: "needs_work",
    owner: "KG",
    ownerName: "Kwanele G.",
    avatarColor: "rgba(16, 185, 129, 0.18)",
  },
  {
    id: "sch-6",
    code: "SCH-1006",
    name: "Crescent Primary School",
    gradePacksCount: 3,
    season: "2024",
    lastEdited: "12/08/26",
    lastEditedBy: "Mcebisi M.",
    visibility: "visible",
    status: "review",
    health: "needs_work",
    owner: "MC",
    ownerName: "Mcebisi M.",
    avatarColor: "rgba(239, 68, 68, 0.18)",
  },
  {
    id: "sch-7",
    code: "SCH-1007",
    name: "Daleview Secondary School",
    gradePacksCount: 8,
    season: "2024",
    lastEdited: "10/08/26",
    lastEditedBy: "Mcebisi M.",
    visibility: "visible",
    status: "published",
    health: "good",
    owner: "MC",
    ownerName: "Mcebisi M.",
    avatarColor: "rgba(139, 92, 246, 0.18)",
  },
  {
    id: "sch-8",
    code: "SCH-1008",
    name: "Edenvale Primary School",
    gradePacksCount: 4,
    season: "2024",
    lastEdited: "09/08/26",
    lastEditedBy: "Kwanele G.",
    visibility: "hidden",
    status: "draft",
    health: "needs_work",
    owner: "KG",
    ownerName: "Kwanele G.",
    avatarColor: "rgba(20, 184, 166, 0.18)",
  },
];

function SparklineWave({ color, direction = "up" }: { color: string; direction?: "up" | "down" }) {
  const path =
    direction === "up"
      ? "M 0 18 Q 15 22 30 14 T 50 8 T 72 2"
      : "M 0 4 Q 15 2 30 10 T 50 16 T 72 22";
  return (
    <svg className={adminStyles.kpiSparkline} viewBox="0 0 72 24" fill="none">
      <path d={path} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

import type { SchoolGroupedResult } from "@/lib/admin/packs";

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

function formatDateString(isoOrDateStr?: string | null): string {
  if (!isoOrDateStr) return "17/08/26";
  try {
    const d = new Date(isoOrDateStr);
    if (isNaN(d.getTime())) return "17/08/26";
    return d.toLocaleDateString("en-GB");
  } catch {
    return "17/08/26";
  }
}

export function SchoolPacksView({ initialData }: { initialData?: SchoolGroupedResult }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("2027");
  const [selectedVisibility, setSelectedVisibility] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const currentDateStr = useMemo(() => {
    return new Date().toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, []);

  const schoolRows = useMemo(() => {
    if (initialData?.schoolsSummary && initialData.schoolsSummary.length > 0) {
      return initialData.schoolsSummary
        .map((s, idx) => ({
          id: s.school_id,
          code: `SCH-${1001 + idx}`,
          name: s.school_name,
          gradePacksCount: s.grade_packs_count,
          season: "2027",
          lastEdited: formatDateString(s.last_edited),
          lastEditedBy: "Mcebisi M.",
          visibility: (s.visible ? "visible" : "hidden") as "visible" | "hidden",
          status: (s.visible ? "published" : "draft") as "published" | "draft" | "review",
          health: "good" as "good" | "needs_work",
          owner: "MC" as "MC" | "KG" | "LM" | "SB",
          ownerName: "Mcebisi M.",
          avatarColor: "rgba(45, 212, 191, 0.18)",
        }))
        .sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
        );
    }
    return SEED_SCHOOL_ROWS;
  }, [initialData]);

  // Filtered rows
  const filteredSchools = useMemo(() => {
    return schoolRows.filter((school) => {
      const matchQuery =
        school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchVisibility =
        selectedVisibility === "all" || school.visibility === selectedVisibility;
      const matchStatus =
        selectedStatus === "all" || school.status === selectedStatus;
      return matchQuery && matchVisibility && matchStatus;
    });
  }, [schoolRows, searchQuery, selectedVisibility, selectedStatus]);

  const totalCount = filteredSchools.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const visiblePageNumbers = useMemo(() => {
    const maxButtons = 5;
    let start = Math.max(1, currentPage - 2);
    let end = start + maxButtons - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxButtons + 1);
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  const paginatedSchools = useMemo(() => {
    const from = (currentPage - 1) * pageSize;
    return filteredSchools.slice(from, from + pageSize);
  }, [filteredSchools, currentPage, pageSize]);

  return (
    <div className={styles.container}>
      {/* ===================================================
          1. PAGE HEADER
          =================================================== */}
      <div className={styles.pageHeader}>
        <div className={styles.headerTitleGroup}>
          <div className={styles.headerTexts}>
            <h1 className={styles.headerTitle}>
              School Packs{" "}
              <span className={styles.headerCount} suppressHydrationWarning>
                ({formatNumber(totalCount)})
              </span>
            </h1>
            <p className={styles.headerSubtitle}>
              Manage and publish school packs for each school and grade.
            </p>
          </div>
        </div>

        <button className={adminStyles.datePickerBtn}>
          <Calendar size={14} />
          <span>{currentDateStr}</span>
        </button>
      </div>

      {/* ===================================================
          2. 6 KPI SPARKLINE CARDS
          =================================================== */}
      <div className={adminStyles.kpiGrid}>
        {/* Card 1: Total Schools */}
        <div className={adminStyles.kpiCard}>
          <div className={adminStyles.kpiTop}>
            <div className={`${adminStyles.kpiIconWrapper} ${adminStyles.kpiIconTeal}`}>
              <GraduationCap size={18} />
            </div>
            <div className={adminStyles.kpiHeaderInfo}>
              <span className={adminStyles.kpiLabel}>Total Schools</span>
              <span className={adminStyles.kpiValue} suppressHydrationWarning>{formatNumber(totalCount)}</span>
            </div>
          </div>
          <div className={adminStyles.kpiFooter}>
            <span className={`${adminStyles.kpiTrend} ${adminStyles.kpiTrendUp}`}>
              <TrendingUp size={12} /> 6 vs last 7 days
            </span>
            <SparklineWave color="#2dd4bf" direction="up" />
          </div>
        </div>

        {/* Card 2: Active Packs */}
        <div className={adminStyles.kpiCard}>
          <div className={adminStyles.kpiTop}>
            <div className={`${adminStyles.kpiIconWrapper} ${adminStyles.kpiIconCyan}`}>
              <Package size={18} />
            </div>
            <div className={adminStyles.kpiHeaderInfo}>
              <span className={adminStyles.kpiLabel}>Active Packs</span>
              <span className={adminStyles.kpiValue}>96</span>
            </div>
          </div>
          <div className={adminStyles.kpiFooter}>
            <span className={`${adminStyles.kpiTrend} ${adminStyles.kpiTrendUp}`}>
              <TrendingUp size={12} /> 12 vs last 7 days
            </span>
            <SparklineWave color="#06b6d4" direction="up" />
          </div>
        </div>

        {/* Card 3: Draft Packs */}
        <div className={adminStyles.kpiCard}>
          <div className={adminStyles.kpiTop}>
            <div className={`${adminStyles.kpiIconWrapper} ${adminStyles.kpiIconBlue}`}>
              <FileText size={18} />
            </div>
            <div className={adminStyles.kpiHeaderInfo}>
              <span className={adminStyles.kpiLabel}>Draft Packs</span>
              <span className={adminStyles.kpiValue}>14</span>
            </div>
          </div>
          <div className={adminStyles.kpiFooter}>
            <span className={`${adminStyles.kpiTrend} ${adminStyles.kpiTrendDown}`}>
              <TrendingDown size={12} /> 2 vs last 7 days
            </span>
            <SparklineWave color="#3b82f6" direction="down" />
          </div>
        </div>

        {/* Card 4: Ready for Review */}
        <div className={adminStyles.kpiCard}>
          <div className={adminStyles.kpiTop}>
            <div className={`${adminStyles.kpiIconWrapper} ${adminStyles.kpiIconAmber}`}>
              <Clock size={18} />
            </div>
            <div className={adminStyles.kpiHeaderInfo}>
              <span className={adminStyles.kpiLabel}>Ready for Review</span>
              <span className={adminStyles.kpiValue}>9</span>
            </div>
          </div>
          <div className={adminStyles.kpiFooter}>
            <span className={`${adminStyles.kpiTrend} ${adminStyles.kpiTrendUp}`}>
              <TrendingUp size={12} /> 3 vs last 7 days
            </span>
            <SparklineWave color="#f59e0b" direction="up" />
          </div>
        </div>

        {/* Card 5: Visible Packs */}
        <div className={adminStyles.kpiCard}>
          <div className={adminStyles.kpiTop}>
            <div className={`${adminStyles.kpiIconWrapper} ${adminStyles.kpiIconEmerald}`}>
              <Eye size={18} />
            </div>
            <div className={adminStyles.kpiHeaderInfo}>
              <span className={adminStyles.kpiLabel}>Visible Packs</span>
              <span className={adminStyles.kpiValue}>82</span>
            </div>
          </div>
          <div className={adminStyles.kpiFooter}>
            <span className={`${adminStyles.kpiTrend} ${adminStyles.kpiTrendUp}`}>
              <TrendingUp size={12} /> 10 vs last 7 days
            </span>
            <SparklineWave color="#10b981" direction="up" />
          </div>
        </div>

        {/* Card 6: Hidden Packs */}
        <div className={adminStyles.kpiCard}>
          <div className={adminStyles.kpiTop}>
            <div className={`${adminStyles.kpiIconWrapper} ${styles.kpiIconSlate}`}>
              <EyeOff size={18} />
            </div>
            <div className={adminStyles.kpiHeaderInfo}>
              <span className={adminStyles.kpiLabel}>Hidden Packs</span>
              <span className={adminStyles.kpiValue}>10</span>
            </div>
          </div>
          <div className={adminStyles.kpiFooter}>
            <span className={`${adminStyles.kpiTrend} ${adminStyles.kpiTrendDown}`}>
              <TrendingDown size={12} /> 1 vs last 7 days
            </span>
            <SparklineWave color="#ef4444" direction="down" />
          </div>
        </div>
      </div>

      {/* ===================================================
          3. FILTER & ACTION TOOLBAR
          =================================================== */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchBox}>
            <Search />
            <input
              type="text"
              placeholder="Search by school name..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className={adminStyles.filterSelect}
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
          >
            <option value="2024">Season: 2024</option>
            <option value="2025">Season: 2025</option>
            <option value="2027">Season: 2027</option>
          </select>

          <select
            className={adminStyles.filterSelect}
            value={selectedVisibility}
            onChange={(e) => setSelectedVisibility(e.target.value)}
          >
            <option value="all">Visibility: All</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>

          <select
            className={adminStyles.filterSelect}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">Status: All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="review">Review</option>
          </select>
        </div>

        <div className={styles.toolbarRight}>
          <button className={styles.sortBtn}>
            <SlidersHorizontal size={13} />
            <span>Sort by: Last edited</span>
          </button>

          <div className={styles.viewToggleGroup}>
            <span className={styles.viewToggleLabel}>View</span>
            <button
              className={`${styles.viewToggleBtn} ${viewMode === "list" ? styles.viewToggleBtnActive : ""}`}
              onClick={() => setViewMode("list")}
              title="List View"
            >
              <List size={14} />
            </button>
            <button
              className={`${styles.viewToggleBtn} ${viewMode === "grid" ? styles.viewToggleBtnActive : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================
          4. MAIN 2-COLUMN GRID (TABLE + RIGHT PANELS)
          =================================================== */}
      <div className={styles.mainGrid}>
        {/* Left Column: Primary Data Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={adminStyles.dataTable}>
              <thead>
                <tr>
                  <th>School Name</th>
                  <th>Grade Packs</th>
                  <th>Season</th>
                  <th>Visibility</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSchools.map((school) => (
                  <tr
                    key={school.id}
                    className={styles.dataRow}
                    onClick={() =>
                      router.push(
                        `/admin/packs/${school.name
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-+|-+$/g, "")}`
                      )
                    }
                  >
                    <td>
                      <div className={styles.schoolCell}>
                        <div
                          className={styles.schoolAvatar}
                          style={{ background: school.avatarColor }}
                        >
                          <GraduationCap size={16} color="#2dd4bf" />
                        </div>
                        <div className={styles.schoolInfo}>
                          <span className={styles.schoolName}>{school.name}</span>
                          <span className={styles.schoolId}>ID: {school.code}</span>
                        </div>
                      </div>
                    </td>
                    <td>{school.gradePacksCount}</td>
                    <td>
                      <span className={styles.seasonBadge}>{school.season}</span>
                    </td>
                    <td>
                      <span
                        className={
                          school.visibility === "visible"
                            ? styles.visibilityBadgeVisible
                            : styles.visibilityBadgeHidden
                        }
                      >
                        {school.visibility === "visible" ? "Visible" : "Hidden"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div className={styles.paginationFooter}>
            <span suppressHydrationWarning>
              Showing {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, totalCount)} of {formatNumber(totalCount)} schools
            </span>
            <div className={styles.paginationControls}>
              <button
                className={styles.pageBtn}
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                &lt;
              </button>

              {visiblePageNumbers.map((pageNum) => (
                <button
                  key={pageNum}
                  className={`${styles.pageBtn} ${
                    currentPage === pageNum ? styles.pageBtnActive : ""
                  }`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              ))}

              <button
                className={styles.pageBtn}
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                &gt;
              </button>
            </div>
            <div className={`${adminStyles.flex} ${adminStyles.itemsCenter} ${adminStyles.gap6}`}>
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className={adminStyles.pageShowSelect}
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
                <option value={500}>500</option>
                <option value={1000}>1000</option>
                <option value={totalCount || 3342}>3342 (All)</option>
              </select>
              <span>per page</span>
            </div>
          </div>
        </div>

        {/* Right Column: Stacked Panels */}
        <div className={styles.rightPanels}>
          {/* Panel 1: What needs attention */}
          <div className={adminStyles.panel}>
            <div className={adminStyles.panelHeader}>
              <h2 className={adminStyles.panelTitle}>What needs attention</h2>
              <Link href="/admin/tasks" className={styles.panelLink}>
                View all <ArrowRight size={12} />
              </Link>
            </div>

            <div className={adminStyles.exceptionList}>
              {/* 1. 9 packs awaiting approval */}
              <div className={adminStyles.exceptionItem}>
                <div className={adminStyles.exceptionLeft}>
                  <div
                    className={`${adminStyles.exceptionIcon} ${adminStyles.iconRed}`}
                  >
                    <AlertTriangle size={15} />
                  </div>
                  <div className={adminStyles.exceptionDetails}>
                    <span className={adminStyles.exceptionHeadline}>9 packs awaiting approval</span>
                    <span className={adminStyles.exceptionSubtext}>
                      Require final review before publishing
                    </span>
                  </div>
                </div>
                <div className={adminStyles.exceptionRight}>
                  <span className={styles.exceptionCount}>9</span>
                  <span className={`${adminStyles.severityBadge} ${adminStyles.severityHigh}`}>High</span>
                  <span className={adminStyles.exceptionTime}>32m ago</span>
                </div>
              </div>

              {/* 2. 14 packs are drafts */}
              <div className={adminStyles.exceptionItem}>
                <div className={adminStyles.exceptionLeft}>
                  <div
                    className={`${adminStyles.exceptionIcon} ${adminStyles.iconAmber}`}
                  >
                    <Clock size={15} />
                  </div>
                  <div className={adminStyles.exceptionDetails}>
                    <span className={adminStyles.exceptionHeadline}>14 packs are drafts</span>
                    <span className={adminStyles.exceptionSubtext}>Not yet published</span>
                  </div>
                </div>
                <div className={adminStyles.exceptionRight}>
                  <span className={styles.exceptionCount}>14</span>
                  <span className={`${adminStyles.severityBadge} ${adminStyles.severityMedium}`}>Medium</span>
                  <span className={adminStyles.exceptionTime}>1h ago</span>
                </div>
              </div>

              {/* 3. 6 packs missing prices */}
              <div className={adminStyles.exceptionItem}>
                <div className={adminStyles.exceptionLeft}>
                  <div
                    className={`${adminStyles.exceptionIcon} ${adminStyles.iconAmber}`}
                  >
                    <AlertTriangle size={15} />
                  </div>
                  <div className={adminStyles.exceptionDetails}>
                    <span className={adminStyles.exceptionHeadline}>6 packs missing prices</span>
                    <span className={adminStyles.exceptionSubtext}>Items without pricing</span>
                  </div>
                </div>
                <div className={adminStyles.exceptionRight}>
                  <span className={styles.exceptionCount}>6</span>
                  <span className={`${adminStyles.severityBadge} ${adminStyles.severityMedium}`}>Medium</span>
                  <span className={adminStyles.exceptionTime}>1h ago</span>
                </div>
              </div>

              {/* 4. 3 schools updated */}
              <div className={adminStyles.exceptionItem}>
                <div className={adminStyles.exceptionLeft}>
                  <div
                    className={`${adminStyles.exceptionIcon} ${adminStyles.iconBlue}`}
                  >
                    <FileText size={15} />
                  </div>
                  <div className={adminStyles.exceptionDetails}>
                    <span className={adminStyles.exceptionHeadline}>3 schools updated</span>
                    <span className={adminStyles.exceptionSubtext}>School lists changed</span>
                  </div>
                </div>
                <div className={adminStyles.exceptionRight}>
                  <span className={styles.exceptionCount}>3</span>
                  <span className={`${adminStyles.severityBadge} ${adminStyles.severityInfo}`}>Info</span>
                  <span className={adminStyles.exceptionTime}>2h ago</span>
                </div>
              </div>

              {/* 5. 10 packs are hidden */}
              <div className={adminStyles.exceptionItem}>
                <div className={adminStyles.exceptionLeft}>
                  <div
                    className={`${adminStyles.exceptionIcon} ${adminStyles.iconSlate}`}
                  >
                    <EyeOff size={15} />
                  </div>
                  <div className={adminStyles.exceptionDetails}>
                    <span className={adminStyles.exceptionHeadline}>10 packs are hidden</span>
                    <span className={adminStyles.exceptionSubtext}>Currently not visible to users</span>
                  </div>
                </div>
                <div className={adminStyles.exceptionRight}>
                  <span className={styles.exceptionCount}>10</span>
                  <span className={`${adminStyles.severityBadge} ${adminStyles.severityLow}`}>Low</span>
                  <span className={adminStyles.exceptionTime}>2h ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 2: Donut Distribution Chart */}
          <div className={adminStyles.panel}>
            <div className={styles.donutContainer}>
              <div className={styles.donutSvgWrapper}>
                <svg width="130" height="130" viewBox="0 0 130 130">
                  {/* Outer glow circle */}
                  <circle cx="65" cy="65" r="50" fill="transparent" stroke="#1e293b" strokeWidth="12" />
                  {/* Segment: Visible (64%) */}
                  <circle
                    cx="65"
                    cy="65"
                    r="50"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="12"
                    strokeDasharray="201 314"
                    strokeDashoffset="78"
                    strokeLinecap="round"
                  />
                  {/* Segment: Draft (11%) */}
                  <circle
                    cx="65"
                    cy="65"
                    r="50"
                    fill="transparent"
                    stroke="#3b82f6"
                    strokeWidth="12"
                    strokeDasharray="35 314"
                    strokeDashoffset="-125"
                  />
                  {/* Segment: Review (7%) */}
                  <circle
                    cx="65"
                    cy="65"
                    r="50"
                    fill="transparent"
                    stroke="#f59e0b"
                    strokeWidth="12"
                    strokeDasharray="22 314"
                    strokeDashoffset="-162"
                  />
                </svg>

                <div className={styles.donutCenterText}>
                  <span className={styles.donutCenterNumber} suppressHydrationWarning>{formatNumber(totalCount)}</span>
                  <span className={styles.donutCenterLabel}>Total Schools</span>
                </div>
              </div>

              <div className={styles.donutLegend}>
                <div className={styles.legendRow}>
                  <div className={styles.legendLabelGroup}>
                    <span className={`${adminStyles.legendDotInline}`} style={{ background: "#10b981" }} />
                    <span>Visible</span>
                  </div>
                  <div>
                    <span className={styles.legendValue}>82</span>
                    <span className={styles.legendPercent}>(64%)</span>
                  </div>
                </div>

                <div className={styles.legendRow}>
                  <div className={styles.legendLabelGroup}>
                    <span className={`${adminStyles.legendDotInline}`} style={{ background: "#64748b" }} />
                    <span>Hidden</span>
                  </div>
                  <div>
                    <span className={styles.legendValue}>10</span>
                    <span className={styles.legendPercent}>(8%)</span>
                  </div>
                </div>

                <div className={styles.legendRow}>
                  <div className={styles.legendLabelGroup}>
                    <span className={`${adminStyles.legendDotInline}`} style={{ background: "#3b82f6" }} />
                    <span>Draft</span>
                  </div>
                  <div>
                    <span className={styles.legendValue}>14</span>
                    <span className={styles.legendPercent}>(11%)</span>
                  </div>
                </div>

                <div className={styles.legendRow}>
                  <div className={styles.legendLabelGroup}>
                    <span className={`${adminStyles.legendDotInline}`} style={{ background: "#f59e0b" }} />
                    <span>Review</span>
                  </div>
                  <div>
                    <span className={styles.legendValue}>9</span>
                    <span className={styles.legendPercent}>(7%)</span>
                  </div>
                </div>

                <div className={styles.legendRow}>
                  <div className={styles.legendLabelGroup}>
                    <span className={`${adminStyles.legendDotInline}`} style={{ background: "#0d9488" }} />
                    <span>Other</span>
                  </div>
                  <div>
                    <span className={styles.legendValue}>13</span>
                    <span className={styles.legendPercent}>(10%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
