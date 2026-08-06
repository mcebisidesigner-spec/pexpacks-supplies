import type { ReactNode } from "react";

export type PackListItem = {
  id: string;
  name: string;
  quantity: number;
  quantityLabel?: string;
  category?: string;
  icon?: string;
  specification?: string;
  description?: string;
};

export type CompleteListPack = {
  id: string;
  gradeLabel: string;
  modalTitle: string;
  contentHeading?: string;
  description: string;
  priceLabel: string;
  items: PackListItem[];
  footerActions?: ReactNode;
  fullPackHref?: string;
  customiseTargetId?: string;
};
