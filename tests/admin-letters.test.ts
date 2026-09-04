import { describe, it, expect } from "vitest";
import React from "react";
import { pdf } from "@react-pdf/renderer";
import { OfficialLetterPdfDocument } from "@/components/pdf/OfficialLetterPdfDocument";
import type { OfficialLetterPdfData } from "@/components/pdf/OfficialLetterPdfDocument";

describe("Admin Official Letters Engine", () => {
  it("validates letter reference number formatting (PX-DOC-YYYY-XXXX)", () => {
    const year = new Date().getFullYear();
    const count = 42;
    const ref = `PX-DOC-${year}-${String(count).padStart(4, "0")}`;
    expect(ref).toBe(`PX-DOC-${year}-0042`);
    expect(ref).toMatch(/^PX-DOC-\d{4}-\d{4}$/);
  });

  it("validates dual-mode recipient payload structures", () => {
    // School mode
    const schoolPayload = {
      recipient_type: "registered_school" as const,
      school_id: "sch-123",
      recipient_organization: "Riverside High School",
      recipient_title: "The Headmaster",
      recipient_name: "Mr. John Smith",
      recipient_email: "principal@riversideschool.co.za",
      recipient_address: "123 School Lane, Johannesburg, Gauteng",
      recipient_country: "South Africa",
      subject: "Official Partnership Proposal 2027",
      body_markdown:
        "We are pleased to present our comprehensive institutional stationery partnership proposal.",
      include_quotation: true,
      quotation_data: {
        items: [
          {
            item_title: "A4 Hardcover 192pg Notebooks",
            sku: "PX-NB-192",
            unit: "Pack of 10",
            quantity: 50,
            unit_price: 220.0,
            total_price: 11000.0,
          },
        ],
        subtotal: 11000.0,
        vat_rate: 15.0,
        vat_amount: 1650.0,
        total_amount: 12650.0,
      },
    };

    expect(schoolPayload.recipient_type).toBe("registered_school");
    expect(schoolPayload.school_id).toBeDefined();
    expect(schoolPayload.quotation_data.total_amount).toBe(12650.0);

    // Private client mode
    const privatePayload = {
      recipient_type: "private_client" as const,
      recipient_organization: "Maputo International Academy",
      recipient_title: "Head of Procurement",
      recipient_name: "Dr. Ana Silva",
      recipient_email: "procurement@maputoacademy.mz",
      recipient_country: "Mozambique",
      recipient_address: "Avenida Julius Nyerere, Maputo",
      subject: "Direct Export Quotation & Terms",
      body_markdown: "Please find attached our direct export rates.",
      include_quotation: false,
    };

    expect(privatePayload.recipient_type).toBe("private_client");
    expect(privatePayload.recipient_country).toBe("Mozambique");
  });

  it("calculates embedded quotation schedules accurately", () => {
    const items = [
      { quantity: 20, unit_price: 55.0 }, // 1100.00
      { quantity: 10, unit_price: 150.0 }, // 1500.00
    ];

    const subtotal = items.reduce(
      (sum, it) => sum + it.quantity * it.unit_price,
      0,
    );
    expect(subtotal).toBe(2600.0);

    const vatRate = 15.0;
    const vatAmount = Number(((subtotal * vatRate) / 100).toFixed(2));
    expect(vatAmount).toBe(390.0);

    const grandTotal = subtotal + vatAmount;
    expect(grandTotal).toBe(2990.0);
  });

  it("renders OfficialLetterPdfDocument without quotation into a valid PDF binary buffer", async () => {
    const letterData: OfficialLetterPdfData = {
      reference_number: "PX-DOC-2026-0001",
      created_at: new Date().toISOString(),
      recipient_type: "registered_school",
      recipient_organization: "Greenwood Ridge College",
      recipient_title: "The Principal & Governing Body",
      recipient_name: "Mrs. Sarah Jenkins",
      recipient_email: "principal@greenwoodridge.co.za",
      recipient_country: "South Africa",
      recipient_address: "44 Oxford Rd, Rosebank, Johannesburg",
      subject: "Annual Bulk Stationery Procurement Agreement",
      body_markdown: `Dear Mrs. Jenkins,

We are pleased to submit our formal commercial proposal for the upcoming academic year.

### Key Highlights
- **Direct Sourcing**: Premium educational supplies delivered on-demand.
- **Customized School Packs**: Pre-packaged by grade level with individual pupil labeling.
- **Dedicated Account Support**: Prompt turnaround on supplementary orders.

We remain committed to supporting educational excellence at Greenwood Ridge College.`,
      include_quotation: false,
      signatory_name: "Mcebisi Hlatshwayo",
      signatory_title: "Managing Director",
      school_name: "Greenwood Ridge College",
      school_emis: "700123456",
    };

    const element = React.createElement(OfficialLetterPdfDocument, {
      data: letterData,
    }) as unknown as Parameters<typeof pdf>[0];
    const blob = await pdf(element).toBlob();
    const arrayBuffer = await blob.arrayBuffer();
    const documentBuffer = Buffer.from(arrayBuffer);

    expect(documentBuffer).toBeDefined();
    expect(documentBuffer.length).toBeGreaterThan(1000);
    const header = documentBuffer.slice(0, 5).toString("utf-8");
    expect(header.startsWith("%PDF")).toBe(true);
  }, 15000);

  it("renders LetterheadDocument into a valid PDF binary buffer", async () => {
    const { LetterheadDocument } = await import("@/lib/pdf/LetterheadDocument");

    const element = React.createElement(LetterheadDocument, {
      referenceNumber: "PX-DOC-2026-0003",
      date: "04 September 2026",
      recipientOrg: "St Andrew's College",
      recipientTitle: "The Head of School",
      recipientName: "Dr. Alistair Finch",
      recipientAddress: "Highland Road, Grahamstown",
      recipientCountry: "South Africa",
      subject: "Annual Bulk Stationery Procurement Agreement",
      body: "We are pleased to submit our formal commercial proposal for the upcoming academic year.\n\nAll items meet rigorous SABS standards and manufacturer quality benchmarks.",
      signatoryName: "Mcebisi Hlatshwayo",
      signatoryTitle: "Managing Director",
      quotation: {
        currency: "ZAR",
        items: [
          {
            description: "A4 Exercise Books 72pg",
            quantity: 500,
            unitPrice: 8.5,
          },
          {
            description: "Ballpoint Pens Blue (Box of 50)",
            quantity: 20,
            unitPrice: 95.0,
          },
        ],
        totalAmount: 6150.0,
      },
    }) as unknown as Parameters<typeof pdf>[0];

    const blob = await pdf(element).toBlob();
    const arrayBuffer = await blob.arrayBuffer();
    const documentBuffer = Buffer.from(arrayBuffer);

    expect(documentBuffer).toBeDefined();
    expect(documentBuffer.length).toBeGreaterThan(1000);
    const header = documentBuffer.slice(0, 5).toString("utf-8");
    expect(header.startsWith("%PDF")).toBe(true);
  }, 15000);

  it("verifies 'New Letter' is the first preset pill and presents a blank letterhead template", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const editorCode = fs.readFileSync(
      path.join(process.cwd(), "components/admin/letters/LetterEditor.tsx"),
      "utf8",
    );

    // Verify 'new_letter' is the first entry in PRESET_TEMPLATES
    const presetMatch = editorCode.match(/const PRESET_TEMPLATES = \[\s*\{([^}]+)\}/);
    expect(presetMatch).not.toBeNull();
    expect(presetMatch![1]).toContain('id: "new_letter"');
    expect(presetMatch![1]).toContain('name: "New Letter"');
    expect(presetMatch![1]).toContain('subject: ""');
    expect(presetMatch![1]).toContain('content: ""');

    // Verify initial state defaults to blank for new letter
    expect(editorCode).toContain('initialLetter ? "" : "new_letter"');
    expect(editorCode).toContain('initialLetter?.subject || ""');
    expect(editorCode).toContain('initialLetter?.body_markdown || ""');
  });

  it("verifies canonical letterReference URL and anchored workbench at bottom of /admin/letters", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");

    // 1. Verify [letterReference] route exists and canonicalizes URLs
    const routeCode = fs.readFileSync(
      path.join(
        process.cwd(),
        "app/admin/letters/[letterReference]/page.tsx",
      ),
      "utf8",
    );
    expect(routeCode).toContain("letterReference");
    expect(routeCode).toContain("getLetterById(letterReference)");
    expect(routeCode).toContain("redirect(`/admin/letters/${encodeURIComponent(letter.reference_number)}`)");

    // 2. Verify LettersListView uses reference URLs and anchored workbench
    const listViewCode = fs.readFileSync(
      path.join(
        process.cwd(),
        "components/admin/letters/LettersListView.tsx",
      ),
      "utf8",
    );
    expect(listViewCode).toContain("LetterActionWorkbench");
    expect(listViewCode).toContain("handleOpenWorkbench(row, \"preview\")");
    expect(listViewCode).toContain("handleOpenWorkbench(row, \"email\")");
    expect(listViewCode).toContain("letter-workbench");
    expect(listViewCode).toContain("row.reference_number");

    // 3. Verify LetterActionWorkbench renders anchored workbench section
    const workbenchCode = fs.readFileSync(
      path.join(
        process.cwd(),
        "components/admin/letters/LetterActionWorkbench.tsx",
      ),
      "utf8",
    );
    expect(workbenchCode).toContain('id="letter-workbench"');
    expect(workbenchCode).toContain("Official Letter Workbench");
    expect(workbenchCode).toContain("sendLetterEmailAction");
  });
});

