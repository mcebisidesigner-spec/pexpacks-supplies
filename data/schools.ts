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
  metro: string;
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
  metro: string;
  province: string;
  logo: string;
  isPartnerSchool: boolean;
  isFeatured?: boolean;
  lowestPrice?: number;
  grades: {
    id: string;
    grade: string;
    gradeSlug: string;
  }[];
};

let schoolIndexPromise: Promise<SchoolIndexRecord[]> | null = null;

export const getSchoolIndex = async (): Promise<SchoolIndexRecord[]> => {
  if (!schoolIndexPromise) {
    schoolIndexPromise = import("./school-index.json").then(
      (data) => data.default as SchoolIndexRecord[]
    );
  }
  return schoolIndexPromise;
};

type SchoolRecordMap = Map<string, School>;

let fullSchoolRecordsPromise: Promise<School[]> | null = null;
let schoolRecordMapPromise: Promise<SchoolRecordMap> | null = null;

export const getFullSchoolRecords = async (): Promise<School[]> => {
  if (!fullSchoolRecordsPromise) {
    fullSchoolRecordsPromise = import("./school-records.json").then(
      (records) => records.default as School[]
    );
  }

  return fullSchoolRecordsPromise;
};

export const getSchoolRecordMap = async (): Promise<SchoolRecordMap> => {
  if (!schoolRecordMapPromise) {
    schoolRecordMapPromise = getFullSchoolRecords().then(
      (records) => new Map(records.map((school) => [school.slug, school]))
    );
  }

  return schoolRecordMapPromise;
};

export const getSchoolBySlug = async (
  slug: string
): Promise<School | undefined> => {
  const records = await getSchoolRecordMap();
  return records.get(slug);
};
