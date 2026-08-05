import { getOzowConfig, ozowCheckoutHash } from "./signature";

const OZOW_POST_PAYMENT_URL = "https://api.ozow.com/postpaymentrequest";

export class OzowCheckoutError extends Error {}

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
    throw new OzowCheckoutError(
      "Payments are temporarily unavailable. Please try again later."
    );
  }

  const amount = input.amount.toFixed(2);
  const returnPath = input.isBnpl ? "/checkout/happypay" : "/checkout";

  const cancelUrl = `${base}${returnPath}?cancelled=1`;
  const errorUrl = `${base}${returnPath}?error=1`;
  const successUrl = `${base}/checkout/success?ref=${encodeURIComponent(
    input.orderReference
  )}`;
  const notifyUrl = `${base}/api/ozow/webhook`;
  const bankReference = `PEX ${input.orderReference}`.slice(0, 34);

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

  const payload: Record<string, string | boolean | number> = {
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
    customerEmail: input.buyerEmail,
    isBnpl: input.isBnpl,
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

  const result = await ozowResponse.json().catch(() => null);

  if (!ozowResponse.ok || !result) {
    console.error(
      "[ozow] Ozow returned an error:",
      ozowResponse.status,
      JSON.stringify(result)
    );
    throw new OzowCheckoutError(
      "The payment provider could not start your payment. Please try again."
    );
  }

  const paymentUrl =
    typeof result.paymentUrl === "string"
      ? result.paymentUrl
      : typeof result.PaymentUrl === "string"
        ? result.PaymentUrl
        : "";

  if (!paymentUrl) {
    console.error(
      "[ozow] Ozow response missing payment URL:",
      JSON.stringify(result)
    );
    throw new OzowCheckoutError(
      "The payment provider did not return a payment link. Please try again."
    );
  }

  return { url: paymentUrl };
}
