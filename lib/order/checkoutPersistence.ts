"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  saveCheckoutDraft,
  loadCheckoutDraft,
  clearCheckoutDraft,
} from "@/lib/supabase/checkoutDraft";

export type GradePexcoverEntry = {
  gradeLabel: string;
  selected: boolean;
  childName: string;
};

export type CheckoutState = {
  activeStep: number;
  schoolQuery: string;
  selectedSchoolSlug?: string;
  gradeSlug: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  learnerName: string;
  preferredContactMethod: string;
  consent: boolean;
  fulfilmentOption: string;
  address: string;
  suburb: string;
  city: string;
  province: string;
  deliveryNotes: string;
  finalConfirmation: boolean;
  hasPexcover: boolean;
  pexcoverName: string;
  pexcoverSubjects: string;
  pexcoverLabelFormat: string;
  pexcoverNotes: string;
  gradePexcovers?: GradePexcoverEntry[];
  savedAt: number;
  orderRef: string;
  /** URL params needed to reconstruct the checkout context */
  params: string;
};

export function saveCheckoutState(state: Omit<CheckoutState, "savedAt">) {
  const payload: CheckoutState = { ...state, savedAt: Date.now() };
  saveCheckoutDraft(payload);
}

export async function loadCheckoutState(): Promise<CheckoutState | null> {
  try {
    const data = await loadCheckoutDraft();
    if (!data) return null;
    return data as CheckoutState;
  } catch {
    return null;
  }
}

export function clearCheckoutState() {
  clearCheckoutDraft();
}

const DEBOUNCE_MS = 800;

/**
 * Auto-saves order form state to Supabase on change (debounced).
 * Returns a restore function and the saved state.
 */
export function useCheckoutPersistence() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback((state: Omit<CheckoutState, "savedAt">) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveCheckoutState(state);
    }, DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { save, load: loadCheckoutState, clear: clearCheckoutState };
}
