import { NextRequest, NextResponse } from "next/server";
import { getOrderByReference } from "@/lib/orders";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
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

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      orderReference: order.order_reference,
      status: order.status,
      schoolName: order.school_name,
      grade: order.grade,
      estimatedTotal: order.estimated_total,
    });
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
