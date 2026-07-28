import type { TrayPackItem, TrayPackLineItem } from "@/store/usePackTrayStore";

type CreateFullTrayPackInput = {
  packId: string;
  basePackId: string;
  packName: string;
  schoolId?: string;
  schoolSlug?: string;
  schoolName?: string;
  grade?: string;
  gradeSlug?: string;
  items: { id: string; name: string; category?: string; quantity: number; unitPrice?: number }[];
  totalPrice: number;
  sourcePath?: string;
};

export function createFullTrayPack(input: CreateFullTrayPackInput): TrayPackItem {
  const now = new Date().toISOString();
  const id = `tray-${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`}`;

  const lineItems: TrayPackLineItem[] = input.items.map((item) => ({
    id: item.id,
    itemId: item.id,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.unitPrice ? item.unitPrice * item.quantity : undefined,
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
    subtotal: input.totalPrice,
    totalPrice: input.totalPrice,
    sourcePath: input.sourcePath,
    createdAt: now,
    updatedAt: now,
  };
}

