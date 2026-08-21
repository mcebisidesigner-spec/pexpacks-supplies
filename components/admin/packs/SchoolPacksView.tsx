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
    <svg className={styles.kpiSparkline} viewBox="0 0 72 24" fill="none">
      <path d={path} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

import type { SchoolGroupedResult } from "@/lib/admin/packs";

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
          lastEdited: s.last_edited ? new Date(s.last_edited).toLocaleDateString("en-GB") : "17/08/26",
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
          <div className={styles.headerIconBadge}>
            <Package size={22} />
          </div>
          <div className={styles.headerTexts}>
            <h1 className={styles.headerTitle}>School Packs</h1>
            <p className={styles.headerSubtitle}>
              Manage and publish school packs for each school and grade.
            </p>
          </div>
        </div>

        <button className={styles.datePickerBtn}>
          <Calendar size={14} />
          <span>{currentDateStr}</span>
        </button>
      </div>

      {/* ===================================================
          2. 6 KPI SPARKLINE CARDS
          =================================================== */}
      <div className={styles.kpiGrid}>
        {/* Card 1: Total Schools */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <div className={`${styles.kpiIconWrapper} ${styles.kpiIconTeal}`}>
              <GraduationCap size={18} />
            </div>
            <div className={styles.kpiHeaderInfo}>
              <span className={styles.kpiLabel}>Total Schools</span>
              <span className={styles.kpiValue}>{totalCount.toLocaleString()}</span>
            </div>
          </div>
          <div className={styles.kpiFooter}>
            <span className={`${styles.kpiTrend} ${styles.kpiTrendUp}`}>
              <TrendingUp size={12} /> 6 vs last 7 days
            </span>
            <SparklineWave color="#2dd4bf" direction="up" />
          </div>
        </div>

        {/* Card 2: Active Packs */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <div className={`${styles.kpiIconWrapper} ${styles.kpiIconCyan}`}>
              <Package size={18} />
            </div>
            <div className={styles.kpiHeaderInfo}>
              <span className={styles.kpiLabel}>Active Packs</span>
              <span className={styles.kpiValue}>96</span>
            </div>
          </div>
          <div className={styles.kpiFooter}>
            <span className={`${styles.kpiTrend} ${styles.kpiTrendUp}`}>
              <TrendingUp size={12} /> 12 vs last 7 days
            </span>
            <SparklineWave color="#06b6d4" direction="up" />
          </div>
        </div>

        {/* Card 3: Draft Packs */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <div className={`${styles.kpiIconWrapper} ${styles.kpiIconBlue}`}>
              <FileText size={18} />
            </div>
            <div className={styles.kpiHeaderInfo}>
              <span className={styles.kpiLabel}>Draft Packs</span>
              <span className={styles.kpiValue}>14</span>
            </div>
          </div>
          <div className={styles.kpiFooter}>
            <span className={`${styles.kpiTrend} ${styles.kpiTrendDown}`}>
              <TrendingDown size={12} /> 2 vs last 7 days
            </span>
            <SparklineWave color="#3b82f6" direction="down" />
          </div>
        </div>

        {/* Card 4: Ready for Review */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <div className={`${styles.kpiIconWrapper} ${styles.kpiIconAmber}`}>
              <Clock size={18} />
            </div>
            <div className={styles.kpiHeaderInfo}>
              <span className={styles.kpiLabel}>Ready for Review</span>
              <span className={styles.kpiValue}>9</span>
            </div>
          </div>
          <div className={styles.kpiFooter}>
            <span className={`${styles.kpiTrend} ${styles.kpiTrendUp}`}>
              <TrendingUp size={12} /> 3 vs last 7 days
            </span>
            <SparklineWave color="#f59e0b" direction="up" />
          </div>
        </div>

        {/* Card 5: Visible Packs */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <div className={`${styles.kpiIconWrapper} ${styles.kpiIconEmerald}`}>
              <Eye size={18} />
            </div>
            <div className={styles.kpiHeaderInfo}>
              <span className={styles.kpiLabel}>Visible Packs</span>
              <span className={styles.kpiValue}>82</span>
            </div>
          </div>
          <div className={styles.kpiFooter}>
            <span className={`${styles.kpiTrend} ${styles.kpiTrendUp}`}>
              <TrendingUp size={12} /> 10 vs last 7 days
            </span>
            <SparklineWave color="#10b981" direction="up" />
          </div>
        </div>

        {/* Card 6: Hidden Packs */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <div className={`${styles.kpiIconWrapper} ${styles.kpiIconSlate}`}>
              <EyeOff size={18} />
            </div>
            <div className={styles.kpiHeaderInfo}>
              <span className={styles.kpiLabel}>Hidden Packs</span>
              <span className={styles.kpiValue}>10</span>
            </div>
          </div>
          <div className={styles.kpiFooter}>
            <span className={`${styles.kpiTrend} ${styles.kpiTrendDown}`}>
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
            className={styles.filterSelect}
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
          >
            <option value="2024">Season: 2024</option>
            <option value="2025">Season: 2025</option>
            <option value="2027">Season: 2027</option>
          </select>

          <select
            className={styles.filterSelect}
            value={selectedVisibility}
            onChange={(e) => setSelectedVisibility(e.target.value)}
          >
            <option value="all">Visibility: All</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>

          <select
            className={styles.filterSelect}
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
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>School Name</th>
                  <th>Grade Packs</th>
                  <th>Season</th>
                  <th>Last Edited</th>
                  <th>Visibility</th>
                  <th>Status</th>
                  <th>Health</th>
                  <th>Owner</th>
                  <th>Actions</th>
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
                      <div>
                        <div>{school.lastEdited}</div>
                        <div style={{ fontSize: 10, color: "#64748b" }}>
                          by {school.lastEditedBy}
                        </div>
                      </div>
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
                    <td>
                      <span
                        className={
                          school.status === "published"
                            ? styles.statusBadgePublished
                            : school.status === "draft"
                            ? styles.statusBadgeDraft
                            : styles.statusBadgeReview
                        }
                      >
                        {school.status.charAt(0).toUpperCase() + school.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          school.health === "good"
                            ? styles.healthDotGood
                            : styles.healthDotNeedsWork
                        }
                      >
                        {school.health === "good" ? "Good" : "Needs work"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.ownerBadge}>
                        <span
                          className={`${styles.ownerAvatar} ${
                            school.owner === "MC" ? styles.ownerAvatarMC : styles.ownerAvatarKG
                          }`}
                        >
                          {school.owner}
                        </span>
                        <span>{school.ownerName}</span>
                      </div>
                    </td>
                    <td>
                      <button
                        className={styles.actionBtnDots}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <MoreHorizontal size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div className={styles.paginationFooter}>
            <span>
              Showing {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, totalCount)} of {totalCount.toLocaleString()} schools
            </span>
            <div className={styles.paginationControls}>
              <button
                className={styles.pageBtn}
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                &lt;
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + i;
                  if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                }
                return (
                  <button
                    key={pageNum}
                    className={`${styles.pageBtn} ${
                      currentPage === pageNum ? styles.pageBtnActive : ""
                    }`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                className={styles.pageBtn}
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                &gt;
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  background: "#0c1322",
                  border: "1px solid #1e293b",
                  borderRadius: 6,
                  color: "#cbd5e1",
                  fontSize: 11,
                  padding: "3px 6px",
                  cursor: "pointer",
                }}
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
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>What needs attention</h2>
              <Link href="/admin/tasks" className={styles.panelLink}>
                View all <ArrowRight size={12} />
              </Link>
            </div>

            <div className={styles.exceptionList}>
              {/* 1. 9 packs awaiting approval */}
              <div className={styles.exceptionItem}>
                <div className={styles.exceptionLeft}>
                  <div
                    className={styles.exceptionIcon}
                    style={{ background: "rgba(239, 68, 68, 0.18)", color: "#ef4444" }}
                  >
                    <AlertTriangle size={15} />
                  </div>
                  <div className={styles.exceptionDetails}>
                    <span className={styles.exceptionHeadline}>9 packs awaiting approval</span>
                    <span className={styles.exceptionSubtext}>
                      Require final review before publishing
                    </span>
                  </div>
                </div>
                <div className={styles.exceptionRight}>
                  <span className={styles.exceptionCount}>9</span>
                  <span className={`${styles.severityBadge} ${styles.severityHigh}`}>High</span>
                  <span className={styles.exceptionTime}>32m ago</span>
                </div>
              </div>

              {/* 2. 14 packs are drafts */}
              <div className={styles.exceptionItem}>
                <div className={styles.exceptionLeft}>
                  <div
                    className={styles.exceptionIcon}
                    style={{ background: "rgba(245, 158, 11, 0.18)", color: "#f59e0b" }}
                  >
                    <Clock size={15} />
                  </div>
                  <div className={styles.exceptionDetails}>
                    <span className={styles.exceptionHeadline}>14 packs are drafts</span>
                    <span className={styles.exceptionSubtext}>Not yet published</span>
                  </div>
                </div>
                <div className={styles.exceptionRight}>
                  <span className={styles.exceptionCount}>14</span>
                  <span className={`${styles.severityBadge} ${styles.severityMedium}`}>Medium</span>
                  <span className={styles.exceptionTime}>1h ago</span>
                </div>
              </div>

              {/* 3. 6 packs missing prices */}
              <div className={styles.exceptionItem}>
                <div className={styles.exceptionLeft}>
                  <div
                    className={styles.exceptionIcon}
                    style={{ background: "rgba(245, 158, 11, 0.18)", color: "#f59e0b" }}
                  >
                    <AlertTriangle size={15} />
                  </div>
                  <div className={styles.exceptionDetails}>
                    <span className={styles.exceptionHeadline}>6 packs missing prices</span>
                    <span className={styles.exceptionSubtext}>Items without pricing</span>
                  </div>
                </div>
                <div className={styles.exceptionRight}>
                  <span className={styles.exceptionCount}>6</span>
                  <span className={`${styles.severityBadge} ${styles.severityMedium}`}>Medium</span>
                  <span className={styles.exceptionTime}>1h ago</span>
                </div>
              </div>

              {/* 4. 3 schools updated */}
              <div className={styles.exceptionItem}>
                <div className={styles.exceptionLeft}>
                  <div
                    className={styles.exceptionIcon}
                    style={{ background: "rgba(59, 130, 246, 0.18)", color: "#3b82f6" }}
                  >
                    <FileText size={15} />
                  </div>
                  <div className={styles.exceptionDetails}>
                    <span className={styles.exceptionHeadline}>3 schools updated</span>
                    <span className={styles.exceptionSubtext}>School lists changed</span>
                  </div>
                </div>
                <div className={styles.exceptionRight}>
                  <span className={styles.exceptionCount}>3</span>
                  <span className={`${styles.severityBadge} ${styles.severityInfo}`}>Info</span>
                  <span className={styles.exceptionTime}>2h ago</span>
                </div>
              </div>

              {/* 5. 10 packs are hidden */}
              <div className={styles.exceptionItem}>
                <div className={styles.exceptionLeft}>
                  <div
                    className={styles.exceptionIcon}
                    style={{ background: "rgba(100, 116, 139, 0.18)", color: "#94a3b8" }}
                  >
                    <EyeOff size={15} />
                  </div>
                  <div className={styles.exceptionDetails}>
                    <span className={styles.exceptionHeadline}>10 packs are hidden</span>
                    <span className={styles.exceptionSubtext}>Currently not visible to users</span>
                  </div>
                </div>
                <div className={styles.exceptionRight}>
                  <span className={styles.exceptionCount}>10</span>
                  <span className={`${styles.severityBadge} ${styles.severityLow}`}>Low</span>
                  <span className={styles.exceptionTime}>2h ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 2: Donut Distribution Chart */}
          <div className={styles.panel}>
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
                  <span className={styles.donutCenterNumber}>128</span>
                  <span className={styles.donutCenterLabel}>Total Schools</span>
                </div>
              </div>

              <div className={styles.donutLegend}>
                <div className={styles.legendRow}>
                  <div className={styles.legendLabelGroup}>
                    <span className={styles.legendColorDot} style={{ background: "#10b981" }} />
                    <span>Visible</span>
                  </div>
                  <div>
                    <span className={styles.legendValue}>82</span>
                    <span className={styles.legendPercent}>(64%)</span>
                  </div>
                </div>

                <div className={styles.legendRow}>
                  <div className={styles.legendLabelGroup}>
                    <span className={styles.legendColorDot} style={{ background: "#64748b" }} />
                    <span>Hidden</span>
                  </div>
                  <div>
                    <span className={styles.legendValue}>10</span>
                    <span className={styles.legendPercent}>(8%)</span>
                  </div>
                </div>

                <div className={styles.legendRow}>
                  <div className={styles.legendLabelGroup}>
                    <span className={styles.legendColorDot} style={{ background: "#3b82f6" }} />
                    <span>Draft</span>
                  </div>
                  <div>
                    <span className={styles.legendValue}>14</span>
                    <span className={styles.legendPercent}>(11%)</span>
                  </div>
                </div>

                <div className={styles.legendRow}>
                  <div className={styles.legendLabelGroup}>
                    <span className={styles.legendColorDot} style={{ background: "#f59e0b" }} />
                    <span>Review</span>
                  </div>
                  <div>
                    <span className={styles.legendValue}>9</span>
                    <span className={styles.legendPercent}>(7%)</span>
                  </div>
                </div>

                <div className={styles.legendRow}>
                  <div className={styles.legendLabelGroup}>
                    <span className={styles.legendColorDot} style={{ background: "#0d9488" }} />
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
