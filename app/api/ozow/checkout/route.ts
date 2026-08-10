import { NextRequest, NextResponse } from "next/server";
import {
  isSameOriginRequest,
  rateLimitRequest,
} from "@/lib/security/requestGuards";
import { initiateOzowPayment, OzowCheckoutError } from "@/lib/ozow/checkout";
import { getOzowConfig } from "@/lib/ozow/signature";
import { handleTrayCheckout, TrayCheckoutError, trayErrorResponse } from "@/lib/checkout/trayCheckout";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { success: false, error: "Invalid request origin." },
      { status: 403 }
    );
  }

  const limit = rateLimitRequest(request, {
    keyPrefix: "checkout",
    windowMs: 10 * 60 * 1000,
    max: 5,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many checkout attempts. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const config = getOzowConfig();

  if (!config) {
    console.error("[ozow/checkout] Missing Ozow configuration.");
    return NextResponse.json(
      { success: false, error: "Payments are temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }

  try {
    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const isBnpl = body.isBnpl === true;
    const isTrayOrder = body.isTrayOrder === true;

    if (!isTrayOrder) {
      return NextResponse.json(
        { success: false, error: "Ozow is only available for pack orders." },
        { status: 400 }
      );
    }

    const buyerName = typeof body.buyerName === "string" ? body.buyerName : "";
    const buyerEmail = typeof body.buyerEmail === "string" ? body.buyerEmail : "";
    const buyerPhone = typeof body.buyerPhone === "string" ? body.buyerPhone : "";
    const estimatedTotal = typeof body.estimatedTotal === "number" ? body.estimatedTotal : 0;
    const deliveryMethod = typeof body.deliveryMethod === "string" ? body.deliveryMethod : "school_collection";
    const primarySchoolSlug = typeof body.primarySchoolSlug === "string" ? body.primarySchoolSlug : undefined;
    const notes = typeof body.notes === "string" ? body.notes : undefined;
    const idempotencyKey =
      typeof body.idempotencyKey === "string" && body.idempotencyKey.length > 0
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
      items: Array.isArray(p.items) ? p.items.map((i: Record<string, unknown>) => ({
        name: typeof i.name === "string" ? i.name : "",
        quantity: typeof i.quantity === "number" ? i.quantity : 0,
        unitPrice: typeof i.unitPrice === "number" ? i.unitPrice : undefined,
      })) : [],
      totalPrice: typeof p.totalPrice === "number" ? p.totalPrice : 0,
      wantsPexcover: p.wantsPexcover === true,
      pexcoverPrice: typeof p.pexcoverPrice === "number" ? p.pexcoverPrice : 0,
      basePackPrice: typeof p.basePackPrice === "number" ? p.basePackPrice : 0,
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
        method: isBnpl ? "HappyPay" : "Ozow",
        is_bnpl: isBnpl,
        ...(isBnpl ? { split_instalments: 2 } : {}),
        amount: estimatedTotal,
      },
      isBnpl,
      idempotencyKey,
    });

    const { url } = await initiateOzowPayment({
      orderReference: order.orderReference,
      amount: order.estimatedTotal,
      buyerEmail,
      isBnpl,
    });

    return NextResponse.json({
      success: true,
      orderReference: order.orderReference,
      reused: order.reused === true,
      url,
    });
  } catch (error) {
    if (error instanceof TrayCheckoutError) {
      return trayErrorResponse(error);
    }

    if (error instanceof OzowCheckoutError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 502 }
      );
    }

    console.error(
      "[ozow/checkout] Unexpected error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
