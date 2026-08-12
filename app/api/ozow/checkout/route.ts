import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import {
  isSameOriginRequest,
  rateLimitRequest,
} from "@/lib/security/requestGuards";
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

  // 1. Verify environment variable availability
  const siteCode = process.env.OZOW_SITE_CODE ?? "";
  const privateKey = process.env.OZOW_PRIVATE_KEY ?? "";
  const apiKey = process.env.OZOW_API_KEY ?? "";
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "";
  const isTest = process.env.OZOW_IS_TEST === "true";

  const missingKeys: string[] = [];
  if (!siteCode) missingKeys.push("OZOW_SITE_CODE");
  if (!privateKey) missingKeys.push("OZOW_PRIVATE_KEY");
  if (!apiKey) missingKeys.push("OZOW_API_KEY");
  if (!appUrl) missingKeys.push("NEXT_PUBLIC_APP_URL");

  if (missingKeys.length > 0) {
    const errorMsg = `Missing required environment variable(s): ${missingKeys.join(", ")}`;
    console.error(`[ozow/checkout] ${errorMsg}`);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
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

    let transactionReference =
      (typeof body.orderId === "string" && body.orderId) ||
      (typeof body.orderReference === "string" && body.orderReference) ||
      "";

    let rawAmount =
      typeof body.amount === "number" || typeof body.amount === "string"
        ? Number(body.amount)
        : typeof body.estimatedTotal === "number"
          ? body.estimatedTotal
          : 0;

    const customerEmail =
      (typeof body.customerEmail === "string" && body.customerEmail) ||
      (typeof body.buyerEmail === "string" && body.buyerEmail) ||
      "";

    const packsRaw = Array.isArray(body.packs) ? body.packs : [];

    // If order has packs, save/retrieve order in DB
    if (packsRaw.length > 0 || isTrayOrder) {
      const buyerName = typeof body.buyerName === "string" ? body.buyerName : "";
      const buyerPhone = typeof body.buyerPhone === "string" ? body.buyerPhone : "";
      const deliveryMethod = typeof body.deliveryMethod === "string" ? body.deliveryMethod : "school_collection";
      const primarySchoolSlug = typeof body.primarySchoolSlug === "string" ? body.primarySchoolSlug : undefined;
      const notes = typeof body.notes === "string" ? body.notes : undefined;
      const idempotencyKey =
        typeof body.idempotencyKey === "string" && body.idempotencyKey.length > 0
          ? body.idempotencyKey
          : undefined;

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
              unitPrice: typeof i.unitPrice === "number" ? i.unitPrice : undefined,
            }))
          : [],
        totalPrice: typeof p.totalPrice === "number" ? p.totalPrice : 0,
        wantsPexcover: p.wantsPexcover === true,
        pexcoverPrice: typeof p.pexcoverPrice === "number" ? p.pexcoverPrice : 0,
        basePackPrice: typeof p.basePackPrice === "number" ? p.basePackPrice : 0,
      }));

      const order = await handleTrayCheckout({
        buyerName,
        buyerEmail: customerEmail,
        buyerPhone,
        estimatedTotal: rawAmount,
        deliveryMethod,
        primarySchoolSlug,
        notes,
        packs,
        paymentGateway: "ozow",
        gatewayMetadata: {
          method: isBnpl ? "HappyPay" : "Ozow",
          is_bnpl: isBnpl,
          ...(isBnpl ? { split_instalments: 2 } : {}),
          amount: rawAmount,
        },
        isBnpl,
        idempotencyKey,
      });

      transactionReference = order.orderReference;
      rawAmount = order.estimatedTotal;
    }

    if (!transactionReference) {
      return NextResponse.json(
        { success: false, error: "Order reference or orderId is required." },
        { status: 400 }
      );
    }

    if (!rawAmount || rawAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid amount is required." },
        { status: 400 }
      );
    }

    // 2. Format Currency to 2 decimal places
    const amount = rawAmount.toFixed(2);
    const countryCode = "ZA";
    const currencyCode = "ZAR";
    const bankReference = transactionReference.slice(0, 20);
    const cancelUrl = `${appUrl}/checkout?cancelled=1`;
    const errorUrl = `${appUrl}/checkout?error=1`;
    const successUrl = `${appUrl}/checkout/success?ref=${encodeURIComponent(transactionReference)}`;
    const notifyUrl = `${appUrl}/api/ozow/webhook`;

    // 3. SHA-512 Hash Generation String Sequence concatenated in lower-case:
    // siteCode + countryCode + currencyCode + amount + transactionReference + bankReference + cancelUrl + errorUrl + successUrl + notifyUrl + isTest + privateKey
    const rawHashString = [
      siteCode,
      countryCode,
      currencyCode,
      amount,
      transactionReference,
      bankReference,
      cancelUrl,
      errorUrl,
      successUrl,
      notifyUrl,
      String(isTest),
      privateKey,
    ]
      .join("")
      .toLowerCase();

    const hashCheck = createHash("sha512").update(rawHashString, "utf8").digest("hex");

    const payload: Record<string, string | boolean> = {
      siteCode,
      countryCode,
      currencyCode,
      amount,
      transactionReference,
      bankReference,
      cancelUrl,
      errorUrl,
      successUrl,
      notifyUrl,
      isTest,
      hashCheck,
    };

    if (isBnpl) {
      payload.paymentMethod = "HappyPay";
    }

    // 4. Post payment request to Ozow API
    const ozowRes = await fetch("https://api.ozow.com/postpaymentrequest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ApiKey: apiKey,
      },
      body: JSON.stringify(payload),
    });

    const rawBody = await ozowRes.text();
    let ozowData: Record<string, unknown> | null = null;
    try {
      ozowData = rawBody ? JSON.parse(rawBody) : null;
    } catch {
      ozowData = null;
    }

    const paymentUrl =
      typeof ozowData?.url === "string"
        ? ozowData.url
        : typeof ozowData?.paymentUrl === "string"
          ? ozowData.paymentUrl
          : typeof ozowData?.PaymentUrl === "string"
            ? ozowData.PaymentUrl
            : "";

    if (!ozowRes.ok || !paymentUrl) {
      console.error("Ozow Gateway API Reject:", ozowRes.status, ozowData || rawBody);

      const errorMessage =
        (typeof ozowData?.errorMessage === "string" && ozowData.errorMessage) ||
        (typeof ozowData?.message === "string" && ozowData.message) ||
        (typeof ozowData?.Error === "string" && ozowData.Error) ||
        (ozowData?.error !== null && typeof ozowData?.error === "object"
          ? (ozowData.error as Record<string, unknown>).Message
          : typeof ozowData?.error === "string"
            ? ozowData.error
            : null) ||
        "Ozow gateway error";

      return NextResponse.json(
        { success: false, error: String(errorMessage) },
        { status: ozowRes.status || 502 }
      );
    }

    return NextResponse.json({
      success: true,
      orderReference: transactionReference,
      url: paymentUrl,
    });
  } catch (error) {
    if (error instanceof TrayCheckoutError) {
      return trayErrorResponse(error);
    }

    console.error(
      "[ozow/checkout] Unexpected error:",
      error instanceof Error ? (error.stack || error.message) : error
    );

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to initialize Ozow payment.",
      },
      { status: 500 }
    );
  }
}
