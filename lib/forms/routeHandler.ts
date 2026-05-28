import { NextRequest, NextResponse } from "next/server";
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
  validateFormSubmission,
} from "@/lib/forms/validation";
import {
  saveFormSubmission,
  saveOrderRecord,
  saveBrandPackageRecord,
  saveLayByRecord,
} from "@/lib/supabase/forms";

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

export async function handlePexpacksFormRequest(
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

  try {
    const body = await readFormBody(request);
    raw = withRequestMetadata(request, body.raw);
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

  const data = validation.data;

  const saved = await saveFormSubmission(data);

  if (saved.submission_id) {
    await Promise.allSettled([
      saveOrderRecord(data, saved.submission_id),
      saveBrandPackageRecord(data, saved.submission_id),
      saveLayByRecord(data, saved.submission_id),
    ]);
  }

  if (!saved.success) {
    console.error("Failed to persist form submission:", saved.error);
    return json(
      {
        success: false,
        message: FORM_ERROR_MESSAGE,
        error: saved.error,
      },
      500
    );
  }

  return json(
    {
      success: true,
      message: FORM_SUCCESS_MESSAGE,
      submission_id: saved.submission_id,
    },
    200
  );
}

export function methodNotAllowed() {
  return json({ success: false, message: "Method not allowed." }, 405);
}
