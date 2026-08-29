import { unstable_cache } from "next/cache";
import {
  getFullSchoolRecords,
  getSchoolIndex,
  type School,
  type SchoolIndexRecord,
} from "@/data/schools";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { SCHOOL_DATA_TAG, SCHOOL_DATA_REVALIDATE_SECONDS } from "@/lib/school-utils";

type SchoolVisibility = Record<string, boolean>;

const getDatabaseSchoolVisibility = unstable_cache(
  async (): Promise<SchoolVisibility> => {
    const supabase = createSupabaseAdminClient();
    const visibility: SchoolVisibility = {};
    const pageSize = 1000;
    let from = 0;

    while (true) {
      const { data, error } = await supabase
        .from("public_school_directory_view")
        .select("slug")
        .range(from, from + pageSize - 1);

      if (error) throw error;
      if (!data || data.length === 0) break;

      for (const school of data) {
        visibility[school.slug] = true;
      }

      if (data.length < pageSize) break;
      from += pageSize;
    }

    return visibility;
  },
  ["public-school-visibility"],
  {
    revalidate: SCHOOL_DATA_REVALIDATE_SECONDS,
    tags: [SCHOOL_DATA_TAG],
  },
);

function isPublicSchool(slug: string, visibility: SchoolVisibility) {
  const hasDatabaseProjection = Object.keys(visibility).length > 0;
  return hasDatabaseProjection ? visibility[slug] === true : true;
}

export async function getPublicSchoolIndex(): Promise<SchoolIndexRecord[]> {
  const [schools, visibility] = await Promise.all([
    getSchoolIndex(),
    getDatabaseSchoolVisibility(),
  ]);
  return schools.filter((school) => isPublicSchool(school.slug, visibility));
}

export async function getPublicSchoolRecords(): Promise<School[]> {
  const [schools, visibility] = await Promise.all([
    getFullSchoolRecords(),
    getDatabaseSchoolVisibility(),
  ]);
  return schools.filter((school) => isPublicSchool(school.slug, visibility));
}

export async function getPublicSchoolSlugSet(): Promise<Set<string>> {
  const schools = await getPublicSchoolIndex();
  return new Set(schools.map((school) => school.slug));
}