import { getOzowConfig, ozowCheckoutHash } from "./signature";

const OZOW_POST_PAYMENT_URL = "https://api.ozow.com/postpaymentrequest";

export class OzowCheckoutError extends Error {}

function extractOzowErrorMessage(
  result: Record<string, unknown> | null
): string {
  if (!result) {
    return "";
  }

  const candidate =
    result.errorMessage ??
    result.message ??
    result.Error ??
    (result.error !== null && typeof result.error === "object"
      ? (result.error as Record<string, unknown>).Message
      : result.error);

  return typeof candidate === "string" && candidate.trim()
    ? candidate.trim()
    : "";
}

function appUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    ""
  );
}

export type InitiateOzowPaymentInput = {
  orderReference: string;
  amount: number;
  buyerEmail: string;
  isBnpl: boolean;
};

export type InitiateOzowPaymentResult = {
  url: string;
};

export async function initiateOzowPayment(
  input: InitiateOzowPaymentInput
): Promise<InitiateOzowPaymentResult> {
  const config = getOzowConfig();

  if (!config) {
    throw new OzowCheckoutError(
      "Payments are temporarily unavailable. Please try again later."
    );
  }

  const base = appUrl();

  if (!base) {
    console.error(
      "[ozow] Missing app URL: neither NEXT_PUBLIC_APP_URL nor NEXT_PUBLIC_SITE_URL " +
        "is set in the server environment. Set it in your hosting provider's " +
        "environment settings and rebuild/redeploy."
    );
    throw new OzowCheckoutError(
      "Payments are temporarily unavailable. Please try again later."
    );
  }

  const amount = input.amount.toFixed(2);
  const cancelUrl = `${base}/checkout?cancelled=1`;
  const errorUrl = `${base}/checkout?error=1`;
  const successUrl = `${base}/checkout/success?ref=${encodeURIComponent(
    input.orderReference
  )}`;
  const notifyUrl = `${base}/api/ozow/webhook`;
  const bankReference = input.orderReference.slice(0, 20);

  const hashCheck = ozowCheckoutHash({
    siteCode: config.siteCode,
    countryCode: config.countryCode,
    currencyCode: config.currencyCode,
    amount,
    transactionReference: input.orderReference,
    bankReference,
    cancelUrl,
    errorUrl,
    successUrl,
    notifyUrl,
    isTest: config.isTest,
    privateKey: config.privateKey,
  });

  const payload: Record<string, string | boolean> = {
    siteCode: config.siteCode,
    countryCode: config.countryCode,
    currencyCode: config.currencyCode,
    amount,
    transactionReference: input.orderReference,
    bankReference,
    cancelUrl,
    errorUrl,
    successUrl,
    notifyUrl,
    isTest: config.isTest,
    hashCheck,
  };

  if (input.isBnpl) {
    payload.paymentMethod = "HappyPay";
  }

  const ozowResponse = await fetch(OZOW_POST_PAYMENT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "ApiKey": config.apiKey,
    },
    body: JSON.stringify(payload),
  });

  const rawBody = await ozowResponse.text();
  let result: Record<string, unknown> | null = null;

  try {
    result = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    result = null;
  }

  if (!ozowResponse.ok || !result) {
    console.error("Ozow Gateway API Reject:", ozowResponse.status, result || rawBody);

    const ozowMessage = extractOzowErrorMessage(result);
    throw new OzowCheckoutError(
      ozowMessage || "Ozow gateway error"
    );
  }

  const paymentUrl =
    typeof result.url === "string"
      ? result.url
      : typeof result.paymentUrl === "string"
        ? result.paymentUrl
        : typeof result.PaymentUrl === "string"
          ? result.PaymentUrl
          : "";

  if (!paymentUrl) {
    console.error(
      "Ozow Gateway API Reject: missing payment URL",
      ozowResponse.status,
      result || rawBody
    );
    throw new OzowCheckoutError(
      "The payment provider did not return a payment link. Please try again."
    );
  }

  return { url: paymentUrl };
}
