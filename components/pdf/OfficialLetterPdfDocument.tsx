import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { PEXPACKS_LETTERHEAD_LOGO_BASE64 } from "./letterhead-logo";
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
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: "#334155",
    backgroundColor: "#ffffff",
    lineHeight: 1.5,
  },
  // Top thin border rule
  topAccentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3.5,
    backgroundColor: "#0d9488",
  },
  // Primary Letterhead Header
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 6,
    marginBottom: 8,
  },
  logo: {
    width: 140,
    height: 54.5,
  },
  companyMetaBlock: {
    alignItems: "flex-end",
  },
  badgePill: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1.2,
    borderColor: "#0d9488",
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginBottom: 6,
    alignSelf: "flex-end",
  },
  badgePillText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#047857",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  companyTitle: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
    textAlign: "right",
  },
  companyMetaText: {
    fontSize: 7.8,
    fontFamily: "Helvetica",
    color: "#64748b",
    textAlign: "right",
    marginTop: 2,
    lineHeight: 1.3,
  },
  // Horizontal divider below header
  headerDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#0d9488",
    marginTop: 8,
    marginBottom: 14,
  },
  // Recipient Details & Document Reference
  recipientSection: {
    marginBottom: 14,
  },
  recipientLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  metaColumnsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  recipientCol: {
    maxWidth: "65%",
  },
  recipientNameText: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 0.2,
  },
  recipientAddressLine: {
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: "#0d9488",
    marginTop: 2,
    lineHeight: 1.3,
  },
  refNumberCol: {
    alignItems: "flex-end",
  },
  refNumberText: {
    fontSize: 12.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    textAlign: "right",
  },
  issueDateText: {
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: "#475569",
    textAlign: "right",
    marginTop: 3,
  },
  // Subject Banner
  subjectBanner: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: "#f8fafc",
    marginTop: 14,
    marginBottom: 18,
    borderRadius: 1,
    overflow: "hidden",
  },
  subjectAccentBar: {
    width: 5,
    backgroundColor: "#059669",
  },
  subjectContent: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
  },
  subjectText: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 0.25,
  },
  // Body and Typography
  bodyWrapper: {
    marginBottom: 14,
  },
  salutationText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: "#334155",
    lineHeight: 1.55,
    marginBottom: 10,
    textAlign: "left",
  },
  heading2: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginTop: 8,
    marginBottom: 6,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 4,
    paddingLeft: 4,
  },
  bulletDot: {
    width: 12,
    fontSize: 9.5,
    color: "#334155",
    fontFamily: "Helvetica",
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: "#334155",
    lineHeight: 1.45,
  },
  // Sign-off
  signatorySection: {
    marginTop: 10,
    marginBottom: 16,
  },
  valediction: {
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: "#334155",
    marginBottom: 14,
  },
  signatoryName: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  signatoryTitle: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#0d9488",
    marginTop: 2,
  },
  signatoryCompany: {
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#64748b",
    marginTop: 2,
  },
  // Quotation Table Styling
  quotationContainer: {
    marginTop: 10,
    marginBottom: 14,
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
    backgroundColor: "#fafaf9",
  },
  colDesc: { flex: 3 },
  colSku: { flex: 1.2 },
  colQty: { flex: 0.8, textAlign: "center" },
  colUnit: { flex: 1.2, textAlign: "right" },
  colTotal: { flex: 1.2, textAlign: "right" },
  cellText: { fontSize: 8, color: "#334155" },
  cellTextBold: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#0f172a" },
  totalsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    marginBottom: 14,
  },
  totalsBox: {
    width: 200,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 4,
    overflow: "hidden",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
  },
  totalsLabel: { fontSize: 8, color: "#64748b" },
  totalsValue: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#1e293b" },
  totalsRowGrand: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#f0fdf4",
  },
  totalsGrandLabel: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#065f46",
    textTransform: "uppercase",
  },
  totalsGrandValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#065f46",
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

  // Badge text: OFFICIAL QUOTATION if quotation included, otherwise OFFICIAL CORRESPONDENCE
  const badgeLabel = data.include_quotation
    ? "OFFICIAL QUOTATION"
    : "OFFICIAL CORRESPONDENCE";

  // Extract recipient display details
  const recipientDisplayName = (
    data.recipient_organization ||
    data.recipient_name ||
    "Valued Client"
  ).trim();

  const addressLines: string[] = [];
  if (data.recipient_address) {
    data.recipient_address
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((line) => addressLines.push(line));
  } else {
    addressLines.push("Kelly Rd, Meerzicht Business Park");
    addressLines.push("Jet Park, Boksburg, 1459, South Africa");
  }

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
        {/* Top accent teal bar */}
        <View style={styles.topAccentBar} fixed />

        {/* Header: Logo on left, Badge and Company Metadata on right */}
        <View style={styles.headerRow}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={PEXPACKS_LETTERHEAD_LOGO_BASE64} style={styles.logo} />

          <View style={styles.companyMetaBlock}>
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>{badgeLabel}</Text>
            </View>
            <Text style={styles.companyTitle}>Pexpacks Supplies (Pty) Ltd</Text>
            <Text style={styles.companyMetaText}>
              Kelly Rd, Meerzicht Business Park
            </Text>
            <Text style={styles.companyMetaText}>
              Jet Park, Boksburg, 1459, South Africa
            </Text>
            <Text style={styles.companyMetaText}>
              helpme@pexpacks.co.za | Tel: 078 003 6048
            </Text>
          </View>
        </View>

        {/* Horizontal teal separator divider */}
        <View style={styles.headerDivider} />

        {/* Recipient Details & Document Reference */}
        <View style={styles.recipientSection}>
          <Text style={styles.recipientLabel}>RECIPIENT DETAILS</Text>

          <View style={styles.metaColumnsRow}>
            <View style={styles.recipientCol}>
              <Text style={styles.recipientNameText}>
                {recipientDisplayName}
              </Text>
              {addressLines.slice(0, 3).map((line, idx) => (
                <Text key={idx} style={styles.recipientAddressLine}>
                  {line}
                </Text>
              ))}
            </View>

            <View style={styles.refNumberCol}>
              <Text style={styles.refNumberText}>{data.reference_number}</Text>
              <Text style={styles.issueDateText}>{dateStr}</Text>
            </View>
          </View>
        </View>

        {/* Subject Header Banner */}
        <View style={styles.subjectBanner}>
          <View style={styles.subjectAccentBar} />
          <View style={styles.subjectContent}>
            <Text style={styles.subjectText}>
              RE: {data.subject.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Letter Body */}
        <View style={styles.bodyWrapper} wrap={true}>
          {rawParagraphs.map((para, index) => {
            // Heading check
            if (para.startsWith("## ") || para.startsWith("# ")) {
              const headingText = para.replace(/^#+\s*/, "");
              return (
                <Text key={index} style={styles.heading2}>
                  {headingText}
                </Text>
              );
            }

            // Salutation bold check (e.g. "Dear ...")
            if (index === 0 && /^dear/i.test(para)) {
              return (
                <Text key={index} style={styles.salutationText}>
                  {para}
                </Text>
              );
            }

            // Bullet list check
            if (
              para.includes("\n* ") ||
              para.includes("\n- ") ||
              para.includes("\n• ") ||
              para.startsWith("* ") ||
              para.startsWith("- ") ||
              para.startsWith("• ")
            ) {
              const lines = para
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean);
              return (
                <View key={index} style={{ marginBottom: 10 }}>
                  {lines.map((line, lIdx) => {
                    const isBullet =
                      line.startsWith("* ") ||
                      line.startsWith("- ") ||
                      line.startsWith("• ");
                    const cleanText = isBullet
                      ? line.replace(/^[*\-•]\s*/, "")
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
                        <Text
                          style={
                            isBullet
                              ? styles.bulletText
                              : {
                                  fontSize: 9.5,
                                  fontFamily: "Helvetica",
                                  color: "#334155",
                                  marginBottom: 4,
                                }
                          }
                        >
                          {cleanText}
                        </Text>
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
      </Page>
    </Document>
  );
}
