/**
 * LetterActionWorkbench Tailwind styles mapping.
 * Replaces the retired LetterActionWorkbench.module.css with Tailwind CSS classes.
 */
export const letterWorkbenchStyles = {
  workbenchContainer:
    "mt-8 bg-[var(--db-surface-elevated,#0c1322)] border border-[var(--db-border,#1e293b)] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200 scroll-mt-20",
  workbenchHeader:
    "flex items-center justify-between p-4 sm:px-6 border-b border-[var(--db-border,#1e293b)] bg-[var(--db-surface-inner,#090e17)] gap-4 flex-wrap",
  headerLeft: "flex items-center gap-3.5 min-w-0",
  iconBadge:
    "flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0",
  headerTitles: "flex flex-col min-w-0",
  titleRow: "flex items-center gap-2.5 flex-wrap",
  refBadge:
    "font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  titleText:
    "text-sm sm:text-base font-bold text-white m-0 truncate max-w-md",
  subtitleText: "text-xs text-slate-400 m-0 mt-0.5",
  headerActions: "flex items-center gap-2 flex-wrap",
  tabBtn:
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border border-[var(--db-border,#1e293b)] bg-[var(--db-surface,#0c1322)] text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-800 transition-all no-underline",
  tabBtnActive:
    "bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:text-emerald-300",
  btnPrimary:
    "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all border border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm",
  closeBtn:
    "flex items-center justify-center w-8 h-8 rounded-lg bg-transparent border-0 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1",
  pdfViewerWrapper:
    "relative w-full h-[780px] bg-slate-950 flex items-center justify-center",
  pdfLoadingOverlay:
    "absolute inset-0 bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-400 z-10",
  spinner: "animate-spin text-emerald-400",
  pdfIframe: "w-full h-full border-0",
  emailFormWrapper:
    "p-6 sm:p-8 flex flex-col gap-4 max-w-3xl mx-auto w-full",
  formGroup: "flex flex-col gap-1.5",
  formLabel:
    "text-[11px] font-bold uppercase tracking-wider text-slate-400",
  formInput:
    "h-11 w-full rounded-lg border border-[var(--db-border-strong)] bg-[var(--db-surface-elevated)] px-3.5 font-inherit text-sm text-[var(--db-text-primary)] outline-none transition-all duration-150 focus:border-[var(--db-brand)] focus:ring-4 focus:ring-[var(--db-brand-subtle)]",
  formInputReadOnly:
    "bg-[var(--db-surface-inner,#090e17)] text-slate-400 cursor-not-allowed",
  formTextarea:
    "min-h-36 w-full resize-y rounded-lg border border-[var(--db-border-strong)] bg-[var(--db-surface-elevated)] p-3.5 font-mono text-sm leading-relaxed text-[var(--db-text-primary)] outline-none transition-all duration-150 focus:border-[var(--db-brand)] focus:ring-4 focus:ring-[var(--db-brand-subtle)]",
  attachmentCard:
    "flex items-center justify-between p-3 sm:px-4 bg-[var(--db-surface-inner,#090e17)] border border-[var(--db-border,#1e293b)] rounded-lg text-xs text-slate-400",
  attachmentBadge: "font-mono font-bold text-emerald-400",
  statusMessageSuccess:
    "flex items-center gap-2.5 p-3 rounded-lg text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-400",
  statusMessageError:
    "flex items-center gap-2.5 p-3 rounded-lg text-xs bg-rose-500/15 border border-rose-500/30 text-rose-400",
  formFooter: "flex items-center justify-end gap-3 pt-2.5",
  btnSecondary:
    "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer bg-[var(--db-surface,#0c1322)] border border-[var(--db-border,#1e293b)] text-slate-300 hover:text-white hover:border-slate-700 transition-colors",
};

export default letterWorkbenchStyles;
