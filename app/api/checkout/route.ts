import { NextRequest, NextResponse } from "next/server";
import { validateCheckoutPayload } from "@/lib/validation/checkout";
import {
  createPendingOrder,
  generateOrderReference,
  getOrderByIdempotencyKey,
} from "@/lib/orders";
import { calculatePexcoverTotal } from "@/lib/pricing/pexcover";
import { getGradeBySlug } from "@/lib/school-utils";
import {
  isSameOriginRequest,
  rateLimitRequest,
} from "@/lib/security/requestGuards";
import { initiateOzowPayment, OzowCheckoutError } from "@/lib/ozow/checkout";
import {
  handleTrayCheckout,
  TrayCheckoutError,
  trayErrorResponse,
} from "@/lib/checkout/trayCheckout";

export const runtime = "nodejs";

async function resolveTrustedPack(input: {
  schoolSlug: string;
  gradeSlug: string;
  packType: string;
}) {
  if (input.packType !== "full") {
    return null;
  }

  const schoolGrade = await getGradeBySlug(input.schoolSlug, input.gradeSlug);
  if (schoolGrade) {
    return {
      id: schoolGrade.id,
      price: schoolGrade.price,
      items: schoolGrade.contents,
      snapshotItems: (schoolGrade.packItems ?? []).map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice ?? undefined,
      })),
      packItems: schoolGrade.packItems ?? [],
    };
  }

  return null;
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { success: false, error: "Invalid request origin." },
      { status: 403 },
    );
  }

  const limit = rateLimitRequest(request, {
    keyPrefix: "checkout",
    windowMs: 10 * 60 * 1000,
    max: 5,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Too many checkout attempts. Please wait a few minutes and try again.",
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  try {
    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body." },
        { status: 400 },
      );
    }

    const isTrayOrder = body.isTrayOrder === true;

    if (isTrayOrder) {
      const buyerName =
        typeof body.buyerName === "string" ? body.buyerName : "";
      const buyerEmail =
        typeof body.buyerEmail === "string" ? body.buyerEmail : "";
      const buyerPhone =
        typeof body.buyerPhone === "string" ? body.buyerPhone : "";
      const estimatedTotal =
        typeof body.estimatedTotal === "number" ? body.estimatedTotal : 0;
      const deliveryMethod =
        typeof body.deliveryMethod === "string"
          ? body.deliveryMethod
          : "school_collection";
      const primarySchoolSlug =
        typeof body.primarySchoolSlug === "string"
          ? body.primarySchoolSlug
          : undefined;
      const notes = typeof body.notes === "string" ? body.notes : undefined;
      const idempotencyKey =
        typeof body.idempotencyKey === "string" &&
        body.idempotencyKey.length > 0
          ? body.idempotencyKey
          : undefined;

      const packsRaw = Array.isArray(body.packs) ? body.packs : [];

      const packs = packsRaw.map((p: Record<string, unknown>) => ({
        learnerName: typeof p.learnerName === "string" ? p.learnerName : "",
        schoolSlug: typeof p.schoolSlug === "string" ? p.schoolSlug : "",
        schoolName: typeof p.schoolName === "string" ? p.schoolName : "",
        grade: typeof p.grade === "string" ? p.grade : "",
        gradeSlug: typeof p.gradeSlug === "string" ? p.gradeSlug : "",
        packName: typeof p.packName === "string" ? p.packName : "",
        packMode: typeof p.packMode === "string" ? p.packMode : "full",
        items: Array.isArray(p.items)
          ? p.items.map((i: Record<string, unknown>) => ({
              name: typeof i.name === "string" ? i.name : "",
              quantity: typeof i.quantity === "number" ? i.quantity : 0,
              unitPrice:
                typeof i.unitPrice === "number" ? i.unitPrice : undefined,
            }))
          : [],
        totalPrice: typeof p.totalPrice === "number" ? p.totalPrice : 0,
        wantsPexcover: p.wantsPexcover === true,
        pexcoverPrice:
          typeof p.pexcoverPrice === "number" ? p.pexcoverPrice : 0,
        basePackPrice:
          typeof p.basePackPrice === "number" ? p.basePackPrice : 0,
      }));

      const order = await handleTrayCheckout({
        buyerName,
        buyerEmail,
        buyerPhone,
        estimatedTotal,
        deliveryMethod,
        primarySchoolSlug,
        notes,
        packs,
        paymentGateway: "ozow",
        gatewayMetadata: {
          method: "Ozow",
          is_bnpl: false,
          amount: estimatedTotal,
        },
        idempotencyKey,
      });

      const { url } = await initiateOzowPayment({
        orderReference: order.orderReference,
        amount: order.estimatedTotal,
        buyerEmail,
        isBnpl: false,
      });

      return NextResponse.json({
        success: true,
        orderReference: order.orderReference,
        reused: order.reused === true,
        url,
      });
    }

    const validated = validateCheckoutPayload(body);

    if (validated.errors) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed.",
          errors: validated.errors,
        },
        { status: 400 },
      );
    }

    const data = validated.data;
    const trustedPack = await resolveTrustedPack({
      schoolSlug: data.schoolSlug,
      gradeSlug: data.gradeSlug,
      packType: data.packType,
    });

    if (!trustedPack) {
      return NextResponse.json(
        {
          success: false,
          error:
            "We could not find this pack. Please choose your school pack again.",
        },
        { status: 400 },
      );
    }

    const pexcoverResult = calculatePexcoverTotal(trustedPack.packItems);
    const pexcoverAmount =
      data.pexcoverSelected && pexcoverResult.hasEligibleBooks
        ? pexcoverResult.pexcoverTotalRands
        : 0;
    const trustedTotal = trustedPack.price + pexcoverAmount;
    const trustedItems =
      data.pexcoverSelected && pexcoverResult.hasEligibleBooks
        ? [
            ...trustedPack.items,
            `Pexcover book covering - R ${pexcoverAmount.toFixed(2)} (${pexcoverResult.coverableItemCount} books)`,
          ]
        : trustedPack.items;

    const orderReference = generateOrderReference();
    const idempotencyKey =
      typeof body.idempotencyKey === "string" && body.idempotencyKey.length > 0
        ? body.idempotencyKey
        : undefined;

    if (idempotencyKey) {
      const existing = await getOrderByIdempotencyKey(idempotencyKey);
      if (existing) {
        const { url } = await initiateOzowPayment({
          orderReference: existing.orderReference,
          amount: trustedTotal,
          buyerEmail: data.buyerEmail,
          isBnpl: false,
        });
        return NextResponse.json({
          success: true,
          orderReference: existing.orderReference,
          reused: true,
          url,
        });
      }
    }

    await createPendingOrder({
      orderReference,
      buyerName: data.buyerName,
      buyerEmail: data.buyerEmail,
      buyerPhone: data.buyerPhone,
      learnerName: data.learnerName,
      schoolSlug: data.schoolSlug,
      schoolName: data.schoolName,
      grade: data.grade,
      packType: data.packType,
      items: trustedItems,
      estimatedTotal: trustedTotal,
      deliveryMethod: data.deliveryMethod,
      notes: data.notes,
      paymentGateway: "ozow",
      gatewayMetadata: {
        method: "Ozow",
        is_bnpl: false,
        amount: trustedTotal,
      },
      idempotencyKey,
      packId: trustedPack.id,
      snapshotItems: trustedPack.snapshotItems,
    });

    const { url } = await initiateOzowPayment({
      orderReference,
      amount: trustedTotal,
      buyerEmail: data.buyerEmail,
      isBnpl: false,
    });

    return NextResponse.json({
      success: true,
      orderReference,
      reused: false,
      url,
    });
  } catch (error) {
    if (error instanceof TrayCheckoutError) {
      return trayErrorResponse(error);
    }

    if (error instanceof OzowCheckoutError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 502 },
      );
    }

    console.error(
      "[checkout] Unexpected error:",
      error instanceof Error ? error.stack || error.message : error,
    );
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred during checkout.",
      },
      { status: 500 },
    );
  }
}
