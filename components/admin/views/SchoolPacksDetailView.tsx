"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Box,
  Calendar,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Edit2,
  Eye,
  HeartPulse,
  Layers,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  Upload,
  Zap,
} from "lucide-react";
import styles from "./CorePagesView.module.css";
import { VisibleToggle } from "@/components/admin/packs/VisibleToggle";
import { DuplicateButton } from "@/components/admin/packs/DuplicateButton";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

interface PackItem {
  id: string;
  title: string;
  slug?: string | null;
  price: number;
  item_count: number;
  visible: boolean;
  featured?: boolean;
  updated_at?: string;
}

interface SchoolData {
  id: string;
  name: string;
  slug?: string | null;
  city?: string | null;
  province?: string | null;
}

interface SchoolPacksDetailViewProps {
  school: SchoolData;
  initialPacks: PackItem[];
  deletePackAction?: (id: string) => Promise<void>;
}

function money(v: number): string {
  return `R ${v.toFixed(2)}`;
}

function extractGradeLabel(title: string, slug?: string | null): string {
  const text = `${title} ${slug ?? ""}`;
  const match = text.match(/grade\s*([r\d]+)/i);
  if (match) {
    const val = match[1].toUpperCase();
    return val === "R" ? "Grade R – Stationery Pack" : `Grade ${val} – Stationery Pack`;
  }
  return title;
}

export function SchoolPacksDetailView({
  school,
  initialPacks,
  deletePackAction,
}: SchoolPacksDetailViewProps) {
  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("last-edited");

  const totalPacks = initialPacks.length;
  const { publishedPacks, totalItemsCount, totalRevenue } = useMemo(() => {
    let publishedPacks = 0;
    let totalItemsCount = 0;
    let totalRevenue = 0;
    for (const p of initialPacks) {
      if (p.visible) publishedPacks++;
      totalItemsCount += p.item_count || 0;
      totalRevenue += p.price || 0;
    }
    return { publishedPacks, totalItemsCount, totalRevenue };
  }, [initialPacks]);

  const filteredPacks = useMemo(() => {
    return initialPacks.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.slug && p.slug.toLowerCase().includes(search.toLowerCase()));
      const matchVis =
        visibilityFilter === "all" ||
        (visibilityFilter === "visible" && p.visible) ||
        (visibilityFilter === "hidden" && !p.visible);
      return matchSearch && matchVis;
    });
  }, [initialPacks, search, visibilityFilter]);

  const schoolIdentifier = school.slug || school.id;

  return (
    <div className={styles.container}>
      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/admin/packs"
          className={styles.secondaryBtn}
          style={{ height: 32, fontSize: 11, background: "transparent", border: "none", color: "#94a3b8", paddingLeft: 0 }}
        >
          <ArrowLeft size={14} /> Back to school packs
        </Link>
      </div>

      {/* Header Row */}
      <div className={styles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>
            {school.name}{" "}
            <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>
              {totalPacks} {totalPacks === 1 ? "Grade pack" : "Grade packs"}
            </span>
          </h1>
        </div>
        <div className={styles.headerActions}>
          <Link
            href={`/admin/packs/${schoolIdentifier}/add-pack`}
            className={styles.primaryBtn}
          >
            <Plus size={14} /> Add pack
          </Link>
        </div>
      </div>

      {/* Metric Summary Row (5 cards matching screenshot) */}
      <div className={styles.metricsGrid5}>
        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Grade Packs</span>
            <div className={`${styles.metricIconWrapper} ${styles.metricIconTeal}`}>
              <Box size={16} />
            </div>
          </div>
          <div className={styles.metricValue}>{totalPacks}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>Total packs</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Published</span>
            <div className={`${styles.metricIconWrapper} ${styles.metricIconBlue}`}>
              <BookOpen size={16} />
            </div>
          </div>
          <div className={styles.metricValue}>{publishedPacks}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>
            {totalPacks > 0 ? Math.round((publishedPacks / totalPacks) * 100) : 0}% published
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Total Items</span>
            <div className={`${styles.metricIconWrapper} ${styles.metricIconTeal}`}>
              <Layers size={16} />
            </div>
          </div>
          <div className={styles.metricValue}>{totalItemsCount}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>Across all packs</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Revenue to Date</span>
            <div className={`${styles.metricIconWrapper} ${styles.metricIconTeal}`}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>R</span>
            </div>
          </div>
          <div className={styles.metricValue}>{money(totalRevenue)}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>From grade packs</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Last Updated</span>
            <div className={`${styles.metricIconWrapper} ${styles.metricIconTeal}`}>
              <Calendar size={16} />
            </div>
          </div>
          <div className={styles.metricValue} style={{ fontSize: 16, marginTop: 8 }}>
            May 21, 2024
          </div>
          <div style={{ fontSize: 11, color: "#64748b" }}>By Liam Morgan</div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className={styles.detailLayout}>
        {/* Left Column: Table and Toolbar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Controls Bar */}
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <div className={styles.searchBox}>
                <Search />
                <input
                  className={styles.searchInput}
                  placeholder="Search grade packs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <button className={styles.secondaryBtn} type="button">
                <SlidersHorizontal size={14} /> Filters
              </button>

              <select
                className={styles.selectInput}
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
              >
                <option value="all">Visibility ⌵</option>
                <option value="visible">Visible only</option>
                <option value="hidden">Hidden only</option>
              </select>
            </div>

            <div className={styles.toolbarRight}>
              <select
                className={styles.selectInput}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="last-edited">Last Edited ⌵</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
              </select>
            </div>
          </div>

          {/* Data Table */}
          <div className={styles.tableCard}>
            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>GRADE PACK</th>
                    <th>PRICE</th>
                    <th>ITEMS</th>
                    <th>VISIBILITY</th>
                    <th>STATUS</th>
                    <th>LAST EDITED</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPacks.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: 32, color: "#64748b" }}>
                        No grade packs found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredPacks.map((pack) => {
                      const formattedGrade = extractGradeLabel(pack.title, pack.slug);

                      return (
                        <tr key={pack.id} className={styles.dataRow}>
                          <td>
                            <div>
                              <div>
                                <span className={styles.gradePackLink} style={{ cursor: "default", color: "#ffffff" }}>
                                  {formattedGrade}
                                </span>
                              </div>
                              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                                {school.name}
                              </div>
                            </div>
                          </td>
                          <td style={{ fontWeight: 700, color: "#ffffff" }}>
                            {money(pack.price)}
                          </td>
                          <td>
                            <span style={{ color: "#ffffff", fontWeight: 600 }}>
                              {pack.item_count}
                            </span>{" "}
                            <span style={{ color: "#64748b", fontSize: 11 }}>items</span>
                          </td>
                          <td>
                            <span className={styles.badgeTeal} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <Eye size={12} /> {pack.visible ? "Visible" : "Hidden"}
                            </span>
                          </td>
                          <td>
                            <span className={styles.badgeGreen}>Published</span>
                          </td>
                          <td>
                            <div style={{ color: "#ffffff", fontWeight: 500 }}>May 21, 2024</div>
                            <div style={{ color: "#64748b", fontSize: 11 }}>Liam Morgan</div>
                          </td>
                          <td>
                            <div className={styles.actionIconBtnGroup}>
                              <Link
                                href={`/admin/packs/${pack.slug || pack.id}`}
                                className={`${styles.actionIconBtn} ${styles.actionIconBtnTeal}`}
                                title="Edit Pack"
                              >
                                <Edit2 size={13} />
                              </Link>
                              <VisibleToggle id={pack.id} visible={pack.visible} />
                              <DuplicateButton id={pack.id} title={pack.title} />
                              {deletePackAction && (
                                <form action={deletePackAction.bind(null, pack.id)}>
                                  <ConfirmButton
                                    label=""
                                    icon={<Trash2 size={13} />}
                                    title="Delete Pack Permanently"
                                    confirmLabel="Delete Pack"
                                    confirmText={`Permanently delete "${pack.title}"`}
                                    busyLabel=""
                                    className={`${styles.actionIconBtn} ${styles.actionIconBtnRed}`}
                                  />
                                </form>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className={styles.paginationFooter}>
              <span>
                Showing 1 to {filteredPacks.length} of {filteredPacks.length} grade packs
              </span>
              <div className={styles.paginationControls}>
                <button className={styles.pageBtn}>&lt;</button>
                <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
                <button className={styles.pageBtn}>&gt;</button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <select className={styles.selectInput} style={{ height: 26, padding: "0 4px", fontSize: 11 }}>
                  <option>10 per page</option>
                  <option>20 per page</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className={styles.sidebarColumn}>
          {/* School Health Card */}
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <HeartPulse size={16} style={{ color: "#2dd4bf" }} />
                <span>School Health</span>
              </div>
              <span className={styles.badgeGreen} style={{ fontSize: 10 }}>Healthy</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>Grade Packs</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className={styles.sidebarStatVal}>{totalPacks} / {totalPacks}</span>
                  <span style={{ color: "#34d399", fontWeight: 700, fontSize: 11 }}>100%</span>
                </div>
              </div>

              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>Published Packs</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className={styles.sidebarStatVal}>{publishedPacks}</span>
                  <span style={{ color: "#34d399", fontWeight: 700, fontSize: 11 }}>100%</span>
                </div>
              </div>

              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>Total Items</span>
                <span className={styles.sidebarStatVal}>{totalItemsCount}</span>
              </div>

              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>Last Activity</span>
                <span className={styles.sidebarStatVal}>May 21, 2024</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <Zap size={16} style={{ color: "#2dd4bf" }} />
                <span>Quick Actions</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link
                href={`/admin/packs/${schoolIdentifier}/add-pack`}
                className={styles.quickActionItem}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Plus size={14} style={{ color: "#2dd4bf" }} />
                  <span>Add new pack</span>
                </div>
                <ChevronRight size={14} style={{ color: "#64748b" }} />
              </Link>

              <button className={styles.quickActionItem} type="button">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Copy size={14} style={{ color: "#2dd4bf" }} />
                  <span>Duplicate existing pack</span>
                </div>
                <ChevronRight size={14} style={{ color: "#64748b" }} />
              </button>

              <button className={styles.quickActionItem} type="button">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Download size={14} style={{ color: "#2dd4bf" }} />
                  <span>Import packs from template</span>
                </div>
                <ChevronRight size={14} style={{ color: "#64748b" }} />
              </button>

              <button className={styles.quickActionItem} type="button">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Upload size={14} style={{ color: "#2dd4bf" }} />
                  <span>Export school packs</span>
                </div>
                <ChevronRight size={14} style={{ color: "#64748b" }} />
              </button>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <Clock size={16} style={{ color: "#2dd4bf" }} />
                <span>Recent Activity</span>
              </div>
              <Link href="#" style={{ fontSize: 11, color: "#2dd4bf", textDecoration: "none" }}>
                View all
              </Link>
            </div>

            <div className={styles.activityList}>
              <div className={styles.activityItem}>
                <div className={styles.activityTitle}>Grade R – Stationery Pack updated</div>
                <div className={styles.activityMeta}>May 21, 2024 • 10:24 AM • Liam Morgan</div>
              </div>

              <div className={styles.activityItem}>
                <div className={styles.activityTitle}>Grade R – Stationery Pack created</div>
                <div className={styles.activityMeta}>May 21, 2024 • 10:15 AM • Liam Morgan</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
