import type { TrayPackItem, TrayPackLineItem } from "@/store/usePackTrayStore";
import { calculateItemLineTotal } from "@/lib/packs/calculatePackTotal";

type CreateFullTrayPackInput = {
  packId: string;
  basePackId: string;
  packName: string;
  schoolId?: string;
  schoolSlug?: string;
  schoolName?: string;
  grade?: string;
  gradeSlug?: string;
  items: {
    id: string;
    name: string;
    category?: string;
    quantity: number;
    unitPrice?: number;
    requiresPexcover?: boolean;
    pexcoCode?: string | null;
    pexcoRateCents?: number | null;
    pexcoRateActive?: boolean;
  }[];
  totalPrice: number;
  sourcePath?: string;
};

export function createFullTrayPack(
  input: CreateFullTrayPackInput,
): TrayPackItem {
  const now = new Date().toISOString();
  const id = `tray-${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`}`;

  const lineItems: TrayPackLineItem[] = input.items.map((item) => ({
    id: item.id,
    itemId: item.id,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    requiresPexcover: item.requiresPexcover,
    pexcoCode: item.pexcoCode,
    pexcoRateCents: item.pexcoRateCents,
    pexcoRateActive: item.pexcoRateActive,
    lineTotal:
      typeof item.unitPrice === "number"
        ? calculateItemLineTotal(item.unitPrice, item.quantity)
        : undefined,
  }));


  return {
    id,
    packId: input.packId,
    basePackId: input.basePackId,
    packName: input.packName,
    schoolId: input.schoolId,
    schoolSlug: input.schoolSlug,
    schoolName: input.schoolName,
    grade: input.grade,
    gradeSlug: input.gradeSlug,
    learnerName: "",
    packMode: "full",
    items: lineItems,
    wantsPexcover: false,
    subtotal: input.totalPrice,
    totalPrice: input.totalPrice,
    sourcePath: input.sourcePath,
    createdAt: now,
    updatedAt: now,
  };
}
