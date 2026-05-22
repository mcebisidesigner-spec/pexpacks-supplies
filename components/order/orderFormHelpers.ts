import { phasePacks } from "@/data/phasePacks";
import type { StandardSelection, SchoolDetails, OrderFormProps } from "./OrderFormTypes";

export function createOrderReference() {
  return `PEX-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`;
}

export async function fetchSchoolDetails(slug: string) {
  const response = await fetch(`/api/schools/${encodeURIComponent(slug)}`);

  if (!response.ok) {
    throw new Error("School not found");
  }

  return (await response.json()) as { success: true; school: SchoolDetails };
}

export function parseEstimatedTotal(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export function resolveStandardSelection({
  initialPhase,
  initialPackId,
  initialGrade,
  initialPackType,
  initialCustomItems,
  initialEstimatedTotal,
}: Pick<
  OrderFormProps,
  | "initialPhase"
  | "initialPackId"
  | "initialGrade"
  | "initialPackType"
  | "initialCustomItems"
  | "initialEstimatedTotal"
>): StandardSelection | null {
  if (!initialPhase) {
    return null;
  }

  const phase = phasePacks.find((pack) => pack.slug === initialPhase);
  if (!phase) {
    return null;
  }

  const selectedPack =
    phase.gradePacks.find((pack) => pack.id === initialPackId) ||
    phase.gradePacks.find(
      (pack) => pack.grade.toLowerCase() === initialGrade?.toLowerCase()
    );

  if (!selectedPack) {
    return null;
  }

  return {
    mode: initialPackType === "custom" ? "custom" : "standard",
    phaseTitle: phase.title,
    phaseSlug: phase.slug,
    pack: selectedPack,
    customItems: initialCustomItems,
    estimatedTotal: parseEstimatedTotal(initialEstimatedTotal),
  };
}

export function isValidEmail(value: string) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isLikelySaPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return (
    (digits.startsWith("0") && digits.length === 10) ||
    (digits.startsWith("27") && digits.length === 11) ||
    (digits.startsWith("0027") && digits.length === 13)
  );
}
