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
  pexcoRateCents?: number | null;
  pexcoRateActive?: boolean;
  similarity: number;
  rawText?: string;
  specifications?: string;
  isCustomOrEstimated?: boolean;
  needsReview?: boolean;
}

interface DraftCart {
  id: string;
  items: MatchedItem[];
  item_count: number;
  subtotal: number;
  wants_pexcover: boolean;
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
      pexco_code: i.pexcoCode ?? null,
      pexco_rate_cents: i.pexcoRateCents ?? null,
      pexco_rate_active: i.pexcoRateActive ?? false,
    }));

    return calculatePexcoverTotal(coverInputs);
  }, [items]);

  const grandTotal = useMemo(() => {
    const coveringCost = wantsPexcover ? pexcoverCalc.pexcoverTotalRands : 0;
    return Math.round((itemsSubtotal + coveringCost) * 100) / 100;
  }, [itemsSubtotal, wantsPexcover, pexcoverCalc]);

  const hasUnmatchedItems = useMemo(() => {
    return items.some((it) => !it.productId);
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
      pexcoRateCents: it.pexcoRateCents ?? null,
      pexcoRateActive: it.pexcoRateActive ?? false,
    }));

    const packId = `ai_pack_${draftId || Date.now()}`;
    const packItem: TrayPackItem = {
      id: packId,
      packId,
      basePackId: packId,
      packName: "AI Matched Custom Pack",
      source: "ai-list",
      packMode: "customised",
      items: trayItems,
      subtotal: itemsSubtotal,
      totalPrice: itemsSubtotal,
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
      <main className="py-[clamp(32px,5vw,64px)] bg-[var(--pex-bg)] min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-[var(--layout-max-width)] mx-auto px-4 md:px-8">
          <div className="text-center py-16 px-4 bg-white rounded-[var(--radius-card)] border border-[var(--pex-border)] shadow-sm max-w-lg mx-auto flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-2 border-[var(--pex-border)] border-t-[var(--pex-keppel)] rounded-full animate-spin mb-4" />
            <h2 className="text-lg font-bold text-[var(--pex-navy)] font-[family-name:var(--font-heading)] mb-2">Loading your matched stationery list...</h2>
            <p className="text-sm text-[var(--pex-muted)]">Verifying catalog pricing and book cover eligibility.</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !draft) {
    return (
      <main className="py-[clamp(32px,5vw,64px)] bg-[var(--pex-bg)] min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-[var(--layout-max-width)] mx-auto px-4 md:px-8">
          <div className="text-center py-16 px-4 bg-white rounded-[var(--radius-card)] border border-[var(--pex-border)] shadow-sm max-w-lg mx-auto flex flex-col items-center justify-center">
            <h2 className="text-lg font-bold text-[var(--pex-navy)] font-[family-name:var(--font-heading)] mb-2">Could not load your cart draft</h2>
            <p className="text-sm text-[var(--pex-muted)] mb-6">{error || "This draft cart may have expired or does not exist."}</p>
            <Link href="/order" className="inline-flex items-center gap-2 text-[var(--pex-keppel)] text-sm font-bold hover:text-[var(--pex-navy)] transition-colors">
              ← Return to List Converter
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="py-[clamp(32px,5vw,64px)] bg-[var(--pex-bg)] min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-[var(--layout-max-width)] mx-auto px-4 md:px-8">
        {/* Navigation / Header */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/order" className="inline-flex items-center gap-2 text-[var(--pex-keppel)] text-sm font-bold hover:text-[var(--pex-navy)] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to List Converter
          </Link>
        </div>

        <div className="mb-8">
          <div className="text-[var(--pex-keppel)] text-xs font-bold uppercase tracking-wider mb-2">AI Stationery Review</div>
          <h1 className="text-[var(--pex-navy)] font-[family-name:var(--font-heading)] text-[clamp(28px,4vw,40px)] font-extrabold m-0 mb-2 leading-tight">Review Your Matched Pack</h1>
          <p className="text-[var(--pex-muted)] text-sm sm:text-base m-0 max-w-2xl">
            Review the catalogue matches below, adjust quantities, and add optional book covering before
            continuing to checkout.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
          {/* Left Column: Items */}
          <div className="bg-white rounded-[var(--radius-card)] p-5 sm:p-8 border border-[var(--pex-border)] shadow-[var(--shadow-card)]">
            {hasUnmatchedItems && (
              <div className="flex gap-3 p-4 mb-6 rounded-[var(--radius-sm)] bg-[rgba(235,94,85,0.08)] border border-[rgba(235,94,85,0.25)] text-left">
                <div className="text-[var(--pex-coral)] shrink-0 mt-0.5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div className="text-xs text-[var(--pex-navy)] leading-relaxed">
                  <div className="font-bold text-[var(--pex-coral)] mb-0.5">Items need catalogue confirmation</div>
                  <div>
                    Remove any unmatched line or return to the list converter with clearer item details. Unmatched items are not priced and cannot proceed to payment.
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pb-4 border-b border-[var(--pex-border)] mb-5">
              <h3 className="m-0 text-lg font-bold text-[var(--pex-navy)] font-[family-name:var(--font-heading)]">Stationery Line Items</h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[rgba(33,158,154,0.1)] text-[var(--pex-keppel)]">
                {items.reduce((s, it) => s + it.quantity, 0)} Items
              </span>
            </div>

            {items.length === 0 ? (
              <p className="text-sm text-[var(--pex-muted)] py-8 text-center">Your cart is empty. Please upload a stationery list.</p>
            ) : (
              <div className="divide-y divide-[var(--pex-border)]">
                {items.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm sm:text-base text-[var(--pex-navy)] mb-1 leading-snug">{item.name}</div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--pex-muted)]">
                        {item.productId ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[rgba(33,158,154,0.1)] text-[var(--pex-keppel)]">Catalog Verified</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[rgba(235,94,85,0.1)] text-[var(--pex-coral)]">Estimated • Concierge Review</span>
                        )}
                        {item.requiresPexcover && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[rgba(240,165,0,0.12)] text-[#b87d00]">Cover Eligible</span>
                        )}
                        {item.specifications && <span>{item.specifications}</span>}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center border border-[var(--pex-border)] rounded-[var(--radius-sm)] bg-[var(--pex-bg)] self-start sm:self-center">
                      <button
                        type="button"
                        className="w-8 h-8 flex items-center justify-center text-sm font-bold text-[var(--pex-navy)] hover:bg-white transition-colors cursor-pointer select-none active:scale-95"
                        onClick={() => handleUpdateQty(item.id, -1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-9 text-center text-xs font-bold text-[var(--pex-navy)]">{item.quantity}</span>
                      <button
                        type="button"
                        className="w-8 h-8 flex items-center justify-center text-sm font-bold text-[var(--pex-navy)] hover:bg-white transition-colors cursor-pointer select-none active:scale-95"
                        onClick={() => handleUpdateQty(item.id, 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-left sm:text-right min-w-[90px]">
                      <div className="font-bold text-sm sm:text-base text-[var(--pex-navy)]">R{item.lineTotal.toFixed(2)}</div>
                      <div className="text-xs text-[var(--pex-muted)]">
                        R{item.unitPrice.toFixed(2)} ea
                        {!item.productId && <span className="text-[var(--pex-coral)] font-semibold"> (est.)</span>}
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      className="p-2 text-[var(--pex-muted)] hover:text-[var(--pex-coral)] transition-colors self-end sm:self-center cursor-pointer rounded-[var(--radius-sm)] hover:bg-[rgba(235,94,85,0.08)]"
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
              <div className="mt-6 p-4 sm:p-5 rounded-[var(--radius-md)] bg-[rgba(33,158,154,0.04)] border border-[rgba(33,158,154,0.2)]">
                <div className="flex items-start gap-3.5">
                  <input
                    type="checkbox"
                    id="pexcover-toggle"
                    className="mt-1 w-4 h-4 rounded text-[var(--pex-keppel)] focus:ring-[var(--pex-keppel)] cursor-pointer accent-[var(--pex-keppel)]"
                    checked={wantsPexcover}
                    onChange={(e) => setWantsPexcover(e.target.checked)}
                  />
                  <div className="flex-1">
                    <label htmlFor="pexcover-toggle">
                      <h4 className="m-0 mb-1 text-sm font-bold text-[var(--pex-navy)] cursor-pointer">Add Professional Book Covering (Pexcover™)</h4>
                    </label>
                    <p className="m-0 mb-2 text-xs text-[var(--pex-muted)] leading-relaxed">
                      Arrives pre-covered with heavy-duty 80-micron clear slip covers and printed learner name
                      labels.
                    </p>
                    <div className="text-xs text-[var(--pex-keppel)] font-medium">
                      Covers {pexcoverCalc.coverableItemCount} eligible books for{" "}
                      <strong className="font-bold">R{pexcoverCalc.pexcoverTotalRands.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <aside className="bg-white rounded-[var(--radius-card)] p-6 sm:p-8 border border-[var(--pex-border)] shadow-[var(--shadow-card)] lg:sticky lg:top-24">
            <h3 className="m-0 mb-5 text-lg font-bold text-[var(--pex-navy)] font-[family-name:var(--font-heading)] pb-3 border-b border-[var(--pex-border)]">Order Summary</h3>

            <div className="flex justify-between items-center text-sm text-[var(--pex-muted)] mb-3">
              <span>Stationery Items</span>
              <span className="font-medium text-[var(--pex-navy)]">R{itemsSubtotal.toFixed(2)}</span>
            </div>

            {wantsPexcover && (
              <div className="flex justify-between items-center text-sm text-[var(--pex-muted)] mb-3">
                <span>Pexcover™ ({pexcoverCalc.coverableItemCount} books)</span>
                <span className="font-medium text-[var(--pex-navy)]">R{pexcoverCalc.pexcoverTotalRands.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm text-[var(--pex-muted)] mb-3">
              <span>Courier Delivery</span>
              <span className="text-xs text-[var(--pex-muted)]">Calculated at checkout</span>
            </div>

            <div className="flex justify-between items-center text-base font-bold text-[var(--pex-navy)] pt-4 mt-3 border-t border-[var(--pex-border)] mb-6">
              <span>Current Total</span>
              <span>R{grandTotal.toFixed(2)}</span>
            </div>

            <button
              type="button"
              className="w-full min-h-[50px] px-6 py-3.5 rounded-[var(--radius-sm)] bg-[var(--pex-keppel)] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all hover:bg-[var(--pex-primary)] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(33,158,154,0.3)] cursor-pointer"
              onClick={handleProceedToCheckout}
              disabled={items.length === 0 || hasUnmatchedItems}
            >
              {hasUnmatchedItems ? "Resolve unmatched items" : "Proceed to Checkout"}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-[var(--pex-muted)] text-center">
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
