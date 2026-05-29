import { NextRequest, NextResponse } from "next/server";
import { validateCheckoutPayload } from "@/lib/validation/checkout";
import { createPendingOrder, generateOrderReference } from "@/lib/orders";
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
