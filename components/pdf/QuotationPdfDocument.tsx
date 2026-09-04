import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { PEXPACKS_LETTERHEAD_LOGO_BASE64 } from "./letterhead-logo";

export interface QuotationItemPdf {
  id?: string;
  item_title: string;
  sku?: string | null;
  unit?: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface QuotationCompanyDetailsPdf {
  registered_name?: string;
  trading_name?: string;
  reg_number?: string;
  vat_number?: string;
  address_text?: string;
  phone?: string;
  email?: string;
  website?: string;
  bank_name?: string;
  account_holder?: string;
  account_type?: string;
  account_number?: string;
  branch_code?: string;
  default_terms?: string;
}

export interface QuotationPdfData {
  quote_number: string;
  created_at: string;
  valid_until: string;
  status: string;
  prepared_by?: string | null;
  recipient_name: string;
  recipient_email: string;
  recipient_phone?: string | null;
  school_name?: string | null;
  school_address?: string | null;
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total_amount: number;
  notes?: string | null;
  items: QuotationItemPdf[];
  company?: QuotationCompanyDetailsPdf;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingBottom: 48,
    paddingHorizontal: 36,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1e293b",
    backgroundColor: "#ffffff",
    lineHeight: 1.45,
  },
  // Top thin teal border rule
  topAccentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3.5,
    backgroundColor: "#0d9488",
  },
  // Header Section
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 4,
    marginBottom: 8,
  },
  brandBlock: {
    flexDirection: "column",
    maxWidth: "52%",
  },
  logo: {
    width: 140,
    height: 54.5,
    marginBottom: 8,
  },
  companyMeta: {
    fontSize: 8,
    color: "#64748b",
    lineHeight: 1.35,
  },
  companyTitle: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
    marginBottom: 2,
  },
  quoteTitleBlock: {
    alignItems: "flex-end",
  },
  quoteBadge: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1.5,
    borderColor: "#0d9488",
    borderRadius: 4,
    paddingVertical: 4.5,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  quoteBadgeText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#0d9488",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  quoteNumber: {
    fontSize: 13.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    textAlign: "right",
  },
  quoteDates: {
    fontSize: 8.5,
    color: "#64748b",
    marginTop: 3,
    textAlign: "right",
    lineHeight: 1.4,
  },
  preparedByText: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#059669",
    marginTop: 3,
    textAlign: "right",
  },
  // Horizontal teal line divider
  headerDivider: {
    borderBottomWidth: 1.2,
    borderBottomColor: "#0d9488",
    marginTop: 8,
    marginBottom: 12,
  },
  // Metadata Grid Card
  metaGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  metaCol: {
    flexDirection: "column",
    width: "48%",
  },
  metaHeading: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  metaName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  metaText: {
    fontSize: 8.5,
    color: "#334155",
    lineHeight: 1.35,
  },
  // Line Items Table
  table: {
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  thText: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  colDesc: { width: "44%" },
  colSku: { width: "20%" },
  colQty: { width: "8%", textAlign: "center" },
  colUnit: { width: "14%", textAlign: "right" },
  colTotal: { width: "14%", textAlign: "right" },
  cellText: {
    fontSize: 8,
    color: "#334155",
    fontFamily: "Helvetica",
  },
  cellTextBold: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  // Totals Summary Box
  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 14,
  },
  totalsTable: {
    width: 220,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 10,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalsRowGrand: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    marginTop: 4,
    borderTopWidth: 1.5,
    borderTopColor: "#0d9488",
  },
  totalsLabel: {
    fontSize: 8.5,
    color: "#64748b",
  },
  totalsValue: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  totalsGrandLabel: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  totalsGrandValue: {
    fontSize: 11.5,
    fontFamily: "Helvetica-Bold",
    color: "#059669",
  },
  // Banking and Notes
  notesAndBanking: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 14,
  },
  bankingCard: {
    width: "48.5%",
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  notesCard: {
    width: "48.5%",
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 7.5,
    color: "#475569",
    lineHeight: 1.45,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    borderTopWidth: 0.5,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
    textAlign: "center",
  },
  footerText: {
    fontSize: 7,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 1.35,
  },
});

function formatMoney(amount: number): string {
  // Format with South African comma as decimal separator to match reference template
  const parts = Number(amount || 0).toFixed(2).split(".");
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `R ${intPart},${parts[1]}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  // Check if already in YYYY/MM/DD format
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(dateStr)) return dateStr;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}/${m}/${day}`;
  } catch {
    return dateStr;
  }
}

export function QuotationPdfDocument({ data }: { data: QuotationPdfData }) {
  // Clean notes from the trailing Prepared by if it was appended
  const displayNotes = data.notes
    ? data.notes.replace(/Prepared by:\s*[^\n\r]+/i, "").trim()
    : "";

  const c = data.company || {};
  const companyTradingName = c.trading_name || "Pexpacks Supplies";
  const companyRegName = c.registered_name || "Pexpacks Supplies (Pty) Ltd";
  const companyAddress =
    c.address_text ||
    "Kelly Rd, Meerzicht Business Park\nJet Park, Boksburg, 1459, South Africa";
  const companyEmail = c.email || "helpme@pexpacks.co.za";
  const companyPhone = c.phone || "078 003 6048";
  const companyWebsite = c.website || "www.pexpacks.co.za";

  const bankName = c.bank_name || "FNB / RMB";
  const bankHolder = c.account_holder || "Pexpacks";
  const bankType = c.account_type || "Current Account";
  const bankNumber = c.account_number || "63215756991";
  const bankBranch = c.branch_code || "250655";

  const defaultTerms =
    "1. This quotation is valid for 30 calendar days from the date of issue.\n2. Pricing includes packaging, quality verification, and school delivery coordination.\n3. Standard settlement: 30 days from official invoice.";

  return (
    <Document
      title={`Quotation ${data.quote_number}`}
      author={companyTradingName}
    >
      <Page size="A4" style={styles.page}>
        {/* Top teal accent border */}
        <View style={styles.topAccentBar} fixed />

        {/* Company & Quotation Header */}
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={PEXPACKS_LETTERHEAD_LOGO_BASE64} style={styles.logo} />
            <Text style={styles.companyTitle}>{companyRegName}</Text>
            {companyAddress.split("\n").map((line, idx) => (
              <Text key={idx} style={styles.companyMeta}>
                {line}
              </Text>
            ))}
            <Text style={styles.companyMeta}>
              {companyEmail} | Tel: {companyPhone}
            </Text>
          </View>

          <View style={styles.quoteTitleBlock}>
            <View style={styles.quoteBadge}>
              <Text style={styles.quoteBadgeText}>OFFICIAL QUOTATION</Text>
            </View>
            <Text style={styles.quoteNumber}>{data.quote_number}</Text>
            <Text style={styles.quoteDates}>
              Date: {formatDate(data.created_at)}
              {"\n"}
              Valid Until: {formatDate(data.valid_until)}
              {"\n"}
              Status: {data.status.toUpperCase()}
            </Text>
            {data.prepared_by ? (
              <Text style={styles.preparedByText}>
                Prepared by: {data.prepared_by}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Teal horizontal divider */}
        <View style={styles.headerDivider} />

        {/* Recipient and School Meta Card */}
        <View style={styles.metaGrid}>
          <View style={styles.metaCol}>
            <Text style={styles.metaHeading}>QUOTATION PREPARED FOR</Text>
            <Text style={styles.metaName}>{data.recipient_name}</Text>
            <Text style={styles.metaText}>{data.recipient_email}</Text>
            {data.recipient_phone ? (
              <Text style={styles.metaText}>{data.recipient_phone}</Text>
            ) : null}
          </View>

          <View style={styles.metaCol}>
            <Text style={styles.metaHeading}>SCHOOL / ORGANISATION</Text>
            <Text style={styles.metaName}>
              {data.school_name || "Custom Client"}
            </Text>
            {data.school_address ? (
              <Text style={styles.metaText}>{data.school_address}</Text>
            ) : null}
            <Text style={styles.metaText}>
              Currency: South African Rand (ZAR)
            </Text>
            {data.prepared_by ? (
              <Text
                style={[
                  styles.metaText,
                  {
                    fontFamily: "Helvetica-Bold",
                    color: "#0f172a",
                    marginTop: 2,
                  },
                ]}
              >
                Prepared by: {data.prepared_by}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.colDesc}>
              <Text style={styles.thText}>ITEM DESCRIPTION</Text>
            </View>
            <View style={styles.colSku}>
              <Text style={styles.thText}>SKU</Text>
            </View>
            <View style={styles.colQty}>
              <Text style={styles.thText}>QTY</Text>
            </View>
            <View style={styles.colUnit}>
              <Text style={styles.thText}>UNIT PRICE</Text>
            </View>
            <View style={styles.colTotal}>
              <Text style={styles.thText}>TOTAL (ZAR)</Text>
            </View>
          </View>

          {data.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.colDesc}>
                <Text style={styles.cellTextBold}>{item.item_title}</Text>
                {item.unit ? (
                  <Text style={{ fontSize: 6.8, color: "#64748b", marginTop: 1 }}>
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
                <Text style={styles.cellText}>{formatMoney(item.unit_price)}</Text>
              </View>
              <View style={styles.colTotal}>
                <Text style={styles.cellTextBold}>
                  {formatMoney(item.total_price)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsTable}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>{formatMoney(data.subtotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>VAT ({data.vat_rate}%)</Text>
              <Text style={styles.totalsValue}>
                {formatMoney(data.vat_amount)}
              </Text>
            </View>
            <View style={styles.totalsRowGrand}>
              <Text style={styles.totalsGrandLabel}>Grand Total (ZAR)</Text>
              <Text style={styles.totalsGrandValue}>
                {formatMoney(data.total_amount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Banking Settlement and Notes Cards */}
        <View style={styles.notesAndBanking}>
          <View style={styles.bankingCard}>
            <Text style={styles.sectionTitle}>
              OFFICIAL BANKING SETTLEMENT DETAILS
            </Text>
            <Text style={styles.infoText}>
              Bank: {bankName}
              {"\n"}
              Account Holder: {bankHolder}
              {"\n"}
              Account Type: {bankType}
              {"\n"}
              Account Number: {bankNumber}
              {"\n"}
              Branch Code: {bankBranch}
              {"\n"}
              Payment Reference: {data.quote_number}
            </Text>
          </View>

          <View style={styles.notesCard}>
            <Text style={styles.sectionTitle}>TERMS &amp; NOTES</Text>
            <Text style={styles.infoText}>
              {displayNotes || c.default_terms || defaultTerms}
            </Text>
          </View>
        </View>

        {/* Footer Disclaimer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Thank you for choosing {companyTradingName}. All orders subject to
            standard trading terms.
            {"\n"}
            {companyRegName} | Care Desk: {companyEmail} | pexpacks@gmail.com |{" "}
            {companyWebsite}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
