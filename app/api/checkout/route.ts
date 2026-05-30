import { NextRequest, NextResponse } from "next/server";
import { validateCheckoutPayload } from "@/lib/validation/checkout";
import { createPendingOrder, createMultiPackOrder, generateOrderReference } from "@/lib/orders";
import { initializePaystackTransaction } from "@/lib/paystack";
import { PEXCOVER_PRICE } from "@/lib/constants";
import { phasePacks } from "@/data/phasePacks";
import { getGradeBySlug } from "@/lib/school-utils";

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
      price: schoolGrade.price,
      items: schoolGrade.contents,
    };
  }

  const phase = phasePacks.find((phasePack) => phasePack.slug === input.schoolSlug);
  const phaseGrade = phase?.gradePacks.find((pack) => pack.id === input.gradeSlug);
  if (phaseGrade) {
    return {
      price: phaseGrade.priceFrom,
      items: phaseGrade.items.map((item) => `${item.quantity} x ${item.name}`),
    };
  }

  return null;
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
      console.error("[checkout] Missing PAYSTACK_SECRET_KEY");
      return NextResponse.json(
        { success: false, error: "Payment service is not configured." },
        { status: 500 }
      );
    }

    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      console.error("[checkout] Missing NEXT_PUBLIC_SITE_URL");
      return NextResponse.json(
        { success: false, error: "Site URL is not configured." },
        { status: 500 }
      );
    }

    const isTrayOrder = body.isTrayOrder === true;

    if (isTrayOrder) {
      // ── TRAY / MULTI-PACK ORDER ──
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

      const orderReference = generateOrderReference();

      const summaryItems = packs.flatMap((pack) => [
        `Learner: ${pack.learnerName || "Unnamed"}`,
        `School: ${pack.schoolName || "N/A"} - ${pack.grade || "N/A"}`,
        `Pack: ${pack.packName} (${pack.packMode})`,
        ...pack.items.map((i) => `${i.quantity} x ${i.name}`),
        pack.wantsPexcover ? `Pexcover book covering - R ${pack.pexcoverPrice}` : "",
        `---`,
      ].filter(Boolean));

      await createMultiPackOrder({
        orderReference,
        buyerName,
        buyerEmail,
        buyerPhone,
        packs,
        estimatedTotal,
        deliveryMethod,
        primarySchoolSlug,
        notes,
        summaryItems,
      });

      let paystackResult;

      try {
        paystackResult = await initializePaystackTransaction({
          email: buyerEmail,
          amountInCents: Math.round(estimatedTotal * 100),
          reference: orderReference,
          callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?ref=${orderReference}`,
          metadata: {
            order_reference: orderReference,
            buyer_name: buyerName,
            pack_count: String(packs.length),
            source: "pexpacks_tray_checkout",
          },
        });
      } catch (paystackError) {
        console.error(
          "[checkout] Paystack initialization failed for tray:",
          paystackError instanceof Error ? paystackError.message : paystackError
        );
        return NextResponse.json(
          { success: false, error: "We could not connect to the payment gateway. Please try again." },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        checkoutUrl: paystackResult.data.authorization_url,
        orderReference,
      });
    }

    // ── SINGLE-PACK ORDER (existing flow) ──
    const validated = validateCheckoutPayload(body);

    if (validated.errors) {
      return NextResponse.json(
        { success: false, error: "Validation failed.", errors: validated.errors },
        { status: 400 }
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
          error: "We could not find this pack. Please choose your school pack again.",
        },
        { status: 400 }
      );
    }

    const pexcoverAmount = data.pexcoverSelected ? PEXCOVER_PRICE : 0;
    const trustedTotal = trustedPack.price + pexcoverAmount;
    const trustedItems = data.pexcoverSelected
      ? [...trustedPack.items, `Pexcover book covering - ${PEXCOVER_PRICE}`]
      : trustedPack.items;

    const orderReference = generateOrderReference();

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
    });

    let paystackResult;

    try {
      paystackResult = await initializePaystackTransaction({
        email: data.buyerEmail,
        amountInCents: Math.round(trustedTotal * 100),
        reference: orderReference,
        callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?ref=${orderReference}`,
        metadata: {
          order_reference: orderReference,
          buyer_name: data.buyerName,
          school_name: data.schoolName,
          grade: data.grade,
          pexcover_selected: data.pexcoverSelected ? "true" : "false",
          source: "pexpacks_checkout",
        },
      });
    } catch (paystackError) {
      console.error(
        "[checkout] Paystack initialization failed:",
        paystackError instanceof Error ? paystackError.message : paystackError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "We could not connect to the payment gateway. Please try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: paystackResult.data.authorization_url,
      orderReference,
    });
  } catch (error) {
    console.error(
      "[checkout] Unexpected error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
