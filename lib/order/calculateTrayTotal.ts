import type { TrayPackItem } from "@/store/usePackTrayStore";
import { PEXCOVER_PRICE } from "@/lib/constants";

export function calculateTrayTotal(packs: TrayPackItem[]): number {
  return packs.reduce(
    (sum, pack) => sum + (pack.totalPrice ?? 0) + (pack.wantsPexcover ? PEXCOVER_PRICE : 0),
    0
  );
}


