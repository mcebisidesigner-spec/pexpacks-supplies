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
    paddingTop: 28,
    paddingBottom: 40,
    paddingHorizontal: 36,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1e293b",
    backgroundColor: "#ffffff",
    lineHeight: 1.4,
  },
  topAccentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#0d9488",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 6,
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  brandCol: {
    flexDirection: "column",
    justifyContent: "center",
  },
  logo: {
    width: 130,
    height: 50.6,
  },
  contactCol: {
    alignItems: "flex-end",
  },
  badge: {
    borderWidth: 1.5,
    borderColor: "#0d9488",
    borderRadius: 4,
    paddingVertical: 3.5,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#0d9488",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  contactText: {
    fontSize: 7.5,
    color: "#334155",
    lineHeight: 1.4,
    textAlign: "right",
  },
  titleSection: {
    marginBottom: 14,
  },
  schoolTitle: {
    fontSize: 14.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  gradeSubtitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0d9488",
    marginBottom: 5,
  },
  accentUnderline: {
    width: 32,
    height: 2.5,
    backgroundColor: "#0d9488",
    borderRadius: 1.5,
    marginBottom: 7,
  },
  checklistInfo: {
    fontSize: 8,
    color: "#64748b",
  },
  table: {
    marginTop: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    paddingVertical: 6.5,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  thText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 6.5,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  tableRowEven: {
    backgroundColor: "#f8fafc",
  },
  colCheck: { width: "8%", alignItems: "center" },
  colQty: { width: "10%", alignItems: "center" },
  colItem: { width: "44%" },
  colDesc: { width: "38%" },
  checkboxBox: {
    width: 9.5,
    height: 9.5,
    borderWidth: 1,
    borderColor: "#0f172a",
    borderRadius: 1.5,
  },
  qtyText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    textAlign: "center",
  },
  itemText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  descText: {
    fontSize: 7.5,
    fontFamily: "Helvetica",
    color: "#334155",
  },
  priceBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0fdfa",
    borderWidth: 1,
    borderColor: "#99f6e4",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  priceValue: {
    fontSize: 13.5,
    fontFamily: "Helvetica-Bold",
    color: "#0d9488",
  },
  instructionsCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  instructionsTitle: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  instructionsText: {
    fontSize: 7,
    color: "#64748b",
    lineHeight: 1.45,
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
    fontSize: 6.5,
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
            <Image
              src={PEXPACKS_LETTERHEAD_LOGO_BASE64}
              style={styles.logo}
            />
          </View>

          <View style={styles.contactCol}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>OFFICIAL CHECKLIST</Text>
            </View>
            <Text style={styles.contactText}>
              Care Desk: care@pexpacks.co.za | pexpacks@gmail.com{"\n"}
              Tel / WhatsApp: +27 78 003 6048{"\n"}
              www.pexpacks.co.za • Gauteng, South Africa
            </Text>
          </View>
        </View>

        {/* School & Grade Title Block */}
        <View style={styles.titleSection}>
          <Text style={styles.schoolTitle}>
            {options.schoolName.toUpperCase()}
          </Text>
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
              <Text style={styles.thText}>TICK</Text>
            </View>
            <View style={styles.colQty}>
              <Text style={styles.thText}>QTY</Text>
            </View>
            <View style={styles.colItem}>
              <Text style={styles.thText}>ITEM NAME</Text>
            </View>
            <View style={styles.colDesc}>
              <Text style={styles.thText}>SPECIFICATION / NOTE</Text>
            </View>
          </View>

          {options.items.map((item, index) => {
            const qtyStr =
              typeof item.quantity === "number"
                ? `${item.quantity}x`
                : String(item.quantity).endsWith("x")
                  ? item.quantity
                  : `${item.quantity}x`;
            const desc = (
              item.specification ||
              item.description ||
              "-"
            ).trim();

            return (
              <View
                key={index}
                style={[
                  styles.tableRow,
                  index % 2 === 1 ? styles.tableRowEven : {},
                  index === options.items.length - 1 ? { borderBottomWidth: 0 } : {},
                ]}
              >
                <View style={styles.colCheck}>
                  <View style={styles.checkboxBox} />
                </View>
                <View style={styles.colQty}>
                  <Text style={styles.qtyText}>{qtyStr}</Text>
                </View>
                <View style={styles.colItem}>
                  <Text style={styles.itemText}>{item.name}</Text>
                </View>
                <View style={styles.colDesc}>
                  <Text style={styles.descText}>{desc}</Text>
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
          <Text style={styles.instructionsTitle}>HOW TO ORDER OR VERIFY</Text>
          <Text style={styles.instructionsText}>
            1. Use the checkboxes above to tick off items in your learner&apos;s stationery bag.{"\n"}
            2. To order pre-packed, verified stationery boxes delivered directly, visit www.pexpacks.co.za.{"\n"}
            3. For custom quotes or bulk school orders, email helpme@pexpacks.co.za / pexpacks@gmail.com or call +27 10 500 8422.
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
