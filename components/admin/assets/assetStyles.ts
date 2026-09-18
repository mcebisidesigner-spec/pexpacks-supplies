export const assetStyles = {
  form: "flex flex-col gap-3.5",
  field: "flex flex-col gap-1.5",
  label: "text-[13px] font-extrabold text-[var(--a-text)] uppercase tracking-[0.04em]",
  input: "border border-[var(--db-border)] rounded-[10px] py-2.5 px-3.5 text-sm font-inherit text-[var(--a-text)] bg-[var(--pex-bg)] w-full max-w-[480px] focus:outline-none focus:border-[var(--db-brand)] focus:ring-3 focus:ring-[rgba(26,122,119,0.15)]",
  fileInput: "font-inherit text-sm text-[var(--a-text)]",
  success: "bg-[var(--db-success-subtle)] text-[var(--db-success-text)] border border-[var(--db-success-border)] rounded-lg py-2.5 px-3.5 text-[13px] font-semibold m-0",
  error: "bg-[var(--db-danger-subtle)] text-[var(--db-danger-text)] border border-[var(--db-danger-border)] rounded-lg py-2.5 px-3.5 text-[13px] font-semibold m-0",
  actions: "flex items-center gap-2.5 mt-1.5",
  saveButton: "bg-[var(--db-brand)] text-white border-0 rounded-lg py-2.5 px-5 text-sm font-bold cursor-pointer font-inherit disabled:opacity-60 disabled:cursor-default",
};

export default assetStyles;
