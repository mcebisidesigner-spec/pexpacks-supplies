export type GradePack = {
  id: string;
  grade: string;
  gradeSlug: string;
  price: number;
  contents: string[];
  deliveryNote: string;
  availability: "in-stock" | "pre-order" | "seasonal";
};

export type School = {
  id: string;
  name: string;
  slug: string;
  city: string;
  province: string;
  logo: string;
  isPartnerSchool: boolean;
  grades: GradePack[];
};

export type SchoolIndexRecord = {
  id: string;
  name: string;
  slug: string;
  city: string;
  province: string;
  logo: string;
  isPartnerSchool: boolean;
  grades: {
    id: string;
    grade: string;
    gradeSlug: string;
  }[];
};

import schoolIndexData from './school-index.json';

export const schoolIndex: SchoolIndexRecord[] = schoolIndexData as SchoolIndexRecord[];

export const getSchoolIndex = (): SchoolIndexRecord[] => schoolIndex;

export const getFullSchoolRecords = async (): Promise<School[]> => {
  const records = await import('./school-records.json');
  return records.default as School[];
};

export const getSchoolBySlug = async (slug: string): Promise<School | undefined> => {
  const records = await getFullSchoolRecords();
  return records.find((s) => s.slug === slug);
};
