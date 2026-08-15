import { NextResponse } from "next/server";
import { createMultiPackOrder, generateOrderReference, getOrderByIdempotencyKey } from "@/lib/orders";
import { PEXCOVER_PRICE } from "@/lib/constants";
import { getGradeBySlug } from "@/lib/school-utils";

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
  for (const pack of input.packs) {
    const serverPack = await getGradeBySlug(pack.schoolSlug, pack.gradeSlug);
    if (!serverPack) {
      throw new TrayCheckoutError(
        `Pack not found: ${pack.schoolSlug}/${pack.gradeSlug}. Please re-select your school.`,
        400,
      );
    }

    if (pack.packMode === "full") {
      verifiedTotal += serverPack.price + (pack.wantsPexcover ? PEXCOVER_PRICE : 0);
    } else {
      const hasUnitPrices = pack.items.some(
        (i) => i.unitPrice !== undefined && i.unitPrice !== null
      );
      if (hasUnitPrices) {
        const itemsTotal = pack.items.reduce(
          (sum, i) => sum + (i.unitPrice ?? 0) * i.quantity,
          0
        );
        verifiedTotal += itemsTotal + (pack.wantsPexcover ? PEXCOVER_PRICE : 0);
      } else {
        verifiedTotal += pack.totalPrice + (pack.wantsPexcover ? PEXCOVER_PRICE : 0);
      }
    }
  }

  if (Math.abs(verifiedTotal - input.estimatedTotal) > 1) {
    console.error("[trayCheckout] Tray price mismatch:", {
      clientTotal: input.estimatedTotal,
      serverTotal: verifiedTotal,
    });
    throw new TrayCheckoutError(
      "Prices have changed since you added items. Please refresh your pack tray.",
      400
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
    ...input.packs.flatMap((pack) => [
      `Learner: ${pack.learnerName || "Unnamed"}`,
      `School: ${pack.schoolName || "N/A"} - ${pack.grade || "N/A"}`,
      `Pack: ${pack.packName} (${pack.packMode})`,
      ...pack.items.map((i) => `${i.quantity} x ${i.name}`),
      pack.wantsPexcover ? `Pexcover book covering - R ${pack.pexcoverPrice}` : "",
      `---`,
    ]),
  ].filter(Boolean);

  const order = await createMultiPackOrder({
    orderReference,
    buyerName,
    buyerEmail,
    buyerPhone,
    packs: input.packs,
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
      { status: err.status }
    );
  }
  console.error(
    "[trayCheckout] Unexpected error:",
    err instanceof Error ? (err.stack || err.message) : err
  );
  return NextResponse.json(
    { success: false, error: "An unexpected error occurred." },
    { status: 500 }
  );
}
