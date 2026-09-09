/**
 * Pexpacks Institutional Rebate Calculator
 * Implements deterministic commercial rebate tiering and currency formatting.
 */

import {
  REBATE_TIERS,
  type CalculatorResult,
  type CalculatorState,
} from "./types";

/**
 * Returns the exact rebate rate decimal for a given parent adoption percentage.
 * Thresholds:
 * - Below 30%: 1.5% (0.015)
 * - 30% to below 60%: 2.0% (0.02)
 * - 60% and above: 3.0% (0.03)
 */
export function getRebateRate(adoptionPercentage: number): number {
  const cleanAdoption = Math.max(0, Math.min(100, Number(adoptionPercentage) || 0));
  if (cleanAdoption >= 60) return 0.03;
  if (cleanAdoption >= 30) return 0.02;
  return 0.015;
}

/**
 * Calculates complete institutional rebate projections with threshold hints.
 */
export function calculateRebate(state: CalculatorState): CalculatorResult {
  const learners = Math.max(1, Math.round(Number(state.totalLearners) || 0));
  const adoption = Math.max(0, Math.min(100, Number(state.adoptionPercentage) || 0));
  const avgOrder = Math.max(0, Number(state.averageOrderValue) || 0);

  const participatingLearners = Math.round(learners * (adoption / 100));
  const estimatedTurnover = Math.round(participatingLearners * avgOrder);
  const rebateRate = getRebateRate(adoption);
  const estimatedSchoolRebate = Math.round(estimatedTurnover * rebateRate);

  let activeTierName = "Base Tier (1.5%)";
  let nextTierHint: string | null = null;

  if (adoption >= 60) {
    activeTierName = "Premier Tier (3.0%)";
    nextTierHint = "Top tier unlocked: Maximum 3.0% institutional rebate active.";
  } else if (adoption >= 30) {
    activeTierName = "Growth Tier (2.0%)";
    nextTierHint = "Increase parent adoption to 60% to unlock the 3.0% Premier Tier.";
  } else {
    activeTierName = "Base Tier (1.5%)";
    nextTierHint = "Increase parent adoption to 30% to unlock the 2.0% Growth Tier.";
  }

  return {
    participatingLearners,
    estimatedTurnover,
    rebateRate,
    rebateRatePercent: Math.round(rebateRate * 1000) / 10,
    estimatedSchoolRebate,
    activeTierName,
    nextTierHint,
  };
}

/**
 * Formats South African Rand currency amounts (e.g. R20,880).
 */
export function formatZAR(amount: number, includeDecimals = false): string {
  if (!Number.isFinite(amount)) return "R0";
  const formatted = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(amount);
  return formatted.replace(/[\s\u00A0]+/g, ""); // Standardize R20,880
}

/**
 * Formats standard integers with locale separators (e.g. 1 200).
 */
export function formatNumber(count: number): string {
  if (!Number.isFinite(count)) return "0";
  const formatted = new Intl.NumberFormat("en-ZA", {
    maximumFractionDigits: 0,
  }).format(count);
  return formatted.replace(/\u00A0/g, " ");
}
