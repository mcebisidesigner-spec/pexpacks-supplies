import type { TrayPackItem } from "@/store/usePackTrayStore";

export type TrayValidationError = {
  packId: string;
  field: string;
  message: string;
};

export function validatePackTray(packs: TrayPackItem[]): TrayValidationError[] {
  const errors: TrayValidationError[] = [];

  if (packs.length === 0) {
    errors.push({ packId: "", field: "packs", message: "No packs in your order. Add a pack first." });
    return errors;
  }

  for (const pack of packs) {
    if (!pack.packName) {
      errors.push({ packId: pack.id, field: "packName", message: "Pack name is missing." });
    }

    if (!pack.totalPrice || pack.totalPrice <= 0) {
      errors.push({ packId: pack.id, field: "totalPrice", message: `Pack "${pack.packName}" has no valid price.` });
    }

    if (pack.items.length === 0) {
      errors.push({ packId: pack.id, field: "items", message: `Pack "${pack.packName}" has no items.` });
    }
  }

  return errors;
}

export function isValidForCheckout(packs: TrayPackItem[]): boolean {
  return validatePackTray(packs).length === 0;
}
