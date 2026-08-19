import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { rateLimitRequest } from "@/lib/security/requestGuards";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  // 1. Rate Limiting: Max 5 attempts per IP per 60 seconds to prevent brute-force enumeration
  const limit = rateLimitRequest(request, {
    keyPrefix: "track-order-lookup",
    windowMs: 60 * 1000,
    max: 5,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: "Too many order tracking attempts. Please wait a minute before trying again.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfter) },
      }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const ref = (searchParams.get("ref") || "").trim();
  const email = (searchParams.get("email") || "").trim().toLowerCase();
  const uniqueId = (searchParams.get("uniqueId") || "").trim();
  const token = (searchParams.get("token") || "").trim();

  // Multi-Factor Security Check: Must have token OR (ref + email + uniqueId)
  const hasTokenProof = Boolean(token);
  const hasManualProof = Boolean(ref && email && uniqueId);

  if (!hasTokenProof && !hasManualProof) {
    return NextResponse.json(
      {
        success: false,
        message: "Order tracking record not found. Please check your order reference and receipt details.",
      },
      { status: 404 }
    );
  }

  const supabase = createSupabaseAdminClient();

  try {
    let query = supabase
      .from("orders")
      .select("order_reference, status, estimated_delivery, courier_name, waybill_number, updated_at, created_at");

    if (hasTokenProof) {
      if (ref) {
        query = query.eq("order_reference", ref).eq("tracking_token", token);
      } else {
        query = query.eq("tracking_token", token);
      }
    } else {
      query = query
        .eq("order_reference", ref)
        .ilike("buyer_email", email)
        .eq("unique_customer_id", uniqueId);
    }

    const { data: order, error } = await query.maybeSingle();

    // Zero Enumeration Security: Return generic 404 for missing records or mismatch
    if (error || !order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order tracking record not found. Please check your order reference and receipt details.",
        },
        { status: 404 }
      );
    }

    // Map order status string to standard tracking enum
    let normalizedStatus: "placed" | "processing" | "shipped" | "out_for_delivery" | "delivered" = "placed";
    const rawStatus = (order.status || "").toLowerCase();

    if (rawStatus.includes("deliver") || rawStatus === "completed") {
      normalizedStatus = "delivered";
    } else if (rawStatus.includes("out") || rawStatus.includes("dispatch")) {
      normalizedStatus = "out_for_delivery";
    } else if (rawStatus.includes("ship") || rawStatus.includes("transit") || rawStatus.includes("courier")) {
      normalizedStatus = "shipped";
    } else if (rawStatus.includes("process") || rawStatus.includes("pack") || rawStatus === "paid") {
      normalizedStatus = "processing";
    } else {
      normalizedStatus = "placed";
    }

    // Public Sanitized Payload (Zero PII Leak)
    const sanitizedPayload = {
      orderReference: order.order_reference,
      status: normalizedStatus,
      estimatedDelivery: order.estimated_delivery
        ? new Date(order.estimated_delivery).toISOString().split("T")[0]
        : null,
      courier: order.courier_name || null,
      waybillNumber: order.waybill_number || null,
      updatedAt: order.updated_at || order.created_at || new Date().toISOString(),
    };

    return NextResponse.json(sanitizedPayload, {
      status: 200,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (err) {
    console.error("[track-order] Unexpected lookup error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Order tracking record not found. Please check your order reference and receipt details.",
      },
      { status: 404 }
    );
  }
}
