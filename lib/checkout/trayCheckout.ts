import { NextResponse } from "next/server";
import {
  createMultiPackOrder,
  generateOrderReference,
  getOrderByIdempotencyKey,
} from "@/lib/orders";
import { calculatePexcoverTotal } from "@/lib/pricing/pexcover";
import { getGradeBySlug } from "@/lib/school-utils";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type PackPricingColumns = {
  margin_rate_used: number | null;
  packaging_cost: number | null;
  assembly_cost: number | null;
  freight_cost: number | null;
  price: number | null;
};

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

async function getPackPricingColumns(
  packId: string,
): Promise<PackPricingColumns | null> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("school_packs" as never)
      .select(
        "price,margin_rate_used,packaging_cost,assembly_cost,freight_cost",
      )
      .eq("id", packId)
      .maybeSingle();
    if (error || !data) return null;
    return data as unknown as PackPricingColumns;
  } catch {
    return null;
  }
}

// Matches the authoritative pricing in lib/packs/calculatePackTotal.ts
// and app/api/packs/custom-total/route.ts:
//   full selection -> packRow.price
//   partial/custom  -> (subtotal / (1 - marginRate)) + fixedPackCost
function calculateCustomisedPackTotal(
  selectedSubtotal: number,
  isFullSelection: boolean,
  pricing: PackPricingColumns | null,
): number {
  if (
    isFullSelection &&
    typeof pricing?.price === "number" &&
    pricing.price > 0
  ) {
    return roundMoney(pricing.price);
  }

  const marginRate = Number(pricing?.margin_rate_used ?? 0);
  const safeMarginRate = marginRate > 0 && marginRate < 1 ? marginRate : 0;
  const fixedPackCost =
    Number(pricing?.packaging_cost ?? 0) +
    Number(pricing?.assembly_cost ?? 0) +
    Number(pricing?.freight_cost ?? 0);

  if (safeMarginRate > 0) {
    return roundMoney(selectedSubtotal / (1 - safeMarginRate) + fixedPackCost);
  }

  return roundMoney(selectedSubtotal + fixedPackCost);
}

export class TrayCheckoutError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "TrayCheckoutError";
  }
}

type TrayPack = {
  learnerName: string;
  schoolSlug: string;
  schoolName: string;
  grade: string;
  gradeSlug: string;
  packName: string;
  packMode: string;
  items: { name: string; quantity: number; unitPrice?: number }[];
  totalPrice: number;
  wantsPexcover: boolean;
  pexcoverPrice: number;
  basePackPrice: number;
  packId?: string;
};

export async function handleTrayCheckout(input: {
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  estimatedTotal: number;
  deliveryMethod: string;
  primarySchoolSlug?: string;
  notes?: string;
  packs: TrayPack[];
  paymentGateway?: string;
  gatewayMetadata?: Record<string, string | number | boolean | null>;
  isBnpl?: boolean;
  idempotencyKey?: string;
}) {
  const buyerName = input.buyerName.trim();
  const buyerEmail = input.buyerEmail.trim().toLowerCase();
  const buyerPhone = input.buyerPhone.trim();

  if (!buyerName || buyerName.length < 2) {
    throw new TrayCheckoutError("Name must be at least 2 characters.", 400);
  }
  if (!buyerEmail) {
    throw new TrayCheckoutError("Email is required.", 400);
  }
  if (!buyerPhone) {
    throw new TrayCheckoutError("Phone is required.", 400);
  }
  if (input.packs.length === 0) {
    throw new TrayCheckoutError("No packs in order.", 400);
  }
  if (!input.estimatedTotal || input.estimatedTotal <= 0) {
    throw new TrayCheckoutError("Invalid total.", 400);
  }

  const isSchoolCollection =
    input.deliveryMethod === "school_collection" ||
    input.deliveryMethod === "School collection";

  if (isSchoolCollection) {
    const schoolSlugs = [
      ...new Set(
        [
          ...input.packs.map((p) => p.schoolSlug),
          input.primarySchoolSlug,
        ].filter((s): s is string => Boolean(s)),
      ),
    ];

    if (schoolSlugs.length > 0) {
      const supabase = createSupabaseAdminClient();
      const { data: schoolsData, error: schoolsError } = await supabase
        .from("schools")
        .select("id, name, slug, parent_collection_accepted")
        .in("slug", schoolSlugs);

      if (schoolsError) {
        console.error("[trayCheckout] Failed to check collection eligibility:", schoolsError);
      } else if (schoolsData) {
        const disallowed = schoolsData.filter(
          (s) => s.parent_collection_accepted === false,
        );
        if (disallowed.length > 0) {
          const names = disallowed.map((s) => s.name).join(", ");
          throw new TrayCheckoutError(
            `School collection is not available for ${names}. Please select home delivery or arranged collection.`,
            400,
          );
        }
      }
    }
  }

  if (input.idempotencyKey) {
    const existing = await getOrderByIdempotencyKey(input.idempotencyKey);
    if (existing) {
      return {
        id: existing.id,
        orderReference: existing.orderReference,
        uniqueCustomerId: existing.uniqueCustomerId,
        trackingToken: existing.trackingToken,
        estimatedTotal: input.estimatedTotal,
        reused: true,
      };
    }
  }

  let verifiedTotal = 0;
  const verifiedPacks: TrayPack[] = [];
  for (const pack of input.packs) {
    const serverPack = await getGradeBySlug(pack.schoolSlug, pack.gradeSlug);
    if (!serverPack) {
      throw new TrayCheckoutError(
        `Pack not found: ${pack.schoolSlug}/${pack.gradeSlug}. Please re-select your school.`,
        400,
      );
    }

    if (pack.packMode === "full") {
      const pexcoverResult = calculatePexcoverTotal(serverPack.packItems ?? []);
      const packPexcoverCost =
        pack.wantsPexcover && pexcoverResult.hasEligibleBooks
          ? pexcoverResult.pexcoverTotalRands
          : 0;

      verifiedTotal += serverPack.price + packPexcoverCost;
      verifiedPacks.push({
        ...pack,
        packId: serverPack.id,
        items: (serverPack.packItems ?? []).map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice ?? undefined,
          requiresPexcover: item.requiresPexcover,
          pexcoCode: item.pexcoCode,
          pexcoRateCents: item.pexcoRateCents,
          pexcoRateActive: item.pexcoRateActive,
        })),
        totalPrice: serverPack.price,
        basePackPrice: serverPack.price,
        pexcoverPrice: packPexcoverCost,
      });
    } else {
      const authoritativeItems = new Map(
        (serverPack.packItems ?? []).map((item) => [
          item.name.trim().toLowerCase(),
          item,
        ]),
      );
      const selectedItems = pack.items
        .map((item) => {
          const authoritative = authoritativeItems.get(
            item.name.trim().toLowerCase(),
          );
          if (!authoritative) {
            throw new TrayCheckoutError(
              `Item is no longer available in ${serverPack.grade}: ${item.name}`,
              400,
            );
          }
          const quantity = Math.max(0, Math.min(99, Math.trunc(item.quantity)));
          return {
            name: authoritative.name,
            quantity,
            unitPrice: authoritative.unitPrice ?? 0,
            requiresPexcover: authoritative.requiresPexcover,
            pexcoCode: authoritative.pexcoCode,
            pexcoRateCents: authoritative.pexcoRateCents,
            pexcoRateActive: authoritative.pexcoRateActive,
          };
        })
        .filter((item) => item.quantity > 0);
      const itemsTotal = selectedItems.reduce(
        (sum, item) => sum + (item.unitPrice ?? 0) * item.quantity,
        0,
      );
      const pexcoverResult = calculatePexcoverTotal(selectedItems);
      const packPexcoverCost =
        pack.wantsPexcover && pexcoverResult.hasEligibleBooks
          ? pexcoverResult.pexcoverTotalRands
          : 0;

      // Apply the authoritative margin-inclusive pricing (same model as the
      // client customiser and /api/packs/custom-total) so the server total
      // matches what the customer is shown and charged.
      const isFullSelection =
        selectedItems.length > 0 &&
        selectedItems.length === (serverPack.packItems ?? []).length &&
        selectedItems.every(
          (item) =>
            item.quantity ===
            (authoritativeItems.get(item.name.trim().toLowerCase())
              ?.quantity ?? 0),
        );
      const pricing = await getPackPricingColumns(serverPack.id);
      const packTotal = calculateCustomisedPackTotal(
        itemsTotal,
        isFullSelection,
        pricing,
      );

      verifiedTotal += packTotal + packPexcoverCost;
      verifiedPacks.push({
        ...pack,
        packId: serverPack.id,
        items: selectedItems,
        totalPrice: packTotal,
        basePackPrice: packTotal,
        pexcoverPrice: packPexcoverCost,
      });
    }
  }

  if (Math.abs(verifiedTotal - input.estimatedTotal) > 1) {
    console.error("[trayCheckout] Tray price mismatch:", {
      clientTotal: input.estimatedTotal,
      serverTotal: verifiedTotal,
    });
    throw new TrayCheckoutError(
      "Prices have changed since you added items. Please refresh your pack tray.",
      400,
    );
  }

  const orderReference = generateOrderReference();
  const amount = verifiedTotal.toFixed(2);
  const isBnpl = input.isBnpl === true;

  const summaryItems = [
    isBnpl ? "HAPPY PAY SPLIT PAYMENT" : "OZOW PAYMENT",
    isBnpl
      ? "Payment method: Happy Pay (2 x interest-free instalments)"
      : "Payment method: Ozow (Pay Now)",
    `Total: R${amount}`,
    "---",
    ...verifiedPacks.flatMap((pack) => [
      `Learner: ${pack.learnerName || "Unnamed"}`,
      `School: ${pack.schoolName || "N/A"} - ${pack.grade || "N/A"}`,
      `Pack: ${pack.packName} (${pack.packMode})`,
      ...pack.items.map((i) => `${i.quantity} x ${i.name}`),
      pack.wantsPexcover
        ? `Pexcover book covering - R ${pack.pexcoverPrice}`
        : "",
      `---`,
    ]),
  ].filter(Boolean);

  const order = await createMultiPackOrder({
    orderReference,
    buyerName,
    buyerEmail,
    buyerPhone,
    packs: verifiedPacks,
    estimatedTotal: verifiedTotal,
    deliveryMethod: input.deliveryMethod,
    primarySchoolSlug: input.primarySchoolSlug,
    notes: input.notes,
    summaryItems,
    paymentGateway: input.paymentGateway,
    gatewayMetadata: input.gatewayMetadata,
    idempotencyKey: input.idempotencyKey,
  });

  return {
    id: order.id,
    orderReference: order.orderReference,
    uniqueCustomerId: order.uniqueCustomerId,
    trackingToken: order.trackingToken,
    estimatedTotal: verifiedTotal,
    reused: false,
  };
}

export function trayErrorResponse(err: unknown) {
  if (err instanceof TrayCheckoutError) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.status },
    );
  }
  console.error(
    "[trayCheckout] Unexpected error:",
    err instanceof Error ? err.stack || err.message : err,
  );
  return NextResponse.json(
    { success: false, error: "An unexpected error occurred." },
    { status: 500 },
  );
}
