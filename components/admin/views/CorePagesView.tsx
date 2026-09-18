/**
 * CorePagesView — shared admin "core pages" design system, now in Tailwind.
 *
 * Replaces the retired CorePagesView.module.css (698 lines). Every class the
 * 19 consumers used is provided here as a Tailwind utility fragment, composed
 * with the admin design tokens (--db-* / --a-* vars consumed as arbitrary
 * values). Kept as plain exported consts (not cva) because these are layout
 * primitives reused by many pages — exactly the pattern used across Phase 1-4.
 *
 * Tailwind v4: arbitrary values (e.g. text-[13px], bg-[rgba(15,23,42,0.6)])
 * compile to CSS custom-property-backed rules automatically.
 */

export const corePages = {
  /* ── Page Container ── */
  container:
    "flex flex-col gap-[18px] min-w-0 w-full text-[var(--a-text-2)] font-[var(--font-sans,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif)] tracking-[-0.01em]",

  packEditorContainer: "gap-[14px]",

  /* ── Header ── */
  headerTitleGroup: "flex flex-col gap-[4px]",

  headerTitle:
    "m-0 text-[28px] font-extrabold text-[var(--a-text)] tracking-[-0.03em] leading-[1.15] flex items-baseline gap-[8px]",

  headerSubtitle: "m-0 text-[13px] font-medium text-[var(--a-text-3)]",

  sectionHeaderTitle: "m-0 text-[16px] font-bold text-[var(--a-text)] tracking-[-0.01em]",
  sectionSubtitle: "m-0 text-[12.5px] font-medium text-[var(--a-text-3)]",

  headerSubtitleBadge: "text-[13px] text-[var(--a-text-3)] font-medium",

  headerMeta: "mt-[2px] mb-0 text-[12px] font-medium text-[var(--a-text-3)]",

  headerActions: "flex items-center gap-[10px]",

  headerSaveBtn:
    "min-w-[88px] h-[var(--a-btn-h,36px)] justify-center rounded-[var(--a-btn-radius,8px)]",

  /* ── Buttons ── */
  primaryBtn:
    "inline-flex items-center justify-center gap-[8px] h-[var(--a-btn-h,40px)] px-[20px] rounded-[8px] text-white font-[700] text-[14px] cursor-pointer no-underline transition-all",
  primaryBtnHover: "hover:bg-[#059669] hover:bg-[linear-gradient(135deg,#34d399_0%,#10b981_100%)] hover:text-white hover:border-[#34d399] hover:shadow-[0_4px_16px_rgba(16,185,129,0.45)] hover:-translate-y-[1px]",
  primaryBtnDisabled: "disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none",

  secondaryBtn:
    "inline-flex items-center justify-center gap-[8px] h-[var(--a-btn-h,40px)] px-[18px] bg-[var(--a-surface-2,var(--db-surface-inner))] border border-[var(--a-border-strong,rgba(30,41,59,0.6))] rounded-[8px] text-[var(--a-text-2,var(--db-text-secondary))] text-[13px] font-semibold cursor-pointer no-underline transition-all",
  secondaryBtnHover:
    "hover:bg-[var(--a-surface-3,var(--db-border))] hover:border-[var(--a-text-4,var(--db-text-subtle))] hover:text-white hover:-translate-y-[1px]",
  secondaryBtnDisabled: "disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none",

  fullWidthBtn: "w-full justify-center",

  backBtn:
    "h-[32px] text-[11px] bg-transparent border-none text-[var(--a-text-3)] pl-0",

  /* ── Toolbar ── */
  toolbar: "flex items-center justify-between flex-wrap gap-[10px]",

  toolbarLeft: "flex items-center gap-[8px] flex-wrap",

  toolbarRight: "flex items-center gap-[8px]",

  searchBox: "relative w-[240px]",

  selectInput:
    "h-[36px] px-[10px] bg-[var(--a-surface)] border border-[var(--a-border)] rounded-[var(--a-radius)] text-[var(--a-text-2)] text-[12px] cursor-pointer",

  /* ── Tabs ── */
  tabsRow:
    "flex items-center gap-[6px] overflow-x-auto pb-[8px] border-b border-[var(--a-border)] mb-[16px]",

  tabBtn:
    "h-[32px] px-[12px] rounded-[6px] bg-transparent border border-transparent text-[var(--a-text-3)] text-[12px] font-semibold cursor-pointer whitespace-nowrap transition-colors duration-[140ms] hover:bg-[rgba(30,41,59,0.5)] hover:text-white",
  tabBtnActive:
    "bg-[rgba(16,185,129,0.14)] border-[rgba(16,185,129,0.4)] text-[var(--db-success-text)] font-bold",

  /* ── View toggle ── */
  viewToggleGroup:
    "flex items-center bg-[var(--db-canvas)] border border-[var(--db-border)] rounded-[8px] p-[2px] gap-[2px]",

  viewToggleBtn:
    "w-[32px] h-[32px] flex items-center justify-center rounded-[6px] bg-transparent border-none text-[var(--db-text-subtle)] cursor-pointer transition-colors duration-[140ms] hover:text-white",
  viewToggleBtnActive: "bg-[var(--db-border)] text-[var(--db-brand)]",

  /* ── Kanban grid ── */
  kpiGrid:
    "grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[8px] mb-[10px]",

  packMetricsGrid: "gap-[10px]",

  metricSubtext: "text-[11px] text-[var(--a-text-3)] mt-[4px]",

  metricValueDate: "text-[15px] mt-[6px]",

  kanbanGrid:
    "grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-[16px] items-start",

  kanbanCol:
    "bg-[var(--db-surface)] border border-[rgba(30,41,59,0.9)] rounded-[12px] p-[14px] flex flex-col gap-[12px]",

  kanbanHeader: "flex items-center justify-between",

  kanbanTitle: "text-[11px] font-extrabold text-[var(--db-text-muted)] tracking-[0.05em]",

  kanbanCount:
    "px-[7px] py-[2px] bg-[var(--db-canvas)] rounded-full text-[10px] font-bold text-[var(--db-text-subtle)]",

  kanbanCardList: "flex flex-col gap-[10px] min-h-[80px]",

  kanbanCard:
    "bg-[var(--db-surface-inner)] border border-[var(--db-border)] rounded-[8px] p-[12px] cursor-pointer flex flex-col gap-[8px] transition-all duration-[140ms] hover:-translate-y-[2px] hover:border-[#3b82f6]",

  kanbanCardTop: "flex items-center justify-between gap-[6px]",

  kanbanCardTitle: "text-[13px] font-bold text-white leading-[1.3]",

  kanbanEntity: "text-[11px] text-[var(--db-info-text)] font-semibold",

  kanbanDate:
    "text-[11px] text-[var(--db-text-subtle)] inline-flex items-center gap-[4px]",

  kanbanEmpty: "p-[24px] text-center text-[12px] text-[var(--db-text-disabled)]",

  /* ── DataTable cells ── */
  dataTable:
    "w-full min-w-[700px] border-separate border-spacing-0 text-left text-[13px]",

  dataRow: "cursor-pointer",

  paginationFooter:
    "flex items-center justify-between flex-wrap gap-[12px] px-[16px] py-[12px] border-t border-[var(--a-border)] bg-[var(--a-surface-2)] text-[11px] text-[var(--a-text-3)]",

  pageBtn:
    "flex items-center justify-center min-w-[26px] h-[26px] px-[6px] bg-transparent border border-transparent rounded-[6px] text-[var(--a-text-3)] text-[11px] font-semibold cursor-pointer",
  pageBtnActive: "bg-[var(--a-accent-strong)] text-[var(--a-text)]",

  paginationEllipsis: "px-[4px] font-extrabold opacity-50",

  /* ── Badges / cells ── */
  badgeIconWrap: "inline-flex items-center gap-[4px]",

  skuBadge:
    "inline-flex items-center justify-center px-3 py-1.5 bg-[#0a1626]/70 border border-cyan-500/30 rounded-xl font-mono text-xs font-semibold text-[#38bdf8] tracking-wide whitespace-nowrap",
  itemSkuBadge: "",

  productCell: "flex flex-col gap-[3px]",

  schoolNameTitle:
    "text-white text-sm font-bold leading-tight tracking-tight no-underline transition-colors hover:text-[#00dfb6]",
  productNameLink: "",

  productBrand: "",
  productBrandLabel:
    "text-[12px] text-[var(--db-text-subtle)] font-medium",

  textMuted:
    "text-sm text-slate-300 font-medium",

  text11: "text-[var(--a-text-3)] text-[10px]",

  priceHighlight: "text-white text-[14px] font-extrabold",

  costPrice: "inline-flex items-center px-2.5 py-1 rounded-md bg-[#131d2e]/80 border border-slate-700/50 text-slate-400 text-xs font-medium",

  actionsCell: "inline-flex items-center gap-[6px]",

  actionEditBtn:
    "inline-flex items-center justify-center w-9 h-9 bg-[#0a1626] border border-[#00dfb6]/25 rounded-xl text-[#00dfb6] cursor-pointer no-underline transition-all duration-150 hover:bg-[#00dfb6]/10 hover:border-[#00dfb6]/60 hover:shadow-[0_0_12px_rgba(0,223,182,0.15)]",
  actionDeleteBtn:
    "inline-flex items-center justify-center w-9 h-9 bg-[#0a1626] border border-red-500/30 rounded-xl text-red-400 cursor-pointer transition-all duration-150 hover:bg-red-500/10 hover:border-red-500/60",

  brandAssetBox:
    "flex flex-col gap-[2px] p-[14px] bg-[var(--db-surface)] border border-[var(--db-border)] rounded-[10px]",
  brandAssetTitle: "text-[12.5px] font-bold text-white",
  brandAssetSub: "text-[11px] text-[var(--db-text-subtle)]",

  taskTitleBtn:
    "bg-transparent border-none p-0 font-[inherit] text-[13px] font-bold text-white cursor-pointer text-left transition-colors duration-[140ms] hover:text-[var(--db-brand)]",

  skuCell: "",

  /* ── Miscellaneous helpers ── */
  fw900: "font-black",
  pl12: "pl-[12px]",
  minW20: "min-w-[20px]",
  text28: "text-[28px]",
  mt12: "mt-[12px]",
  toolbarSelect: "min-w-[140px]",
  filterGroup: "flex items-center gap-[8px]",

  /* ── Master products catalogue extras ── */
  catalogueMessage: "text-[13px] text-[var(--db-text-muted)]",
  catalogueReset:
    "inline-flex items-center gap-[6px] text-[12px] font-medium text-[var(--db-brand)] cursor-pointer transition-colors duration-[140ms] hover:text-[var(--db-brand-strong)]",
  csvBanner:
    "flex items-center justify-between gap-[12px] p-[14px] rounded-[10px] bg-[var(--db-surface)] border border-[var(--db-border)]",
  resetCopy: "font-medium",
  resetIcon: "text-[13px] leading-none",

  /* ── Settings / misc extras ── */
  alignCenter: "flex items-center justify-center",
  headerContent: "flex flex-col gap-[4px]",
  sortIcon: "inline-block w-[10px] h-[10px] shrink-0 opacity-60",
};
