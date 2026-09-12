export const PEXCOVER_PAPER_STYLES = [
  "STANDARD_KRAFT",
  "MARBLED_PATTERNS",
  "SOLID_COLOURS",
] as const;

export type PexcoverPaperStyle = (typeof PEXCOVER_PAPER_STYLES)[number];

export function normalisePexcoverPaperStyle(
  value: unknown,
): PexcoverPaperStyle {
  return PEXCOVER_PAPER_STYLES.includes(value as PexcoverPaperStyle)
    ? (value as PexcoverPaperStyle)
    : "STANDARD_KRAFT";
}

export function pexcoverPaperStyleLabel(style: PexcoverPaperStyle): string {
  switch (style) {
    case "MARBLED_PATTERNS":
      return "Marbled & Print";
    case "SOLID_COLOURS":
      return "Vibrant Colors";
    default:
      return "Standard Kraft";
  }
}
