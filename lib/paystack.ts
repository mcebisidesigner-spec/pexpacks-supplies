import { createHmac, timingSafeEqual } from "node:crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_API = "https://api.paystack.co";

export type PaystackInitResponse = {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

export type PaystackVerifyData = {
  id: number;
  status: string;
  reference: string;
  amount: number;
  paid_at?: string;
  channel?: string;
  currency?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
};

export type PaystackWebhookEvent = {
  event: string;
  data: PaystackVerifyData;
};

export async function initializePaystackTransaction(params: {
  email: string;
  amountInCents: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}): Promise<PaystackInitResponse> {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  const requestBody = {
    email: params.email,
    amount: params.amountInCents,
    reference: params.reference,
    callback_url: params.callbackUrl,
    metadata: params.metadata,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let response: Response;

  try {
    response = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
  } catch (fetchError) {
    clearTimeout(timeout);
    const message =
      fetchError instanceof Error
        ? fetchError.name === "AbortError"
          ? "Paystack request timed out after 15s"
          : fetchError.message
        : "Unknown network error";
    throw new Error(message);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      "[paystack] Initialize transaction failed:",
      response.status,
      errorBody.slice(0, 500)
    );
    throw new Error(
      `Paystack returned status ${response.status}`
    );
  }

  const result: PaystackInitResponse = await response.json();

  if (!result.status) {
    throw new Error(
      `Paystack declined: ${result.message || "unknown error"}`
    );
  }

  return result;
}

export function verifyPaystackWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  if (!signature) return false;

  try {
    const hash = createHmac("sha512", PAYSTACK_SECRET_KEY || "")
      .update(rawBody)
      .digest("hex");

    const signatureBuffer = Buffer.from(signature);
    const hashBuffer = Buffer.from(hash);

    if (signatureBuffer.length !== hashBuffer.length) return false;

    return timingSafeEqual(signatureBuffer, hashBuffer);
  } catch {
    return false;
  }
}

export async function verifyPaystackTransaction(
  reference: string
): Promise<PaystackVerifyData | null> {
  if (!PAYSTACK_SECRET_KEY) return null;

  try {
    const response = await fetch(
      `${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (!response.ok) return null;

    const result = await response.json();
    return result.status ? result.data : null;
  } catch {
    return null;
  }
}
