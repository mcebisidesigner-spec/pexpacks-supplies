/**
 * SettingsControlCentre Tailwind styles object.
 * Replaces the retired SettingsControlCentre.module.css with Tailwind CSS classes.
 */
export const settingsStyles = {
  container: "flex flex-col gap-5 w-full",
  header:
    "flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 border border-[var(--a-border,#1e293b)] rounded-2xl bg-[var(--a-surface,#0c1322)]",
  headerTitleGroup: "flex flex-col gap-1",
  headerTitle: "m-0 text-xl sm:text-2xl font-extrabold text-white tracking-tight",
  headerSubtitle: "m-0 text-xs sm:text-sm text-slate-400",
  searchWrapper: "relative w-full sm:max-w-[380px]",
  searchInput:
    "w-full h-11 pl-9 pr-11 text-sm font-medium rounded-lg border border-[var(--db-border-strong)] bg-[var(--db-surface-elevated)] text-[var(--db-text-primary)] placeholder:text-[var(--db-text-subtle)] outline-none focus:border-[var(--db-brand)] focus:ring-4 focus:ring-[var(--db-brand-subtle)] transition-all",
  searchIcon:
    "absolute left-3 top-3 w-4 h-4 text-slate-500 pointer-events-none",
  searchKbd:
    "absolute right-3 top-2.5 px-1.5 py-0.5 border border-slate-700 rounded bg-slate-800 text-slate-400 text-[10px] font-bold",
  searchResultsDropdown:
    "absolute top-[calc(100%+8px)] left-0 z-50 w-full max-h-[360px] overflow-y-auto p-2 border border-slate-700 rounded-xl bg-[var(--db-surface,#0c1322)] shadow-2xl",
  searchResultItem:
    "flex flex-col gap-1 p-2.5 rounded-lg text-white hover:bg-emerald-500/10 cursor-pointer w-full text-left transition-colors",
  searchResultHeader: "flex items-center justify-between",
  searchResultTitle: "text-xs font-bold text-white",
  searchResultCategory:
    "px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 text-[10px] font-bold",
  searchResultDesc: "text-[11px] text-slate-400",
  dbWarning:
    "flex flex-col gap-1 p-3.5 sm:px-4 border border-amber-500/40 rounded-xl bg-amber-500/10 text-slate-100 text-xs",
  layout:
    "grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5 items-start",
  sidebar:
    "flex flex-col gap-1 p-3 border border-[var(--a-border,#1e293b)] rounded-2xl bg-[var(--a-surface,#0c1322)]",
  categoryButton:
    "flex items-center gap-3 w-full p-2.5 sm:px-3.5 border border-transparent rounded-xl text-slate-300 text-xs font-semibold text-left cursor-pointer hover:bg-slate-800/60 hover:text-white transition-all",
  categoryButtonActive:
    "border-emerald-500/30 bg-emerald-500/15 text-emerald-400 font-bold hover:bg-emerald-500/20 hover:text-emerald-300",
  categoryIcon: "w-4 h-4 shrink-0",
  sidebarSaveAction:
    "flex items-center justify-center gap-2.5 w-full mt-3 p-3 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold cursor-pointer hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  contentArea: "flex flex-col gap-5 min-w-0",
  panelCard:
    "p-5 sm:p-6 border border-[var(--a-border,#1e293b)] rounded-2xl bg-[var(--a-surface,#0c1322)] shadow-sm",
  panelHeader:
    "mb-5 pb-3 border-b border-[var(--a-border,#1e293b)] flex flex-col gap-1",
  formGrid: "grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5",
  field: "flex flex-col gap-2",
  label: "text-xs font-semibold leading-4 text-[var(--db-text-secondary)]",
  input:
    "w-full h-11 px-3.5 border border-[var(--db-border-strong)] rounded-lg bg-[var(--db-surface-elevated)] text-sm text-[var(--db-text-primary)] placeholder:text-[var(--db-text-subtle)] outline-none focus:border-[var(--db-brand)] focus:ring-4 focus:ring-[var(--db-brand-subtle)] transition-all",
  select:
    "w-full h-11 px-3.5 border border-[var(--db-border-strong)] rounded-lg bg-[var(--db-surface-elevated)] text-sm text-[var(--db-text-primary)] outline-none focus:border-[var(--db-brand)] focus:ring-4 focus:ring-[var(--db-brand-subtle)] transition-all",
  textarea:
    "w-full min-h-24 resize-y p-3.5 border border-[var(--db-border-strong)] rounded-lg bg-[var(--db-surface-elevated)] text-sm leading-relaxed text-[var(--db-text-primary)] outline-none focus:border-[var(--db-brand)] focus:ring-4 focus:ring-[var(--db-brand-subtle)] transition-all",
  hint: "text-xs leading-relaxed text-[var(--db-text-muted)]",
  checkboxLabel:
    "flex items-center gap-2.5 text-xs font-semibold text-slate-200 cursor-pointer",
  actionsRow:
    "flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[var(--a-border,#1e293b)] flex-wrap",
  saveButton:
    "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[var(--db-brand)] px-5 text-sm font-semibold text-slate-950 shadow-sm transition-all hover:-translate-y-px hover:bg-[var(--db-brand-strong)] hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--db-brand-subtle)] disabled:cursor-not-allowed disabled:opacity-50",
  discardButton:
    "inline-flex h-11 items-center justify-center rounded-lg border border-[var(--db-border-strong)] bg-transparent px-4 text-sm font-medium text-[var(--db-text-secondary)] transition-all hover:-translate-y-px hover:border-[var(--db-brand)] hover:bg-[var(--db-brand-subtle)] hover:text-[var(--db-text-primary)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--db-brand-subtle)]",
  badgeSuccess:
    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold",
  badgeWarning:
    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 text-xs font-bold",
  badgeDanger:
    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-400 text-xs font-bold",
  table: "w-full border-collapse mt-3 text-xs text-slate-200",
  precedenceBox:
    "p-4 border border-emerald-500/30 rounded-xl bg-emerald-500/5 mt-4 text-xs text-slate-300 flex flex-col gap-1.5",
  recalcWarning:
    "flex items-start gap-3.5 p-3.5 sm:px-4 mb-5 border border-yellow-500/35 rounded-xl bg-yellow-500/10 text-xs text-slate-200",
  recalcWarningIcon: "text-lg shrink-0 mt-0.5",
  pexcoverRatesPanel:
    "flex flex-col gap-3.5 p-4 sm:p-5 mt-5 border border-indigo-500/30 rounded-xl bg-indigo-500/5 text-xs text-slate-200",
  pexcoverRatesHeader: "flex items-start gap-3",
  pexcoverRatesTable: "w-full border-collapse text-xs",
  pexcoverClassification:
    "flex flex-col gap-2.5 pt-2 border-t border-indigo-500/20",
  pexcoverClassificationTitle:
    "text-xs font-bold text-indigo-300 uppercase tracking-wide",
  pexcoRatePrefix: "mr-1 text-slate-400 font-bold text-xs",
  pexcoRateInput:
    "w-24 px-2 py-1 text-right text-xs font-mono rounded bg-slate-900 border border-indigo-500/30 text-white",
};

export default settingsStyles;
