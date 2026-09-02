import { unstable_cache } from "next/cache";
import type { GradePack, School, SchoolPackItem } from "@/data/schools";
import { getGradeOrder } from "@/lib/grade-utils";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const SCHOOL_DATA_TAG = "school-data";
export const SCHOOL_DATA_REVALIDATE_SECONDS = 300;

type DbSchool = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  district: string | null;
  province: string | null;
  logo: string | null;
  is_partner: boolean | null;
  refused_partnership: boolean | null;
  partnership?: string | null;
  parent_collection_accepted?: boolean | null;
  principal?: string | null;
  website?: string | null;
};

type DbPackItem = {
  id?: string;
  pack_id: string;
  name: string;
  quantity: number;
  unit_price: number | null;
  icon: string | null;
  description: string | null;
  specification: string | null;
  requires_pexcover?: boolean;
  pexco_code?: string | null;
  pexco_rate_cents?: number | null;
  pexco_rate_active?: boolean;
};

type DbPack = {
  id: string;
  title: string;
  slug: string | null;
  price: number | null;
  description: string | null;
  stock: number | null;
  sort_order: number | null;
  items: DbPackItem[];
};

function extractGradeName(title: string | null, slug: string | null): string {
  const match =
    (title ?? "").match(/Grade\s+([R\d]+)/i) ||
    (slug ?? "").match(/grade-([r\d]+)/i);
  if (match) return `Grade ${match[1].toUpperCase()}`;

  const generalMatch = (title ?? "").match(/(Grade\s+[\w-]+)/i);
  return generalMatch?.[1] || title || "Stationery Pack";
}

function extractGradeSlug(grade: string, slug: string | null): string {
  const slugMatch = (slug ?? "").match(/grade-[r\d]+/i);
  if (slugMatch) return slugMatch[0].toLowerCase();
  return grade
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toGradePacks(packs: DbPack[]): GradePack[] {
  return [...packs]
    .sort((a, b) => {
      const gradeOrder =
        getGradeOrder(`${a.title} ${a.slug ?? ""}`) -
        getGradeOrder(`${b.title} ${b.slug ?? ""}`);
      return gradeOrder || (a.sort_order ?? 0) - (b.sort_order ?? 0);
    })
    .map((pack) => {
      const grade = extractGradeName(pack.title, pack.slug);
      const packItems: SchoolPackItem[] = pack.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        icon: item.icon,
        description: item.description,
        specification: item.specification,
        requiresPexcover: item.requires_pexcover,
        pexcoCode: item.pexco_code,
        pexcoRateCents: item.pexco_rate_cents,
        pexcoRateActive: item.pexco_rate_active,
      }));

      return {
        id: pack.id,
        grade,
        gradeSlug: extractGradeSlug(grade, pack.slug),
        price: packItems.length === 0 ? 0 : (pack.price ?? 0),
        contents: packItems.map((item) =>
          item.quantity > 1 ? `${item.quantity}x ${item.name}` : item.name,
        ),
        packItems,
        deliveryNote:
          pack.description || "Prepared for delivery before school starts.",
        availability: (pack.stock ?? 1) > 0 ? "in-stock" : "pre-order",
      };
    });
}

function toSchool(school: DbSchool, packs: DbPack[]): School {
  return {
    id: school.id,
    name: school.name,
    slug: school.slug,
    city: school.city ?? "",
    district: school.district ?? "",
    metro: school.district ?? "",
    province: school.province ?? "",
    logo: school.logo,
    website: school.website || school.principal || null,
    isPartnerSchool:
      Boolean(school.is_partner) || school.partnership === "partner",
    refusedPartnership:
      Boolean(school.refused_partnership) ||
      school.partnership === "refused_partner",
    parentCollectionAccepted: school.parent_collection_accepted !== false,
    grades: toGradePacks(packs),
  };
}

function parseAggregatePayload(value: unknown): School | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const payload = value as { school?: DbSchool; packs?: DbPack[] };
  if (!payload.school || !Array.isArray(payload.packs)) return null;
  return toSchool(payload.school, payload.packs);
}

export async function getSchoolBySlug(
  slug: string,
): Promise<School | undefined> {
  const normalizedSlug = (slug || "").toLowerCase().trim();
  if (!normalizedSlug) return undefined;

  try {
    const supabase = createSupabaseAdminClient();
    // 1. Direct exact lookup via database RPC
    const { data, error } = await supabase.rpc("get_public_school_pack", {
      school_slug: normalizedSlug,
    });

    if (!error) {
      const parsed = parseAggregatePayload(data);
      if (parsed) return parsed;
    }

    // 2. Prefix fallback (e.g. "brakpan-high" -> "brakpan-high-school", "pretoria-high" -> "pretoria-high-school-for-girls")
    const { data: prefixCandidates } = await supabase
      .from("schools")
      .select("slug")
      .or(`slug.ilike.${normalizedSlug}-%,slug.ilike.${normalizedSlug}%`)
      .eq("published", true)
      .limit(1);

    if (
      prefixCandidates &&
      prefixCandidates.length > 0 &&
      prefixCandidates[0].slug !== normalizedSlug
    ) {
      const { data: prefixData } = await supabase.rpc(
        "get_public_school_pack",
        {
          school_slug: prefixCandidates[0].slug,
        },
      );
      const parsedPrefix = parseAggregatePayload(prefixData);
      if (parsedPrefix) return parsedPrefix;
    }

    // 3. Keyword / distinctive word fallback (e.g. "randhart-high" -> "laerskool-randhart", "langaville-high" -> "langaville-secondary-school")
    const noiseWords = new Set([
      "high",
      "school",
      "primary",
      "secondary",
      "laerskool",
      "hoerskool",
      "preparatory",
      "college",
    ]);
    const distinctiveWords = normalizedSlug
      .split("-")
      .filter((w) => w.length > 2 && !noiseWords.has(w));

    if (distinctiveWords.length > 0) {
      const keywordPattern = distinctiveWords.join("%");
      const { data: keywordCandidates } = await supabase
        .from("schools")
        .select("slug")
        .or(
          `slug.ilike.%${keywordPattern}%,name.ilike.%${distinctiveWords.join(" ")}%`,
        )
        .eq("published", true)
        .limit(1);

      if (keywordCandidates && keywordCandidates.length > 0) {
        const { data: keywordData } = await supabase.rpc(
          "get_public_school_pack",
          {
            school_slug: keywordCandidates[0].slug,
          },
        );
        const parsedKeyword = parseAggregatePayload(keywordData);
        if (parsedKeyword) return parsedKeyword;
      }
    }

    return undefined;
  } catch (error) {
    console.error("[school-utils] public school lookup failed:", error);
    return undefined;
  }
}

export async function getGradeBySlug(schoolSlug: string, gradeSlug: string) {
  const school = await getSchoolBySlug(schoolSlug);
  return school?.grades.find((grade) => grade.gradeSlug === gradeSlug);
}

export const getCachedSchoolBySlug = unstable_cache(
  async (slug: string) => getSchoolBySlug(slug) ?? null,
  ["public-school-by-slug-v2"],
  { revalidate: SCHOOL_DATA_REVALIDATE_SECONDS, tags: [SCHOOL_DATA_TAG] },
);
