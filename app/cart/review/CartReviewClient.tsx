"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  trackCartReviewOpened,
  trackCartReviewItemEdited,
  trackProceedToCheckout,
} from "@/lib/analytics";
import { usePackTrayStore, type TrayPackItem, type TrayPackLineItem } from "@/store/usePackTrayStore";
import { calculatePexcoverTotal } from "@/lib/pricing/pexcover";
import styles from "./CartReview.module.css";

interface MatchedItem {
  id: string;
  productId: string | null;
  sku: string | null;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  requiresPexcover: boolean;
  pexcoCode: string | null;
  similarity: number;
  rawText?: string;
  specifications?: string;
  isCustomOrEstimated?: boolean;
  needsReview?: boolean;
}

interface DraftCart {
  id: string;
  status: string;
  items: MatchedItem[];
  item_count: number;
  subtotal: number;
  wants_pexcover: boolean;
  document_name: string;
  document_type: string;
  metadata?: {
    learnerName?: string;
    grade?: string;
    extractedCount?: number;
    matchedCatalogCount?: number;
    hasEstimatedItems?: boolean;
    unmatchedCount?: number;
  };
}

export function CartReviewClient({ draftId }: { draftId: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftCart | null>(null);
  const [items, setItems] = useState<MatchedItem[]>([]);
  const [wantsPexcover, setWantsPexcover] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!draftId) {
      setError("No draft ID provided.");
      setIsLoading(false);
      return;
    }

    async function loadDraft() {
      try {
        const res = await fetch(`/api/draft-cart?draft_id=${encodeURIComponent(draftId)}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Draft cart not found.");
        }

        setDraft(data.draft);
        setItems(data.draft.items || []);
        setWantsPexcover(Boolean(data.draft.wants_pexcover));

        const loadedItems: MatchedItem[] = data.draft.items || [];
        trackCartReviewOpened({
          draftId,
          itemCount: data.draft.item_count ?? loadedItems.length,
          estimatedCount: loadedItems.filter((it) => !it.productId).length,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load cart review.";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    }

    loadDraft();
  }, [draftId]);

  const itemsSubtotal = useMemo(() => {
    return (
      Math.round(
        items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) * 100
      ) / 100
    );
  }, [items]);

  const pexcoverCalc = useMemo(() => {
    const coverInputs = items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      requires_pexcover: i.requiresPexcover,
      pexco_code: i.pexcoCode || "PEXCO01",
      pexco_rate_cents: 800, // R8.00 per book standard rate
    }));

    return calculatePexcoverTotal(coverInputs);
  }, [items]);

  const grandTotal = useMemo(() => {
    const coveringCost = wantsPexcover ? pexcoverCalc.pexcoverTotalRands : 0;
    return Math.round((itemsSubtotal + coveringCost) * 100) / 100;
  }, [itemsSubtotal, wantsPexcover, pexcoverCalc]);

  const hasEstimatedItems = useMemo(() => {
    return items.some((it) => it.isCustomOrEstimated || !it.productId);
  }, [items]);

  const handleUpdateQty = (itemId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((it) => {
          if (it.id !== itemId) return it;
          const nextQty = Math.max(1, it.quantity + delta);
          return {
            ...it,
            quantity: nextQty,
            lineTotal: Math.round(it.unitPrice * nextQty * 100) / 100,
          };
        })
        .filter((it) => it.quantity > 0)
    );
    trackCartReviewItemEdited({ action: "qty", estimatedCount: items.filter((it) => !it.productId).length });
  };

  const handleRemoveItem = (itemId: string) => {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
    trackCartReviewItemEdited({ action: "remove", estimatedCount: items.filter((it) => !it.productId).length });
  };

  const handleProceedToCheckout = () => {
    if (items.length === 0) return;

    // Convert draft items to TrayPackLineItem format
    const trayItems: TrayPackLineItem[] = items.map((it) => ({
      id: it.id,
      itemId: it.productId || undefined,
      name: it.name,
      category: it.category,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      lineTotal: it.lineTotal,
      requiresPexcover: it.requiresPexcover,
      pexcoCode: it.pexcoCode,
      pexcoRateCents: it.requiresPexcover ? 800 : null,
      pexcoRateActive: it.requiresPexcover,
    }));

    const packId = `ai_pack_${draftId || Date.now()}`;
    const packItem: TrayPackItem = {
      id: packId,
      packId,
      basePackId: packId,
      packName: draft?.document_name
        ? `Custom Pack (${draft.document_name})`
        : "AI Matched Custom Pack",
      learnerName: draft?.metadata?.learnerName || undefined,
      grade: draft?.metadata?.grade || undefined,
      packMode: "customised",
      items: trayItems,
      subtotal: itemsSubtotal,
      totalPrice: grandTotal,
      wantsPexcover,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to global zustand tray store
    usePackTrayStore.getState().addPack(packItem);

    trackProceedToCheckout({ packCount: 1, totalPrice: grandTotal });

    // Route to checkout
    router.push("/checkout");
  };

  if (isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <h2>Loading your matched stationery list...</h2>
            <p>Verifying catalog pricing and book cover eligibility.</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !draft) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorState}>
            <h2>Could not load your cart draft</h2>
            <p>{error || "This draft cart may have expired or does not exist."}</p>
            <Link href="/order" className={styles.backLink}>
              ← Return to List Converter
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* Navigation / Header */}
        <div className={styles.headerRow}>
          <Link href="/order" className={styles.backLink}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to List Converter
          </Link>
        </div>

        <div className={styles.titleArea}>
          <div className={styles.eyebrow}>AI Stationery Review</div>
          <h1 className={styles.pageTitle}>Review Your Matched Pack</h1>
          <p className={styles.pageSubtitle}>
            We parsed <strong>{draft.document_name || "your uploaded document"}</strong> and matched items to
            our verified school catalog. Adjust quantities, toggle optional book covering, and proceed to
            checkout.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className={styles.contentGrid}>
          {/* Left Column: Items */}
          <div className={styles.itemsCard}>
            {hasEstimatedItems && (
              <div className={styles.conciergeAlertBanner}>
                <div className={styles.alertIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div className={styles.alertContent}>
                  <div className={styles.alertTitle}>Notice: Unverified School Items</div>
                  <div>
                    Some items from your list could not be automatically matched to our verified catalog. These lines are labeled as <strong>Estimated (R25.00 placeholder)</strong> and will be confirmed with our concierge team before final payment and dispatch.
                  </div>
                </div>
              </div>
            )}

            <div className={styles.itemsHeader}>
              <h3>Stationery Line Items</h3>
              <span className={styles.itemCountBadge}>
                {items.reduce((s, it) => s + it.quantity, 0)} Items
              </span>
            </div>

            {items.length === 0 ? (
              <p>Your cart is empty. Please upload a stationery list.</p>
            ) : (
              <div className={styles.itemList}>
                {items.map((item) => (
                  <div key={item.id} className={styles.itemRow}>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemName}>{item.name}</div>
                      <div className={styles.itemMeta}>
                        {item.productId ? (
                          <span className={styles.catalogBadge}>Catalog Verified</span>
                        ) : (
                          <span className={styles.estimatedBadge}>Estimated • Concierge Review</span>
                        )}
                        {item.requiresPexcover && (
                          <span className={styles.coverBadge}>Cover Eligible</span>
                        )}
                        {item.specifications && <span>{item.specifications}</span>}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className={styles.qtyControls}>
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        onClick={() => handleUpdateQty(item.id, -1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className={styles.qtyNum}>{item.quantity}</span>
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        onClick={() => handleUpdateQty(item.id, 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <div className={styles.itemPrice}>
                      <div className={styles.lineTotal}>R{item.lineTotal.toFixed(2)}</div>
                      <div className={styles.unitPrice}>
                        R{item.unitPrice.toFixed(2)} ea
                        {!item.productId && <span className={styles.estNotice}> (est.)</span>}
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => handleRemoveItem(item.id)}
                      title="Remove item"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Pexcover Dynamic Book Covering Option */}
            {pexcoverCalc.hasEligibleBooks && (
              <div className={styles.pexcoverCard}>
                <div className={styles.pexcoverHeader}>
                  <input
                    type="checkbox"
                    id="pexcover-toggle"
                    className={styles.checkbox}
                    checked={wantsPexcover}
                    onChange={(e) => setWantsPexcover(e.target.checked)}
                  />
                  <div className={styles.pexcoverText}>
                    <label htmlFor="pexcover-toggle">
                      <h4>Add Professional Book Covering (Pexcover™)</h4>
                    </label>
                    <p>
                      Arrives pre-covered with heavy-duty 80-micron clear slip covers and printed learner name
                      labels.
                    </p>
                    <div className={styles.pexcoverPrice}>
                      Covers {pexcoverCalc.coverableItemCount} eligible books for{" "}
                      <strong>R{pexcoverCalc.pexcoverTotalRands.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <aside className={styles.summaryCard}>
            <h3 className={styles.summaryTitle}>Order Summary</h3>

            <div className={styles.summaryRow}>
              <span>Stationery Items</span>
              <span>R{itemsSubtotal.toFixed(2)}</span>
            </div>

            {wantsPexcover && (
              <div className={styles.summaryRow}>
                <span>Pexcover™ ({pexcoverCalc.coverableItemCount} books)</span>
                <span>R{pexcoverCalc.pexcoverTotalRands.toFixed(2)}</span>
              </div>
            )}

            <div className={styles.summaryRow}>
              <span>Courier Delivery</span>
              <span>Calculated at checkout</span>
            </div>

            <div className={styles.summaryRowStrong}>
              <span>Estimated Total</span>
              <span>R{grandTotal.toFixed(2)}</span>
            </div>

            <button
              type="button"
              className={styles.checkoutBtn}
              onClick={handleProceedToCheckout}
              disabled={items.length === 0}
            >
              Proceed to Checkout
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            <div className={styles.securityNote}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Instant secure checkout with Happy Pay & Ozow</span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
