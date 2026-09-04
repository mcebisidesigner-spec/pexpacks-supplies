import { NextRequest, NextResponse, after } from "next/server";
import crypto from "node:crypto";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getOrderForReceipt } from "@/lib/orders";
import { sendPurchaseReceipt } from "@/lib/email/receipt";

export const runtime = "nodejs";

const webhookPayloadSchema = z.object({
  type: z.enum(["INSERT", "UPDATE"]),
  table: z.literal("orders"),
  schema: z.literal("public"),
  record: z.object({
    id: z.string(),
    order_reference: z.string(),
    status: z.string(),
    buyer_email: z.string().nullable().optional(),
    receipt_email_sent_at: z.string().nullable().optional(),
  }),
  old_record: z
    .object({
      status: z.string().optional(),
    })
    .nullable()
    .optional(),
});

function verifyWebhookSecret(request: NextRequest): boolean {
  const incomingSecret =
    request.headers.get("x-supabase-webhook-secret") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    "";
  const configuredSecret = process.env.SUPABASE_WEBHOOK_SECRET || "";

  if (!configuredSecret || !incomingSecret) {
    return false;
  }

  const incomingBuffer = Buffer.from(incomingSecret);
  const configuredBuffer = Buffer.from(configuredSecret);

  if (incomingBuffer.length !== configuredBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(incomingBuffer, configuredBuffer);
}

export async function POST(request: NextRequest) {
  if (!verifyWebhookSecret(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Invalid webhook secret." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const parsed = webhookPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Schema validation failed.",
        details: parsed.error.issues,
      },
      { status: 422 },
    );
  }

  const { record, old_record } = parsed.data;

  // Only trigger on transition to 'paid'
  const isNowPaid = record.status === "paid";
  const wasAlreadyPaid = old_record?.status === "paid";
  const alreadySent = Boolean(record.receipt_email_sent_at);

  if (!isNowPaid || wasAlreadyPaid || alreadySent) {
    return NextResponse.json({
      success: true,
      message:
        "No action required. Order status not transitioning to paid or receipt already sent.",
    });
  }

  // Decoupled async dispatch via Next.js after() with safe fallback for test contexts
  const dispatchReceipt = async () => {
    try {
      const order = await getOrderForReceipt(record.order_reference);
      if (!order) {
        console.warn(
          "[webhook/order-paid] Order not found for reference:",
          record.order_reference,
        );
        return;
      }

      const receiptResult = await sendPurchaseReceipt(order);
      if (receiptResult.success) {
        const admin = createSupabaseAdminClient();
        await admin
          .from("orders")
          .update({
            receipt_email_sent_at: new Date().toISOString(),
          } as never)
          .eq("id", record.id);
        console.log(
          "[webhook/order-paid] Receipt dispatched and recorded for:",
          record.order_reference,
        );
      } else {
        console.error(
          "[webhook/order-paid] Resend dispatch failed:",
          receiptResult.error,
        );
      }
    } catch (err) {
      console.error(
        "[webhook/order-paid] Async error executing receipt dispatch:",
        err,
      );
    }
  };

  try {
    after(dispatchReceipt);
  } catch {
    // Outside request context (e.g. unit tests): fire and forget
    void dispatchReceipt();
  }

  return NextResponse.json(
    { success: true, message: "Webhook accepted; email scheduled." },
    { status: 200 },
  );
}
