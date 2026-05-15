import { NextRequest, NextResponse } from "next/server";
import { formSubmissionSchema, flattenErrors, formTypeLabel } from "@/lib/forms/schema";
import { sanitise, isSpam } from "@/lib/forms/sanitise";
import { sendToWeb3Forms } from "@/lib/forms/web3forms";

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

/* ── POST /api/forms/submit ── */
export async function POST(req: NextRequest) {
  const body = await readJson(req);

  if (!body) {
    return json({ success: false, message: "Invalid form data." }, 400);
  }

  /* Honeypot — silently accept so bots think it worked */
  if (isSpam(body as never)) {
    return json({ success: true, message: OK_MSG }, 200);
  }

  /* Validate */
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

  /* Sanitise & forward to Web3Forms */
  const clean = sanitise(parsed.data);

  const result = await sendToWeb3Forms({
    subject: `[Pexpacks] New ${formTypeLabel(clean.formType)} from ${clean.fullName}`,
    formName: formTypeLabel(clean.formType),
    payload: {
      "Form Type": formTypeLabel(clean.formType),
      "Full Name": clean.fullName,
      Phone: clean.phone,
      Email: clean.email || "-",
      "Preferred Contact": clean.preferredContactMethod || "-",
      "School ID": clean.schoolId || "-",
      "School Name": clean.schoolName || "-",
      Grade: clean.grade || "-",
      "Learner Name": clean.learnerName || "-",
      "Business Name": clean.businessName || "-",
      "Order Quantity": clean.orderQuantity ?? "-",
      "Pack Type": clean.packType || "-",
      "Selected Items": clean.selectedItems || "-",
      "Removed Items": clean.removedItems || "-",
      "Estimated Total": clean.estimatedTotal ?? "-",
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

/* Block other methods */
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
