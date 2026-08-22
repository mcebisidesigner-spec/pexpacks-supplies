import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/types";
import { getSchool, type SchoolRow } from "@/lib/admin/schools";

interface ProfileOrder {
  id: string;
  school_slug: string | null;
  school_name: string;
  status: string;
  metadata: Json | null;
}

interface OrderPack {
  school_slug?: string;
}

export interface SchoolProfileData {
  school: SchoolRow;
  totalPacks: number;
  visiblePacks: number;
  packsBought: number;
  paidOrders: number;
  pendingOrders: number;
  acceptsDelivery: boolean;
  acceptsCollection: boolean;
  deliveryPackCount: number;
}

const BOUGHT_STATUSES = new Set(["paid", "packing", "delivered"]);
const PENDING_STATUSES = new Set([
  "pending_payment",
  "pending",
  "paid",
  "packing",
]);

function metadataPacks(metadata: Json | null): OrderPack[] {
  if (!metadata || Array.isArray(metadata) || typeof metadata !== "object")
    return [];
  const packs = (metadata as Record<string, Json | undefined>).packs;
  if (!Array.isArray(packs)) return [];

  return packs.flatMap((pack) => {
    if (!pack || typeof pack !== "object" || Array.isArray(pack)) return [];
    const schoolSlug = pack.school_slug;
    return [
      { school_slug: typeof schoolSlug === "string" ? schoolSlug : undefined },
    ];
  });
}

function matchingPackCount(order: ProfileOrder, school: SchoolRow): number {
  const matchingPacks = metadataPacks(order.metadata).filter(
    (pack) => pack.school_slug?.toLowerCase() === school.slug.toLowerCase(),
  );

  if (matchingPacks.length > 0) return matchingPacks.length;

  const directSlugMatch =
    order.school_slug?.toLowerCase() === school.slug.toLowerCase();
  const directNameMatch =
    order.school_name.trim().toLowerCase() === school.name.trim().toLowerCase();
  return directSlugMatch || directNameMatch ? 1 : 0;
}

export async function getSchoolProfile(
  idOrSlug: string,
): Promise<SchoolProfileData | null> {
  const school = await getSchool(idOrSlug);
  if (!school) return null;

  const admin = createSupabaseAdminClient();
  const orderFields = "id,school_slug,school_name,status,metadata";

  const [
    packsResult,
    directOrdersResult,
    namedOrdersResult,
    multiPackOrdersResult,
  ] = await Promise.all([
    admin
      .from("school_packs")
      .select("id,visible,delivery_type")
      .eq("school_id", school.id),
    admin.from("orders").select(orderFields).eq("school_slug", school.slug),
    admin.from("orders").select(orderFields).ilike("school_name", school.name),
    admin
      .from("orders")
      .select(orderFields)
      .contains("metadata", { packs: [{ school_slug: school.slug }] }),
  ]);

  if (packsResult.error) {
    console.error("[school-profile] packs failed:", packsResult.error);
  }

  for (const result of [
    directOrdersResult,
    namedOrdersResult,
    multiPackOrdersResult,
  ]) {
    if (result.error)
      console.error("[school-profile] orders failed:", result.error);
  }

  const packs = packsResult.data ?? [];
  const visiblePacks = packs.filter((pack) => pack.visible);
  const ordersById = new Map<string, ProfileOrder>();

  for (const result of [
    directOrdersResult,
    namedOrdersResult,
    multiPackOrdersResult,
  ]) {
    for (const order of (result.data ?? []) as ProfileOrder[]) {
      ordersById.set(order.id, order);
    }
  }

  const orders = [...ordersById.values()];
  const paidOrders = orders.filter((order) =>
    BOUGHT_STATUSES.has(order.status),
  );
  const packsBought = paidOrders.reduce(
    (total, order) => total + matchingPackCount(order, school),
    0,
  );
  const deliveryPacks = visiblePacks.filter((pack) => {
    const mode = pack.delivery_type.toLowerCase();
    return mode.includes("courier") || mode.includes("delivery");
  });
  return {
    school,
    totalPacks: packs.length,
    visiblePacks: visiblePacks.length,
    packsBought,
    paidOrders: paidOrders.length,
    pendingOrders: orders.filter((order) => PENDING_STATUSES.has(order.status))
      .length,
    acceptsDelivery: deliveryPacks.length > 0,
    acceptsCollection: school.parent_collection_accepted,
    deliveryPackCount: deliveryPacks.length,
  };
}
