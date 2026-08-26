"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
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
  Loader2,
} from "lucide-react";
import { createQuotationAction } from "@/app/admin/quotations/actions";
import { DateField } from "@/components/admin/DateField";
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
  slug?: string | null;
  city?: string | null;
  province?: string | null;
  address?: string | null;
}

export interface StationerySearchResult {
  id: string;
  sku?: string;
  title: string;
  description?: string;
  category?: string;
  unit_price: number;
}

interface FormLineItem {
  id: string;
  master_product_id: string | null;
  item_title: string;
  sku: string;
  unit: string;
  qtyText: string;
  quantity: number;
  unit_price: number | "";
  // Placeholders matching reference design
  placeholderTitle?: string;
  placeholderSku?: string;
  placeholderUnit?: string;
  placeholderQty?: string;
  placeholderUnitPrice?: string;
  placeholderTotal?: string;
}

function formatZAR(amount: number): string {
  const formatted = Number(amount || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `R ${formatted}`;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function QuotationBuilderForm({
  schools: initialSchools = [],
  masterProducts: initialMasterProducts = [],
}: {
  schools?: SchoolOption[];
  masterProducts?: MasterProductOption[];
}) {
  const router = useRouter();

  // 1. Top header state
  const [preparedBy, setPreparedBy] = useState("");

  // 2. Client Details state
  const [isCustomClient, setIsCustomClient] = useState(false);
  const [schoolSearch, setSchoolSearch] = useState("");
  const [debouncedSchoolQuery, setDebouncedSchoolQuery] = useState("");
  const [isSchoolDrawerOpen, setIsSchoolDrawerOpen] = useState(false);
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

  // Debounce school search input (150ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSchoolQuery(schoolSearch.trim());
    }, 150);
    return () => clearTimeout(handler);
  }, [schoolSearch]);

  // Query all 3,342 schools from database when query >= 3 letters
  const shouldFetchSchools = debouncedSchoolQuery.length >= 3;
  const { data: searchedSchools, isValidating: isSearchingSchools } = useSWR<SchoolOption[]>(
    shouldFetchSchools
      ? `/api/admin/schools/search?q=${encodeURIComponent(debouncedSchoolQuery)}`
      : null,
    fetcher,
    { keepPreviousData: true }
  );

  const matchingSchools = Array.isArray(searchedSchools) ? searchedSchools : [];

  // Close school dropdown when clicking outside
  const schoolSearchContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        schoolSearchContainerRef.current &&
        !schoolSearchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSchoolDrawerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelectSchool(school: SchoolOption) {
    setSelectedSchoolId(school.id);
    setSchoolSearch(school.name);
    setIsSchoolDrawerOpen(false);
    setRecipientName(`${school.name} Bursar / Finance`);
    const schoolSlug =
      school.slug ||
      school.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "")
        .slice(0, 20);
    setRecipientEmail(`accounts@${schoolSlug}.co.za`);
  }

  // 3. Line Items state - all pre-filled text in initial state are PLACEHOLDERS
  const [lineItems, setLineItems] = useState<FormLineItem[]>([
    {
      id: "item-1",
      master_product_id: null,
      item_title: "",
      sku: "",
      unit: "",
      qtyText: "",
      quantity: 1,
      unit_price: "",
      placeholderTitle: "Search items by item name/SKU",
      placeholderSku: "ST-PEN-BLU-BOX",
      placeholderUnit: "Pack",
      placeholderQty: "Box of 40",
      placeholderUnitPrice: "180.00",
      placeholderTotal: "180.00",
    },
    {
      id: "item-2",
      master_product_id: null,
      item_title: "",
      sku: "",
      unit: "",
      qtyText: "",
      quantity: 1,
      unit_price: "",
      placeholderTitle: "Search items by item name/SKU",
      placeholderSku: "ST-PEN-BLU-BOX",
      placeholderUnit: "Unit",
      placeholderQty: "01",
      placeholderUnitPrice: "180.00",
      placeholderTotal: "180.00",
    },
    {
      id: "item-3",
      master_product_id: null,
      item_title: "",
      sku: "",
      unit: "",
      qtyText: "",
      quantity: 1,
      unit_price: "",
      placeholderTitle: "Search items by item name/SKU",
      placeholderSku: "ST-PEN-BLU-BOX",
      placeholderUnit: "Pack",
      placeholderQty: "Box of 01",
      placeholderUnitPrice: "180.00",
      placeholderTotal: "180.00",
    },
    {
      id: "item-4",
      master_product_id: null,
      item_title: "",
      sku: "",
      unit: "",
      qtyText: "",
      quantity: 1,
      unit_price: "",
      placeholderTitle: "Search items by item name/SKU",
      placeholderSku: "ST-PEN-BLU-BOX",
      placeholderUnit: "Pack",
      placeholderQty: "Box of 50",
      placeholderUnitPrice: "140.00",
      placeholderTotal: "140.00",
    },
  ]);

  // Active line item row being searched
  const [activeItemRowId, setActiveItemRowId] = useState<string | null>(null);
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [debouncedItemQuery, setDebouncedItemQuery] = useState("");

  // Debounce item query (150ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedItemQuery(itemSearchQuery.trim());
    }, 150);
    return () => clearTimeout(handler);
  }, [itemSearchQuery]);

  // Query master stationery inventory when query >= 3 letters
  const shouldFetchItems = debouncedItemQuery.length >= 3;
  const { data: searchResults, isValidating: isSearchingItems } = useSWR<StationerySearchResult[]>(
    shouldFetchItems
      ? `/api/stationery/search?q=${encodeURIComponent(debouncedItemQuery)}`
      : null,
    fetcher,
    { keepPreviousData: true }
  );

  const matchingItems = Array.isArray(searchResults) ? searchResults : [];

  // Close item dropdown when clicking outside
  const lineItemsTableRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        lineItemsTableRef.current &&
        !lineItemsTableRef.current.contains(e.target as Node)
      ) {
        setActiveItemRowId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelectItem(rowId: string, item: StationerySearchResult) {
    setLineItems((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              master_product_id: item.id,
              item_title: item.title,
              sku: item.sku || "ST-ITEM-001",
              unit: "Pack",
              qtyText: row.qtyText || "01",
              quantity: row.quantity || 1,
              unit_price: item.unit_price || 0,
            }
          : row
      )
    );
    setActiveItemRowId(null);
    setItemSearchQuery("");
  }

  // Add line item row
  function handleAddItem() {
    setLineItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        master_product_id: null,
        item_title: "",
        sku: "",
        unit: "",
        qtyText: "",
        quantity: 1,
        unit_price: "",
        placeholderTitle: "Search items by item name/SKU",
        placeholderSku: "ST-PEN-BLU-BOX",
        placeholderUnit: "Pack",
        placeholderQty: "01",
        placeholderUnitPrice: "180.00",
        placeholderTotal: "180.00",
      },
    ]);
  }

  // Remove line item row
  function handleRemoveItem(rowId: string) {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((item) => item.id !== rowId));
  }

  // Update line item field
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
        if (field === "unit_price") {
          const numeric = value === "" ? "" : parseFloat(String(value));
          return {
            ...item,
            unit_price: isNaN(Number(numeric)) ? "" : numeric,
          };
        }
        return { ...item, [field]: value };
      })
    );
  }

  // 4. Calculations (only sums rows with entered/actual unit prices)
  const subtotal = useMemo(() => {
    return lineItems.reduce((sum, item) => {
      const price = typeof item.unit_price === "number" ? item.unit_price : 0;
      return sum + item.quantity * price;
    }, 0);
  }, [lineItems]);

  const vatRate = 15.0;
  const vatAmount = useMemo(() => {
    return (subtotal * vatRate) / 100;
  }, [subtotal, vatRate]);

  const totalAmount = useMemo(() => {
    return subtotal + vatAmount;
  }, [subtotal, vatAmount]);

  // 5. Notes state (matching reference text)
  const [notes, setNotes] = useState(
    `1. This quotation is valid for 30 calendar days from the date of issue.\n2. Pricing includes packaging, quality verification, and school delivery coordination.\n3. Standard settlement: 30 days from official invoice.`
  );

  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
      items: lineItems.map((item) => {
        const title = item.item_title.trim() || item.placeholderTitle || "Stationery Item";
        const sku = item.sku.trim() || item.placeholderSku || null;
        const unit = item.unit.trim() || item.placeholderUnit || "Pack";
        const price =
          typeof item.unit_price === "number"
            ? item.unit_price
            : parseFloat(item.placeholderUnitPrice || "0") || 0;

        return {
          master_product_id: item.master_product_id,
          item_title: title,
          sku,
          unit,
          quantity: Number(item.quantity) || 1,
          unit_price: price,
        };
      }),
    };

    const res = await createQuotationAction(payload, status);
    setBusy(false);

    if (!res.ok || !res.id) {
      setErrorMsg(res.error || "Failed to create quotation.");
      return;
    }

    router.push(`/admin/quotations/${res.quoteNumber || res.id}`);
  }

  return (
    <div className={styles.container}>
      {/* 1. Top Back Button */}
      <Link href="/admin/quotations" className={styles.backButton}>
        <ArrowLeft size={14} />
        Back to Quotations
      </Link>

      {/* 2. Top Header Row */}
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

          {/* Select School Searchable Input with 3-character threshold */}
          {!isCustomClient ? (
            <div className={styles.formGroup} ref={schoolSearchContainerRef}>
              <label className={styles.formLabel}>Select School</label>
              <div className={styles.inputWrapper}>
                <Search size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="Search school by school name"
                  value={schoolSearch}
                  onFocus={() => {
                    if (schoolSearch.trim().length >= 3) {
                      setIsSchoolDrawerOpen(true);
                    }
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSchoolSearch(val);
                    if (val.trim().length >= 3) {
                      setIsSchoolDrawerOpen(true);
                    } else {
                      setIsSchoolDrawerOpen(false);
                    }
                  }}
                  className={`${styles.textInput} ${styles.textInputWithIcon}`}
                />
              </div>

              {/* Matching results drawer activated ONLY when query >= 3 letters */}
              {isSchoolDrawerOpen && debouncedSchoolQuery.length >= 3 && (
                <div className={styles.searchDrawer}>
                  {isSearchingSchools ? (
                    <div className={styles.drawerSpinnerWrap}>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Searching across 3,342 schools...</span>
                    </div>
                  ) : matchingSchools.length === 0 ? (
                    <div className={styles.drawerEmpty}>
                      No schools found matching &ldquo;{debouncedSchoolQuery}&rdquo;.
                    </div>
                  ) : (
                    matchingSchools.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectSchool(s)}
                        className={styles.drawerItem}
                      >
                        <div className={styles.drawerItemInfo}>
                          <p className={styles.drawerItemTitle}>{s.name}</p>
                          <p className={styles.drawerItemDesc}>
                            {[s.address, s.city, s.province].filter(Boolean).join(" • ") ||
                              "Gauteng, South Africa"}
                          </p>
                        </div>
                        <div className={styles.drawerPriceBlock}>
                          <span className={styles.drawerTag}>Active School</span>
                        </div>
                      </button>
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
              <DateField
                name="valid_until"
                value={validUntil}
                onChange={(val) => setValidUntil(val)}
                placeholder="Select date"
                required
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
      <div className={styles.lineItemsCard} ref={lineItemsTableRef}>
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
                <th style={{ width: "36%", textAlign: "center" }}>
                  ITEM DESCRIPTION
                </th>
                <th style={{ width: "16%", textAlign: "center" }}>SKU</th>
                <th style={{ width: "12%", textAlign: "center" }}>UNIT/PACK</th>
                <th style={{ width: "14%", textAlign: "center" }}>QTY</th>
                <th style={{ width: "12%", textAlign: "center" }}>UNIT PRICE (R)</th>
                <th style={{ width: "10%", textAlign: "center" }}>TOTAL</th>
                <th style={{ width: "4%", textAlign: "center" }}></th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => {
                const hasCustomPrice = typeof item.unit_price === "number";
                const rowPrice: number = hasCustomPrice
                  ? Number(item.unit_price)
                  : parseFloat(item.placeholderUnitPrice || "0") || 0;

                const lineTotal = hasCustomPrice
                  ? (item.quantity * rowPrice).toFixed(2)
                  : item.placeholderTotal || "0.00";

                const isRowActive = activeItemRowId === item.id;
                const showItemDrawer = isRowActive && debouncedItemQuery.length >= 3;

                return (
                  <tr
                    key={item.id}
                    className={`${styles.lineItemRow} ${showItemDrawer ? styles.activeRowZIndex : ""}`}
                  >
                    {/* Item Description Search Field with 3-letter threshold & generous icon gap */}
                    <td style={{ position: "relative" }}>
                      <div className={styles.inputWrapper}>
                        <Search size={16} className={styles.inputIcon} />
                        <input
                          type="text"
                          placeholder={item.placeholderTitle || "Search items by item name/SKU"}
                          value={item.item_title}
                          onFocus={() => {
                            setActiveItemRowId(item.id);
                            setItemSearchQuery(item.item_title);
                          }}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleUpdateItem(item.id, "item_title", val);
                            setActiveItemRowId(item.id);
                            setItemSearchQuery(val);
                          }}
                          className={`${styles.tablePillInput} ${styles.textInputWithIcon}`}
                        />
                      </div>

                      {/* Matching Results Drawer matching Image 1 on /admin/packs/[slug] */}
                      {showItemDrawer && (
                        <div className={styles.searchDrawer}>
                          {isSearchingItems ? (
                            <div className={styles.drawerSpinnerWrap}>
                              <Loader2 size={16} className="animate-spin" />
                              <span>Searching inventory...</span>
                            </div>
                          ) : matchingItems.length === 0 ? (
                            <div className={styles.drawerEmpty}>
                              No matching stationery items found for &ldquo;{debouncedItemQuery}&rdquo;.
                            </div>
                          ) : (
                            matchingItems.map((prod) => {
                              const prodTitle = prod.title || "Stationery Item";
                              const prodPrice = prod.unit_price ?? 0;

                              return (
                                <button
                                  key={prod.id}
                                  type="button"
                                  onClick={() => handleSelectItem(item.id, prod)}
                                  className={styles.drawerItem}
                                >
                                  <div className={styles.drawerItemInfo}>
                                    <p className={styles.drawerItemTitle}>{prodTitle}</p>
                                    {prod.sku ? (
                                      <p className={styles.drawerItemMeta}>{prod.sku}</p>
                                    ) : null}
                                    {prod.description ? (
                                      <p className={styles.drawerItemDesc}>{prod.description}</p>
                                    ) : null}
                                  </div>

                                  <div className={styles.drawerPriceBlock}>
                                    <span className={styles.drawerPrice}>
                                      R {prodPrice.toFixed(2)}
                                    </span>
                                    <p className={styles.drawerTag}>Auto-filled</p>
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      )}
                    </td>

                    {/* SKU - placeholder when empty */}
                    <td>
                      <input
                        type="text"
                        placeholder={item.placeholderSku || "ST-PEN-BLU-BOX"}
                        value={item.sku}
                        onChange={(e) => handleUpdateItem(item.id, "sku", e.target.value)}
                        className={`${styles.tablePillInput} ${styles.tablePillCenter} ${styles.tablePillMono}`}
                      />
                    </td>

                    {/* UNIT/PACK - placeholder when empty */}
                    <td>
                      <input
                        type="text"
                        placeholder={item.placeholderUnit || "Pack"}
                        value={item.unit}
                        onChange={(e) => handleUpdateItem(item.id, "unit", e.target.value)}
                        className={`${styles.tablePillInput} ${styles.tablePillCenter}`}
                      />
                    </td>

                    {/* QTY - placeholder when empty */}
                    <td>
                      <input
                        type="text"
                        placeholder={item.placeholderQty || "Box of 40"}
                        value={item.qtyText}
                        onChange={(e) => handleUpdateItem(item.id, "qtyText", e.target.value)}
                        className={`${styles.tablePillInput} ${styles.tablePillCenter}`}
                      />
                    </td>

                    {/* UNIT PRICE (R) - placeholder when empty */}
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={item.placeholderUnitPrice || "180.00"}
                        value={item.unit_price}
                        onChange={(e) =>
                          handleUpdateItem(item.id, "unit_price", e.target.value)
                        }
                        className={`${styles.tablePillInput} ${styles.tablePillCenter}`}
                      />
                    </td>

                    {/* TOTAL - displays calculated total or placeholder */}
                    <td>
                      <div
                        className={`${styles.tablePillInput} ${styles.tablePillCenter}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          color: hasCustomPrice ? "#f8fafc" : "#64748b",
                        }}
                      >
                        {lineTotal}
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
