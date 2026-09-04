import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { getLetterById } from "@/lib/admin/letters";
import { requireAdmin } from "@/lib/admin/rbac";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin({ permission: "orders.view" });
    const { id } = await params;
    const letter = await getLetterById(id);

    if (!letter) {
      return new NextResponse("Letter not found", { status: 404 });
    }

    const [{ pdf }, { OfficialLetterPdfDocument }] = await Promise.all([
      import("@react-pdf/renderer"),
      import("@/components/pdf/OfficialLetterPdfDocument"),
    ]);

    const pdfElement = React.createElement(OfficialLetterPdfDocument, {
      data: {
        reference_number: letter.reference_number,
        created_at: letter.created_at,
        recipient_type: letter.recipient_type,
        recipient_organization: letter.recipient_organization,
        recipient_title: letter.recipient_title,
        recipient_name: letter.recipient_name,
        recipient_email: letter.recipient_email,
        recipient_country: letter.recipient_country,
        recipient_address: letter.recipient_address,
        subject: letter.subject,
        body_markdown: letter.body_markdown,
        include_quotation: letter.include_quotation,
        quotation_data: letter.quotation_data,
        signatory_name: letter.signatory_name,
        signatory_title: letter.signatory_title,
        school_name: letter.school?.name,
      },
    }) as NonNullable<Parameters<typeof pdf>[0]>;

    const buffer = await pdf(pdfElement).toBuffer();

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${letter.reference_number}.pdf"`,
      },
    });
  } catch (err: unknown) {
    console.error("[Letter PDF Route] Error:", err);
    return new NextResponse("Failed to generate PDF", { status: 500 });
  }
}
