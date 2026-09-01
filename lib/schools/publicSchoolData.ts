import { unstable_cache } from "next/cache";
import {
  getFullSchoolRecords,
  getSchoolIndex,
  type School,
  type SchoolIndexRecord,
} from "@/data/schools";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  SCHOOL_DATA_REVALIDATE_SECONDS,
  SCHOOL_DATA_TAG,
} from "@/lib/school-utils";

type SchoolVisibility = Record<string, boolean>;

const getDatabaseSchoolVisibility = unstable_cache(
  async (): Promise<SchoolVisibility> => {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.rpc(
      "get_public_school_visibility" as never,
      { school_slugs: null } as never,
    );

    if (error) throw error;

    const rows = (data as unknown as Array<{ slug: string }> | null) ?? [];
    return Object.fromEntries(rows.map((school) => [school.slug, true]));
  },
  ["public-school-visibility-v2"],
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
