import { NextRequest, NextResponse } from "next/server";
import { getOrderByReference } from "@/lib/orders";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { rateLimitRequest } from "@/lib/security/requestGuards";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const limit = rateLimitRequest(request, {
    keyPrefix: "order-status",
    windowMs: 10 * 60 * 1000,
    max: 20,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please wait and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const ref = searchParams.get("ref");

  if (!ref) {
    return NextResponse.json(
      { success: false, error: "Missing order reference." },
      { status: 400 }
    );
  }

  try {
    const order = await getOrderByReference(ref);

    if (order) {
      return NextResponse.json({
        success: true,
        orderReference: order.order_reference,
        status: order.status,
        schoolName: order.school_name,
        grade: order.grade,
        estimatedTotal: order.estimated_total,
      });
    }

    // Order not in Supabase — fallback to Paystack verification.
    // This covers cases where Supabase DNS was down when the order was created
    // (checkout skipped the DB insert but Paystack still processed the payment).
    const paystackData = await verifyPaystackTransaction(ref);
    if (paystackData && paystackData.status === "success") {
      return NextResponse.json({
        success: true,
        orderReference: ref,
        status: "paid",
        schoolName: undefined,
        grade: undefined,
        estimatedTotal: paystackData.amount ? paystackData.amount / 100 : undefined,
      });
    }

    return NextResponse.json(
      { success: false, error: "Order not found." },
      { status: 404 }
    );
  } catch (error) {
    console.error(
      "[orders/status] Error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { success: false, error: "Failed to fetch order status." },
      { status: 500 }
    );
  }
}
