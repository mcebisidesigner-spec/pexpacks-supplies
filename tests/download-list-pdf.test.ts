import { describe, it, expect } from "vitest";
import { generateStationeryPdfBuffer } from "@/lib/pdf/generateStationeryPdf";

describe("Download List PDF Generation (@react-pdf/renderer)", () => {
  it("generates a valid A4 PDF buffer for school stationery list", async () => {
    const options = {
      schoolName: "3d Christian Academy",
      grade: "Grade 10",
      academicYear: "2027",
      estimatedPrice: "R 1,450.00",
      items: [
        {
          name: "A4 College Exercise Books (72 Page)",
          quantity: 8,
          description: "Feint & Margin ruled",
        },
        {
          name: "Mathematical Set (11 Piece)",
          quantity: 1,
          description: "Metal compass & dividers",
        },
        {
          name: "Scientific Calculator (Casio fx-82ZA Plus II)",
          quantity: 1,
          description: "Approved for CAPS examinations",
        },
        {
          name: "Ballpoint Pens Blue (Pack of 10)",
          quantity: 2,
          description: "Medium point 1.0mm",
        },
      ],
    };

    const pdfBuffer = await generateStationeryPdfBuffer(options);
    expect(pdfBuffer).toBeDefined();
    expect(pdfBuffer.length).toBeGreaterThan(1000);

    // Verify PDF header magic bytes %PDF
    const header = pdfBuffer.slice(0, 5).toString("utf-8");
    expect(header.startsWith("%PDF")).toBe(true);
  });
});
