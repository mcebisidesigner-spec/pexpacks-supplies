import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";

export type GradePack = {
  id: string;
  grade: string;
  gradeSlug: string;
  price: number;
  contents: string[];
  deliveryNote: string;
  availability: "in-stock" | "pre-order" | "seasonal";
  packItems?: SchoolPackItem[];
};

export type SchoolPackItem = {
  name: string;
  quantity: number;
  unitPrice?: number | null;
  icon?: string | null;
  description?: string | null;
  specification?: string | null;
};

export type School = {
  id: string;
  name: string;
  slug: string;
  city: string;
  district?: string | null;
  metro: string;
  province: string;
  logo?: string | null;
  website?: string | null;
  isPartnerSchool: boolean;
  refusedPartnership?: boolean;
  parentCollectionAccepted?: boolean;
  customBadge?: string | null;
  grades: GradePack[];
};

export type SchoolIndexRecord = {
  id: string;
  name: string;
  slug: string;
  city: string;
  district?: string | null;
  metro: string;
  province: string;
  logo?: string | null;
  website?: string | null;
  isPartnerSchool: boolean;
  isFeatured?: boolean;
  lowestPrice?: number;
  customBadge?: string | null;
  grades: {
    id: string;
    grade: string;
    gradeSlug: string;
  }[];
};

let schoolIndexPromise: Promise<SchoolIndexRecord[]> | null = null;

export const getSchoolIndex = async (): Promise<SchoolIndexRecord[]> => {
  if (!schoolIndexPromise) {
    schoolIndexPromise = readFile(
      path.join(process.cwd(), "data", "school-index.json"),
      "utf8",
    ).then((contents) => JSON.parse(contents) as SchoolIndexRecord[]);
  }
  return schoolIndexPromise;
};

type SchoolRecordMap = Map<string, School>;

let fullSchoolRecordsPromise: Promise<School[]> | null = null;
let schoolRecordMapPromise: Promise<SchoolRecordMap> | null = null;

export const getFullSchoolRecords = async (): Promise<School[]> => {
  if (!fullSchoolRecordsPromise) {
    fullSchoolRecordsPromise = readFile(
      path.join(process.cwd(), "data", "school-records.json"),
      "utf8",
    ).then((contents) => JSON.parse(contents) as School[]);
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
