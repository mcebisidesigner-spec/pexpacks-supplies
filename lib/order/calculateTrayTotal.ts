import type { TrayPackItem } from "@/store/usePackTrayStore";
import { PEXCOVER_PRICE } from "@/lib/constants";

export function calculateTrayTotal(packs: TrayPackItem[]): number {
  return packs.reduce(
    (sum, pack) => sum + (pack.totalPrice ?? 0) + (pack.wantsPexcover ? PEXCOVER_PRICE : 0),
    0
  );
}

export function calculateTrayItemCount(packs: TrayPackItem[]): number {
  return packs.reduce((sum, pack) => sum + pack.items.length, 0);
}

export function formatTraySummary(packs: TrayPackItem[]): string {
  if (packs.length === 0) return "No packs";
  if (packs.length === 1) return `1 pack - ${packs[0].packName}`;
  return `${packs.length} packs - ${packs.length} learners`;
}
