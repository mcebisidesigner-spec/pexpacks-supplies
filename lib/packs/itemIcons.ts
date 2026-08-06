export type PackItemIconKey =
  | "notebook"
  | "pad"
  | "file"
  | "pen"
  | "pencil"
  | "crayon"
  | "glue"
  | "scissors"
  | "ruler"
  | "eraser"
  | "sharpener"
  | "highlighter"
  | "calculator"
  | "box";

export const PACK_ITEM_ICONS: { key: PackItemIconKey; label: string }[] = [
  { key: "notebook", label: "Book / notebook" },
  { key: "pad", label: "Exercise pad" },
  { key: "file", label: "File / folder" },
  { key: "pen", label: "Pen" },
  { key: "pencil", label: "Pencil" },
  { key: "crayon", label: "Crayons" },
  { key: "glue", label: "Glue stick" },
  { key: "scissors", label: "Scissors" },
  { key: "ruler", label: "Ruler" },
  { key: "eraser", label: "Eraser" },
  { key: "sharpener", label: "Sharpener" },
  { key: "highlighter", label: "Highlighter" },
  { key: "calculator", label: "Calculator" },
  { key: "box", label: "Pack / box" },
];

export function isPackItemIconKey(value: string): value is PackItemIconKey {
  return PACK_ITEM_ICONS.some((icon) => icon.key === value);
}
