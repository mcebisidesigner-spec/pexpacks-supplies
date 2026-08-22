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
import adminStyles from "@/app/admin/admin.module.css";
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
          className={`${styles.secondaryBtn} ${styles.backBtn}`}
        >
          <ArrowLeft size={14} /> Back to school packs
        </Link>
      </div>

      {/* Header Row */}
      <div className={adminStyles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>
            {school.name}{" "}
            <span className={styles.headerSubtitleBadge}>
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

      {/* Metric Summary Row (5 cards) */}
      <div className={adminStyles.metricsGrid5}>
        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Grade Packs</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconTeal}`}>
              <Box size={16} />
            </div>
          </div>
          <div className={adminStyles.metricValue}>{totalPacks}</div>
          <div className={styles.metricSubtext}>Total packs</div>
        </div>

        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Published</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconBlue}`}>
              <BookOpen size={16} />
            </div>
          </div>
          <div className={adminStyles.metricValue}>{publishedPacks}</div>
          <div className={styles.metricSubtext}>
            {totalPacks > 0 ? Math.round((publishedPacks / totalPacks) * 100) : 0}% published
          </div>
        </div>

        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Total Items</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconTeal}`}>
              <Layers size={16} />
            </div>
          </div>
          <div className={adminStyles.metricValue}>{totalItemsCount}</div>
          <div className={styles.metricSubtext}>Across all packs</div>
        </div>

        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Revenue to Date</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconTeal}`}>
              <span className={adminStyles.currencyText}>R</span>
            </div>
          </div>
          <div className={adminStyles.metricValue}>{money(totalRevenue)}</div>
          <div className={styles.metricSubtext}>From grade packs</div>
        </div>

        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Last Updated</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconTeal}`}>
              <Calendar size={16} />
            </div>
          </div>
          <div className={`${adminStyles.metricValue} ${styles.metricValueDate}`}>
            May 21, 2024
          </div>
          <div className={styles.metricSubtext}>By Liam Morgan</div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className={adminStyles.detailLayout}>
        {/* Left Column: Table and Toolbar */}
        <div className={adminStyles.leftColumn}>
          {/* Controls Bar */}
          <div className={adminStyles.toolbar}>
            <div className={styles.toolbarLeft}>
              <div className={styles.searchBox}>
                <Search />
                <input
                  className={adminStyles.searchInput}
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
          <div className={adminStyles.tableCard}>
            <div className={adminStyles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>GRADE PACK</th>
                    <th>PRICE</th>
                    <th>ITEMS</th>
                    <th>VISIBILITY</th>
                    <th>LAST EDITED</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPacks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={adminStyles.emptyCell}>
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
                                <Link href={`/admin/packs/${pack.slug || pack.id}`} className={adminStyles.gradePackLink}>
                                  {formattedGrade}
                                </Link>
                              </div>
                              <div className={adminStyles.schoolNameSub}>
                                {school.name}
                              </div>
                            </div>
                          </td>
                          <td className={adminStyles.textWhiteBold}>
                            {money(pack.price)}
                          </td>
                          <td>
                            <span className={adminStyles.itemCountSpan}>
                              {pack.item_count}
                            </span>{" "}
                            <span className={adminStyles.itemCountLabel}>items</span>
                          </td>
                          <td>
                            <span className={`${adminStyles.badgeTeal} ${styles.badgeIconWrap}`}>
                              <Eye size={12} /> {pack.visible ? "Visible" : "Hidden"}
                            </span>
                          </td>
                          <td>
                            <div className={adminStyles.textWhiteMedium}>May 21, 2024</div>
                            <div className={adminStyles.itemCountLabel}>Liam Morgan</div>
                          </td>
                          <td>
                            <div className={adminStyles.actionIconBtnGroup}>
                              <Link
                                href={`/admin/packs/${pack.slug || pack.id}`}
                                className={`${adminStyles.actionIconBtn} ${adminStyles.actionIconBtnTeal}`}
                                title="Edit Pack"
                              >
                                <Edit2 size={13} />
                              </Link>
                              <VisibleToggle id={pack.id} visible={pack.visible} />
                              {deletePackAction && (
                                <form action={deletePackAction.bind(null, pack.id)}>
                                  <ConfirmButton
                                    label=""
                                    icon={<Trash2 size={13} />}
                                    title="Delete Pack Permanently"
                                    confirmLabel="Delete Pack"
                                    confirmText={`Permanently delete "${pack.title}"`}
                                    busyLabel=""
                                    className={`${adminStyles.actionIconBtn} ${adminStyles.actionIconBtnRed}`}
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
              <div className={adminStyles.paginationControls}>
                <button className={styles.pageBtn}>&lt;</button>
                <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
                <button className={styles.pageBtn}>&gt;</button>
              </div>
              <div className={adminStyles.paginationSelectWrap}>
                <select className={`${styles.selectInput} ${adminStyles.paginationSelect}`}>
                  <option>10 per page</option>
                  <option>20 per page</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className={adminStyles.sidebarColumn}>
          {/* School Health Card */}
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <HeartPulse size={16} className={adminStyles.iconTeal} />
                <span>School Health</span>
              </div>
              <span className={`${adminStyles.badgeGreen} ${adminStyles.badgeTiny}`}>Healthy</span>
            </div>

            <div className={adminStyles.sidebarStack}>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Grade Packs</span>
                <div className={adminStyles.sidebarStatGroup}>
                  <span className={adminStyles.sidebarStatVal}>{totalPacks} / {totalPacks}</span>
                  <span className={adminStyles.sidebarStatPercent}>100%</span>
                </div>
              </div>

              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Published Packs</span>
                <div className={adminStyles.sidebarStatGroup}>
                  <span className={adminStyles.sidebarStatVal}>{publishedPacks}</span>
                  <span className={adminStyles.sidebarStatPercent}>100%</span>
                </div>
              </div>

              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Total Items</span>
                <span className={adminStyles.sidebarStatVal}>{totalItemsCount}</span>
              </div>

              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Last Activity</span>
                <span className={adminStyles.sidebarStatVal}>May 21, 2024</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Zap size={16} className={adminStyles.iconTeal} />
                <span>Quick Actions</span>
              </div>
            </div>

            <div className={`${adminStyles.sidebarStack} ${adminStyles.gap8}`}>
              <Link
                href={`/admin/packs/${schoolIdentifier}/add-pack`}
                className={adminStyles.quickActionItem}
              >
                <div className={adminStyles.sidebarStatGroup}>
                  <Plus size={14} className={adminStyles.iconTeal} />
                  <span>Add new pack</span>
                </div>
                <ChevronRight size={14} className={adminStyles.iconMuted} />
              </Link>

              <button className={adminStyles.quickActionItem} type="button">
                <div className={adminStyles.sidebarStatGroup}>
                  <Copy size={14} className={adminStyles.iconTeal} />
                  <span>Duplicate existing pack</span>
                </div>
                <ChevronRight size={14} className={adminStyles.iconMuted} />
              </button>

              <button className={adminStyles.quickActionItem} type="button">
                <div className={adminStyles.sidebarStatGroup}>
                  <Download size={14} className={adminStyles.iconTeal} />
                  <span>Import packs from template</span>
                </div>
                <ChevronRight size={14} className={adminStyles.iconMuted} />
              </button>

              <button className={adminStyles.quickActionItem} type="button">
                <div className={adminStyles.sidebarStatGroup}>
                  <Upload size={14} className={adminStyles.iconTeal} />
                  <span>Export school packs</span>
                </div>
                <ChevronRight size={14} className={adminStyles.iconMuted} />
              </button>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Clock size={16} className={adminStyles.iconTeal} />
                <span>Recent Activity</span>
              </div>
              <Link href="#" className={adminStyles.sidebarHeaderLink}>
                View all
              </Link>
            </div>

            <div className={adminStyles.activityList}>
              <div className={adminStyles.activityItem}>
                <div className={adminStyles.activityTitle}>Grade R – Stationery Pack updated</div>
                <div className={adminStyles.activityMeta}>May 21, 2024 • 10:24 AM • Liam Morgan</div>
              </div>

              <div className={adminStyles.activityItem}>
                <div className={adminStyles.activityTitle}>Grade R – Stationery Pack created</div>
                <div className={adminStyles.activityMeta}>May 21, 2024 • 10:15 AM • Liam Morgan</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
