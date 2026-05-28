import type { CheckoutPayload } from "@/types/orders";

const SA_PHONE_REGEX = /^(\+27|0)[1-9]\d{8}$/;

function validateEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export type ValidationErrors = Record<string, string>;

export function validateCheckoutPayload(
  raw: Record<string, unknown>
): { data: CheckoutPayload; errors: null } | { data: null; errors: ValidationErrors } {
  const errors: ValidationErrors = {};

  const buyerName = typeof raw.buyerName === "string" ? raw.buyerName.trim() : "";
  if (!buyerName || buyerName.length < 2) {
    errors.buyerName = "Name must be at least 2 characters.";
  } else if (buyerName.length > 120) {
    errors.buyerName = "Name is too long.";
  }

  const buyerEmail =
    typeof raw.buyerEmail === "string" ? raw.buyerEmail.trim().toLowerCase() : "";
  if (!buyerEmail) {
    errors.buyerEmail = "Email address is required.";
  } else if (!validateEmail(buyerEmail)) {
    errors.buyerEmail = "Please enter a valid email address.";
  }

  const buyerPhone =
    typeof raw.buyerPhone === "string" ? raw.buyerPhone.trim() : "";
  if (!buyerPhone) {
    errors.buyerPhone = "Phone number is required.";
  } else if (!SA_PHONE_REGEX.test(buyerPhone)) {
    errors.buyerPhone = "Please enter a valid South African phone number.";
  }

  const learnerName =
    typeof raw.learnerName === "string" ? raw.learnerName.trim() : "";
  if (!learnerName || learnerName.length < 2) {
    errors.learnerName = "Learner name is required.";
  } else if (learnerName.length > 120) {
    errors.learnerName = "Name is too long.";
  }

  const schoolSlug =
    typeof raw.schoolSlug === "string" ? raw.schoolSlug.trim() : "";
  if (!schoolSlug) {
    errors.schoolSlug = "School is required.";
  }

  const schoolName =
    typeof raw.schoolName === "string" ? raw.schoolName.trim() : "";
  if (!schoolName) {
    errors.schoolName = "School name is required.";
  }

  const grade = typeof raw.grade === "string" ? raw.grade.trim() : "";
  if (!grade) {
    errors.grade = "Grade is required.";
  }

  const gradeSlug = typeof raw.gradeSlug === "string" ? raw.gradeSlug.trim() : "";

  const packType = typeof raw.packType === "string" ? raw.packType.trim() : "";
  if (packType !== "full") {
    errors.packType = "Invalid pack type.";
  }

  const deliveryMethod =
    typeof raw.deliveryMethod === "string" ? raw.deliveryMethod.trim() : "";
  if (!["school_collection", "delivery", "collection_point"].includes(deliveryMethod)) {
    errors.deliveryMethod = "Please select a delivery or collection method.";
  }

  const estimatedTotal =
    typeof raw.estimatedTotal === "number"
      ? raw.estimatedTotal
      : typeof raw.estimatedTotal === "string"
        ? Number(raw.estimatedTotal)
        : NaN;

  if (!Number.isFinite(estimatedTotal) || estimatedTotal <= 0) {
    errors.estimatedTotal = "Invalid total.";
  }

  const items: string[] = [];
  if (Array.isArray(raw.items)) {
    for (const item of raw.items) {
      if (typeof item === "string" && item.trim()) {
        items.push(item.trim());
      }
    }
  }

  const notes =
    typeof raw.notes === "string" ? raw.notes.trim() : undefined;

  if (Object.keys(errors).length > 0) {
    return { data: null, errors };
  }

  return {
    data: {
      buyerName,
      buyerEmail,
      buyerPhone,
      learnerName,
      schoolSlug,
      schoolName,
      grade,
      gradeSlug,
      packType: "full",
      items,
      estimatedTotal,
      deliveryMethod: deliveryMethod as CheckoutPayload["deliveryMethod"],
      notes: notes || undefined,
    },
    errors: null,
  };
}
