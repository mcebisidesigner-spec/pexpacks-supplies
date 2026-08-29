import type { TrayPackItem } from "@/store/usePackTrayStore";
import { calculatePexcoverTotal } from "@/lib/pricing/pexcover";

export function calculateTrayTotal(packs: TrayPackItem[]): number {
  return packs.reduce((sum, pack) => {
    const pexcoverCost = pack.wantsPexcover
      ? calculatePexcoverTotal(pack.items).pexcoverTotalRands
      : 0;
    return sum + (pack.totalPrice ?? 0) + pexcoverCost;
  }, 0);
}
