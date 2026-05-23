"use client";

import { useCallback, useEffect, useRef } from "react";

const STORAGE_KEY = "Pexpacks:checkout-state";

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
  try {
    const payload: CheckoutState = { ...state, savedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage may be unavailable
  }
}

export function loadCheckoutState(): CheckoutState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CheckoutState;
  } catch {
    return null;
  }
}

export function clearCheckoutState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}

const DEBOUNCE_MS = 800;

/**
 * Auto-saves order form state to localStorage on change (debounced).
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
