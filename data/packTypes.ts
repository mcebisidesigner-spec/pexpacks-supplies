export type StationeryItem = {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  specification?: string;
  category: "Core Essentials" | "Durables" | "Brand Upgrades";
  icon?:
    | "notebook"
    | "crayon"
    | "glue"
    | "scissors"
    | "pencil"
    | "pen"
    | "ruler"
    | "eraser"
    | "sharpener"
    | "highlighter"
    | "pad"
    | "calculator"
    | "file";
  unitPrice?: number;
};
