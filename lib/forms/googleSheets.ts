import { google } from "googleapis";
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
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"]
    });
    const sheets = google.sheets({ version: "v4", auth });
    const values = [columns.map((column) => rowValue(submission, submissionId, column))];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:V`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values }
    });

    return { ok: true };
  } catch (error) {
    return { ok: false, reason: "google_sheets_error", error };
  }
}
