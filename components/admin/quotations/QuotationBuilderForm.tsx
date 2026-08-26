"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  Send,
  Save,
  Package,
  FileText,
  Building2,
  Calendar,
} from "lucide-react";
import { createQuotationAction } from "@/app/admin/quotations/actions";
import type { QuotationStatus } from "@/lib/admin/quotations";
import styles from "./Quotations.module.css";

export interface MasterProductOption {
  id: string;
  name: string;
  sku: string | null;
  unit: string | null;
  base_price: number;
}

export interface SchoolOption {
  id: string;
  name: string;
  city: string | null;
  province: string | null;
}

interface FormLineItem {
  id: string;
  master_product_id: string | null;
  item_title: string;
  sku: string;
  unit: string;
  qtyText: string;
  quantity: number;
  unit_price: number;
}

function formatZAR(amount: number): string {
  const formatted = Number(amount || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `R ${formatted}`;
}

export function QuotationBuilderForm({
  schools,
  masterProducts,
}: {
  schools: SchoolOption[];
  masterProducts: MasterProductOption[];
}) {
  const router = useRouter();

  // Top header state
  const [preparedBy, setPreparedBy] = useState("");

  // Client Details state
  const [isCustomClient, setIsCustomClient] = useState(false);
  const [schoolSearch, setSchoolSearch] = useState("");
  const [isSchoolDropdownOpen, setIsSchoolDropdownOpen] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");

  const defaultValidUntil = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  }, []);

  const [validUntil, setValidUntil] = useState(defaultValidUntil);

  // Line items matching reference sample defaults
  const [lineItems, setLineItems] = useState<FormLineItem[]>([
    {
      id: "item-1",
      master_product_id: null,
      item_title: "",
      sku: "ST-PEN-BLU-BOX",
      unit: "Pack",
      qtyText: "Box of 40",
      quantity: 1,
      unit_price: 180.0,
    },
    {
      id: "item-2",
      master_product_id: null,
      item_title: "",
      sku: "ST-PEN-BLU-BOX",
      unit: "Unit",
      qtyText: "01",
      quantity: 1,
      unit_price: 180.0,
    },
    {
      id: "item-3",
      master_product_id: null,
      item_title: "",
      sku: "ST-PEN-BLU-BOX",
      unit: "Pack",
      qtyText: "Box of 01",
      quantity: 1,
      unit_price: 180.0,
    },
    {
      id: "item-4",
      master_product_id: null,
      item_title: "",
      sku: "ST-PEN-BLU-BOX",
      unit: "Pack",
      qtyText: "Box of 50",
      quantity: 1,
      unit_price: 140.0,
    },
  ]);

  // Search query state for item description dropdowns
  const [activeItemSearchId, setActiveItemSearchId] = useState<string | null>(null);

  // Notes state matching reference text
  const [notes, setNotes] = useState(
    `1. This quotation is valid for 30 calendar days from the date of issue.\n2. Pricing includes packaging, quality verification, and school delivery coordination.\n3. Standard settlement: 30 days from official invoice.`
  );

  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Filter schools based on search
  const filteredSchools = useMemo(() => {
    if (!schoolSearch.trim()) return schools.slice(0, 10);
    const q = schoolSearch.toLowerCase();
    return schools.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.city && s.city.toLowerCase().includes(q))
    );
  }, [schools, schoolSearch]);

  // Handle School Selection
  function handleSelectSchool(school: SchoolOption) {
    setSelectedSchoolId(school.id);
    setSchoolSearch(school.name);
    setIsSchoolDropdownOpen(false);
    setRecipientName(`${school.name} Bursar / Finance`);
    setRecipientEmail(
      `accounts@${school.name.toLowerCase().replace(/[^a-z0-9]+/g, "")}.co.za`
    );
  }

  // Handle Product Autocomplete Selection
  function handleSelectProduct(rowId: string, product: MasterProductOption) {
    setLineItems((prev) =>
      prev.map((item) =>
        item.id === rowId
          ? {
              ...item,
              master_product_id: product.id,
              item_title: product.name,
              sku: product.sku || item.sku,
              unit: product.unit || "Pack",
              unit_price: product.base_price || item.unit_price,
            }
          : item
      )
    );
    setActiveItemSearchId(null);
  }

  // Add line item
  function handleAddItem() {
    setLineItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        master_product_id: null,
        item_title: "",
        sku: "ST-PEN-BLU-BOX",
        unit: "Pack",
        qtyText: "01",
        quantity: 1,
        unit_price: 180.0,
      },
    ]);
  }

  // Remove line item
  function handleRemoveItem(rowId: string) {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((item) => item.id !== rowId));
  }

  // Update item field
  function handleUpdateItem(
    rowId: string,
    field: keyof FormLineItem,
    value: string | number
  ) {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== rowId) return item;
        if (field === "qtyText") {
          const parsed = parseInt(String(value).replace(/\D/g, ""), 10);
          return {
            ...item,
            qtyText: String(value),
            quantity: isNaN(parsed) || parsed <= 0 ? 1 : parsed,
          };
        }
        return { ...item, [field]: value };
      })
    );
  }

  // Calculate live totals
  const subtotal = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  }, [lineItems]);

  const vatRate = 15.0;
  const vatAmount = useMemo(() => {
    return (subtotal * vatRate) / 100;
  }, [subtotal, vatRate]);

  const totalAmount = useMemo(() => {
    return subtotal + vatAmount;
  }, [subtotal, vatAmount]);

  // Submit Handler
  async function handleSubmit(status: QuotationStatus) {
    if (!recipientName.trim()) {
      setErrorMsg("Please enter a recipient name.");
      return;
    }
    if (!recipientEmail.trim()) {
      setErrorMsg("Please enter a recipient email.");
      return;
    }

    setBusy(true);
    setErrorMsg("");

    const payload = {
      school_id: !isCustomClient && selectedSchoolId ? selectedSchoolId : null,
      recipient_name: recipientName.trim(),
      recipient_email: recipientEmail.trim(),
      recipient_phone: recipientPhone.trim() || null,
      valid_until: validUntil,
      notes: `${notes.trim()}${preparedBy.trim() ? `\nPrepared by: ${preparedBy.trim()}` : ""}`,
      items: lineItems.map((item) => ({
        master_product_id: item.master_product_id,
        item_title: item.item_title.trim() || `Stationery Item (${item.sku})`,
        sku: item.sku.trim() || null,
        unit: item.unit.trim() || "Pack",
        quantity: Number(item.quantity) || 1,
        unit_price: Number(item.unit_price) || 0,
      })),
    };

    const res = await createQuotationAction(payload, status);
    setBusy(false);

    if (!res.ok || !res.id) {
      setErrorMsg(res.error || "Failed to create quotation.");
      return;
    }

    router.push(`/admin/quotations/${res.id}`);
  }

  return (
    <div className={styles.container}>
      {/* 1. Top Back Button */}
      <Link href="/admin/packs" className={styles.backButton}>
        <ArrowLeft size={14} />
        Back to Packs
      </Link>

      {/* 2. Top Header Row with Prepared By */}
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>New Quotation</h1>
          <p className={styles.pageSubtitle}>
            Compose an official school price quotation with live line items and VAT.
          </p>
        </div>

        <div className={styles.preparedByArea}>
          <label className={styles.preparedByLabel}>Prepared by:</label>
          <input
            type="text"
            placeholder="Print your name"
            value={preparedBy}
            onChange={(e) => setPreparedBy(e.target.value)}
            className={styles.preparedByInput}
          />
        </div>
      </div>

      {errorMsg ? (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "8px",
            color: "#f87171",
            fontSize: "13px",
          }}
        >
          {errorMsg}
        </div>
      ) : null}

      {/* 3. Top 2-Column Grid (Client Details & Quotation Summary) */}
      <div className={styles.topGrid}>
        {/* Left Card: Client & Recipient Details */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <Building2 size={16} color="#10b981" />
              Client &amp; Recipient Details
            </h2>
          </div>

          {/* Radio Options */}
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="clientType"
                className={styles.radioInput}
                checked={!isCustomClient}
                onChange={() => setIsCustomClient(false)}
              />
              Existing School
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="clientType"
                className={styles.radioInput}
                checked={isCustomClient}
                onChange={() => {
                  setIsCustomClient(true);
                  setSelectedSchoolId("");
                }}
              />
              Custom / Non-Partner Client
            </label>
          </div>

          {/* Select School Searchable Input */}
          {!isCustomClient ? (
            <div className={styles.formGroup} style={{ position: "relative" }}>
              <label className={styles.formLabel}>Select School</label>
              <div className={styles.inputWrapper}>
                <Search size={15} className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="Search school by school name"
                  value={schoolSearch}
                  onFocus={() => setIsSchoolDropdownOpen(true)}
                  onChange={(e) => {
                    setSchoolSearch(e.target.value);
                    setIsSchoolDropdownOpen(true);
                  }}
                  className={`${styles.textInput} ${styles.textInputWithIcon}`}
                />
              </div>

              {isSchoolDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    marginTop: "4px",
                    background: "#0c1322",
                    border: "1px solid rgba(30, 41, 59, 0.9)",
                    borderRadius: "8px",
                    maxHeight: "220px",
                    overflowY: "auto",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                  }}
                >
                  {filteredSchools.length === 0 ? (
                    <div style={{ padding: "10px 14px", fontSize: "12px", color: "#94a3b8" }}>
                      No schools found matching &ldquo;{schoolSearch}&rdquo;
                    </div>
                  ) : (
                    filteredSchools.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => handleSelectSchool(s)}
                        style={{
                          padding: "8px 14px",
                          fontSize: "12.5px",
                          color: "#f8fafc",
                          cursor: "pointer",
                          borderBottom: "1px solid rgba(30, 41, 59, 0.4)",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#131d2e")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <div style={{ fontWeight: 600 }}>{s.name}</div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>
                          {s.city || "Gauteng"}, {s.province || "South Africa"}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : null}

          {/* Recipient Name & Recipient Email */}
          <div className={styles.formRow2}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Recipient Name / Contact Person *</label>
              <input
                type="text"
                placeholder="Bedfordview Primary School Bursar / Finance"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className={styles.textInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Recipient Email *</label>
              <input
                type="email"
                placeholder="e.g. bursar@school.co.za"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className={styles.textInput}
              />
            </div>
          </div>

          {/* Phone Number & Valid Until */}
          <div className={styles.formRow2}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Phone Number</label>
              <input
                type="text"
                placeholder="e.g. +27 11 902 4432"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                className={styles.textInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Valid Until *</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className={styles.textInput}
              />
            </div>
          </div>
        </div>

        {/* Right Card: Quotation Summary */}
        <div className={styles.summaryCard}>
          <div className={styles.summaryList}>
            <h2 className={styles.summaryTitle}>Quotation Summary</h2>

            <div className={styles.summaryRow}>
              <span>Line Items</span>
              <span className={styles.summaryRowValue}>{lineItems.length} Items</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Subtotal (Excl. VAT)</span>
              <span className={styles.summaryRowValue}>{formatZAR(subtotal)}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>VAT (15%)</span>
              <span className={styles.summaryRowValue}>{formatZAR(vatAmount)}</span>
            </div>

            <div className={styles.summaryRowGrand}>
              <span className={styles.grandTotalLabel}>Total (ZAR)</span>
              <span className={styles.grandTotalAmount}>{formatZAR(totalAmount)}</span>
            </div>
          </div>

          <div className={styles.summaryActions}>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleSubmit("sent")}
              className={styles.btnGenerate}
            >
              <Send size={15} />
              {busy ? "Generating..." : "Save & Generate PDF"}
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => handleSubmit("draft")}
              className={styles.btnDraft}
            >
              <Save size={15} />
              Save as Draft
            </button>
          </div>
        </div>
      </div>

      {/* 4. Middle Full-Width Card: Line Items */}
      <div className={styles.lineItemsCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <Package size={16} color="#10b981" />
            Line Items ({lineItems.length})
          </h2>

          <button
            type="button"
            onClick={handleAddItem}
            className={styles.btnAddItem}
          >
            <Plus size={13} /> Add Line Item
          </button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.lineItemsTable}>
            <thead>
              <tr>
                <th style={{ width: "36%" }}>ITEM DESCRIPTION</th>
                <th style={{ width: "16%" }}>SKU</th>
                <th style={{ width: "12%" }}>UNIT/PACK</th>
                <th style={{ width: "14%" }}>QTY</th>
                <th style={{ width: "12%", textAlign: "center" }}>UNIT PRICE (R)</th>
                <th style={{ width: "10%", textAlign: "right" }}>TOTAL</th>
                <th style={{ width: "4%" }}></th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => {
                const lineTotal = item.quantity * item.unit_price;
                const isDropdownOpen = activeItemSearchId === item.id;

                const filteredProducts = masterProducts.filter((p) =>
                  p.name.toLowerCase().includes((item.item_title || "").toLowerCase())
                );

                return (
                  <tr key={item.id} className={styles.lineItemRow}>
                    {/* Item Description Search Field */}
                    <td style={{ position: "relative" }}>
                      <div className={styles.inputWrapper}>
                        <Search size={14} className={styles.inputIcon} />
                        <input
                          type="text"
                          placeholder="Search items by item name/SKU"
                          value={item.item_title}
                          onFocus={() => setActiveItemSearchId(item.id)}
                          onChange={(e) => {
                            handleUpdateItem(item.id, "item_title", e.target.value);
                            setActiveItemSearchId(item.id);
                          }}
                          className={`${styles.tablePillInput} ${styles.textInputWithIcon}`}
                        />
                      </div>

                      {isDropdownOpen && (
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            zIndex: 30,
                            marginTop: "4px",
                            background: "#0c1322",
                            border: "1px solid rgba(30, 41, 59, 0.9)",
                            borderRadius: "8px",
                            maxHeight: "180px",
                            overflowY: "auto",
                            boxShadow: "0 8px 20px rgba(0,0,0,0.6)",
                          }}
                        >
                          {filteredProducts.slice(0, 8).map((p) => (
                            <div
                              key={p.id}
                              onClick={() => handleSelectProduct(item.id, p)}
                              style={{
                                padding: "8px 12px",
                                fontSize: "12px",
                                color: "#f8fafc",
                                cursor: "pointer",
                                borderBottom: "1px solid rgba(30, 41, 59, 0.4)",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#131d2e")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              <span>{p.name}</span>
                              <span style={{ color: "#10b981", fontWeight: 600 }}>
                                R {p.base_price.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* SKU */}
                    <td>
                      <input
                        type="text"
                        value={item.sku}
                        onChange={(e) => handleUpdateItem(item.id, "sku", e.target.value)}
                        className={`${styles.tablePillInput} ${styles.tablePillCenter} ${styles.tablePillMono}`}
                      />
                    </td>

                    {/* UNIT/PACK */}
                    <td>
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleUpdateItem(item.id, "unit", e.target.value)}
                        className={`${styles.tablePillInput} ${styles.tablePillCenter}`}
                      />
                    </td>

                    {/* QTY */}
                    <td>
                      <input
                        type="text"
                        value={item.qtyText}
                        onChange={(e) => handleUpdateItem(item.id, "qtyText", e.target.value)}
                        className={`${styles.tablePillInput} ${styles.tablePillCenter}`}
                      />
                    </td>

                    {/* UNIT PRICE (R) */}
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unit_price}
                        onChange={(e) =>
                          handleUpdateItem(item.id, "unit_price", parseFloat(e.target.value) || 0)
                        }
                        className={`${styles.tablePillInput} ${styles.tablePillCenter}`}
                      />
                    </td>

                    {/* TOTAL */}
                    <td>
                      <div
                        className={`${styles.tablePillInput} ${styles.tablePillCenter}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          color: "#f8fafc",
                        }}
                      >
                        {lineTotal.toFixed(2)}
                      </div>
                    </td>

                    {/* Delete */}
                    <td>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={lineItems.length <= 1}
                        className={styles.deleteBtn}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Bottom 2-Column Grid (Notes & Banking) */}
      <div className={styles.bottomGrid}>
        {/* Left Card: Notes & Settlement Terms */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <FileText size={16} color="#10b981" />
              Notes &amp; Settlement Terms
            </h2>
          </div>

          <div className={styles.notesContainer}>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={styles.notesTextarea}
            />
          </div>
        </div>

        {/* Right Card: Official Banking Settlement Details */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <FileText size={16} color="#10b981" />
              Official Banking Settlement Details
            </h2>
          </div>

          <div className={styles.bankingBox}>
            <p className={styles.bankingText}>Bank: FNB / RMB</p>
            <p className={styles.bankingText}>Account Holder: Pexpacks</p>
            <p className={styles.bankingText}>Account Type: Current Account</p>
            <p className={styles.bankingTextBold}>Account Number: 63215756991</p>
            <p className={styles.bankingTextBold}>Branch Code: 250655</p>
          </div>
        </div>
      </div>
    </div>
  );
}
