export const blogStyles = {
  form: "flex flex-col gap-4",
  field: "flex flex-col gap-1.5",
  fieldRow: "grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5",
  label: "text-[13px] font-extrabold text-[var(--a-text)] uppercase tracking-[0.04em]",
  input: "border border-[var(--db-border)] rounded-[10px] py-2.5 px-3.5 text-sm font-inherit text-[var(--a-text)] bg-[var(--pex-bg)] w-full focus:outline-none focus:border-[var(--db-brand)] focus:ring-3 focus:ring-[rgba(26,122,119,0.15)]",
  select: "border border-[var(--db-border)] rounded-[10px] py-2.5 px-3.5 text-sm font-inherit text-[var(--a-text)] bg-[var(--pex-bg)] w-full focus:outline-none focus:border-[var(--db-brand)] focus:ring-3 focus:ring-[rgba(26,122,119,0.15)]",
  textarea: "border border-[var(--db-border)] rounded-[10px] py-2.5 px-3.5 text-sm font-inherit text-[var(--a-text)] bg-[var(--pex-bg)] w-full resize-y min-h-[96px] leading-[1.5] focus:outline-none focus:border-[var(--db-brand)] focus:ring-3 focus:ring-[rgba(26,122,119,0.15)]",
  slugRow: "flex items-center gap-2",
  slugPrefix: "text-[13px] font-bold text-[var(--db-text-muted)] whitespace-nowrap",
  checkboxRow: "flex items-start gap-2.5 p-3 sm:px-3.5 border border-[var(--db-border)] rounded-[10px] cursor-pointer",
  checkbox: "mt-[3px] accent-[var(--db-brand)] w-4 h-4 shrink-0",
  checkLabel: "block text-sm font-bold text-[var(--a-text)]",
  checkHelp: "block text-xs text-[var(--db-text-muted)] mt-0.5",
  success: "bg-[var(--db-success-subtle)] text-[var(--db-success-text)] border border-[var(--db-success-border)] rounded-lg py-2.5 px-3.5 text-[13px] font-semibold m-0",
  error: "bg-[var(--db-danger-subtle)] text-[var(--db-danger-text)] border border-[var(--db-danger-border)] rounded-lg py-2.5 px-3.5 text-[13px] font-semibold m-0",
  actions: "flex items-center gap-2.5 mt-1.5",
  saveButton: "bg-[var(--db-brand)] text-white border-0 rounded-lg py-2.5 px-5 text-sm font-bold cursor-pointer font-inherit disabled:opacity-60 disabled:cursor-default",
  hint: "m-0 text-xs text-[var(--db-text-muted)]",
  backLink: "inline-flex items-center gap-1.5 text-[13px] font-bold text-[var(--db-brand)] no-underline mb-4.5 hover:underline",
};

export default blogStyles;
