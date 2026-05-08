import { Resend } from "resend";
import type { SanitisedFormSubmission } from "./sanitise";
import { getFormTypeLabel } from "./schema";

export type IntegrationResult = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  error?: unknown;
};

function valueOrDash(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  return String(value);
}

function escapeHtml(value: unknown) {
  return valueOrDash(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rows(submission: SanitisedFormSubmission, submissionId: string, ipHash: string) {
  return [
    ["Submission ID", submissionId],
    ["Date/time", submission.submittedAt],
    ["Form type", getFormTypeLabel(submission.formType)],
    ["Full name", submission.fullName],
    ["Phone", submission.phone],
    ["Email", submission.email],
    ["Preferred contact method", submission.preferredContactMethod],
    ["School name", submission.schoolName],
    ["Grade", submission.grade],
    ["Learner name", submission.learnerName],
    ["Business name", submission.businessName],
    ["Order quantity", submission.orderQuantity],
    ["Pack type", submission.packType],
    ["Suburb", submission.suburb],
    ["City", submission.city],
    ["Province", submission.province],
    ["Message", submission.message],
    ["Consent", submission.consent ? "Yes" : "No"],
    ["Page URL", submission.pageUrl],
    ["User agent", submission.userAgent],
    ["IP hash", ipHash]
  ];
}

export function buildEmailContent(submission: SanitisedFormSubmission, submissionId: string, ipHash: string) {
  const bodyRows = rows(submission, submissionId, ipHash);
  const htmlRows = bodyRows
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:8px 12px;border-bottom:1px solid #dde2e6;color:#192a3e;">${escapeHtml(label)}</th><td style="padding:8px 12px;border-bottom:1px solid #dde2e6;color:#192a3e;">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#192a3e;line-height:1.5;">
      <h1 style="margin:0 0 16px;color:#192a3e;">New PexPacks enquiry</h1>
      <table cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:100%;max-width:760px;">
        ${htmlRows}
      </table>
    </div>
  `;

  const text = bodyRows.map(([label, value]) => `${label}: ${valueOrDash(value)}`).join("\n");

  return { html, text };
}

export async function sendSubmissionEmail(
  submission: SanitisedFormSubmission,
  submissionId: string,
  ipHash: string
): Promise<IntegrationResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.PEXPACKS_NOTIFICATION_EMAIL || "pexpacks@gmail.com";
  const from = process.env.PEXPACKS_FROM_EMAIL || "PexPacks <no-reply@pexpacks.co.za>";

  if (!apiKey) {
    return { ok: false, skipped: true, reason: "missing_resend_api_key" };
  }

  const resend = new Resend(apiKey);
  const { html, text } = buildEmailContent(submission, submissionId, ipHash);
  const subject = `[PexPacks] New ${getFormTypeLabel(submission.formType)} from ${submission.fullName}`;

  try {
    const result = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text
    });

    if (result.error) {
      return { ok: false, reason: "resend_error", error: result.error };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, reason: "email_exception", error };
  }
}
