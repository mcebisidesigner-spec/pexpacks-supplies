/**
 * CMS Content Manager & Content Form Tailwind styles mapping.
 * Replaces the retired CmsContentManager.module.css and content-form.module.css with Tailwind CSS.
 */
export const cmsStyles: Record<string, string> = {
  cmsRoot: "flex flex-col gap-6 w-full text-slate-100",
  metricsGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
  metricCard:
    "p-5 rounded-xl border border-[var(--db-border,#1e293b)] bg-[var(--db-surface,#0c1322)] flex flex-col gap-2 shadow-sm",
  metricHeader: "flex justify-between items-center",
  metricLabel: "text-xs font-semibold text-slate-400 uppercase tracking-wider",
  metricIcon: "text-emerald-400",
  metricValue: "text-2xl font-bold text-white tabular-nums tracking-tight",
  metricSubtext: "text-xs text-slate-400 font-medium",
  tabsContainer:
    "flex items-center gap-1.5 border-b border-[var(--db-border,#1e293b)] pb-2 overflow-x-auto",
  tabButton:
    "inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer border-0 bg-transparent whitespace-nowrap",
  tabButtonActive:
    "bg-emerald-500/15 text-emerald-400 font-bold hover:bg-emerald-500/20 hover:text-emerald-300",
  tabBadge:
    "px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300",
  sectionCard:
    "p-5 sm:p-6 rounded-xl border border-[var(--db-border,#1e293b)] bg-[var(--db-surface,#0c1322)] flex flex-col gap-5 shadow-sm",
  sectionHeader:
    "flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-[var(--db-border,#1e293b)]",
  sectionTitleGroup: "flex flex-col gap-1",
  sectionTitle: "text-base font-bold text-white tracking-tight m-0",
  sectionSubtitle: "text-xs text-slate-400 m-0",
  tableWrapper: "overflow-x-auto rounded-lg border border-[var(--db-border,#1e293b)]",
  table: "w-full border-collapse text-left text-xs text-slate-200",
  badge:
    "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border",
  badgeEmerald:
    "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  badgeSlate:
    "bg-slate-800 text-slate-400 border-slate-700",
  badgeBlue:
    "bg-blue-500/15 text-blue-400 border-blue-500/30",
  actionBtnGroup: "flex items-center gap-1.5 justify-end",
  iconBtn:
    "w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer border-0 bg-transparent",
  iconBtnDelete:
    "w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer border-0 bg-transparent",
  primaryBtn:
    "inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer border-0",
  secondaryBtn:
    "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--db-surface-inner,#090e17)] border border-[var(--db-border,#1e293b)] text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer",
  emptyState:
    "flex flex-col items-center justify-center p-10 text-center text-slate-400 text-xs sm:text-sm gap-2",
  modalOverlay:
    "fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4",
  modalBox:
    "w-full max-w-lg rounded-xl bg-[var(--db-surface,#0c1322)] border border-[var(--db-border,#1e293b)] p-6 shadow-2xl flex flex-col gap-4",
  modalHeader:
    "flex justify-between items-start pb-3 border-b border-[var(--db-border,#1e293b)]",
  modalTitle: "text-base font-bold text-white m-0",
  modalBody: "flex flex-col gap-3",
  modalFooter:
    "flex justify-end gap-2 pt-3 border-t border-[var(--db-border,#1e293b)]",
  inputGroup: "flex flex-col gap-1.5",
  inputLabel: "text-xs font-semibold text-slate-300",
  textInput:
    "w-full h-9 px-3 text-xs rounded-lg bg-[var(--db-surface-inner,#090e17)] border border-[var(--db-border,#1e293b)] text-white focus:outline-none focus:border-emerald-500",
  textareaInput:
    "w-full p-3 text-xs rounded-lg bg-[var(--db-surface-inner,#090e17)] border border-[var(--db-border,#1e293b)] text-white focus:outline-none focus:border-emerald-500 min-h-[90px] leading-relaxed",
  selectInput:
    "w-full h-9 px-3 text-xs rounded-lg bg-[var(--db-surface-inner,#090e17)] border border-[var(--db-border,#1e293b)] text-white focus:outline-none focus:border-emerald-500",
  stars: "flex items-center text-amber-400 gap-0.5 text-xs",
  bannerMock:
    "p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-emerald-300 text-xs",
  previewBannerBox:
    "p-4 rounded-xl border border-dashed border-[var(--db-border,#1e293b)] bg-[var(--db-surface-inner,#090e17)] flex flex-col gap-2",
  previewBannerLabel:
    "text-[10px] font-bold uppercase tracking-wider text-slate-400",
  field: "flex flex-col gap-1.5",
  checkboxRow: "flex items-center gap-2 pt-1",
  checkLabel: "text-xs font-semibold text-slate-300 cursor-pointer flex items-center gap-2",
  error: "text-xs text-rose-400 mt-1 block",
  success: "text-xs text-emerald-400 mt-1 block",
  linkEditor: "flex flex-col gap-2 p-3 rounded-lg bg-[var(--db-surface-inner,#090e17)] border border-slate-800",
  linkRow: "flex items-center gap-2",
  linkAdd: "text-xs text-emerald-400 hover:underline font-semibold cursor-pointer w-fit inline-flex items-center gap-1",
  linkRemove: "p-1 text-slate-400 hover:text-rose-400 cursor-pointer",
};

export default cmsStyles;
