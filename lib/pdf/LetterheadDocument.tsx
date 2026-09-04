import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 45,
    paddingBottom: 60,
    paddingHorizontal: 45,
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: "#1e293b",
    lineHeight: 1.5,
  },
  headerBand: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: "#10b981",
    paddingBottom: 12,
    marginBottom: 20,
  },
  companyName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    letterSpacing: 0.5,
  },
  companySubtext: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 2,
  },
  metaRight: {
    alignItems: "flex-end",
  },
  refNumber: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  dateText: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 2,
  },
  recipientBox: {
    marginBottom: 16,
  },
  recipientLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#94a3b8",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  recipientOrg: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  recipientDetails: {
    fontSize: 9,
    color: "#334155",
  },
  subjectBar: {
    backgroundColor: "#f8fafc",
    borderLeftWidth: 3,
    borderLeftColor: "#10b981",
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  subjectTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    textTransform: "uppercase",
  },
  paragraph: {
    marginBottom: 10,
    textAlign: "justify",
  },
  tableContainer: {
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    padding: 6,
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
    padding: 6,
    fontSize: 8.5,
  },
  colDesc: { width: "55%" },
  colQty: { width: "15%", textAlign: "center" },
  colPrice: { width: "15%", textAlign: "right" },
  colTotal: { width: "15%", textAlign: "right" },
  signoffBlock: {
    marginTop: 20,
  },
  signoffName: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginTop: 20,
  },
  signoffTitle: {
    fontSize: 8.5,
    color: "#64748b",
  },
  signoffCompany: {
    fontSize: 7.5,
    color: "#10b981",
    marginTop: 2,
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 45,
    right: 45,
    borderTopWidth: 0.5,
    borderTopColor: "#cbd5e1",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: "#94a3b8",
  },
});

export interface LetterheadProps {
  referenceNumber: string;
  date: string;
  recipientOrg: string;
  recipientTitle?: string;
  recipientName: string;
  recipientAddress?: string;
  recipientCountry?: string;
  subject: string;
  body: string;
  signatoryName: string;
  signatoryTitle: string;
  quotation?: {
    currency: string;
    items: { description: string; quantity: number; unitPrice: number }[];
    totalAmount: number;
  };
}

export function LetterheadDocument(props: LetterheadProps) {
  const paragraphs = props.body.split(/\n\s*\n/).filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Running Header */}
        <View fixed style={styles.headerBand}>
          <View>
            <Text style={styles.companyName}>PEXPACKS SUPPLIES (PTY) LTD</Text>
            <Text style={styles.companySubtext}>Institutional Stationery & Commercial Supply</Text>
          </View>
          <View style={styles.metaRight}>
            <Text style={styles.refNumber}>{props.referenceNumber}</Text>
            <Text style={styles.dateText}>{props.date}</Text>
          </View>
        </View>

        {/* Recipient Block */}
        <View style={styles.recipientBox}>
          <Text style={styles.recipientLabel}>Delivered To:</Text>
          <Text style={styles.recipientOrg}>{props.recipientOrg}</Text>
          {props.recipientTitle && <Text style={styles.recipientDetails}>{props.recipientTitle}</Text>}
          <Text style={styles.recipientDetails}>Attn: {props.recipientName}</Text>
          {props.recipientAddress && <Text style={styles.recipientDetails}>{props.recipientAddress}</Text>}
          {props.recipientCountry && <Text style={styles.recipientDetails}>{props.recipientCountry}</Text>}
        </View>

        {/* Subject Header */}
        <View style={styles.subjectBar}>
          <Text style={styles.subjectTitle}>RE: {props.subject}</Text>
        </View>

        {/* Multi-Page Body Content */}
        {paragraphs.map((para, i) => (
          <Text key={i} style={styles.paragraph} wrap>
            {para}
          </Text>
        ))}

        {/* Optional Embedded Quotation Table */}
        {props.quotation && props.quotation.items.length > 0 && (
          <View style={styles.tableContainer} wrap={false}>
            <View style={styles.tableHeader}>
              <Text style={styles.colDesc}>Item Description</Text>
              <Text style={styles.colQty}>Qty</Text>
              <Text style={styles.colPrice}>Unit Price</Text>
              <Text style={styles.colTotal}>Total ({props.quotation.currency})</Text>
            </View>
            {props.quotation.items.map((row, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.colDesc}>{row.description}</Text>
                <Text style={styles.colQty}>{row.quantity}</Text>
                <Text style={styles.colPrice}>{row.unitPrice.toFixed(2)}</Text>
                <Text style={styles.colTotal}>{(row.quantity * row.unitPrice).toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Signatory Block */}
        <View style={styles.signoffBlock} wrap={false}>
          <Text>Yours sincerely,</Text>
          <Text style={styles.signoffName}>{props.signatoryName}</Text>
          <Text style={styles.signoffTitle}>{props.signatoryTitle}</Text>
          <Text style={styles.signoffCompany}>Pexpacks Commercial Administration</Text>
        </View>

        {/* Running Footer with Page Numbers */}
        <View fixed style={styles.footer}>
          <Text>Pexpacks Supplies (Pty) Ltd • Reg: 2026/000000/07 • support@pexpacks.co.za</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
