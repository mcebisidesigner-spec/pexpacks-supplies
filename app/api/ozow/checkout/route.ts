import { NextRequest, NextResponse } from "next/server";
import {
  createMultiPackOrder,
  generateOrderReference,
} from "@/lib/orders";
import { PEXCOVER_PRICE } from "@/lib/constants";
import { getGradeBySlug } from "@/lib/school-utils";
import {
  isSameOriginRequest,
  rateLimitRequest,
} from "@/lib/security/requestGuards";
import { initiateOzowPayment, OzowCheckoutError } from "@/lib/ozow/checkout";
import { getOzowConfig } from "@/lib/ozow/signature";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { success: false, error: "Invalid request origin." },
      { status: 403 }
    );
  }

  const limit = rateLimitRequest(request, {
    keyPrefix: "ozow-checkout",
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

    const buyerName = typeof body.buyerName === "string" ? body.buyerName.trim() : "";
    const buyerEmail = typeof body.buyerEmail === "string" ? body.buyerEmail.trim().toLowerCase() : "";
    const buyerPhone = typeof body.buyerPhone === "string" ? body.buyerPhone.trim() : "";
    const estimatedTotal = typeof body.estimatedTotal === "number" ? body.estimatedTotal : 0;
    const deliveryMethod = typeof body.deliveryMethod === "string" ? body.deliveryMethod : "school_collection";
    const primarySchoolSlug = typeof body.primarySchoolSlug === "string" ? body.primarySchoolSlug : undefined;
    const notes = typeof body.notes === "string" ? body.notes : undefined;
    const packsRaw = Array.isArray(body.packs) ? body.packs : [];

    if (!buyerName || buyerName.length < 2) {
      return NextResponse.json({ success: false, error: "Name must be at least 2 characters." }, { status: 400 });
    }
    if (!buyerEmail) {
      return NextResponse.json({ success: false, error: "Email is required." }, { status: 400 });
    }
    if (!buyerPhone) {
      return NextResponse.json({ success: false, error: "Phone is required." }, { status: 400 });
    }
    if (packsRaw.length === 0) {
      return NextResponse.json({ success: false, error: "No packs in order." }, { status: 400 });
    }
    if (!estimatedTotal || estimatedTotal <= 0) {
      return NextResponse.json({ success: false, error: "Invalid total." }, { status: 400 });
    }

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

    let verifiedTotal = 0;
    for (const pack of packs) {
      if (pack.packMode === "full") {
        const serverPack = await getGradeBySlug(pack.schoolSlug, pack.gradeSlug);
        if (!serverPack) {
          return NextResponse.json(
            { success: false, error: `Pack not found: ${pack.schoolSlug}/${pack.gradeSlug}. Please re-select your school.` },
            { status: 400 }
          );
        }
        verifiedTotal += serverPack.price + (pack.wantsPexcover ? PEXCOVER_PRICE : 0);
      } else {
        const hasUnitPrices = pack.items.some((i) => i.unitPrice !== undefined && i.unitPrice !== null);
        if (hasUnitPrices) {
          const itemsTotal = pack.items.reduce((sum, i) => sum + (i.unitPrice ?? 0) * i.quantity, 0);
          verifiedTotal += itemsTotal + (pack.wantsPexcover ? PEXCOVER_PRICE : 0);
        } else {
          verifiedTotal += pack.totalPrice + (pack.wantsPexcover ? PEXCOVER_PRICE : 0);
        }
      }
    }

    if (Math.abs(verifiedTotal - estimatedTotal) > 1) {
      console.error("[ozow/checkout] Tray price mismatch:", { clientTotal: estimatedTotal, serverTotal: verifiedTotal });
      return NextResponse.json(
        { success: false, error: "Prices have changed since you added items. Please refresh your pack tray." },
        { status: 400 }
      );
    }

    const orderReference = generateOrderReference();
    const amount = verifiedTotal.toFixed(2);

    const summaryItems = [
      isBnpl ? "HAPPY PAY SPLIT PAYMENT" : "OZOW PAYMENT",
      isBnpl
        ? "Payment method: Happy Pay (2 x interest-free instalments)"
        : "Payment method: Ozow (Pay Now)",
      `Total: R${amount}`,
      "---",
      ...packs.flatMap((pack) => [
        `Learner: ${pack.learnerName || "Unnamed"}`,
        `School: ${pack.schoolName || "N/A"} - ${pack.grade || "N/A"}`,
        `Pack: ${pack.packName} (${pack.packMode})`,
        ...pack.items.map((i) => `${i.quantity} x ${i.name}`),
        pack.wantsPexcover ? `Pexcover book covering - R ${pack.pexcoverPrice}` : "",
        `---`,
      ]),
    ].filter(Boolean);

    await createMultiPackOrder({
      orderReference,
      buyerName,
      buyerEmail,
      buyerPhone,
      packs,
      estimatedTotal: verifiedTotal,
      deliveryMethod,
      primarySchoolSlug,
      notes,
      summaryItems,
      paymentGateway: "ozow",
      gatewayMetadata: {
        method: isBnpl ? "HappyPay" : "Ozow",
        is_bnpl: isBnpl,
        ...(isBnpl ? { split_instalments: 2 } : {}),
        amount: verifiedTotal,
      },
    });

    const { url } = await initiateOzowPayment({
      orderReference,
      amount: verifiedTotal,
      buyerEmail,
      isBnpl,
    });

    return NextResponse.json({
      success: true,
      orderReference,
      url,
    });
  } catch (error) {
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
