import { appendSubmissionToGoogleSheet } from "./googleSheets";
import { sendSubmissionEmail } from "./email";
import type { SanitisedFormSubmission } from "./sanitise";
import { logger } from "@/lib/logger";

export async function processFormSubmission(
  submission: SanitisedFormSubmission,
  submissionId: string,
  ipHash: string
) {
  const [emailResult, sheetResult] = await Promise.all([
    sendSubmissionEmail(submission, submissionId, ipHash),
    appendSubmissionToGoogleSheet(submission, submissionId)
  ]);

  if (!emailResult.ok) {
    logger.warn("Form email notification failed", {
      submissionId,
      formType: submission.formType,
      reason: emailResult.reason,
      skipped: emailResult.skipped,
      error: emailResult.error
    });
  }

  if (!sheetResult.ok) {
    logger.warn("Google Sheets append failed", {
      submissionId,
      formType: submission.formType,
      reason: sheetResult.reason,
      skipped: sheetResult.skipped,
      error: sheetResult.error
    });
  }

  return {
    email: emailResult,
    sheet: sheetResult,
    recorded: sheetResult.ok,
    notified: emailResult.ok,
    success: emailResult.ok || sheetResult.ok
  };
}
