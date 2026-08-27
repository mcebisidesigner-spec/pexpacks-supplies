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
  Save,
  Package,
  FileText,
  Building2,
  Loader2,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Percent,
  Truck,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  createQuotationAction,
  listSchoolPacksForQuotation,
  importSchoolPackItemsAction,
} from "@/app/admin/quotations/actions";
import { DateField } from "@/components/admin/DateField";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { FloatingTextarea } from "@/components/ui/FloatingTextarea";
import { AdminButton } from "@/components/admin/ui/AdminButton";
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
}

function formatZAR(amount: number): string {
  const formatted = Number(amount || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `R ${formatted}`;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const STANDARD_NOTE_TEMPLATES = [
  {
    label: "Standard 30-Day School Terms",
    text: "1. This quotation is valid for 30 calendar days from date of issue.\n2. Pricing includes quality packaging and coordinated delivery to school premises.\n3. Settlement: Strictly 30 days from official invoice.",
  },
  {
    label: "Bulk Order Discount Terms",
    text: "1. Quotation reflects agreed institutional bulk volume pricing.\n2. Stock reserved for 14 calendar days.\n3. Free delivery included for direct school batch intake.",
  },
  {
    label: "Immediate EFT / Direct Supply",
    text: "1. Valid for 14 days from date of generation.\n2. Dispatch commences upon receipt of official proof of payment / order confirmation.",
  },
];

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

  // Financial adjustments
  const [discountAmount, setDiscountAmount] = useState<number | "">("");
  const [deliveryFee, setDeliveryFee] = useState<number | "">("");
  const [vatEnabled, setVatEnabled] = useState(true);

  // Modals state
  const [showPackImportModal, setShowPackImportModal] = useState(false);
  const [packModalSchools, setPackModalSchools] = useState<SchoolOption[]>(initialSchools);
  const [packModalSelectedSchool, setPackModalSelectedSchool] = useState<string>("");
  const [packModalPacks, setPackModalPacks] = useState<Array<{ id: string; title: string; price: number }>>([]);
  const [packModalLoadingPacks, setPackModalLoadingPacks] = useState(false);
  const [packModalImporting, setPackModalImporting] = useState(false);

  const [showCsvImportModal, setShowCsvImportModal] = useState(false);
  const [csvText, setCsvText] = useState("");

  // Debounce school search input (150ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSchoolQuery(schoolSearch.trim());
    }, 150);
    return () => clearTimeout(handler);
  }, [schoolSearch]);

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

  // 3. Line Items state
  const [lineItems, setLineItems] = useState<FormLineItem[]>([
    {
      id: "item-1",
      master_product_id: null,
      item_title: "",
      sku: "",
      unit: "Each",
      qtyText: "1",
      quantity: 1,
      unit_price: "",
    },
  ]);

  // Active line item row being searched
  const [activeItemRowId, setActiveItemRowId] = useState<string | null>(null);
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [debouncedItemQuery, setDebouncedItemQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedItemQuery(itemSearchQuery.trim());
    }, 150);
    return () => clearTimeout(handler);
  }, [itemSearchQuery]);

  const shouldFetchItems = debouncedItemQuery.length >= 2;
  const { data: searchResults, isValidating: isSearchingItems } = useSWR<StationerySearchResult[]>(
    shouldFetchItems
      ? `/api/stationery/search?q=${encodeURIComponent(debouncedItemQuery)}`
      : null,
    fetcher,
    { keepPreviousData: true }
  );

  const matchingItems = Array.isArray(searchResults) ? searchResults : [];

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
              unit: "Each",
              qtyText: row.qtyText || "1",
              quantity: row.quantity || 1,
              unit_price: Number(item.unit_price || 0),
            }
          : row
      )
    );
    setActiveItemRowId(null);
    setItemSearchQuery("");
  }

  function handleAddItem() {
    setLineItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        master_product_id: null,
        item_title: "",
        sku: "",
        unit: "Each",
        qtyText: "1",
        quantity: 1,
        unit_price: "",
      },
    ]);
  }

  function handleRemoveItem(rowId: string) {
    if (lineItems.length <= 1) {
      setLineItems([
        {
          id: `item-${Date.now()}`,
          master_product_id: null,
          item_title: "",
          sku: "",
          unit: "Each",
          qtyText: "1",
          quantity: 1,
          unit_price: "",
        },
      ]);
      return;
    }
    setLineItems((prev) => prev.filter((item) => item.id !== rowId));
  }

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

  // 4. Import from Pack Logic
  async function handleSchoolSelectForPack(schoolId: string) {
    setPackModalSelectedSchool(schoolId);
    setPackModalLoadingPacks(true);
    const packs = await listSchoolPacksForQuotation(schoolId);
    setPackModalPacks(packs);
    setPackModalLoadingPacks(false);
  }

  async function handleImportPackItems(packId: string) {
    setPackModalImporting(true);
    const res = await importSchoolPackItemsAction(packId);
    setPackModalImporting(false);

    if (res.ok && res.items && res.items.length > 0) {
      const newItems: FormLineItem[] = res.items.map((it, idx) => ({
        id: `pack-item-${Date.now()}-${idx}`,
        master_product_id: it.master_product_id,
        item_title: it.item_title,
        sku: it.sku || "",
        unit: it.unit || "Each",
        qtyText: String(it.quantity),
        quantity: it.quantity,
        unit_price: it.unit_price,
      }));

      // Replace empty lines or append
      setLineItems((prev) => {
        const existingValid = prev.filter((it) => it.item_title.trim().length > 0);
        return [...existingValid, ...newItems];
      });

      setShowPackImportModal(false);
    }
  }

  // 5. Import from CSV Logic
  function handleImportCsv() {
    if (!csvText.trim()) return;
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const imported: FormLineItem[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip header row if present
      if (i === 0 && line.toLowerCase().includes("item") && line.toLowerCase().includes("price")) {
        continue;
      }
      const parts = line.split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
      if (parts.length >= 1 && parts[0]) {
        const title = parts[0];
        const qty = parseInt(parts[1], 10) || 1;
        const price = parseFloat(parts[2]) || 0;
        const sku = parts[3] || "";

        imported.push({
          id: `csv-${Date.now()}-${i}`,
          master_product_id: null,
          item_title: title,
          sku,
          unit: "Each",
          qtyText: String(qty),
          quantity: qty,
          unit_price: price,
        });
      }
    }

    if (imported.length > 0) {
      setLineItems((prev) => {
        const existingValid = prev.filter((it) => it.item_title.trim().length > 0);
        return [...existingValid, ...imported];
      });
      setCsvText("");
      setShowCsvImportModal(false);
    }
  }

  // 6. Calculations
  const rawSubtotal = useMemo(() => {
    return lineItems.reduce((sum, item) => {
      const price = typeof item.unit_price === "number" ? item.unit_price : 0;
      return sum + (item.quantity || 1) * price;
    }, 0);
  }, [lineItems]);

  const disc = typeof discountAmount === "number" ? discountAmount : 0;
  const delivery = typeof deliveryFee === "number" ? deliveryFee : 0;
  const subtotal = Math.max(0, rawSubtotal - disc);

  const vatRate = vatEnabled ? 15.0 : 0;
  const vatAmount = useMemo(() => {
    return (subtotal * vatRate) / 100;
  }, [subtotal, vatRate]);

  const totalAmount = useMemo(() => {
    return subtotal + vatAmount + delivery;
  }, [subtotal, vatAmount, delivery]);

  // 7. Notes state
  const [notes, setNotes] = useState(STANDARD_NOTE_TEMPLATES[0].text);
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

    // Filter out real items only
    const validItems = lineItems.filter((item) => item.item_title.trim().length > 0);
    if (validItems.length === 0) {
      setErrorMsg("Please add at least one line item with a title.");
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
      discount_amount: disc,
      delivery_fee: delivery,
      vat_enabled: vatEnabled,
      items: validItems.map((item) => ({
        master_product_id: item.master_product_id,
        item_title: item.item_title.trim(),
        sku: item.sku.trim() || null,
        unit: item.unit.trim() || "Each",
        quantity: Number(item.quantity) || 1,
        unit_price: typeof item.unit_price === "number" ? item.unit_price : 0,
      })),
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
            Compose an official school price quotation with live line items and automated calculation.
          </p>
        </div>

        <div className={styles.preparedByArea}>
          <FloatingInput
            label="Prepared by"
            value={preparedBy}
            onChange={(e) => setPreparedBy(e.target.value)}
          />
        </div>
      </div>

      {errorMsg ? (
        <div className={styles.errorBanner}>
          <span>{errorMsg}</span>
        </div>
      ) : null}

      <div className={styles.mainLayout}>
        {/* LEFT COLUMN: Main Form */}
        <div className={styles.leftColumn}>
          {/* Card A: Client Details */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <Building2 size={16} className={styles.cardIcon} />
                Client Details
              </div>
              <div className={styles.clientTypeToggle}>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomClient(false);
                    setSelectedSchoolId("");
                    setSchoolSearch("");
                  }}
                  className={`${styles.clientTypeBtn} ${
                    !isCustomClient ? styles.clientTypeBtnActive : ""
                  }`}
                >
                  School
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomClient(true);
                    setSelectedSchoolId("");
                    setSchoolSearch("");
                  }}
                  className={`${styles.clientTypeBtn} ${
                    isCustomClient ? styles.clientTypeBtnActive : ""
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            <div className={styles.cardBody}>
              {!isCustomClient && (
                <div
                  className={styles.schoolSearchWrapper}
                  ref={schoolSearchContainerRef}
                >
                  <FloatingInput
                    label="Search Registered Schools (3,342 in DB)..."
                    value={schoolSearch}
                    onChange={(e) => {
                      setSchoolSearch(e.target.value);
                      setIsSchoolDrawerOpen(true);
                    }}
                    onFocus={() => setIsSchoolDrawerOpen(true)}
                  />

                  {isSchoolDrawerOpen && (
                    <div className={styles.schoolDropdown}>
                      {isSearchingSchools ? (
                        <div className={styles.schoolDropdownLoading}>
                          <Loader2 size={16} className={styles.spinIcon} />
                          Searching database...
                        </div>
                      ) : matchingSchools.length > 0 ? (
                        matchingSchools.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            className={styles.schoolOptionBtn}
                            onClick={() => handleSelectSchool(s)}
                          >
                            <div className={styles.schoolOptionName}>{s.name}</div>
                            <div className={styles.schoolOptionMeta}>
                              {s.city || "Johannesburg"}, {s.province || "Gauteng"}
                            </div>
                          </button>
                        ))
                      ) : debouncedSchoolQuery.length >= 3 ? (
                        <div className={styles.schoolDropdownEmpty}>
                          No schools found for &ldquo;{debouncedSchoolQuery}&rdquo;
                        </div>
                      ) : (
                        <div className={styles.schoolDropdownEmpty}>
                          Type at least 3 letters to search schools
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className={styles.grid2}>
                <FloatingInput
                  label="Recipient / Attn *"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
                <FloatingInput
                  label="Recipient Email *"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
              </div>

              <div className={styles.grid2}>
                <FloatingInput
                  label="Recipient Phone"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                />
                <div>
                  <label className={styles.inputLabel}>Valid Until</label>
                  <DateField
                    value={validUntil}
                    onChange={(val) => setValidUntil(val)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card B: Line Items Table */}
          <div className={styles.card} ref={lineItemsTableRef}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <Package size={16} className={styles.cardIcon} />
                Quotation Line Items
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <AdminButton
                  variant="secondary"
                  size="sm"
                  icon={<Layers size={13} />}
                  onClick={() => {
                    if (selectedSchoolId) {
                      handleSchoolSelectForPack(selectedSchoolId);
                    }
                    setShowPackImportModal(true);
                  }}
                >
                  Import Pack
                </AdminButton>
                <AdminButton
                  variant="secondary"
                  size="sm"
                  icon={<FileSpreadsheet size={13} />}
                  onClick={() => setShowCsvImportModal(true)}
                >
                  Import CSV
                </AdminButton>
                <AdminButton
                  variant="outline"
                  size="sm"
                  icon={<Plus size={13} />}
                  onClick={handleAddItem}
                >
                  Add Item
                </AdminButton>
              </div>
            </div>

            <div className={styles.cardBody} style={{ padding: "0" }}>
              <div className={styles.tableScroll}>
                <table className={styles.itemsTable}>
                  <thead>
                    <tr>
                      <th style={{ width: "38%" }}>ITEM DESCRIPTION</th>
                      <th style={{ width: "16%" }}>SKU</th>
                      <th style={{ width: "12%" }}>UNIT</th>
                      <th style={{ width: "10%" }}>QTY</th>
                      <th style={{ width: "12%" }}>PRICE (ZAR)</th>
                      <th style={{ width: "12%" }}>TOTAL</th>
                      <th style={{ width: "40px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item) => {
                      const lineTotal =
                        typeof item.unit_price === "number"
                          ? (item.quantity || 1) * item.unit_price
                          : 0;

                      return (
                        <tr key={item.id}>
                          <td style={{ position: "relative" }}>
                            <input
                              type="text"
                              className={styles.tableInput}
                              placeholder="Search item or enter description..."
                              value={item.item_title}
                              onChange={(e) => {
                                handleUpdateItem(item.id, "item_title", e.target.value);
                                setItemSearchQuery(e.target.value);
                                setActiveItemRowId(item.id);
                              }}
                              onFocus={() => {
                                setItemSearchQuery(item.item_title);
                                setActiveItemRowId(item.id);
                              }}
                            />

                            {/* Autocomplete Dropdown */}
                            {activeItemRowId === item.id && shouldFetchItems && (
                              <div className={styles.itemAutocomplete}>
                                {isSearchingItems ? (
                                  <div className={styles.itemAutocompleteLoading}>
                                    <Loader2 size={14} className={styles.spinIcon} />
                                    Searching catalog...
                                  </div>
                                ) : matchingItems.length > 0 ? (
                                  matchingItems.map((res) => (
                                    <button
                                      key={res.id}
                                      type="button"
                                      className={styles.itemAutocompleteOption}
                                      onClick={() => handleSelectItem(item.id, res)}
                                    >
                                      <div className={styles.itemOptionTitle}>
                                        {res.title}
                                      </div>
                                      <div className={styles.itemOptionMeta}>
                                        <span>{res.sku || "NO-SKU"}</span>
                                        <span className={styles.itemOptionPrice}>
                                          {formatZAR(res.unit_price)}
                                        </span>
                                      </div>
                                    </button>
                                  ))
                                ) : (
                                  <div className={styles.itemAutocompleteEmpty}>
                                    No stationery matches found
                                  </div>
                                )}
                              </div>
                            )}
                          </td>

                          <td>
                            <input
                              type="text"
                              className={styles.tableInput}
                              placeholder="SKU-CODE"
                              value={item.sku}
                              onChange={(e) =>
                                handleUpdateItem(item.id, "sku", e.target.value)
                              }
                            />
                          </td>

                          <td>
                            <input
                              type="text"
                              className={styles.tableInput}
                              placeholder="Each"
                              value={item.unit}
                              onChange={(e) =>
                                handleUpdateItem(item.id, "unit", e.target.value)
                              }
                            />
                          </td>

                          <td>
                            <input
                              type="text"
                              className={styles.tableInput}
                              placeholder="1"
                              value={item.qtyText}
                              onChange={(e) =>
                                handleUpdateItem(item.id, "qtyText", e.target.value)
                              }
                            />
                          </td>

                          <td>
                            <input
                              type="number"
                              step="0.01"
                              className={styles.tableInput}
                              placeholder="0.00"
                              value={item.unit_price}
                              onChange={(e) =>
                                handleUpdateItem(item.id, "unit_price", e.target.value)
                              }
                            />
                          </td>

                          <td className={styles.totalCell}>
                            {formatZAR(lineTotal)}
                          </td>

                          <td className={styles.actionCell}>
                            <button
                              type="button"
                              className={styles.deleteRowBtn}
                              onClick={() => handleRemoveItem(item.id)}
                              title="Delete Row"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Card C: Notes & Terms */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <FileText size={16} className={styles.cardIcon} />
                Quotation Notes &amp; Settlement Terms
              </div>
            </div>

            <div className={styles.cardBody}>
              {/* Quick Template Chips */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                {STANDARD_NOTE_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNotes(tmpl.text)}
                    className={styles.templateChip}
                  >
                    <Sparkles size={11} />
                    {tmpl.label}
                  </button>
                ))}
              </div>

              <FloatingTextarea
                label="Quotation Terms and Settlement Notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Price Summary Sidebar */}
        <div className={styles.rightColumn}>
          <div className={styles.sidebarSticky}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>Price Summary</div>

              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Gross Subtotal</span>
                <span className={styles.summaryValue}>{formatZAR(rawSubtotal)}</span>
              </div>

              {/* Discount Row */}
              <div className={styles.summaryAdjustmentRow}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Percent size={13} className={styles.textMuted} />
                  <span className={styles.summaryLabel}>Discount (ZAR)</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={discountAmount}
                  onChange={(e) =>
                    setDiscountAmount(
                      e.target.value === "" ? "" : Math.max(0, parseFloat(e.target.value) || 0)
                    )
                  }
                  className={styles.summaryAdjInput}
                />
              </div>

              {/* Delivery Fee Row */}
              <div className={styles.summaryAdjustmentRow}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Truck size={13} className={styles.textMuted} />
                  <span className={styles.summaryLabel}>Delivery Fee</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={deliveryFee}
                  onChange={(e) =>
                    setDeliveryFee(
                      e.target.value === "" ? "" : Math.max(0, parseFloat(e.target.value) || 0)
                    )
                  }
                  className={styles.summaryAdjInput}
                />
              </div>

              {/* VAT Toggle */}
              <div className={styles.summaryVatToggleRow}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={vatEnabled}
                    onChange={(e) => setVatEnabled(e.target.checked)}
                  />
                  <span>Apply Standard 15% VAT</span>
                </label>
                <span className={styles.summaryValue}>{formatZAR(vatAmount)}</span>
              </div>

              <div className={styles.summaryDivider} />

              <div className={styles.summaryTotalRow}>
                <span className={styles.summaryTotalLabel}>Total Amount</span>
                <span className={styles.summaryTotalValue}>
                  {formatZAR(totalAmount)}
                </span>
              </div>

              <div className={styles.summaryActions}>
                <AdminButton
                  variant="primary"
                  icon={busy ? <Loader2 size={14} className={styles.spinIcon} /> : <CheckCircle2 size={14} />}
                  onClick={() => handleSubmit("sent")}
                  disabled={busy}
                >
                  Create &amp; Issue Quotation
                </AdminButton>

                <AdminButton
                  variant="secondary"
                  icon={busy ? <Loader2 size={14} className={styles.spinIcon} /> : <Save size={14} />}
                  onClick={() => handleSubmit("draft")}
                  disabled={busy}
                >
                  Save as Draft
                </AdminButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Import from School Pack */}
      {showPackImportModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <Layers size={18} />
                Import Line Items from School Pack
              </div>
              <button
                type="button"
                onClick={() => setShowPackImportModal(false)}
                className={styles.modalCloseBtn}
              >
                <X size={16} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalSubtitle}>
                Select a registered school and pick a grade pack to import all pack stationery items into this quote.
              </p>

              <div style={{ marginBottom: "16px" }}>
                <label className={styles.inputLabel}>Select School</label>
                <select
                  className={styles.modalSelect}
                  value={packModalSelectedSchool}
                  onChange={(e) => handleSchoolSelectForPack(e.target.value)}
                >
                  <option value="">-- Choose School --</option>
                  {packModalSchools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.city || "Gauteng"})
                    </option>
                  ))}
                </select>
              </div>

              {packModalLoadingPacks ? (
                <div className={styles.modalLoading}>
                  <Loader2 size={16} className={styles.spinIcon} />
                  Loading school packs...
                </div>
              ) : packModalPacks.length > 0 ? (
                <div className={styles.packList}>
                  {packModalPacks.map((p) => (
                    <div key={p.id} className={styles.packListItem}>
                      <div>
                        <div className={styles.packItemTitle}>{p.title}</div>
                        <div className={styles.packItemPrice}>{formatZAR(p.price)}</div>
                      </div>
                      <AdminButton
                        size="sm"
                        variant="primary"
                        disabled={packModalImporting}
                        onClick={() => handleImportPackItems(p.id)}
                      >
                        {packModalImporting ? "Importing..." : "Import Items"}
                      </AdminButton>
                    </div>
                  ))}
                </div>
              ) : packModalSelectedSchool ? (
                <div className={styles.modalEmpty}>No packs registered for this school yet.</div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Import from CSV */}
      {showCsvImportModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <FileSpreadsheet size={18} />
                Import Line Items from CSV / Table
              </div>
              <button
                type="button"
                onClick={() => setShowCsvImportModal(false)}
                className={styles.modalCloseBtn}
              >
                <X size={16} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalSubtitle}>
                Paste comma-separated rows in format: <code>Item Title, Quantity, Price, SKU</code>
              </p>

              <textarea
                className={styles.csvTextarea}
                rows={8}
                placeholder={`A4 72-Page Exercise Book, 50, 12.50, ST-EX-001\nStaedtler Noris HB Pencil (Box 12), 10, 48.00, ST-HB-12\nPritt Glue Stick 43g, 30, 29.50, ST-GL-43`}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
              />

              <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <AdminButton variant="secondary" onClick={() => setShowCsvImportModal(false)}>
                  Cancel
                </AdminButton>
                <AdminButton variant="primary" onClick={handleImportCsv} disabled={!csvText.trim()}>
                  Import Lines
                </AdminButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
