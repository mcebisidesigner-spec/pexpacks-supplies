import { createSign } from "crypto";
import type { IntegrationResult } from "./email";
import type { SanitisedFormSubmission } from "./sanitise";

const columns: Array<keyof SanitisedFormSubmission | "submissionId"> = [
  "submissionId",
  "submittedAt",
  "formType",
  "fullName",
  "phone",
  "email",
  "preferredContactMethod",
  "schoolName",
  "grade",
  "learnerName",
  "businessName",
  "orderQuantity",
  "packType",
  "suburb",
  "city",
  "province",
  "message",
  "consent",
  "pageUrl",
  "userAgent",
  "status",
  "source"
];

function rowValue(submission: SanitisedFormSubmission, submissionId: string, column: (typeof columns)[number]) {
  if (column === "submissionId") {
    return submissionId;
  }

  const value = submission[column];
  if (typeof value === "boolean") {
    return value ? "TRUE" : "FALSE";
  }

  return value ?? "";
}

function base64Url(value: string | Buffer) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function getGoogleAccessToken(clientEmail: string, privateKey: string) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claimSet = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: issuedAt + 3600,
    iat: issuedAt
  };
  const unsignedToken = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(claimSet))}`;
  const signature = createSign("RSA-SHA256").update(unsignedToken).sign(privateKey);
  const jwt = `${unsignedToken}.${base64Url(signature)}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  });

  if (!response.ok) {
    throw new Error(`google_oauth_${response.status}`);
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("google_oauth_missing_access_token");
  }

  return data.access_token;
}

export async function appendSubmissionToGoogleSheet(
  submission: SanitisedFormSubmission,
  submissionId: string
): Promise<IntegrationResult> {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || "Submissions";

  if (!clientEmail || !privateKey || !spreadsheetId) {
    return { ok: false, skipped: true, reason: "missing_google_sheets_config" };
  }

  try {
    const accessToken = await getGoogleAccessToken(clientEmail, privateKey);
    const values = [columns.map((column) => rowValue(submission, submissionId, column))];
    const range = encodeURIComponent(`${sheetName}!A:V`);
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ values })
      }
    );

    if (!response.ok) {
      throw new Error(`google_sheets_${response.status}`);
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, reason: "google_sheets_error", error };
  }
}
