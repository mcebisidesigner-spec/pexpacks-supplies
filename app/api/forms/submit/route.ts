import { NextRequest, NextResponse } from "next/server";
import { verifyCaptcha } from "@/lib/forms/captcha";
import { checkRateLimit } from "@/lib/forms/rateLimit";
import { processFormSubmission } from "@/lib/forms/processSubmission";
import { flattenValidationErrors, formSubmissionSchema } from "@/lib/forms/schema";
import { hasSuspiciousContent, sanitiseSubmission } from "@/lib/forms/sanitise";
import { createSubmissionId } from "@/lib/forms/submissionId";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const successMessage = "Thank you. Your enquiry has been received.";

function jsonResponse(body: unknown, status: number) {
  return NextResponse.json(body, { status });
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

async function readJson(request: NextRequest) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function hasFilledHoneypot(body: Record<string, unknown>) {
  const companyWebsite = typeof body.companyWebsite === "string" ? body.companyWebsite.trim() : "";
  const honeypot = typeof body.honeypot === "string" ? body.honeypot.trim() : "";
  return Boolean(companyWebsite || honeypot);
}

export async function POST(request: NextRequest) {
  const submissionId = createSubmissionId();
  const submittedAt = new Date().toISOString();
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit(ip);

  if (!rateLimit.allowed) {
    logger.warn("Form submission rate limited", { submissionId, ipHash: rateLimit.identifier, submittedAt });
    return jsonResponse(
      {
        success: false,
        message: "Too many submissions. Please wait a few minutes and try again."
      },
      429
    );
  }

  const body = await readJson(request);
  if (!body) {
    return jsonResponse(
      {
        success: false,
        message: "Invalid form data."
      },
      400
    );
  }

  if (hasFilledHoneypot(body)) {
    logger.info("Honeypot submission blocked", { submissionId, ipHash: rateLimit.identifier, submittedAt });
    return jsonResponse({ success: true, message: successMessage, submissionId }, 200);
  }

  const captcha = await verifyCaptcha(typeof body.captchaToken === "string" ? body.captchaToken : undefined, ip);
  if (!captcha.ok) {
    logger.warn("Captcha failed for form submission", { submissionId, reason: captcha.reason, ipHash: rateLimit.identifier });
    return jsonResponse(
      {
        success: false,
        message: "We could not verify this submission. Please try again."
      },
      403
    );
  }

  const payload = {
    ...body,
    pageUrl: body.pageUrl || request.headers.get("referer") || undefined,
    userAgent: body.userAgent || request.headers.get("user-agent") || undefined,
    submittedAt
  };
  const parsed = formSubmissionSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonResponse(
      {
        success: false,
        message: "Please check the highlighted fields and try again.",
        errors: flattenValidationErrors(parsed.error)
      },
      400
    );
  }

  if (hasSuspiciousContent(parsed.data)) {
    logger.warn("Suspicious form content blocked", {
      submissionId,
      formType: parsed.data.formType,
      ipHash: rateLimit.identifier
    });
    return jsonResponse(
      {
        success: false,
        message: "We could not verify this submission. Please try again."
      },
      403
    );
  }

  const sanitised = sanitiseSubmission(parsed.data, submittedAt);

  try {
    const result = await processFormSubmission(sanitised, submissionId, rateLimit.identifier);

    if (!result.success) {
      logger.error("Form submission failed all integrations", {
        submissionId,
        formType: sanitised.formType,
        submittedAt
      });
      return jsonResponse(
        {
          success: false,
          message: "We could not submit your enquiry right now. Please try again or contact us directly."
        },
        500
      );
    }

    logger.info("Form submission accepted", {
      submissionId,
      formType: sanitised.formType,
      submittedAt,
      notified: result.notified,
      recorded: result.recorded
    });

    return jsonResponse(
      {
        success: true,
        message: successMessage,
        submissionId,
        ...(process.env.NODE_ENV !== "production" && (!result.notified || !result.recorded)
          ? { warning: { notified: result.notified, recorded: result.recorded } }
          : {})
      },
      200
    );
  } catch (error) {
    logger.error("Unexpected form submission error", { submissionId, error });
    return jsonResponse(
      {
        success: false,
        message: "Something went wrong. Please try again."
      },
      500
    );
  }
}

export function GET() {
  return jsonResponse({ success: false, message: "Method not allowed." }, 405);
}

export function PUT() {
  return jsonResponse({ success: false, message: "Method not allowed." }, 405);
}

export function DELETE() {
  return jsonResponse({ success: false, message: "Method not allowed." }, 405);
}

export function PATCH() {
  return jsonResponse({ success: false, message: "Method not allowed." }, 405);
}
