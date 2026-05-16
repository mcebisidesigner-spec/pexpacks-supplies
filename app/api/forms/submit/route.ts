import { NextRequest, NextResponse } from "next/server";
import {
  formSubmissionSchema,
  flattenErrors,
  formTypeLabel,
} from "@/lib/forms/schema";
import { sanitise, isSpam } from "@/lib/forms/sanitise";
import { sendToWeb3Forms } from "@/lib/forms/web3forms";
import { isValidEmailAddress } from "@/lib/forms/contact";
import { normaliseSubmittedTotal } from "@/lib/order/orderTotals";
import {
  isSameOriginRequest,
  rateLimitRequest,
} from "@/lib/security/requestGuards";

export const runtime = "nodejs";

const OK_MSG =
  "Thank you. Your enquiry has been received. The Pexpacks team will contact you soon.";

function json(body: unknown, status: number) {
  return NextResponse.json(body, { status });
}

async function readJson(req: NextRequest) {
  try {
    return (await req.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  if (!isSameOriginRequest(req)) {
    return json({ success: false, message: "Invalid request origin." }, 403);
  }

  const limit = rateLimitRequest(req, {
    keyPrefix: "forms-submit",
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

  const body = await readJson(req);

  if (!body) {
    return json({ success: false, message: "Invalid form data." }, 400);
  }

  if (isSpam(body)) {
    return json({ success: true, message: OK_MSG }, 200);
  }

  const parsed = formSubmissionSchema.safeParse({
    ...body,
    pageUrl: body.pageUrl || req.headers.get("referer") || undefined,
    userAgent: body.userAgent || req.headers.get("user-agent") || undefined,
    submittedAt: body.submittedAt || new Date().toISOString(),
  });

  if (!parsed.success) {
    return json(
      {
        success: false,
        message: "Please check the highlighted fields and try again.",
        errors: flattenErrors(parsed.error),
      },
      400
    );
  }

  const clean = sanitise(parsed.data);
  const total = await normaliseSubmittedTotal(clean);
  const estimatedTotal =
    typeof total.estimatedTotal === "number"
      ? total.estimatedTotal
      : clean.estimatedTotal;
  const contactEmail =
    clean.email ||
    (clean.contactDetail && isValidEmailAddress(clean.contactDetail)
      ? clean.contactDetail
      : undefined);
  const contactPhone =
    clean.phone ||
    (clean.contactDetail && !isValidEmailAddress(clean.contactDetail)
      ? clean.contactDetail
      : undefined);

  const result = await sendToWeb3Forms({
    subject: `[Pexpacks] New ${formTypeLabel(clean.formType)} from ${clean.fullName}`,
    formName: formTypeLabel(clean.formType),
    replyTo: contactEmail,
    payload: {
      "Form Type": formTypeLabel(clean.formType),
      "Full Name": clean.fullName,
      Phone: contactPhone || "-",
      Email: contactEmail || "-",
      "Contact Detail": clean.contactDetail || "-",
      "Preferred Contact": clean.preferredContactMethod || "-",
      "School ID": clean.schoolId || "-",
      "School Name": clean.schoolName || "-",
      Grade: clean.grade || "-",
      City: clean.city || "-",
      Province: clean.province || "-",
      "Learner Name": clean.learnerName || "-",
      "Business Name": clean.businessName || "-",
      "Order Quantity": clean.orderQuantity ?? "-",
      "Pack Type": clean.packType || "-",
      "Selected Items": clean.selectedItems || "-",
      "Removed Items": clean.removedItems || "-",
      "Estimated Total": estimatedTotal ?? "-",
      "Total Source": total.source,
      "Client Total Adjusted": total.changed ? "Yes" : "No",
      "Order Reference": clean.orderReference || "-",
      "Order Draft ID": clean.orderDraftId || "-",
      Message: clean.message || "-",
      Consent: clean.consent ? "Yes" : "No",
      "Page URL": clean.pageUrl || "-",
      "Submitted At": clean.submittedAt || "-",
    },
  });

  if (!result.success) {
    return json(
      {
        success: false,
        message: result.message,
      },
      500
    );
  }

  return json({ success: true, message: OK_MSG }, 200);
}

export function GET() {
  return json({ success: false, message: "Method not allowed." }, 405);
}

export function PUT() {
  return json({ success: false, message: "Method not allowed." }, 405);
}

export function DELETE() {
  return json({ success: false, message: "Method not allowed." }, 405);
}

export function PATCH() {
  return json({ success: false, message: "Method not allowed." }, 405);
}
