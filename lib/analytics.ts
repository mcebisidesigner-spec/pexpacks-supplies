"use client";

import { track } from "@vercel/analytics";

export const AnalyticsEvents = {
  ctaClicked: "CTA Clicked",
  schoolSearchCompleted: "School Search Completed",
  schoolSearchFailed: "School Search Failed",
  schoolResultSelected: "School Result Selected",
  schoolNoResultsRecovery: "School No Results Recovery",
  schoolCardClicked: "School Card Clicked",
  schoolImpression: "School Impression",
  schoolDirectoryBrowse: "School Directory Browse",
  faqOpened: "FAQ Opened",
  whatsappClicked: "WhatsApp Clicked",
  conciergeCtaClicked: "Concierge CTA Clicked",
  initiatePreOrder: "Initiate Pre-Order",
  customiserOpened: "Pack Customiser Opened",
  customiserReset: "Pack Customiser Reset",
  trayOpened: "Order Tray Opened",
  addLearnerStarted: "Add Learner Started",
  proceedToCheckout: "Proceed to Checkout",
  checkoutStepCompleted: "Checkout Step Completed",
  checkoutValidationFailed: "Checkout Validation Failed",
  paymentInitiated: "Payment Initiated",
  paymentFailed: "Payment Failed",
  checkoutCompleted: "Checkout Completed",
  quoteStepCompleted: "Quote Step Completed",
  quoteSubmitted: "Quote Submitted",
  quoteSubmissionFailed: "Quote Submission Failed",
} as const;

type SearchSource = "home" | "schools" | "tray";
type CheckoutMode = "tray" | "single-pack";

export function trackCtaClicked({
  sourcePath,
  destination,
  label,
}: {
  sourcePath: string;
  destination: string;
  label: string;
}) {
  track(AnalyticsEvents.ctaClicked, { sourcePath, destination, label });
}

export function trackSchoolSearchCompleted({
  source,
  queryLength,
  resultCount,
  offset,
}: {
  source: SearchSource;
  queryLength: number;
  resultCount: number;
  offset: number;
}) {
  track(AnalyticsEvents.schoolSearchCompleted, {
    source,
    queryLength,
    resultCount,
    offset,
    outcome: resultCount > 0 ? "results" : "no_results",
  });
}

export function trackSchoolSearchFailed({
  source,
  queryLength,
}: {
  source: SearchSource;
  queryLength: number;
}) {
  track(AnalyticsEvents.schoolSearchFailed, { source, queryLength });
}

export function trackSchoolResultSelected({
  source,
  schoolSlug,
  position,
  placement,
}: {
  source: SearchSource;
  schoolSlug: string;
  position: number;
  placement: "result" | "trending";
}) {
  track(AnalyticsEvents.schoolResultSelected, {
    source,
    schoolSlug,
    position,
    placement,
  });
}

export function trackSchoolNoResultsRecovery({
  source,
}: {
  source: SearchSource;
}) {
  track(AnalyticsEvents.schoolNoResultsRecovery, { source });
}

export function trackSchoolCardClicked({
  schoolSlug,
  placement,
  position,
}: {
  schoolSlug: string;
  placement: "featured" | "browse" | "recent";
  position: number;
}) {
  track(AnalyticsEvents.schoolCardClicked, {
    schoolSlug,
    placement,
    position,
  });
}

export function trackSchoolImpression({
  schoolSlug,
  placement,
}: {
  schoolSlug: string;
  placement: "featured" | "browse";
}) {
  track(AnalyticsEvents.schoolImpression, { schoolSlug, placement });
}

export function trackSchoolDirectoryBrowse({
  filter,
  visibleCount,
}: {
  filter: string;
  visibleCount: number;
}) {
  track(AnalyticsEvents.schoolDirectoryBrowse, { filter, visibleCount });
}

export function trackFaqOpened({
  faqId,
  section,
}: {
  faqId: string;
  section: string;
}) {
  track(AnalyticsEvents.faqOpened, { faqId, section });
}

export function trackWhatsAppClicked({
  sourcePath,
  label,
}: {
  sourcePath: string;
  label: string;
}) {
  track(AnalyticsEvents.whatsappClicked, { sourcePath, label });
}

export function trackConciergeCtaClicked({
  cta,
  sourcePath,
}: {
  cta: "upload" | "whatsapp";
  sourcePath: string;
}) {
  track(AnalyticsEvents.conciergeCtaClicked, { cta, sourcePath });
}

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

export function trackCustomiserOpened({
  school,
  grade,
}: {
  school: string;
  grade: string;
}) {
  track(AnalyticsEvents.customiserOpened, { school, grade });
}

export function trackCustomiserReset({
  school,
  grade,
}: {
  school: string;
  grade: string;
}) {
  track(AnalyticsEvents.customiserReset, { school, grade });
}

export function trackTrayOpened({ packCount }: { packCount: number }) {
  track(AnalyticsEvents.trayOpened, { packCount });
}

export function trackAddLearnerStarted({ packCount }: { packCount: number }) {
  track(AnalyticsEvents.addLearnerStarted, { packCount });
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

export function trackCheckoutStepCompleted({
  checkoutMode,
  step,
}: {
  checkoutMode: CheckoutMode;
  step: string;
}) {
  track(AnalyticsEvents.checkoutStepCompleted, { checkoutMode, step });
}

export function trackCheckoutValidationFailed({
  checkoutMode,
  step,
  fields,
}: {
  checkoutMode: CheckoutMode;
  step: string;
  fields: string[];
}) {
  track(AnalyticsEvents.checkoutValidationFailed, {
    checkoutMode,
    step,
    errorCount: fields.length,
    fields: fields.join(","),
  });
}

export function trackPaymentFailed({
  checkoutMode,
  failureType,
  statusCode,
}: {
  checkoutMode: CheckoutMode;
  failureType: "api" | "network" | "invalid_response";
  statusCode?: number;
}) {
  track(AnalyticsEvents.paymentFailed, {
    checkoutMode,
    failureType,
    statusCode: statusCode ?? 0,
  });
}

export function trackCheckoutCompleted({
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
  track(AnalyticsEvents.checkoutCompleted, {
    orderReference,
    school: school ?? null,
    grade: grade ?? null,
    amount: amount ?? null,
    currency: "ZAR",
  });
}

export function trackQuoteStepCompleted({
  step,
  inputMethod,
}: {
  step: number;
  inputMethod?: "upload" | "type";
}) {
  track(AnalyticsEvents.quoteStepCompleted, {
    step,
    inputMethod: inputMethod ?? "not_selected",
  });
}

export function trackQuoteSubmitted({
  inputMethod,
  learnerPhase,
}: {
  inputMethod: "upload" | "type";
  learnerPhase: string;
}) {
  track(AnalyticsEvents.quoteSubmitted, { inputMethod, learnerPhase });
}

export function trackQuoteSubmissionFailed({
  failureType,
}: {
  failureType: "validation" | "api" | "network";
}) {
  track(AnalyticsEvents.quoteSubmissionFailed, { failureType });
}
