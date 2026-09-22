/**
 * PexpacksDetails Tailwind styles mapping.
 * Replaces the retired PexpacksDetails.module.css with pure Tailwind CSS classes.
 */
export const pexpacksDetailsStyles = {
  container: "flex flex-col gap-6 w-full max-w-7xl mx-auto",
  backButton:
    "inline-flex items-center gap-2 px-3.5 py-2 bg-[var(--db-surface,#0c1322)] border border-[var(--db-border,#1e293b)] rounded-lg text-slate-400 text-xs font-medium hover:bg-slate-800 hover:text-white transition-all w-fit no-underline",
  layoutGrid:
    "grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start",
  sidebarCard:
    "bg-[var(--db-surface,#0c1322)] border border-[var(--db-border,#1e293b)] rounded-xl p-5 flex flex-col gap-4 shadow-sm",
  sidebarHeader: "pb-3 border-b border-[var(--db-border,#1e293b)]",
  sidebarTitle:
    "text-lg font-bold text-white tracking-tight m-0 mb-1",
  sidebarSubtitle: "text-xs text-slate-400 m-0 leading-relaxed",
  navMenu: "flex flex-col gap-1.5",
  navItem:
    "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-400 bg-transparent border border-transparent cursor-pointer text-left hover:bg-slate-800 hover:text-white transition-all w-full",
  navItemActive:
    "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-bold hover:bg-emerald-500/20 hover:text-emerald-300",
  contentPanel: "flex flex-col gap-5 min-w-0",
  sectionHeader:
    "bg-[var(--db-surface,#0c1322)] border border-[var(--db-border,#1e293b)] rounded-xl p-5 sm:px-6 flex justify-between items-center gap-4 flex-wrap",
  sectionTitle: "text-base font-bold text-white tracking-tight m-0",
  sectionSubtitle: "text-xs text-slate-400 m-0 mt-0.5",
  noticeBanner:
    "flex items-start gap-3 bg-blue-950/20 border border-blue-900/40 rounded-lg p-3.5 text-blue-300 text-xs leading-relaxed",
  cardsGrid: "grid grid-cols-1 sm:grid-cols-2 gap-4",
  card: "bg-[var(--db-surface,#0c1322)] border border-[var(--db-border,#1e293b)] rounded-xl p-5 flex flex-col justify-between gap-4 transition-colors hover:border-slate-700 shadow-sm",
  cardHeader: "flex justify-between items-start gap-2",
  cardTitle: "text-sm font-bold text-white m-0",
  cardSubtitle: "text-xs text-slate-400 m-0",
  cardBody: "flex flex-col gap-2",
  infoRow: "flex justify-between items-center text-xs py-1 border-b border-slate-800/60 last:border-0",
  infoLabel: "text-slate-400",
  infoValue: "text-slate-200 font-medium text-right",
  cardActionRow: "flex justify-end pt-3 border-t border-slate-800/80",
  manageBtn:
    "inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--db-surface-inner,#090e17)] border border-[var(--db-border,#1e293b)] rounded-md text-slate-300 text-xs font-semibold hover:border-emerald-500 hover:text-emerald-400 transition-all cursor-pointer",
  formCard:
    "bg-[var(--db-surface,#0c1322)] border border-[var(--db-border,#1e293b)] rounded-xl p-5 sm:p-6 flex flex-col gap-5 shadow-sm",
  formGrid2: "grid grid-cols-1 sm:grid-cols-2 gap-4",
  formField: "flex flex-col gap-2",
  formLabel: "text-xs font-semibold leading-4 text-[var(--db-text-secondary)]",
  formInput:
    "h-11 rounded-lg border border-[var(--db-border-strong)] bg-[var(--db-surface-elevated)] px-3.5 text-sm text-[var(--db-text-primary)] outline-none transition-all duration-150 focus:border-[var(--db-brand)] focus:ring-4 focus:ring-[var(--db-brand-subtle)]",
  formTextarea:
    "min-h-24 rounded-lg border border-[var(--db-border-strong)] bg-[var(--db-surface-elevated)] p-3.5 text-sm leading-relaxed text-[var(--db-text-primary)] outline-none transition-all duration-150 focus:border-[var(--db-brand)] focus:ring-4 focus:ring-[var(--db-brand-subtle)]",
  actionFooter: "flex justify-end items-center gap-3 pt-4 border-t border-[var(--db-border,#1e293b)]",
  cancelBtn:
    "px-4 py-2 bg-transparent border border-[var(--db-border,#1e293b)] rounded-lg text-slate-300 text-xs font-semibold hover:bg-slate-800 hover:text-white transition-colors cursor-pointer",
  saveBtn:
    "px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
};

export default pexpacksDetailsStyles;
