import { createHmac, timingSafeEqual } from "node:crypto";
import https from "node:https";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_API = "https://api.paystack.co";

const httpsAgent = new https.Agent({ keepAlive: true });

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

async function fetchWithRetry(
  url: string,
  options: RequestInit & { agent?: https.Agent },
  retries = 2,
): Promise<Response> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      try {
        const res = await fetch(url, {
          ...options,
          signal: controller.signal,
          // @ts-expect-error - agent is a Node.js option not in TS types
          agent: httpsAgent,
        });
        return res;
      } finally {
        clearTimeout(timeout);
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 4000);
        console.error(`[paystack] Fetch attempt ${attempt + 1} failed, retrying in ${delay}ms: ${lastError.message}`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError!;
}

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

  const fullUrl = `${PAYSTACK_API}/transaction/initialize`;

  let response: Response;

  try {
    response = await fetchWithRetry(fullUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
  } catch (fetchError) {
    const msg = fetchError instanceof Error ? fetchError.message : String(fetchError);
    console.error("[paystack] All fetch attempts failed:", msg);
    throw new Error(msg);
  }

  if (!response.ok) {
    let errorDetail = "";
    try {
      errorDetail = await response.text();
    } catch {}
    const snippet = errorDetail.slice(0, 500);
    console.error(
      "[paystack] Initialize transaction failed:",
      response.status,
      snippet
    );
    const paystackMsg = snippet ? ` — ${snippet}` : "";
    throw new Error(
      `Paystack returned status ${response.status}${paystackMsg}`
    );
  }

  let result: PaystackInitResponse;
  try {
    result = await response.json();
  } catch (parseError) {
    const body = await response.text().catch(() => "");
    console.error("[paystack] Failed to parse response:", body.slice(0, 500));
    throw new Error("Paystack returned an invalid response");
  }

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
