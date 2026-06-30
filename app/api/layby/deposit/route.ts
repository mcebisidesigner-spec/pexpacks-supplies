import { NextRequest, NextResponse } from "next/server";
import { createMultiPackOrder, generateOrderReference } from "@/lib/orders";
import { initializePaystackTransaction } from "@/lib/paystack";

export const runtime = "nodejs";

function buildBaseUrl(request: NextRequest): string {
  const host = request.headers.get("host") || request.headers.get("x-forwarded-host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  if (host) {
    return `${proto}://${host}`;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export async function POST(request: NextRequest) {
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

    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.error("[layby-deposit] Missing PAYSTACK_SECRET_KEY");
      return NextResponse.json(
        { success: false, error: "Payment service is not configured." },
        { status: 500 }
      );
    }

    const baseUrl = buildBaseUrl(request);

    const buyerName = typeof body.buyerName === "string" ? body.buyerName.trim() : "";
    const buyerEmail = typeof body.buyerEmail === "string" ? body.buyerEmail.trim().toLowerCase() : "";
    const buyerPhone = typeof body.buyerPhone === "string" ? body.buyerPhone.trim() : "";
    const estimatedTotal = typeof body.estimatedTotal === "number" ? body.estimatedTotal : 0;
    const depositAmount = typeof body.depositAmount === "number" ? body.depositAmount : 0;
    const fullTotal = typeof body.fullTotal === "number" ? body.fullTotal : estimatedTotal;
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
    if (!fullTotal || fullTotal <= 0) {
      return NextResponse.json({ success: false, error: "Invalid total." }, { status: 400 });
    }
    if (!depositAmount || depositAmount <= 0) {
      return NextResponse.json({ success: false, error: "Invalid deposit amount." }, { status: 400 });
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

    const orderReference = generateOrderReference();

    const summaryItems = [
      "LAY-BY DEPOSIT",
      `Full total: R${fullTotal} | Deposit: R${depositAmount}`,
      `Remaining: R${fullTotal - depositAmount} (4 monthly instalments)`,
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

    // Create order with deposit as estimated_total (Paystack verification matches this amount)
    // Full total is stored in metadata for reference
    await createMultiPackOrder({
      orderReference,
      buyerName,
      buyerEmail,
      buyerPhone,
      packs,
      estimatedTotal: depositAmount,
      deliveryMethod,
      primarySchoolSlug,
      notes,
      summaryItems,
    });

    let paystackResult;

    try {
      paystackResult = await initializePaystackTransaction({
        email: buyerEmail,
        amountInCents: Math.round(depositAmount * 100),
        reference: orderReference,
        callbackUrl: `${baseUrl}/checkout/success?ref=${orderReference}`,
        metadata: {
          order_reference: orderReference,
          buyer_name: buyerName,
          pack_count: String(packs.length),
          payment_type: "layby_deposit",
          full_total: String(fullTotal),
          deposit_amount: String(depositAmount),
          source: "pexpacks_layby_deposit",
        },
      });
    } catch (paystackError) {
      const msg = paystackError instanceof Error ? paystackError.message : String(paystackError);
      console.error("[layby-deposit] Paystack initialization failed:", msg);
      return NextResponse.json(
        { success: false, error: msg },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: paystackResult.data.authorization_url,
      orderReference,
      depositAmount,
      fullTotal,
    });
  } catch (error) {
    console.error(
      "[layby-deposit] Unexpected error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
