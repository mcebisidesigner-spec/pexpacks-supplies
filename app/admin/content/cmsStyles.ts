/**
 * CMS Content Dashboard Tailwind Utility Styles
 * 100% Token & Visual Parity replacement for content.module.css
 */

export const styles = {
  container: "flex flex-col gap-5 w-full min-w-0 text-db-text-secondary",

  /* ── Segmented Tab Bar ── */
  tabBar: "flex items-center gap-2 border-b border-db-border pb-3 mb-2 overflow-x-auto",
  tabBtn: "inline-flex items-center gap-2 h-[38px] px-4 rounded-lg text-[13px] font-bold cursor-pointer whitespace-nowrap select-none transition-all duration-140",
  tabBtnActive: "bg-db-brand-subtle border border-db-brand text-db-brand shadow-db-brand",
  tabBtnInactive: "bg-db-surface border border-db-border text-db-text-muted hover:border-white/15 hover:text-white hover:bg-db-surface-hover",
  tabCount: "inline-flex items-center justify-center px-[7px] py-0.5 rounded-full bg-black/40 text-[11px] font-extrabold text-inherit",

  /* ── Category Filter Bar (FAQs / Resources) ── */
  filterBar: "flex items-center gap-2 flex-wrap mb-3.5",
  filterPill: "inline-flex items-center gap-1.5 h-8 px-3.5 rounded-md text-xs font-bold cursor-pointer transition-all duration-140 select-none",
  filterPillActive: "bg-db-brand-subtle border border-db-brand text-db-brand",
  filterPillInactive: "bg-db-surface border border-db-border text-db-text-muted hover:border-white/15 hover:text-white",

  /* ── Cards & Grid ── */
  grid1: "flex flex-col gap-3",
  grid2: "grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-4",
  card: "bg-db-surface border border-db-border rounded-db-card p-[18px_20px] flex flex-col gap-3 transition-[border-color,box-shadow] duration-140 hover:border-db-brand hover:shadow-db-card",
  cardHeader: "flex items-center justify-between gap-3 flex-wrap",
  cardBadges: "flex items-center gap-2 flex-wrap",
  cardTitle: "text-[15px] font-extrabold text-white leading-[1.35] m-0",
  cardMessage: "text-[13.5px] text-db-text-secondary leading-[1.5] m-0",
  cardLinkRow: "inline-flex items-center gap-1.5 text-[12.5px] text-db-brand font-semibold no-underline hover:underline",
  cardFooter: "flex items-center justify-between gap-3 border-t border-db-border-muted pt-3 mt-1",
  cardActions: "inline-flex items-center gap-1.5",

  /* ── Badges ── */
  badgeLocation: "font-mono text-[11px] font-bold text-db-info-text bg-db-info-subtle border border-db-info-border rounded-md px-2 py-[3px] uppercase tracking-[0.03em]",
  badgeCategory: "text-[11px] font-bold text-db-brand bg-db-brand-subtle border border-db-brand/40 rounded-md px-2 py-[3px] uppercase tracking-[0.03em]",
  badgePageHomepage: "text-[11px] font-bold text-db-info-text bg-db-info-subtle border border-db-info-border rounded-md px-2 py-[3px] uppercase tracking-[0.03em]",
  badgePageSchools: "text-[11px] font-bold text-db-purple-text bg-db-purple-subtle border border-db-purple-border rounded-md px-2 py-[3px] uppercase tracking-[0.03em]",
  badgePageAll: "text-[11px] font-bold text-db-warning-text bg-db-warning-subtle border border-db-warning-border rounded-md px-2 py-[3px] uppercase tracking-[0.03em]",
  badgePageTrackOrder: "text-[11px] font-bold text-db-brand bg-db-brand-subtle border border-db-brand/45 rounded-md px-2 py-[3px] uppercase tracking-[0.03em]",
  badgePageHappyPay: "text-[11px] font-bold text-db-purple-text bg-db-purple-subtle border border-db-purple-border rounded-md px-2 py-[3px] uppercase tracking-[0.03em]",
  badgePageAddSchool: "text-[11px] font-bold text-db-info-text bg-db-info-subtle border border-db-info-border rounded-md px-2 py-[3px] uppercase tracking-[0.03em]",
  badgePagePartnership: "text-[11px] font-bold text-db-teal-text bg-db-teal-subtle border border-db-teal-border rounded-md px-2 py-[3px] uppercase tracking-[0.03em]",
  badgeSchool: "text-[11.5px] font-semibold text-db-info-text bg-db-info-subtle border border-db-info-border rounded-md px-2 py-0.5",
  badgeFormat: "font-mono text-[11px] font-extrabold text-db-warning-text bg-db-warning-subtle border border-db-warning-border rounded-md px-2 py-[3px] uppercase",
  badgeArticle: "text-db-success-text bg-db-success-subtle border-db-success-border",
  skuBadge: "font-mono text-[11px] font-bold text-db-text-muted bg-black/30 px-1.5 py-0.5 rounded",

  /* ── Article (blog) Resource Cell ── */
  articleCell: "flex items-center gap-3 min-w-0",
  articleThumb: "w-14 h-10 object-cover rounded-lg border border-white/10 shrink-0",
  articleThumbPlaceholder: "w-14 h-10 flex items-center justify-center rounded-lg border border-dashed border-white/15 text-db-text-muted shrink-0",
  articlePreviewImg: "block mt-2 max-w-[220px] h-auto rounded-lg border border-white/12",

  /* ── Resource Kind Toggle ── */
  resourceKindToggle: "flex gap-2 flex-wrap",
  resourceKindBtn: "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-white/10 bg-white/[0.03] text-db-text-muted text-[13px] font-semibold cursor-pointer transition-colors duration-150 hover:border-db-info-border hover:text-db-text-primary",
  resourceKindBtnActive: "bg-db-info-subtle border-db-info-border text-db-info-text",

  /* ── Testimonial Card Elements ── */
  starRow: "flex items-center gap-[3px] text-db-warning",
  quoteText: "text-sm leading-[1.55] text-slate-100 italic m-0",
  authorRow: "flex flex-col gap-0.5",
  authorName: "text-[13.5px] font-extrabold text-white",
  authorRole: "text-xs text-db-text-muted",
  schoolNameTitle: "text-sm font-bold text-white",

  /* ── FAQ Accordion Elements ── */
  faqHeader: "flex items-center justify-between gap-3 cursor-pointer select-none",
  faqQuestion: "text-[14.5px] font-bold text-white flex items-center gap-2.5",
  faqAnswer: "text-[13.5px] text-db-text-secondary leading-relaxed p-[12px_14px] bg-db-surface-inner rounded-lg border-l-[3px] border-db-brand",

  /* ── Action Buttons ── */
  iconBtn: "inline-flex items-center justify-center w-[34px] h-[34px] bg-slate-900/60 border border-db-teal-border rounded-lg text-db-teal cursor-pointer transition-all duration-140 hover:bg-db-teal-subtle hover:border-db-teal hover:text-white hover:shadow-db-brand no-underline",
  iconBtnDanger: "inline-flex items-center justify-center w-[34px] h-[34px] bg-red-500/[0.08] border border-red-500/30 rounded-lg text-red-400 cursor-pointer transition-all duration-140 hover:bg-red-500/20 hover:border-red-500 hover:text-white hover:[box-shadow:0_0_10px_rgba(239,68,68,0.3)]",

  /* ── Modal Dialog ── */
  modalOverlay: "fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-5 overflow-y-auto",
  modalDialog: "bg-db-surface border border-db-border rounded-db-card w-full max-w-[580px] max-h-[90vh] flex flex-col overflow-hidden shadow-db-modal my-auto",
  modalHeader: "flex items-center justify-between p-[16px_20px] border-b border-db-border bg-db-surface-elevated",
  modalTitle: "text-[15px] font-extrabold text-white flex items-center gap-2 m-0",
  modalCloseBtn: "bg-transparent border-0 text-db-text-muted cursor-pointer p-1.5 flex items-center justify-center rounded-md transition-colors duration-140 hover:text-white hover:bg-white/10",
  modalForm: "flex flex-col flex-1 min-h-0 overflow-hidden",
  modalBody: "p-5 flex flex-col gap-4 overflow-y-auto flex-1 min-h-0",
  modalFooter: "flex items-center justify-end gap-2.5 p-[14px_20px] border-t border-db-border bg-db-surface-elevated",

  /* ── Form Controls ── */
  formGrid2: "grid grid-cols-1 min-[500px]:grid-cols-2 gap-3.5",
  formRow2: "grid grid-cols-1 min-[500px]:grid-cols-2 gap-3.5",
  formGroup: "flex flex-col gap-2",
  formLabel: "text-xs font-semibold leading-4 text-db-text-secondary",
  formInput: "h-11 w-full rounded-lg border border-db-border-strong bg-db-surface-elevated px-3.5 font-inherit text-sm text-db-text-primary outline-none transition-all duration-150 focus:border-db-brand focus:ring-4 focus:ring-db-brand-subtle",
  formTextarea: "min-h-24 max-h-60 w-full resize-y overflow-y-auto rounded-lg border border-db-border-strong bg-db-surface-elevated px-3.5 py-3 font-inherit text-sm leading-relaxed text-db-text-primary outline-none transition-all duration-150 focus:border-db-brand focus:ring-4 focus:ring-db-brand-subtle",
  formSelect: "h-11 w-full cursor-pointer rounded-lg border border-db-border-strong bg-db-surface-elevated px-3.5 font-inherit text-sm text-db-text-primary outline-none transition-all duration-150 focus:border-db-brand focus:ring-4 focus:ring-db-brand-subtle",
  checkboxWrap: "flex items-center gap-2 text-[13px] font-semibold text-db-text-secondary cursor-pointer select-none",
  checkbox: "w-4 h-4 accent-db-brand cursor-pointer",
  errorMessage: "flex items-center gap-2 rounded-lg border border-db-danger-border bg-db-danger-subtle px-3.5 py-2.5 text-xs font-semibold text-db-danger-text",

  /* ── Empty State ── */
  emptyState: "flex flex-col items-center justify-center text-center p-[48px_24px] bg-db-surface border border-dashed border-db-border rounded-db-card text-db-text-muted",
  emptyTitle: "text-[15px] font-extrabold text-white my-[12px_4px]",
  emptySubtitle: "text-[13px] text-db-text-muted max-w-[380px] m-[0_0_16px]",

  /* ── Page Hero Eyebrows Panel ── */
  eyebrowPanel: "bg-db-surface border border-db-border rounded-db-card p-[18px] mb-5",
  eyebrowPanelHeader: "flex items-start justify-between gap-3 flex-wrap mb-3.5",
  eyebrowPanelToggle: "inline-flex items-center gap-[7px] h-[34px] px-3 rounded-lg border border-db-border bg-db-surface text-db-text-muted text-xs font-bold cursor-pointer whitespace-nowrap transition-all duration-140 hover:border-db-brand hover:text-db-brand hover:bg-db-brand-subtle focus-visible:outline-2 focus-visible:outline-db-brand focus-visible:outline-offset-2",
  eyebrowCollapsible: "grid transition-[grid-template-rows] duration-180 ease-in-out",
  eyebrowCollapsibleOpen: "grid-template-rows-[1fr]",
  eyebrowCollapsibleInner: "overflow-hidden min-h-0",
  eyebrowFeedback: "p-[10px_14px] rounded-lg text-[12.5px] font-semibold mb-3",
  eyebrowFeedbackSuccess: "bg-db-brand-subtle border border-db-brand/35 text-db-success-text",
  eyebrowFeedbackError: "bg-red-500/10 border border-red-500/35 text-red-400",
  eyebrowRows: "flex flex-col gap-2.5",
  eyebrowRow: "grid grid-cols-1 sm:grid-cols-[150px_1fr_auto] items-stretch sm:items-center gap-3 p-[10px_12px] bg-black/25 border border-db-border rounded-lg",
  eyebrowRowMeta: "flex flex-col gap-0.5",
  eyebrowRowLabel: "text-[13px] font-extrabold text-white",
  eyebrowSaveBtn: "inline-flex items-center gap-[7px] h-9 px-3.5 rounded-lg border border-db-brand bg-db-brand-subtle text-db-brand text-[12.5px] font-extrabold cursor-pointer whitespace-nowrap transition-all duration-140 hover:not-disabled:bg-db-brand/25 hover:not-disabled:border-db-brand hover:not-disabled:shadow-db-brand disabled:opacity-55 disabled:cursor-not-allowed",

  /* ── Avatar / Photo Upload in CMS Modal ── */
  avatarUploadRow: "flex items-center gap-4 p-[12px_14px] bg-db-surface-inner border border-dashed border-db-border rounded-[10px]",
  avatarPreview: "w-[54px] h-[54px] rounded-full object-cover border-2 border-db-brand bg-db-surface shrink-0",
  avatarPlaceholder: "w-[54px] h-[54px] rounded-full bg-db-brand-subtle text-db-brand grid place-items-center font-bold text-[17px] shrink-0 border border-db-brand/30 select-none",
  avatarControls: "flex flex-col gap-2 flex-1 min-w-0",
  avatarButtons: "flex items-center gap-2.5 flex-wrap",
  uploadFileBtn: "inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-db-brand text-white rounded-md text-[12.5px] font-semibold cursor-pointer border-0 transition-opacity duration-140 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed select-none",
  removeAvatarBtn: "inline-flex items-center gap-1 px-2.5 py-[5px] bg-transparent text-red-400 border border-red-400/30 rounded-md text-xs font-semibold cursor-pointer transition-all duration-140 hover:bg-red-400/10 hover:border-red-400",
  avatarUrlInput: "h-8 px-2.5 bg-black/25 border border-db-border rounded-md text-white text-xs outline-none w-full focus:border-db-brand",
  avatarHelp: "text-[11.5px] text-db-text-muted",

  /* ── Miscellaneous helper tokens ── */
  productCell: "flex flex-col gap-0.5",
  productBrand: "text-xs text-db-text-muted",
  textMuted: "text-db-text-muted text-xs",
} as const;

export default styles;
