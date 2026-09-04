import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { LetterQuotationData } from "@/lib/admin/letters";

export interface OfficialLetterPdfData {
  reference_number: string;
  created_at: string;
  recipient_type: "registered_school" | "private_client";
  recipient_organization: string;
  recipient_title?: string | null;
  recipient_name: string;
  recipient_email: string;
  recipient_country?: string | null;
  recipient_address?: string | null;
  subject: string;
  body_markdown: string;
  include_quotation?: boolean;
  quotation_data?: LetterQuotationData;
  signatory_name: string;
  signatory_title: string;
  school_name?: string | null;
  school_emis?: string | null;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: "#1e293b",
    backgroundColor: "#ffffff",
    lineHeight: 1.45,
  },
  topAccentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#059669",
  },
  // Running Header (fixed for multi-page overflow)
  runningHeader: {
    position: "absolute",
    top: 14,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#cbd5e1",
  },
  runningHeaderText: {
    fontSize: 7.5,
    color: "#64748b",
  },
  // Primary Letterhead Header
  letterhead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: "#059669",
  },
  brandBlock: {
    flexDirection: "column",
    maxWidth: "58%",
  },
  brandTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 8,
    color: "#059669",
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  companyMeta: {
    fontSize: 7.5,
    color: "#64748b",
    marginTop: 6,
    lineHeight: 1.35,
  },
  letterheadMeta: {
    alignItems: "flex-end",
  },
  badge: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#059669",
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#047857",
    letterSpacing: 0.5,
  },
  refNumber: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  issueDate: {
    fontSize: 8.5,
    color: "#64748b",
    marginTop: 3,
  },
  // Recipient Block
  recipientSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  recipientCol: {
    maxWidth: "60%",
  },
  recipientLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  recipientTitle: {
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#334155",
    marginBottom: 1,
  },
  recipientName: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  recipientOrg: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#059669",
    marginBottom: 2,
  },
  recipientAddress: {
    fontSize: 8.5,
    color: "#475569",
    lineHeight: 1.35,
  },
  // Subject Block
  subjectBox: {
    backgroundColor: "#f8fafc",
    borderLeftWidth: 3,
    borderLeftColor: "#059669",
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginBottom: 16,
    borderRadius: 2,
  },
  subjectText: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    letterSpacing: 0.2,
  },
  // Body & Paragraphs
  bodyContainer: {
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 9.5,
    color: "#1e293b",
    marginBottom: 10,
    lineHeight: 1.5,
    textAlign: "justify",
  },
  heading2: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginTop: 8,
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 4,
    paddingLeft: 8,
  },
  bulletDot: {
    width: 12,
    fontSize: 9.5,
    color: "#059669",
    fontFamily: "Helvetica-Bold",
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    color: "#1e293b",
    lineHeight: 1.4,
  },
  // Quotation Table Block
  quotationContainer: {
    marginTop: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  quoteHeaderBanner: {
    backgroundColor: "#0f172a",
    paddingVertical: 5,
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quoteBannerTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#f8fafc",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  quoteBannerNumber: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#34d399",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  thText: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#475569",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  tableRowEven: {
    backgroundColor: "#f8fafc",
  },
  colDesc: { width: "50%" },
  colSku: { width: "16%" },
  colQty: { width: "10%", textAlign: "center" },
  colUnit: { width: "12%", textAlign: "right" },
  colTotal: { width: "12%", textAlign: "right" },
  cellText: {
    fontSize: 8,
    color: "#334155",
  },
  cellTextBold: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  // Quotation Totals
  totalsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 6,
    marginBottom: 14,
  },
  totalsBox: {
    width: "45%",
    backgroundColor: "#f8fafc",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 8,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  totalsRowGrand: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 4,
    marginTop: 3,
    borderTopWidth: 1,
    borderTopColor: "#059669",
  },
  totalsLabel: {
    fontSize: 8,
    color: "#64748b",
  },
  totalsValue: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  totalsGrandLabel: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  totalsGrandValue: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: "#059669",
  },
  // Signatory Block
  signatorySection: {
    marginTop: 14,
    marginBottom: 20,
  },
  valediction: {
    fontSize: 9.5,
    color: "#1e293b",
    marginBottom: 24,
  },
  signatoryName: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  signatoryTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#059669",
  },
  signatoryCompany: {
    fontSize: 8.5,
    color: "#64748b",
    marginTop: 1,
  },
  // Running Footer
  runningFooter: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#e2e8f0",
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: "#94a3b8",
  },
  pageNumberText: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
  },
});

function formatMoney(amount: number, currency = "ZAR"): string {
  const sym =
    currency === "USD"
      ? "$"
      : currency === "GBP"
        ? "£"
        : currency === "EUR"
          ? "€"
          : "R";
  return `${sym} ${Number(amount || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function OfficialLetterPdfDocument({
  data,
}: {
  data: OfficialLetterPdfData;
}) {
  const dateStr = data.created_at
    ? new Date(data.created_at).toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  // Parse body text into structured paragraphs, headings, and bullet points
  const rawParagraphs = (data.body_markdown || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const quotation = data.quotation_data;
  const hasQuotation =
    Boolean(data.include_quotation) &&
    Boolean(quotation && quotation.items && quotation.items.length > 0);

  return (
    <Document
      title={`${data.reference_number} - ${data.subject}`}
      author="Pexpacks Supplies (Pty) Ltd"
    >
      <Page size="A4" style={styles.page}>
        {/* Top green accent border */}
        <View style={styles.topAccentBar} fixed />

        {/* Running Header for multi-page documents */}
        <View style={styles.runningHeader} fixed>
          <Text style={styles.runningHeaderText}>
            Pexpacks Supplies • Official Correspondence
          </Text>
          <Text style={styles.runningHeaderText}>
            Ref: {data.reference_number}
          </Text>
        </View>

        {/* Primary Letterhead Header */}
        <View style={styles.letterhead}>
          <View style={styles.brandBlock}>
            <Text style={styles.brandTitle}>Pexpacks Supplies</Text>
            <Text style={styles.brandTagline}>
              Official School Stationery &amp; Academic Supply Partner
            </Text>
            <Text style={styles.companyMeta}>
              Pexpacks Supplies (Pty) Ltd | Reg: 2024/789123/07 | VAT:
              4920182741{"\n"}
              Email: helpme@pexpacks.co.za | Tel: 078 003 6048{"\n"}
              33 Kelly Rd, Meerzicht Business Park, Jet Park, Boksburg, 1459,
              South Africa
            </Text>
          </View>

          <View style={styles.letterheadMeta}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>OFFICIAL CORRESPONDENCE</Text>
            </View>
            <Text style={styles.refNumber}>{data.reference_number}</Text>
            <Text style={styles.issueDate}>{dateStr}</Text>
          </View>
        </View>

        {/* Recipient Metadata Block */}
        <View style={styles.recipientSection}>
          <View style={styles.recipientCol}>
            <Text style={styles.recipientLabel}>Recipient Details</Text>
            {data.recipient_title ? (
              <Text style={styles.recipientTitle}>{data.recipient_title}</Text>
            ) : null}
            <Text style={styles.recipientName}>{data.recipient_name}</Text>
            <Text style={styles.recipientOrg}>
              {data.recipient_organization}
            </Text>
            {data.school_emis ? (
              <Text style={styles.recipientAddress}>
                EMIS / Reg ID: {data.school_emis}
              </Text>
            ) : null}
            {data.recipient_address ? (
              <Text style={styles.recipientAddress}>
                {data.recipient_address}
              </Text>
            ) : null}
            <Text style={styles.recipientAddress}>
              {data.recipient_country || "South Africa"} •{" "}
              {data.recipient_email}
            </Text>
          </View>
        </View>

        {/* Subject Header */}
        <View style={styles.subjectBox}>
          <Text style={styles.subjectText}>
            RE: {data.subject.toUpperCase()}
          </Text>
        </View>

        {/* Letter Body / Markdown Parsed Blocks */}
        <View style={styles.bodyContainer} wrap={true}>
          {rawParagraphs.map((para, index) => {
            // Heading 2 check
            if (para.startsWith("## ") || para.startsWith("# ")) {
              const headingText = para.replace(/^#+\s*/, "");
              return (
                <Text key={index} style={styles.heading2}>
                  {headingText}
                </Text>
              );
            }

            // Bullet list check
            if (
              para.includes("\n* ") ||
              para.includes("\n- ") ||
              para.startsWith("* ") ||
              para.startsWith("- ")
            ) {
              const lines = para
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean);
              return (
                <View key={index} style={{ marginBottom: 8 }}>
                  {lines.map((line, lIdx) => {
                    const isBullet =
                      line.startsWith("* ") || line.startsWith("- ");
                    const cleanText = isBullet
                      ? line.replace(/^[*\-]\s*/, "")
                      : line;
                    return (
                      <View
                        key={lIdx}
                        style={
                          isBullet ? styles.bulletRow : { marginBottom: 4 }
                        }
                      >
                        {isBullet ? (
                          <Text style={styles.bulletDot}>•</Text>
                        ) : null}
                        <Text style={styles.bulletText}>{cleanText}</Text>
                      </View>
                    );
                  })}
                </View>
              );
            }

            // Standard Paragraph
            return (
              <Text key={index} style={styles.paragraph}>
                {para}
              </Text>
            );
          })}
        </View>

        {/* Optional Embedded Quotation Table */}
        {hasQuotation && quotation && (
          <View wrap={true}>
            <View style={styles.quotationContainer}>
              <View style={styles.quoteHeaderBanner}>
                <Text style={styles.quoteBannerTitle}>
                  Itemized Quotation Schedule
                </Text>
                {quotation.quote_number ? (
                  <Text style={styles.quoteBannerNumber}>
                    Ref: {quotation.quote_number}
                  </Text>
                ) : null}
              </View>

              <View style={styles.tableHeader}>
                <View style={styles.colDesc}>
                  <Text style={styles.thText}>Item Description</Text>
                </View>
                <View style={styles.colSku}>
                  <Text style={styles.thText}>SKU</Text>
                </View>
                <View style={styles.colQty}>
                  <Text style={styles.thText}>Qty</Text>
                </View>
                <View style={styles.colUnit}>
                  <Text style={styles.thText}>Unit Price</Text>
                </View>
                <View style={styles.colTotal}>
                  <Text style={styles.thText}>Total</Text>
                </View>
              </View>

              {quotation.items.map((item, iIdx) => (
                <View
                  key={iIdx}
                  style={[
                    styles.tableRow,
                    iIdx % 2 === 1 ? styles.tableRowEven : {},
                  ]}
                >
                  <View style={styles.colDesc}>
                    <Text style={styles.cellTextBold}>{item.item_title}</Text>
                    {item.unit ? (
                      <Text style={{ fontSize: 6.5, color: "#64748b" }}>
                        Unit: {item.unit}
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.colSku}>
                    <Text style={styles.cellText}>{item.sku || "-"}</Text>
                  </View>
                  <View style={styles.colQty}>
                    <Text style={styles.cellText}>{item.quantity}</Text>
                  </View>
                  <View style={styles.colUnit}>
                    <Text style={styles.cellText}>
                      {formatMoney(item.unit_price, quotation.currency)}
                    </Text>
                  </View>
                  <View style={styles.colTotal}>
                    <Text style={styles.cellTextBold}>
                      {formatMoney(item.total_price, quotation.currency)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Totals Summary */}
            <View style={styles.totalsContainer}>
              <View style={styles.totalsBox}>
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Subtotal</Text>
                  <Text style={styles.totalsValue}>
                    {formatMoney(quotation.subtotal, quotation.currency)}
                  </Text>
                </View>
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>
                    VAT ({quotation.vat_rate}%)
                  </Text>
                  <Text style={styles.totalsValue}>
                    {formatMoney(quotation.vat_amount, quotation.currency)}
                  </Text>
                </View>
                <View style={styles.totalsRowGrand}>
                  <Text style={styles.totalsGrandLabel}>
                    Grand Total ({quotation.currency || "ZAR"})
                  </Text>
                  <Text style={styles.totalsGrandValue}>
                    {formatMoney(quotation.total_amount, quotation.currency)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Signatory Closing Block */}
        <View style={styles.signatorySection} wrap={false}>
          <Text style={styles.valediction}>Yours faithfully,</Text>
          <Text style={styles.signatoryName}>{data.signatory_name}</Text>
          <Text style={styles.signatoryTitle}>{data.signatory_title}</Text>
          <Text style={styles.signatoryCompany}>
            Pexpacks Supplies (Pty) Ltd
          </Text>
        </View>

        {/* Running Footer */}
        <View style={styles.runningFooter} fixed>
          <Text style={styles.footerText}>
            Pexpacks Supplies (Pty) Ltd • Official Letterhead • Care Desk:
            helpme@pexpacks.co.za
          </Text>
          <Text
            style={styles.pageNumberText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
