import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

export interface QuotationItemPdf {
  id?: string;
  item_title: string;
  sku?: string | null;
  unit?: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface QuotationPdfData {
  quote_number: string;
  created_at: string;
  valid_until: string;
  status: string;
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
}

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1e293b",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    borderBottomWidth: 1.5,
    borderBottomColor: "#10b981",
    paddingBottom: 16,
  },
  brandBlock: {
    flexDirection: "column",
  },
  brandTitle: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 8.5,
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
    lineHeight: 1.4,
  },
  quoteTitleBlock: {
    alignItems: "flex-end",
  },
  quoteBadge: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#10b981",
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  quoteBadgeText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#047857",
    letterSpacing: 0.5,
  },
  quoteNumber: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  quoteDates: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 4,
    textAlign: "right",
    lineHeight: 1.4,
  },
  metaGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#f8fafc",
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
  table: {
    marginTop: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
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
    color: "#f8fafc",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  tableRowEven: {
    backgroundColor: "#f8fafc",
  },
  colDesc: { width: "48%" },
  colSku: { width: "16%" },
  colQty: { width: "10%", textAlign: "center" },
  colUnit: { width: "12%", textAlign: "right" },
  colTotal: { width: "14%", textAlign: "right" },
  cellText: {
    fontSize: 8,
    color: "#334155",
  },
  cellTextBold: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  totalsTable: {
    width: "45%",
    backgroundColor: "#f8fafc",
    borderRadius: 6,
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
    borderTopColor: "#10b981",
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
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  totalsGrandValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#059669",
  },
  notesAndBanking: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  bankingCard: {
    width: "48%",
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  notesCard: {
    width: "48%",
    backgroundColor: "#f8fafc",
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
    marginBottom: 4,
  },
  infoText: {
    fontSize: 7.5,
    color: "#475569",
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
    textAlign: "center",
  },
  footerText: {
    fontSize: 7,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 1.3,
  },
});

function formatMoney(amount: number): string {
  return `R ${Number(amount || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function QuotationPdfDocument({ data }: { data: QuotationPdfData }) {
  return (
    <Document title={`Quotation ${data.quote_number}`} author="Pexpacks Supplies">
      <Page size="A4" style={styles.page}>
        {/* Company & Quotation Header */}
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <Text style={styles.brandTitle}>Pexpacks Supplies</Text>
            <Text style={styles.brandTagline}>School Stationery &amp; Academic Supply Partner</Text>
            <Text style={styles.companyMeta}>
              Pexpacks Supplies (Pty) Ltd{"\n"}
              Reg No: 2024/789123/07 | VAT No: 4920182741{"\n"}
              Email: care@pexpacks.co.za | Tel: +27 10 500 8422{"\n"}
              Sandton City Office Tower, 5th Floor, Sandton, 2196, South Africa
            </Text>
          </View>

          <View style={styles.quoteTitleBlock}>
            <View style={styles.quoteBadge}>
              <Text style={styles.quoteBadgeText}>OFFICIAL QUOTATION</Text>
            </View>
            <Text style={styles.quoteNumber}>{data.quote_number}</Text>
            <Text style={styles.quoteDates}>
              Date: {data.created_at}{"\n"}
              Valid Until: {data.valid_until}{"\n"}
              Status: {data.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Recipient and School Meta */}
        <View style={styles.metaGrid}>
          <View style={styles.metaCol}>
            <Text style={styles.metaHeading}>Quotation Prepared For</Text>
            <Text style={styles.metaName}>{data.recipient_name}</Text>
            <Text style={styles.metaText}>{data.recipient_email}</Text>
            {data.recipient_phone ? <Text style={styles.metaText}>{data.recipient_phone}</Text> : null}
          </View>

          <View style={styles.metaCol}>
            <Text style={styles.metaHeading}>School / Organisation</Text>
            <Text style={styles.metaName}>{data.school_name || "Custom Client"}</Text>
            {data.school_address ? <Text style={styles.metaText}>{data.school_address}</Text> : null}
            <Text style={styles.metaText}>Currency: South African Rand (ZAR)</Text>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
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
              <Text style={styles.thText}>Total (ZAR)</Text>
            </View>
          </View>

          {data.items.map((item, index) => (
            <View
              key={index}
              style={[styles.tableRow, index % 2 === 1 ? styles.tableRowEven : {}]}
            >
              <View style={styles.colDesc}>
                <Text style={styles.cellTextBold}>{item.item_title}</Text>
                {item.unit ? <Text style={{ fontSize: 6.5, color: "#64748b" }}>Unit: {item.unit}</Text> : null}
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
                <Text style={styles.cellTextBold}>{formatMoney(item.total_price)}</Text>
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
              <Text style={styles.totalsValue}>{formatMoney(data.vat_amount)}</Text>
            </View>
            <View style={styles.totalsRowGrand}>
              <Text style={styles.totalsGrandLabel}>Grand Total (ZAR)</Text>
              <Text style={styles.totalsGrandValue}>{formatMoney(data.total_amount)}</Text>
            </View>
          </View>
        </View>

        {/* Banking and Notes */}
        <View style={styles.notesAndBanking}>
          <View style={styles.bankingCard}>
            <Text style={styles.sectionTitle}>Official Banking Settlement Details</Text>
            <Text style={styles.infoText}>
              Bank: Standard Bank of South Africa{"\n"}
              Account Name: Pexpacks Supplies (Pty) Ltd{"\n"}
              Account Number: 023 948 109{"\n"}
              Branch Code: 051001 (Sandton City){"\n"}
              Payment Reference: {data.quote_number}
            </Text>
          </View>

          <View style={styles.notesCard}>
            <Text style={styles.sectionTitle}>Terms &amp; Notes</Text>
            <Text style={styles.infoText}>
              {data.notes ||
                "1. This quotation is valid for 30 calendar days from the date of issue.\n2. Pricing includes packaging, quality verification, and school delivery coordination.\n3. To accept this quotation, reply with an official stamp/signature or purchase order."}
            </Text>
          </View>
        </View>

        {/* Footer Disclaimer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for choosing Pexpacks Supplies. All orders subject to standard trading terms.{"\n"}
            Pexpacks Supplies (Pty) Ltd | Care Desk: care@pexpacks.co.za | www.pexpacks.co.za
          </Text>
        </View>
      </Page>
    </Document>
  );
}
