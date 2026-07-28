import { NextRequest, NextResponse } from "next/server";
import { validateCheckoutPayload } from "@/lib/validation/checkout";
import { createPendingOrder, createMultiPackOrder, generateOrderReference } from "@/lib/orders";
import { PEXCOVER_PRICE } from "@/lib/constants";
import { getGradeBySlug } from "@/lib/school-utils";
import {
  isSameOriginRequest,
  rateLimitRequest,
} from "@/lib/security/requestGuards";

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

  return null;
}

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

    const isTrayOrder = body.isTrayOrder === true;

    if (isTrayOrder) {
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
        console.error("[checkout] Tray price mismatch:", { clientTotal: estimatedTotal, serverTotal: verifiedTotal });
        return NextResponse.json(
          { success: false, error: "Prices have changed since you added items. Please refresh your pack tray." },
          { status: 400 }
        );
      }

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
        estimatedTotal: verifiedTotal,
        deliveryMethod,
        primarySchoolSlug,
        notes,
        summaryItems,
      });

      return NextResponse.json({
        success: true,
        orderReference,
      });
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

    return NextResponse.json({
      success: true,
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
