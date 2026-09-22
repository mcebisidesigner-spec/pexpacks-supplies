export const contentBlocksStyles = {
  composer: "flex flex-col gap-2.5",
  blockList: "list-none m-0 p-0 flex flex-col gap-2.5",
  block: "overflow-hidden rounded-xl border border-[var(--db-border)] bg-[var(--db-surface)] focus-within:border-[var(--db-brand)] focus-within:ring-4 focus-within:ring-[var(--db-brand-subtle)]",
  blockBar: "flex items-center gap-2 border-b border-[var(--db-border)] bg-[var(--db-surface-inner)] px-3 py-2",
  blockIcon: "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--db-border-strong)] bg-[var(--db-surface-elevated)] text-xs font-bold text-[var(--db-brand)]",
  kindSelect: "h-8 rounded-md border border-[var(--db-border-strong)] bg-[var(--db-surface-elevated)] px-2 text-xs font-semibold text-[var(--db-text-primary)] outline-none transition-all focus:border-[var(--db-brand)] focus:ring-2 focus:ring-[var(--db-brand-subtle)]",
  blockActions: "ml-auto flex gap-1",
  blockButton: "inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--db-border-strong)] bg-[var(--db-surface-elevated)] p-0 text-[13px] leading-none text-[var(--db-text-muted)] transition-all hover:not-disabled:-translate-y-px hover:not-disabled:border-[var(--db-brand)] hover:not-disabled:text-[var(--db-brand)] disabled:cursor-default disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--db-brand-subtle)]",
  blockButtonDelete: "hover:not-disabled:border-[var(--a-red)] hover:not-disabled:text-[var(--a-red)]",
  blockBody: "p-2.5 flex flex-col gap-2",
  blockTextarea: "min-h-24 w-full resize-y rounded-lg border border-[var(--db-border-strong)] bg-[var(--db-surface-elevated)] px-3.5 py-3 font-inherit text-sm leading-relaxed text-[var(--db-text-primary)] outline-none transition-all duration-150 focus:border-[var(--db-brand)] focus:ring-4 focus:ring-[var(--db-brand-subtle)]",
  boldRow: "flex cursor-pointer items-center gap-2 text-[13px] text-[var(--db-text-secondary)]",
  imageGrid: "grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2.5",
  imageField: "flex flex-col gap-2",
  imageLabel: "text-xs font-semibold text-[var(--db-text-secondary)]",
  input: "h-11 w-full rounded-lg border border-[var(--db-border-strong)] bg-[var(--db-surface-elevated)] px-3.5 font-inherit text-sm text-[var(--db-text-primary)] outline-none transition-all duration-150 placeholder:text-[var(--db-text-subtle)] focus:border-[var(--db-brand)] focus:ring-4 focus:ring-[var(--db-brand-subtle)]",
  addBlock: "inline-flex h-11 items-center gap-2 self-start rounded-lg border border-dashed border-[var(--db-border-strong)] bg-[var(--db-surface-elevated)] px-3.5 font-inherit text-sm font-semibold text-[var(--db-brand)] transition-all hover:-translate-y-px hover:border-[var(--db-brand)] hover:bg-[var(--db-brand-subtle)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--db-brand-subtle)]",
};

export default contentBlocksStyles;
