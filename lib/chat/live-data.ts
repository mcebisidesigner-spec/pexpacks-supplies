import { searchSchoolRecords } from "@/lib/schools/schoolSearchData";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PexIntent } from "./pex";

export type PexLiveCards = {
  schoolCards: Array<{
    id: string;
    name: string;
    city: string;
    slug: string;
    grades: string[];
  }>;
  packCards: Array<{
    id: string;
    title: string;
    grade: string;
    gradeSlug: string;
    price: number;
    href: string;
    schoolId: string;
    schoolSlug: string;
    schoolName: string;
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      unitPrice: number | null;
      requiresPexcover: boolean;
      pexcoCode: string | null;
      pexcoRateCents: number | null;
      pexcoRateActive: boolean;
    }>;
  }>;
  productCards: Array<{
    id: string;
    name: string;
    category: string | null;
    description: string | null;
    unit: string | null;
    price: number;
    requiresPexcover: boolean;
  }>;
};

type PublicSchoolBundle = {
  school?: { id?: string; name?: string; slug?: string };
  packs?: Array<{
    id?: string;
    title?: string;
    slug?: string | null;
    price?: number | string | null;
    items?: Array<{
      id?: string;
      name?: string;
      quantity?: number | string | null;
      unit_price?: number | string | null;
      requires_pexcover?: boolean | null;
      pexco_code?: string | null;
      pexco_rate_cents?: number | string | null;
      pexco_rate_active?: boolean | null;
    }>;
  }>;
};

const EMPTY_CARDS: PexLiveCards = {
  schoolCards: [],
  packCards: [],
  productCards: [],
};

function finiteNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function gradeFromPack(title: string, slug: string | null | undefined) {
  const match = `${title} ${slug ?? ""}`.match(/Grade\s+([R\d]+)/i);
  return match ? `Grade ${match[1].toUpperCase()}` : "Pack";
}

function gradeSlugFromPack(grade: string, slug: string | null | undefined) {
  const slugMatch = slug?.match(/grade-[r\d]+/i);
  return slugMatch
    ? slugMatch[0].toLowerCase()
    : grade.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function publicPackCards(bundle: PublicSchoolBundle): PexLiveCards["packCards"] {
  const schoolId = bundle.school?.id;
  const schoolName = bundle.school?.name;
  const schoolSlug = bundle.school?.slug;
  if (!schoolId || !schoolName || !schoolSlug) return [];

  return (bundle.packs ?? []).slice(0, 4).flatMap((pack) => {
    if (!pack.id || !pack.title) return [];

    const grade = gradeFromPack(pack.title, pack.slug);
    const items = (pack.items ?? []).flatMap((item) => {
      if (!item.id || !item.name) return [];
      const quantity = finiteNumber(item.quantity);
      if (quantity <= 0) return [];

      const unitPrice = item.unit_price === null || item.unit_price === undefined
        ? null
        : finiteNumber(item.unit_price);
      return [{
        id: item.id,
        name: item.name,
        quantity,
        unitPrice,
        requiresPexcover: item.requires_pexcover === true,
        pexcoCode: typeof item.pexco_code === "string" ? item.pexco_code : null,
        pexcoRateCents: item.pexco_rate_cents === null || item.pexco_rate_cents === undefined
          ? null
          : finiteNumber(item.pexco_rate_cents),
        pexcoRateActive: item.pexco_rate_active === true,
      }];
    });

    return [{
      id: pack.id,
      title: pack.title,
      grade,
      gradeSlug: gradeSlugFromPack(grade, pack.slug),
      price: Math.max(0, finiteNumber(pack.price)),
      href: `/schools/${schoolSlug}`,
      schoolId,
      schoolSlug,
      schoolName,
      items,
    }];
  });
}

export async function getPexLiveCards(
  intent: PexIntent,
  query: string,
): Promise<PexLiveCards> {
  try {
    if (intent === "find_school" || intent === "find_school_pack") {
      const result = await searchSchoolRecords(
        { query: query.slice(0, 160), grade: "", phase: "", region: "" },
        3,
        0,
      );
      const schoolCards = result.results.map((school) => ({
        id: school.id,
        name: school.name,
        city: school.city ?? "",
        slug: school.slug,
        grades: school.grades.slice(0, 4),
      }));
      const primary = result.results[0];
      if (!primary) return { ...EMPTY_CARDS, schoolCards };

      const supabase = createSupabaseAdminClient();
      const { data: bundle, error } = await supabase.rpc(
        "get_public_school_pack" as never,
        { school_slug: primary.slug } as never,
      );
      const packCards = !error && bundle && typeof bundle === "object" && !Array.isArray(bundle)
        ? publicPackCards(bundle as PublicSchoolBundle)
        : [];
      return { ...EMPTY_CARDS, schoolCards, packCards };
    }

    if (intent === "product_search") {
      const supabase = createSupabaseAdminClient();
      const { data, error } = await supabase.rpc("search_public_products" as never, {
        search_query: query.slice(0, 160),
        result_limit: 4,
      } as never);
      if (error || !Array.isArray(data)) return EMPTY_CARDS;
      const productCards = (data as Array<Record<string, unknown>>).map((product) => ({
        id: String(product.id),
        name: String(product.name ?? "Stationery item"),
        category: typeof product.category === "string" ? product.category : null,
        description: typeof product.description === "string" ? product.description : null,
        unit: typeof product.unit === "string" ? product.unit : null,
        price: Math.max(0, finiteNumber(product.current_selling_price)),
        requiresPexcover: product.requires_pexcover === true,
      }));
      return { ...EMPTY_CARDS, productCards };
    }
  } catch (error) {
    console.error("[pex-chat] Public catalogue lookup failed:", error);
  }

  return EMPTY_CARDS;
}