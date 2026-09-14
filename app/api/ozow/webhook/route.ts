import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse, after } from "next/server";
import { track } from "@vercel/analytics/server";
import {
  markOrderPaid,
  getOrderForReceipt,
  recordOrderPaymentStatus,
} from "@/lib/orders";
import { getOzowConfig, ozowWebhookHash } from "@/lib/ozow/signature";
import { dispatchPurchaseReceipt } from "@/lib/email/deliverPurchaseReceipt";
import { reportException } from "@/lib/observability/sentry";

export const runtime = "nodejs";

function parseBody(raw: string): Record<string, string> {
  const contentType = "application/x-www-form-urlencoded";
  void contentType;

  try {
    const json = JSON.parse(raw);
    if (json && typeof json === "object") {
      return Object.fromEntries(
        Object.entries(json).map(([key, value]) => [key, String(value ?? "")]),
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

async function handleWebhook(request: NextRequest) {
  const config = getOzowConfig();

  if (!config) {
    reportException(new Error("Missing Ozow configuration."), "ozow.webhook.missing-config");
    console.error("[ozow/webhook] Missing Ozow configuration.");
    return NextResponse.json(
      { success: false, error: "Payment configuration is not available." },
      { status: 503 },
    );
  }

  let params: Record<string, string>;

  try {
    const raw = await request.text();
    params = parseBody(raw);
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid body." },
      { status: 400 },
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

if (!SiteCode || !TransactionReference || !HashCheck || !IsTest) {
    reportException(
      new Error("Missing required webhook fields."),
      "ozow.webhook.missing-fields",
    );
    return NextResponse.json(
      { success: false, error: "Missing required webhook fields." },
      { status: 400 },
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
    /^[a-f0-9]{128}$/.test(providedHash) &&
    timingSafeEqual(
      Buffer.from(expectedHash, "hex"),
      Buffer.from(providedHash, "hex"),
    );

if (!hashValid) {
    reportException(
      new Error("Hash check failed."),
      "ozow.webhook.hash-check-failed",
    );
    console.error(
      "[ozow/webhook] Hash check failed for:",
      TransactionReference,
    );
    return NextResponse.json(
      { success: false, error: "Invalid signature." },
      { status: 400 },
    );
  }

  const webhookIsTest = IsTest.toLowerCase() === "true";
  if (webhookIsTest !== config.isTest) {
    reportException(
      new Error("Payment environment mismatch."),
      "ozow.webhook.environment-mismatch",
    );
    console.error("[ozow/webhook] Environment mismatch for:", TransactionReference);
    return NextResponse.json(
      { success: false, error: "Invalid payment environment." },
      { status: 400 },
    );
  }

if (SiteCode !== config.siteCode) {
    reportException(
      new Error("SiteCode mismatch."),
      "ozow.webhook.site-code-mismatch",
    );
    console.error(
      "[ozow/webhook] SiteCode mismatch for:",
      TransactionReference,
    );
    return NextResponse.json(
      { success: false, error: "Invalid site code." },
      { status: 400 },
    );
  }

  if (Status === "Complete") {
    const isHappyPay =
      (Optional1 || "").includes("HappyPay") ||
      (Optional2 || "").includes("HappyPay");
    const numAmount = Amount ? Number(Amount) : null;
    if (numAmount === null || !Number.isFinite(numAmount) || numAmount < 0) {
      reportException(
        new Error("Invalid payment amount received."),
        "ozow.webhook.invalid-amount",
      );
      return NextResponse.json(
        { success: false, error: "Invalid payment amount." },
        { status: 400 },
      );
    }

    const result = await markOrderPaid({
      orderReference: TransactionReference,
      paymentGateway: "ozow",
      gatewayReference: TransactionId ?? null,
      amount: numAmount,
      currency: CurrencyCode || "ZAR",
      paymentMethod: isHappyPay ? "HappyPay" : "Ozow",
      metadata: {
        ozowStatusMessage: StatusMessage || "Complete",
        isTest: IsTest === "true",
        method: isHappyPay ? "HappyPay" : "Ozow",
        ...(isHappyPay ? { instalments: 2 } : {}),
      },
    });

if (!result.success) {
      const failureDetail =
        result.error && typeof result.error === "object"
          ? (result.error as { message?: string }).message
          : null;
      reportException(
        new Error(failureDetail || "Failed to mark order paid."),
        "ozow.webhook.mark-order-paid-failed",
      );
      console.error(
        "[ozow/webhook] Failed to mark order paid for:",
        TransactionReference,
      );
      return NextResponse.json(
        { success: false, error: "Could not update the order." },
        { status: 500 },
      );
    }

    console.log(
      "[ozow/webhook] Order marked paid:",
      TransactionReference,
      "amount",
      Amount,
      "statusMessage",
      StatusMessage,
    );

    if (result.alreadyPaid) {
      return NextResponse.json({ status: "OK", replay: true });
    }

    track("Pre-Order Completed", {
      orderReference: TransactionReference,
      amount: numAmount ?? null,
      currency: CurrencyCode || "ZAR",
      paymentMethod: isHappyPay ? "HappyPay" : "Ozow",
      isTest: IsTest === "true",
    });

    after(async () => {
      await dispatchPurchaseReceipt(TransactionReference);
    });
  } else {
    await recordOrderPaymentStatus({
      orderReference: TransactionReference,
      gatewayReference: TransactionId ?? null,
      status: Status || "Error",
      amount: Amount ? parseFloat(Amount) : null,
      currency: CurrencyCode || "ZAR",
      metadata: {
        ozowStatusMessage: StatusMessage || Status || "Not complete",
        isTest: IsTest === "true",
      },
    });
    console.log(
      "[ozow/webhook] Payment not complete:",
      TransactionReference,
      "status",
      Status,
      "message",
      StatusMessage,
    );
  }

return NextResponse.json({ status: "OK" });
}

export async function POST(request: NextRequest) {
  try {
    return await handleWebhook(request);
  } catch (err) {
    reportException(err, "ozow.webhook.unhandled");
    return NextResponse.json(
      { success: false, error: "Webhook processing failed." },
      { status: 500 },
    );
  }
}
