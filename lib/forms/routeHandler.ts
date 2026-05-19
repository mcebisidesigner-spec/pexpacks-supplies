import { NextRequest, NextResponse } from "next/server";
import { createEmailTemplate } from "@/lib/email/templates";
import { recipientForEndpoint, sendPexPacksEmail } from "@/lib/email/mailer";
import { normaliseSubmittedTotal } from "@/lib/order/orderTotals";
import {
  isSameOriginRequest,
  rateLimitRequest,
} from "@/lib/security/requestGuards";
import {
  FORM_ERROR_MESSAGE,
  FORM_SUCCESS_MESSAGE,
  FORM_VALIDATION_MESSAGE,
  type FormEndpointKind,
  type FormSubmission,
} from "@/lib/forms/types";
import {
  isHoneypotSubmission,
  readFormBody,
  type SubmittedFormAttachment,
  validateFormSubmission,
} from "@/lib/forms/validation";

function json(body: unknown, status: number) {
  return NextResponse.json(body, { status });
}

function withRequestMetadata(
  request: NextRequest,
  raw: Record<string, unknown>
) {
  return {
    ...raw,
    sourceUrl:
      raw.sourceUrl || raw.pageUrl || request.headers.get("referer") || "",
    pageUrl:
      raw.pageUrl || raw.sourceUrl || request.headers.get("referer") || "",
    userAgent: raw.userAgent || request.headers.get("user-agent") || "",
    submittedAt: raw.submittedAt || new Date().toISOString(),
  };
}

async function withOrderTotal(data: FormSubmission) {
  const total = await normaliseSubmittedTotal(data);

  return {
    ...data,
    estimatedTotal:
      typeof total.estimatedTotal === "number"
        ? total.estimatedTotal
        : data.estimatedTotal,
    notes: [
      data.notes,
      `Total source: ${total.source}. Client total adjusted: ${
        total.changed ? "Yes" : "No"
      }.`,
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

export async function handlePexPacksFormRequest(
  request: NextRequest,
  endpoint: FormEndpointKind
) {
  if (!isSameOriginRequest(request)) {
    return json({ success: false, message: "Invalid request origin." }, 403);
  }

  const limit = rateLimitRequest(request, {
    keyPrefix: `forms-${endpoint}`,
    windowMs: 10 * 60 * 1000,
    max: 8,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Too many submissions were made from this connection. Please wait a few minutes and try again.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfter) },
      }
    );
  }

  let raw: Record<string, unknown>;

  let attachments: SubmittedFormAttachment[] = [];

  try {
    const body = await readFormBody(request);
    raw = withRequestMetadata(request, body.raw);
    attachments = body.attachments;
    if (body.fileError) {
      return json(
        {
          success: false,
          message: FORM_VALIDATION_MESSAGE,
          errors: { brandAssets: body.fileError },
        },
        400
      );
    }
  } catch {
    return json({ success: false, message: "Invalid form data." }, 400);
  }

  if (isHoneypotSubmission(raw)) {
    return json({ success: true, message: FORM_SUCCESS_MESSAGE }, 200);
  }

  const validation = validateFormSubmission(raw, endpoint);

  if (!validation.success) {
    return json(
      {
        success: false,
        message: FORM_VALIDATION_MESSAGE,
        errors: validation.errors,
      },
      400
    );
  }

  // Future: persist this payload to Supabase before sending email.
  const data =
    endpoint === "order"
      ? await withOrderTotal(validation.data)
      : validation.data;
  const recipient = recipientForEndpoint(endpoint);

  if (!recipient) {
    console.error("[SMTP] SMTP_TO_EMAIL or endpoint recipient is not set.");
    return json({ success: false, message: FORM_ERROR_MESSAGE }, 500);
  }

  const template = createEmailTemplate(endpoint, data);
  const result = await sendPexPacksEmail({
    to: recipient,
    replyTo: data.email,
    subject: template.subject,
    text: template.text,
    html: template.html,
    formType: data.formType,
    attachments,
    metadata: {
      sourceUrl: data.sourceUrl || data.pageUrl,
    },
  });

  if (!result.success) {
    return json({ success: false, message: FORM_ERROR_MESSAGE }, 500);
  }

  return json({ success: true, message: FORM_SUCCESS_MESSAGE }, 200);
}

export function methodNotAllowed() {
  return json({ success: false, message: "Method not allowed." }, 405);
}
