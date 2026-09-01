export type PackItem = {
  id: string;
  name: string;
  category?: string;
  requiredQuantity: number;
  selectedQuantity?: number;
  unitPrice?: number;
  icon?: string;
  isRequired?: boolean;
  notes?: string;
  description?: string;
  specification?: string;
  requiresPexcover?: boolean;
  pexcoCode?: string | null;
  pexcoRateCents?: number | null;
  pexcoRateActive?: boolean;
};

export type GradePackForCustomisation = {
  id: string;
  schoolId: string;
  schoolSlug: string;
  schoolName: string;
  grade: string;
  gradeSlug: string;
  packName: string;
  slug: string;
  items: PackItem[];
  fullPackPrice?: number;
  deliveryNote?: string;
  isCustomisable: boolean;
  marginRate?: number | null;
  fixedPackCost?: number | null;
  packagingCost?: number | null;
  assemblyCost?: number | null;
  freightCost?: number | null;
};

export type PackSelectionItem = PackItem & {
  selected: boolean;
  selectedQuantity: number;
};
