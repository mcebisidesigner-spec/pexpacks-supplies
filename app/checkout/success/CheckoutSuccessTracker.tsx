"use client";

import { useEffect, useRef } from "react";
import { trackCheckoutCompleted } from "@/lib/analytics";

export function CheckoutSuccessTracker({
  orderReference,
  school,
  grade,
  amount,
}: {
  orderReference: string;
  school?: string;
  grade?: string;
  amount?: number;
}) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    trackCheckoutCompleted({ orderReference, school, grade, amount });
  }, [orderReference, school, grade, amount]);

  return null;
}
