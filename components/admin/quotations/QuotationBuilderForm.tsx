"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Building2,
  User,
  Calendar,
  FileText,
  Save,
  Send,
  ArrowLeft,
  Search,
  Package,
} from "lucide-react";
import { createQuotationAction } from "@/app/admin/quotations/actions";
import type { QuotationStatus } from "@/lib/admin/quotations";
import styles from "./Quotations.module.css";
import adminStyles from "@/app/admin/admin.module.css";

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
  quantity: number;
  unit_price: number;
}

function formatMoney(amount: number): string {
  return `R ${Number(amount || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function QuotationBuilderForm({
  schools,
  masterProducts,
}: {
  schools: SchoolOption[];
  masterProducts: MasterProductOption[];
}) {
  const router = useRouter();

  // Form State
  const [isCustomClient, setIsCustomClient] = useState(false);
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
  const [notes, setNotes] = useState(
    "1. This quotation is valid for 30 calendar days from the date of issue.\n2. Pricing includes packaging, quality verification, and school delivery coordination.\n3. Standard settlement: 30 days from official invoice."
  );

  const [lineItems, setLineItems] = useState<FormLineItem[]>([
    {
      id: "item-1",
      master_product_id: null,
      item_title: "A4 Exercise Books (72 Page Feint & Margin)",
      sku: "ST-NB-A4-72",
      unit: "Pack of 10",
      quantity: 50,
      unit_price: 120,
    },
    {
      id: "item-2",
      master_product_id: null,
      item_title: "Ballpoint Pens Blue (Medium 1.0mm)",
      sku: "ST-PEN-BLU-BOX",
      unit: "Box of 50",
      quantity: 10,
      unit_price: 180,
    },
  ]);

  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Handle School Selection
  function handleSchoolChange(schoolId: string) {
    setSelectedSchoolId(schoolId);
    if (!schoolId) return;

    const school = schools.find((s) => s.id === schoolId);
    if (school) {
      setRecipientName(`${school.name} Bursar / Finance`);
      setRecipientEmail(
        `accounts@${school.name.toLowerCase().replace(/[^a-z0-9]+/g, "")}.co.za`
      );
    }
  }

  // Handle Product Autocomplete Selection for a row
  function handleProductSelect(rowId: string, productId: string) {
    const product = masterProducts.find((p) => p.id === productId);
    if (!product) return;

    setLineItems((prev) =>
      prev.map((item) =>
        item.id === rowId
          ? {
              ...item,
              master_product_id: product.id,
              item_title: product.name,
              sku: product.sku || "",
              unit: product.unit || "Each",
              unit_price: product.base_price || 0,
            }
          : item
      )
    );
  }

  // Add Item Row
  function handleAddItem() {
    setLineItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        master_product_id: null,
        item_title: "",
        sku: "",
        unit: "Each",
        quantity: 1,
        unit_price: 0,
      },
    ]);
  }

  // Remove Item Row
  function handleRemoveItem(rowId: string) {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((item) => item.id !== rowId));
  }

  // Update Item Field
  function handleUpdateItem(
    rowId: string,
    field: keyof FormLineItem,
    value: string | number
  ) {
    setLineItems((prev) =>
      prev.map((item) => (item.id === rowId ? { ...item, [field]: value } : item))
    );
  }

  // Calculations
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
    if (lineItems.some((i) => !i.item_title.trim() || i.quantity <= 0)) {
      setErrorMsg("Please ensure all line items have descriptions and quantities greater than 0.");
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
      notes: notes.trim() || null,
      items: lineItems.map((item) => ({
        master_product_id: item.master_product_id,
        item_title: item.item_title.trim(),
        sku: item.sku.trim() || null,
        unit: item.unit.trim() || "Each",
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
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
      {/* Header */}
      <div className={adminStyles.headerRow}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href="/admin/quotations"
            className={adminStyles.button}
            style={{ width: "32px", height: "32px", padding: 0 }}
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className={adminStyles.pageTitle}>New Quotation</h1>
            <p className={adminStyles.pageSubtitle}>
              Compose an official school price quotation with live line items and VAT.
            </p>
          </div>
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

      <div className={styles.builderGrid}>
        {/* Left Column: Form Details & Line Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Client & Recipient Section */}
          <div className={styles.formCard}>
            <div className={styles.formSectionTitle}>
              <Building2 size={16} color="#10b981" />
              Client &amp; Recipient Details
            </div>

            <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ fontSize: "13px", color: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="radio"
                  name="clientType"
                  checked={!isCustomClient}
                  onChange={() => setIsCustomClient(false)}
                />
                Existing School
              </label>
              <label style={{ fontSize: "13px", color: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="radio"
                  name="clientType"
                  checked={isCustomClient}
                  onChange={() => {
                    setIsCustomClient(true);
                    setSelectedSchoolId("");
                  }}
                />
                Custom / Non-Partner Client
              </label>
            </div>

            {!isCustomClient ? (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Select School</label>
                <select
                  className={styles.formInput}
                  value={selectedSchoolId}
                  onChange={(e) => handleSchoolChange(e.target.value)}
                >
                  <option value="">-- Choose a school from directory --</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.city || "Johannesburg"})
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className={styles.formRow2}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Recipient Name / Contact Person *</label>
                <input
                  type="text"
                  placeholder="e.g. Mrs. Sarah Jenkins"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Recipient Email *</label>
                <input
                  type="email"
                  placeholder="e.g. bursar@school.co.za"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className={styles.formInput}
                />
              </div>
            </div>

            <div className={styles.formRow2}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +27 11 902 4432"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Valid Until *</label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className={styles.formInput}
                />
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className={styles.formCard}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid rgba(30, 41, 59, 0.6)",
                paddingBottom: "10px",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
                <Package size={16} color="#10b981" />
                Line Items ({lineItems.length})
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className={adminStyles.button}
                style={{ height: "30px", fontSize: "11px", color: "#10b981", borderColor: "rgba(16, 185, 129, 0.3)" }}
              >
                <Plus size={13} /> Add Line Item
              </button>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.lineItemsTable}>
                <thead>
                  <tr>
                    <th style={{ width: "38%" }}>Item Description</th>
                    <th style={{ width: "16%" }}>SKU</th>
                    <th style={{ width: "14%" }}>Unit</th>
                    <th style={{ width: "10%" }}>Qty</th>
                    <th style={{ width: "14%" }}>Unit Price (R)</th>
                    <th style={{ width: "8%", textAlign: "right" }}>Total</th>
                    <th style={{ width: "5%" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => {
                    const rowTotal = item.quantity * item.unit_price;
                    return (
                      <tr key={item.id} style={{ borderBottom: "1px solid rgba(30, 41, 59, 0.4)" }}>
                        <td>
                          <input
                            type="text"
                            placeholder="Item title / Description"
                            value={item.item_title}
                            onChange={(e) =>
                              handleUpdateItem(item.id, "item_title", e.target.value)
                            }
                            className={styles.formInput}
                            style={{ height: "32px", fontSize: "12px", width: "100%" }}
                          />
                          {/* Optional master product quick pick */}
                          <select
                            onChange={(e) => {
                              if (e.target.value) handleProductSelect(item.id, e.target.value);
                            }}
                            className={styles.formInput}
                            style={{ height: "24px", fontSize: "10px", marginTop: "4px", padding: "0 6px", color: "#94a3b8" }}
                          >
                            <option value="">-- Or auto-fill from catalogue --</option>
                            {masterProducts.slice(0, 50).map((mp) => (
                              <option key={mp.id} value={mp.id}>
                                {mp.name} (R{mp.base_price})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="SKU"
                            value={item.sku}
                            onChange={(e) =>
                              handleUpdateItem(item.id, "sku", e.target.value)
                            }
                            className={styles.formInput}
                            style={{ height: "32px", fontSize: "12px", width: "100%" }}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="Unit"
                            value={item.unit}
                            onChange={(e) =>
                              handleUpdateItem(item.id, "unit", e.target.value)
                            }
                            className={styles.formInput}
                            style={{ height: "32px", fontSize: "12px", width: "100%" }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateItem(
                                item.id,
                                "quantity",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className={styles.formInput}
                            style={{ height: "32px", fontSize: "12px", width: "100%", textAlign: "center" }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unit_price}
                            onChange={(e) =>
                              handleUpdateItem(
                                item.id,
                                "unit_price",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className={styles.formInput}
                            style={{ height: "32px", fontSize: "12px", width: "100%", textAlign: "right" }}
                          />
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 600, color: "#f8fafc", fontSize: "12px" }}>
                          {formatMoney(rowTotal)}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={lineItems.length <= 1}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#ef4444",
                              cursor: lineItems.length <= 1 ? "not-allowed" : "pointer",
                              opacity: lineItems.length <= 1 ? 0.3 : 1,
                            }}
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

          {/* Notes & Terms */}
          <div className={styles.formCard}>
            <div className={styles.formSectionTitle}>
              <FileText size={16} color="#10b981" />
              Notes &amp; Settlement Terms
            </div>
            <div className={styles.formGroup}>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={styles.formTextarea}
                placeholder="Add quotation terms, payment details, or special delivery notes..."
              />
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Summary & Action Dock */}
        <div className={styles.summaryCard}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#f8fafc", borderBottom: "1px solid rgba(30, 41, 59, 0.6)", paddingBottom: "10px" }}>
            Quotation Summary
          </div>

          <div className={styles.summaryRow}>
            <span>Line Items</span>
            <span>{lineItems.length} items</span>
          </div>

          <div className={styles.summaryRow}>
            <span>Subtotal (Excl. VAT)</span>
            <span>{formatMoney(subtotal)}</span>
          </div>

          <div className={styles.summaryRow}>
            <span>VAT (15%)</span>
            <span>{formatMoney(vatAmount)}</span>
          </div>

          <div className={styles.summaryRowGrand}>
            <span>Total (ZAR)</span>
            <span className={styles.grandTotalAmount}>{formatMoney(totalAmount)}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleSubmit("sent")}
              className={adminStyles.button}
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#ffffff",
                borderColor: "rgba(16, 185, 129, 0.4)",
                fontWeight: 600,
                justifyContent: "center",
                height: "40px",
              }}
            >
              <Send size={15} /> {busy ? "Generating..." : "Save & Generate PDF"}
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => handleSubmit("draft")}
              className={adminStyles.button}
              style={{ justifyContent: "center", height: "38px" }}
            >
              <Save size={15} /> Save as Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
