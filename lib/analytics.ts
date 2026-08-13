"use client";

import { track } from "@vercel/analytics";

export const AnalyticsEvents = {
  initiatePreOrder: "Initiate Pre-Order",
  proceedToCheckout: "Proceed to Checkout",
  paymentInitiated: "Payment Initiated",
} as const;

export function trackInitiatePreOrder({
  school,
  grade,
  packMode,
  totalPrice,
}: {
  school: string;
  grade: string;
  packMode: "full" | "customised";
  totalPrice: number;
}) {
  track(AnalyticsEvents.initiatePreOrder, {
    school,
    grade,
    packMode,
    totalPrice,
    currency: "ZAR",
  });
}

export function trackProceedToCheckout({
  packCount,
  totalPrice,
}: {
  packCount: number;
  totalPrice: number;
}) {
  track(AnalyticsEvents.proceedToCheckout, {
    packCount,
    totalPrice,
    currency: "ZAR",
  });
}

export function trackPaymentInitiated({
  orderId,
  totalPrice,
}: {
  orderId: string;
  totalPrice: number;
}) {
  track(AnalyticsEvents.paymentInitiated, {
    orderId,
    totalPrice,
    currency: "ZAR",
    paymentMethod: "Ozow",
  });
}
