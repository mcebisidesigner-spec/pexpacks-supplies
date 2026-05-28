import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackWebhookSignature } from "@/lib/paystack";
import { markOrderPaid } from "@/lib/orders";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    const signature = request.headers.get("x-paystack-signature");

    if (!verifyPaystackWebhookSignature(rawBody, signature)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    let payload: { event: string; data: Record<string, unknown> };

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }

    if (payload.event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    const reference = payload.data?.reference as string | undefined;
    const amount = payload.data?.amount as number | undefined;
    const paidAt = (payload.data?.paid_at as string) || new Date().toISOString();
    const gatewayReference =
      (payload.data?.id as number)?.toString() || reference || "";

    if (!reference) {
      console.error("[webhook] charge.success missing reference");
      return NextResponse.json(
        { error: "Missing reference" },
        { status: 400 }
      );
    }

    const result = await markOrderPaid(reference, {
      gatewayReference,
      paidAt,
      amount: amount || 0,
    });

    if (!result.updated) {
      console.warn(
        `[webhook] Order ${reference} not updated: ${result.message}`
      );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(
      "[webhook] Error processing Paystack webhook:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
