export const contentBlocksStyles = {
  composer: "flex flex-col gap-2.5",
  blockList: "list-none m-0 p-0 flex flex-col gap-2.5",
  block: "border border-[var(--db-border)] rounded-xl bg-[var(--pex-bg)] overflow-hidden focus-within:border-[var(--db-brand)] focus-within:ring-3 focus-within:ring-[var(--db-brand-subtle)]",
  blockBar: "flex items-center gap-2 py-1.5 px-2.5 bg-[var(--db-surface-inner)] border-b border-[var(--db-border)]",
  blockIcon: "inline-flex items-center justify-center w-[22px] h-[22px] rounded-md bg-[var(--pex-bg)] border border-[#dbe3ec] text-[var(--db-brand)] text-xs font-bold shrink-0",
  kindSelect: "border border-[#dbe3ec] rounded-md bg-[var(--pex-bg)] text-[var(--a-text)] text-xs font-bold py-[3px] px-2 font-inherit cursor-pointer",
  blockActions: "ml-auto flex gap-1",
  blockButton: "inline-flex items-center justify-center w-[26px] h-[26px] border border-[#dbe3ec] rounded-md bg-[var(--pex-bg)] text-[#5c6b76] text-[13px] leading-none cursor-pointer p-0 hover:not-disabled:border-[var(--db-brand)] hover:not-disabled:text-[var(--db-brand)] disabled:opacity-35 disabled:cursor-default",
  blockButtonDelete: "hover:not-disabled:border-[var(--a-red)] hover:not-disabled:text-[var(--a-red)]",
  blockBody: "p-2.5 flex flex-col gap-2",
  blockTextarea: "border border-[var(--db-border)] rounded-lg py-2.5 px-3 text-sm font-inherit text-[var(--a-text)] bg-[var(--pex-bg)] w-full resize-y leading-[1.55] focus:outline-none focus:border-[var(--db-brand)]",
  boldRow: "flex items-center gap-2 text-[13px] text-[#5c6b76] cursor-pointer",
  imageGrid: "grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2.5",
  imageField: "flex flex-col gap-1",
  imageLabel: "text-[11px] font-extrabold text-[#5c6b76] uppercase tracking-[0.04em]",
  input: "border border-[var(--db-border)] rounded-lg py-2 px-2.5 text-[13px] font-inherit text-[var(--a-text)] bg-[var(--pex-bg)] w-full focus:outline-none focus:border-[var(--db-brand)]",
  addBlock: "self-start inline-flex items-center gap-1.5 border border-dashed border-[var(--db-text-muted)] rounded-[10px] bg-[var(--pex-bg)] text-[var(--db-brand)] text-[13px] font-bold py-2 px-3.5 cursor-pointer font-inherit hover:border-[var(--db-brand)] hover:bg-[rgba(26,122,119,0.04)]",
};

export default contentBlocksStyles;
