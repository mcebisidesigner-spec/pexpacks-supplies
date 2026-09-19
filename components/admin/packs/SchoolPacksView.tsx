"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  EyeOff,
  FileText,
  GraduationCap,
  Package,
  Search,
  TrendingDown,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";


export interface SchoolPackRowData {
  id: string;
  code: string;
  name: string;
  gradePacksCount: number;
  season: string;
  lastEdited: string;
  lastEditedBy: string;
  visibility: "visible" | "hidden";
  status: "Active" | "Inactive";
  health: "good" | "needs_work";
  owner: "MC" | "KG" | "LM" | "SB";
  ownerName: string;
  avatarColor: string;
}

function SparklineWave({ color, direction = "up" }: { color: string; direction?: "up" | "down" }) {
  const path =
    direction === "up"
      ? "M 0 18 Q 15 22 30 14 T 50 8 T 72 2"
      : "M 0 4 Q 15 2 30 10 T 50 16 T 72 22";
  return (
    <svg className="w-[72px] h-[24px]" viewBox="0 0 72 24" fill="none">
      <path d={path} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

import type { SchoolGroupedResult } from "@/lib/admin/packs";

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

function formatDateString(isoOrDateStr?: string | null): string {
  if (!isoOrDateStr) return "Never";
  try {
    const d = new Date(isoOrDateStr);
    if (isNaN(d.getTime())) return "Never";
    return d.toLocaleDateString("en-GB");
  } catch {
    return "Never";
  }
}

export function SchoolPacksView({ initialData }: { initialData?: SchoolGroupedResult }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("2027");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [visibilityMap] = useState<Record<string, "visible" | "hidden">>({});

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
        .map((s, idx) => {
          const isSchoolActive = Boolean(
            s.has_items ??
            (s.active_packs_count !== undefined
              ? s.active_packs_count > 0
              : s.grade_packs_count > 0 && s.visible)
          );
          const currentVis = visibilityMap[s.school_id] ?? (isSchoolActive ? "visible" : "hidden");
          return {
            id: s.school_id,
            code: `SCH-${1001 + idx}`,
            name: s.school_name,
            gradePacksCount: s.grade_packs_count,
            season: "2027",
            lastEdited: formatDateString(s.last_edited),
            lastEditedBy: "Mcebisi M.",
            visibility: currentVis,
            status: (isSchoolActive ? "Active" : "Inactive") as "Active" | "Inactive",
            health: "good" as "good" | "needs_work",
            owner: "MC" as "MC" | "KG" | "LM" | "SB",
            ownerName: "Mcebisi M.",
            avatarColor: "rgba(45, 212, 191, 0.18)",
          };
        })
        .sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
        );
    }
    return [];
  }, [initialData, visibilityMap]);

  // Filtered rows
  const filteredSchools = useMemo(() => {
    return schoolRows.filter((school) => {
      const matchQuery =
        school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        selectedStatus === "all" || school.status.toLowerCase() === selectedStatus.toLowerCase();
      return matchQuery && matchStatus;
    });
  }, [schoolRows, searchQuery, selectedStatus]);

  const { activeCount, inactiveCount } = useMemo(() => {
    let active = 0;
    let inactive = 0;
    for (const s of schoolRows) {
      if (s.status === "Active") {
        active++;
      } else {
        inactive++;
      }
    }
    return { activeCount: active, inactiveCount: inactive };
  }, [schoolRows]);

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
    <div className="flex flex-col gap-5 min-w-0 w-full text-slate-300 font-sans tracking-tight">
      {/* ===================================================
          1. PAGE HEADER
          =================================================== */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-0.5">
            <h1 className="m-0 text-2xl md:text-[28px] font-extrabold text-white tracking-tight leading-tight flex items-baseline gap-2">
              School Packs{" "}
              <span className="text-2xl md:text-[28px] font-extrabold text-white tracking-tight" suppressHydrationWarning>
                ({formatNumber(totalCount)})
              </span>
            </h1>
            <p className="m-0 text-xs md:text-[13px] text-slate-400">
              Manage and publish school packs for each school and grade.
            </p>
          </div>
        </div>

        <button className="inline-flex items-center gap-2 px-3 py-2 bg-slate-900/80 border border-slate-700/60 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors">
          <Calendar size={14} />
          <span>{currentDateStr}</span>
        </button>
      </div>

      {/* ===================================================
          2. 5 KPI SPARKLINE CARDS
          =================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 w-full">
        {/* Card 1: Total Schools */}
        <div className="bg-[#070d18] border border-white/10 rounded-xl p-4 flex flex-col justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <GraduationCap size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Schools</span>
              <span className="text-xl font-bold text-white tracking-tight" suppressHydrationWarning>{formatNumber(totalCount)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
              <TrendingUp size={12} /> 6 vs last 7 days
            </span>
            <SparklineWave color="#2dd4bf" direction="up" />
          </div>
        </div>

        {/* Card 2: Active Packs */}
        <div className="bg-[#070d18] border border-white/10 rounded-xl p-4 flex flex-col justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Package size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Active Packs</span>
              <span className="text-xl font-bold text-white tracking-tight" suppressHydrationWarning>
                {formatNumber(initialData?.activePacksCount ?? 0)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
              <TrendingUp size={12} /> Live catalog
            </span>
            <SparklineWave color="#06b6d4" direction="up" />
          </div>
        </div>

        {/* Card 3: Stationery Items */}
        <div className="bg-[#070d18] border border-white/10 rounded-xl p-4 flex flex-col justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileText size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Stationery Items</span>
              <span className="text-xl font-bold text-white tracking-tight" suppressHydrationWarning>
                {formatNumber(initialData?.totalPackItems ?? 0)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
              <TrendingUp size={12} /> In active packs
            </span>
            <SparklineWave color="#3b82f6" direction="up" />
          </div>
        </div>

        {/* Card 4: Active (based on Status column) */}
        <div className="bg-[#070d18] border border-white/10 rounded-xl p-4 flex flex-col justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Active</span>
              <span className="text-xl font-bold text-white tracking-tight" suppressHydrationWarning>
                {formatNumber(activeCount)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
              <TrendingUp size={12} /> Active school packs
            </span>
            <SparklineWave color="#10b981" direction="up" />
          </div>
        </div>

        {/* Card 5: Inactive (based on Status column) */}
        <div className="bg-[#070d18] border border-white/10 rounded-xl p-4 flex flex-col justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-slate-500/10 text-slate-400 border border-slate-500/20">
              <EyeOff size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Inactive</span>
              <span className="text-xl font-bold text-white tracking-tight" suppressHydrationWarning>
                {formatNumber(inactiveCount)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400">
              <TrendingDown size={12} /> Inactive school packs
            </span>
            <SparklineWave color="#64748b" direction="down" />
          </div>
        </div>
      </div>

      {/* ===================================================
          3. FILTER & ACTION TOOLBAR
          =================================================== */}
      <div className="flex items-center justify-between flex-wrap gap-3 py-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative w-full sm:w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by school name..."
              className="w-full h-[38px] pl-9 pr-3 bg-slate-900/80 border border-slate-700/60 rounded-lg text-slate-100 text-xs outline-none transition-all duration-150 focus:border-emerald-500 focus:bg-slate-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="h-[38px] px-3 bg-slate-900/80 border border-slate-700/60 rounded-lg text-slate-200 text-xs font-medium outline-none cursor-pointer hover:border-slate-600 focus:border-emerald-500"
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
          >
            <option value="2027">Season: 2027</option>
            <option value="2026">Season: 2026</option>
            <option value="2025">Season: 2025</option>
            <option value="2024">Season: 2024</option>
          </select>

          <select
            className="h-[38px] px-3 bg-slate-900/80 border border-slate-700/60 rounded-lg text-slate-200 text-xs font-medium outline-none cursor-pointer hover:border-slate-600 focus:border-emerald-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">Status: All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* ===================================================
          4. MAIN 2-COLUMN GRID (TABLE + RIGHT PANELS)
          =================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-3.5 items-start w-full max-w-full">
        {/* Left Column: Primary Data Table */}
        <div className="bg-[#070d18] border border-white/10 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left text-[13px]">
              <thead className="sticky top-0 z-10 bg-slate-900/90 border-b border-slate-800">
                <tr>
                  <th className="px-4.5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span>School &amp; ID</span>
                      <span className="text-[10px] text-slate-500">↑↓</span>
                    </div>
                  </th>
                  <th className="px-4.5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span>Total Packs</span>
                      <span className="text-[10px] text-slate-500">↑↓</span>
                    </div>
                  </th>
                  <th className="px-4.5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span>Season</span>
                      <span className="text-[10px] text-slate-500">↑↓</span>
                    </div>
                  </th>
                  <th className="px-4.5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span>Status</span>
                      <span className="text-[10px] text-slate-500">↑↓</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedSchools.map((school) => (
                  <tr
                    key={school.id}
                    className="cursor-pointer transition-colors duration-150 border-b border-slate-800/60 hover:bg-slate-800/40"
                    onClick={() =>
                      router.push(
                        `/admin/packs/${school.name
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-+|-+$/g, "")}`
                      )
                    }
                  >
                    <td className="px-4.5 py-3.5 text-slate-300 align-middle">
                      <div className="flex items-center gap-3 min-w-[180px]">
                        <div
                          className="flex items-center justify-center w-8.5 h-8.5 rounded-lg shrink-0"
                          style={{ background: school.avatarColor }}
                        >
                          <GraduationCap size={16} color="#2dd4bf" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-bold text-white whitespace-nowrap">{school.name}</span>
                          <span className="text-xs font-medium text-slate-400 tracking-wide">{school.code}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4.5 py-3.5 text-slate-300 align-middle">
                      <span className="text-xs text-slate-400 font-medium">
                        {school.gradePacksCount} {school.gradePacksCount === 1 ? "pack" : "packs"}
                      </span>
                    </td>
                    <td className="px-4.5 py-3.5 text-slate-300 align-middle">
                      <span className="inline-flex px-2.5 py-1 bg-slate-900/60 border border-white/10 text-slate-300 rounded-md text-xs font-semibold">{school.season}</span>
                    </td>
                    <td className="px-4.5 py-3.5 text-slate-300 align-middle">
                      <StatusBadge
                        status={school.status}
                        tone={school.status === "Active" ? "emerald" : "slate"}
                        showDot
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div className="flex items-center justify-between flex-wrap gap-3 px-4 py-3 border-t border-slate-800 bg-slate-900/40 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <div className="relative inline-flex items-center">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-slate-900 border border-slate-700/60 rounded-lg text-slate-200 text-xs font-semibold py-1.5 pl-3 pr-8 cursor-pointer outline-none hover:border-slate-600 focus:border-emerald-500"
                  aria-label="Records per page"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                  <option value={250}>250 per page</option>
                  <option value={500}>500 per page</option>
                  <option value={1000}>1000 per page</option>
                  <option value={totalCount || 3342}>All per page</option>
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span suppressHydrationWarning className="text-xs text-slate-400 font-medium">
                Showing <span className="text-slate-200 font-semibold">{totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{" "}
                <span className="text-slate-200 font-semibold">{Math.min(currentPage * pageSize, totalCount)}</span> of{" "}
                <span className="text-slate-200 font-semibold">{formatNumber(totalCount)}</span> schools
              </span>
              <div className="flex items-center gap-1">
                <button
                  className="flex items-center justify-center min-w-7 h-7 px-1.5 rounded-md text-slate-400 text-xs font-semibold transition-colors duration-150 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:pointer-events-none"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  &lt;
                </button>

                {visiblePageNumbers.map((pageNum) => (
                  <button
                    key={pageNum}
                    className={`flex items-center justify-center min-w-7 h-7 px-1.5 rounded-md text-slate-400 text-xs font-semibold transition-colors duration-150 hover:bg-slate-800 hover:text-white ${
                      currentPage === pageNum ? "!bg-emerald-500 !text-slate-950 font-bold" : ""
                    }`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  className="flex items-center justify-center min-w-7 h-7 px-1.5 rounded-md text-slate-400 text-xs font-semibold transition-colors duration-150 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:pointer-events-none"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stacked Panels */}
        <div className="flex flex-col gap-4">
          {/* Panel 1: What needs attention */}
          <div className="bg-[#070d18] border border-white/10 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
              <h2 className="text-sm font-bold text-white tracking-tight m-0">What needs attention</h2>
              <Link href="/admin/tasks" className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                View all <ArrowRight size={12} />
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              {/* 1. 9 packs awaiting approval */}
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-rose-500/10 text-rose-400"
                  >
                    <AlertTriangle size={15} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-slate-200 truncate">9 packs awaiting approval</span>
                    <span className="text-[11px] text-slate-400 truncate">
                      Require final review before publishing
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-slate-300">9</span>
                  <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">High</span>
                  <span className="text-[10px] text-slate-500">32m ago</span>
                </div>
              </div>

              {/* 2. 14 packs are drafts */}
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-amber-500/10 text-amber-400"
                  >
                    <Clock size={15} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-slate-200 truncate">14 packs are drafts</span>
                    <span className="text-[11px] text-slate-400 truncate">Not yet published</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-slate-300">14</span>
                  <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">Medium</span>
                  <span className="text-[10px] text-slate-500">1h ago</span>
                </div>
              </div>

              {/* 3. 6 packs missing prices */}
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-amber-500/10 text-amber-400"
                  >
                    <AlertTriangle size={15} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-slate-200 truncate">6 packs missing prices</span>
                    <span className="text-[11px] text-slate-400 truncate">Items without pricing</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-slate-300">6</span>
                  <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">Medium</span>
                  <span className="text-[10px] text-slate-500">1h ago</span>
                </div>
              </div>

              {/* 4. 3 schools updated */}
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-400"
                  >
                    <FileText size={15} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-slate-200 truncate">3 schools updated</span>
                    <span className="text-[11px] text-slate-400 truncate">School lists changed</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-slate-300">3</span>
                  <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30">Info</span>
                  <span className="text-[10px] text-slate-500">2h ago</span>
                </div>
              </div>

              {/* 5. 10 packs are hidden */}
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-slate-500/10 text-slate-400"
                  >
                    <EyeOff size={15} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-slate-200 truncate">10 packs are hidden</span>
                    <span className="text-[11px] text-slate-400 truncate">Currently not visible to users</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-slate-300">10</span>
                  <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-500/15 text-slate-400 border border-slate-500/30">Low</span>
                  <span className="text-[10px] text-slate-500">2h ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
