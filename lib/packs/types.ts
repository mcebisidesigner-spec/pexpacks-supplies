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
};

export type PackSelectionItem = PackItem & {
  selected: boolean;
  selectedQuantity: number;
};
