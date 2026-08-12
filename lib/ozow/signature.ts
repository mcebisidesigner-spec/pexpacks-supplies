import { createHash } from "node:crypto";

const OZOW_COUNTRY_CODE = "ZA";
const OZOW_CURRENCY_CODE = "ZAR";

export function getOzowConfig() {
  const siteCode = process.env.OZOW_SITE_CODE ?? "";
  const privateKey = process.env.OZOW_PRIVATE_KEY ?? "";
  const apiKey = process.env.OZOW_API_KEY ?? "";
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "";
  const isTest = process.env.OZOW_IS_TEST === "true";

  const missingKeys: string[] = [];
  if (!siteCode) missingKeys.push("OZOW_SITE_CODE");
  if (!privateKey) missingKeys.push("OZOW_PRIVATE_KEY");
  if (!apiKey) missingKeys.push("OZOW_API_KEY");
  if (!appUrl) missingKeys.push("NEXT_PUBLIC_APP_URL");

  if (missingKeys.length > 0) {
    console.error(
      `[ozow] Missing environment variable(s): ${missingKeys.join(", ")}.`
    );
    return null;
  }

  if (isTest) {
    console.warn(
      "[ozow] Test mode is ON (OZOW_IS_TEST=true). Live payments will be rejected by Ozow's payment API."
    );
  }

  return {
    siteCode,
    privateKey,
    apiKey,
    appUrl,
    isTest,
    countryCode: OZOW_COUNTRY_CODE,
    currencyCode: OZOW_CURRENCY_CODE,
  };
}

export function ozowCheckoutHash(input: {
  siteCode: string;
  countryCode: string;
  currencyCode: string;
  amount: string;
  transactionReference: string;
  bankReference: string;
  cancelUrl: string;
  errorUrl: string;
  successUrl: string;
  notifyUrl: string;
  isTest: boolean;
  privateKey: string;
}): string {
  const raw = [
    input.siteCode,
    input.countryCode,
    input.currencyCode,
    input.amount,
    input.transactionReference,
    input.bankReference,
    input.cancelUrl,
    input.errorUrl,
    input.successUrl,
    input.notifyUrl,
    String(input.isTest),
    input.privateKey,
  ]
    .join("")
    .toLowerCase();

  return createHash("sha512").update(raw, "utf8").digest("hex");
}

export function ozowWebhookHash(input: {
  siteCode: string;
  transactionId: string;
  transactionReference: string;
  amount: string;
  status: string;
  optional1: string;
  optional2: string;
  optional3: string;
  optional4: string;
  optional5: string;
  currencyCode: string;
  isTest: string;
  statusMessage: string;
  privateKey: string;
}): string {
  const raw = [
    input.siteCode,
    input.transactionId,
    input.transactionReference,
    input.amount,
    input.status,
    input.optional1,
    input.optional2,
    input.optional3,
    input.optional4,
    input.optional5,
    input.currencyCode,
    input.isTest,
    input.statusMessage,
    input.privateKey,
  ]
    .join("")
    .toLowerCase();

  return createHash("sha512").update(raw, "utf8").digest("hex");
}
