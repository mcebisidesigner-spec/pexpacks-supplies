import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

export interface StationeryListItem {
  name: string;
  quantity: number | string;
  description?: string;
  specification?: string;
}

export interface StationeryPdfOptions {
  schoolName: string;
  grade: string;
  items: StationeryListItem[];
  estimatedPrice?: string;
  fileName?: string;
  academicYear?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1e293b",
    backgroundColor: "#ffffff",
  },
  topAccentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#10b981",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 4,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 16,
  },
  brandCol: {
    flexDirection: "column",
  },
  brandTitle: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#059669",
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  contactCol: {
    alignItems: "flex-end",
  },
  contactText: {
    fontSize: 8,
    color: "#64748b",
    lineHeight: 1.4,
    textAlign: "right",
  },
  titleSection: {
    marginBottom: 16,
  },
  schoolTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  gradeSubtitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#059669",
    marginTop: 3,
  },
  accentUnderline: {
    width: 42,
    height: 2.5,
    backgroundColor: "#10b981",
    borderRadius: 2,
    marginTop: 6,
    marginBottom: 8,
  },
  checklistInfo: {
    fontSize: 8.5,
    color: "#64748b",
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
  colCheck: { width: "8%", alignItems: "center" },
  colQty: { width: "12%", textAlign: "center" },
  colItem: { width: "45%" },
  colDesc: { width: "35%" },
  checkboxBox: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: "#0f172a",
    borderRadius: 2,
  },
  cellText: {
    fontSize: 8.5,
    color: "#334155",
  },
  cellTextBold: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  priceBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  priceValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#059669",
  },
  instructionsCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    padding: 10,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 7.5,
    color: "#64748b",
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 7,
    color: "#94a3b8",
  },
});

export function StationeryListPdfDocument({
  options,
}: {
  options: StationeryPdfOptions;
}) {
  const year = options.academicYear || "2027";

  return (
    <Document
      title={`${options.schoolName} - ${options.grade} Stationery List`}
      author="Pexpacks Supplies"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.topAccentBar} />

        {/* Header / Letterhead */}
        <View style={styles.header}>
          <View style={styles.brandCol}>
            <Text style={styles.brandTitle}>Pexpacks Supplies</Text>
            <Text style={styles.brandSubtitle}>
              Official Academic Supplies &amp; Stationery Checklist
            </Text>
          </View>

          <View style={styles.contactCol}>
            <Text style={styles.contactText}>
              Care Desk: care@pexpacks.co.za{"\n"}
              Tel / WhatsApp: +27 10 500 8422{"\n"}
              www.pexpacks.co.za • Gauteng, South Africa
            </Text>
          </View>
        </View>

        {/* School & Grade Title Block */}
        <View style={styles.titleSection}>
          <Text style={styles.schoolTitle}>{options.schoolName.toUpperCase()}</Text>
          <Text style={styles.gradeSubtitle}>
            {options.grade} Stationery Checklist ({year})
          </Text>
          <View style={styles.accentUnderline} />
          <Text style={styles.checklistInfo}>
            Prepared according to the official school stationery list requirements.
          </Text>
        </View>

        {/* Stationery Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.colCheck}>
              <Text style={styles.thText}>Tick</Text>
            </View>
            <View style={styles.colQty}>
              <Text style={styles.thText}>Qty</Text>
            </View>
            <View style={styles.colItem}>
              <Text style={styles.thText}>Item Name</Text>
            </View>
            <View style={styles.colDesc}>
              <Text style={styles.thText}>Specification / Note</Text>
            </View>
          </View>

          {options.items.map((item, index) => {
            const qtyStr =
              typeof item.quantity === "number"
                ? `${item.quantity}x`
                : String(item.quantity);
            const desc = (item.description || item.specification || "-").trim();

            return (
              <View
                key={index}
                style={[
                  styles.tableRow,
                  index % 2 === 1 ? styles.tableRowEven : {},
                ]}
              >
                <View style={styles.colCheck}>
                  <View style={styles.checkboxBox} />
                </View>
                <View style={styles.colQty}>
                  <Text style={styles.cellTextBold}>{qtyStr}</Text>
                </View>
                <View style={styles.colItem}>
                  <Text style={styles.cellTextBold}>{item.name}</Text>
                </View>
                <View style={styles.colDesc}>
                  <Text style={styles.cellText}>{desc}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Estimated Price Bar if Available */}
        {options.estimatedPrice ? (
          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>
              Estimated Complete Pack Price ({options.grade}):
            </Text>
            <Text style={styles.priceValue}>{options.estimatedPrice}</Text>
          </View>
        ) : null}

        {/* Microcopy & Order Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>How to Order or Verify</Text>
          <Text style={styles.instructionsText}>
            1. Use the checkboxes above to tick off items in your learner&apos;s stationery bag.{"\n"}
            2. To order pre-packed, verified stationery boxes delivered directly, visit www.pexpacks.co.za.{"\n"}
            3. For custom quotes or bulk school orders, email care@pexpacks.co.za or call +27 10 500 8422.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Pexpacks Supplies (Pty) Ltd • Official Stationery Partner • www.pexpacks.co.za
          </Text>
          <Text style={styles.footerText}>
            Printed checklist for personal &amp; school reference
          </Text>
        </View>
      </Page>
    </Document>
  );
}
