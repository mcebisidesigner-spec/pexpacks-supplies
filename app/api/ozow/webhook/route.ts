import { NextRequest, NextResponse } from "next/server";
import { markOrderPaid, getOrderForReceipt } from "@/lib/orders";
import { getOzowConfig, ozowWebhookHash } from "@/lib/ozow/signature";
import { sendPurchaseReceipt } from "@/lib/email/receipt";

export const runtime = "nodejs";

function parseBody(raw: string): Record<string, string> {
  const contentType = "application/x-www-form-urlencoded";
  void contentType;

  try {
    const json = JSON.parse(raw);
    if (json && typeof json === "object") {
      return Object.fromEntries(
        Object.entries(json).map(([key, value]) => [key, String(value ?? "")])
      );
    }
  } catch {
    // Not JSON — fall through to form parsing
  }

  const params = new URLSearchParams(raw);
  const record: Record<string, string> = {};
  params.forEach((value, key) => {
    record[key] = value;
  });
  return record;
}

export async function POST(request: NextRequest) {
  const config = getOzowConfig();

  if (!config) {
    console.error("[ozow/webhook] Missing Ozow configuration.");
    return NextResponse.json(
      { success: false, error: "Payment configuration is not available." },
      { status: 503 }
    );
  }

  let params: Record<string, string>;

  try {
    const raw = await request.text();
    params = parseBody(raw);
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid body." },
      { status: 400 }
    );
  }

  const {
    SiteCode,
    TransactionId,
    TransactionReference,
    Amount,
    Status,
    Optional1,
    Optional2,
    Optional3,
    Optional4,
    Optional5,
    CurrencyCode,
    IsTest,
    StatusMessage,
    HashCheck,
  } = params;

  if (!SiteCode || !TransactionReference || !HashCheck) {
    return NextResponse.json(
      { success: false, error: "Missing required webhook fields." },
      { status: 400 }
    );
  }

  const expectedHash = ozowWebhookHash({
    siteCode: SiteCode,
    transactionId: TransactionId ?? "",
    transactionReference: TransactionReference,
    amount: Amount ?? "",
    status: Status ?? "",
    optional1: Optional1 ?? "",
    optional2: Optional2 ?? "",
    optional3: Optional3 ?? "",
    optional4: Optional4 ?? "",
    optional5: Optional5 ?? "",
    currencyCode: CurrencyCode ?? "",
    isTest: IsTest ?? "",
    statusMessage: StatusMessage ?? "",
    privateKey: config.privateKey,
  });

  const providedHash = HashCheck.toLowerCase();
  const hashValid =
    expectedHash.length === providedHash.length &&
    expectedHash === providedHash;

  if (!hashValid) {
    console.error("[ozow/webhook] Hash check failed for:", TransactionReference);
    return NextResponse.json(
      { success: false, error: "Invalid signature." },
      { status: 400 }
    );
  }

  if (SiteCode !== config.siteCode) {
    console.error("[ozow/webhook] SiteCode mismatch for:", TransactionReference);
    return NextResponse.json(
      { success: false, error: "Invalid site code." },
      { status: 400 }
    );
  }

  if (Status === "Complete") {
    const result = await markOrderPaid({
      orderReference: TransactionReference,
      paymentGateway: "ozow",
      gatewayReference: TransactionId ?? null,
    });

    if (!result.success) {
      console.error(
        "[ozow/webhook] Failed to mark order paid for:",
        TransactionReference
      );
      return NextResponse.json(
        { success: false, error: "Could not update the order." },
        { status: 500 }
      );
    }

    console.log(
      "[ozow/webhook] Order marked paid:",
      TransactionReference,
      "amount",
      Amount,
      "statusMessage",
      StatusMessage
    );

    const order = await getOrderForReceipt(TransactionReference);

    if (order) {
      const receiptResult = await sendPurchaseReceipt(order);
      if (!receiptResult.success) {
        console.warn(
          "[ozow/webhook] Receipt email not sent for",
          TransactionReference,
          receiptResult.error
        );
      }
    } else {
      console.warn(
        "[ozow/webhook] Order not found for receipt:",
        TransactionReference
      );
    }
  } else {
    console.log(
      "[ozow/webhook] Payment not complete:",
      TransactionReference,
      "status",
      Status,
      "message",
      StatusMessage
    );
  }

  return NextResponse.json({ status: "OK" });
}
