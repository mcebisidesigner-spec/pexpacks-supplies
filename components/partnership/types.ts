/**
 * Pexpacks Institutional Partnership Types & Constants
 * Unified configuration for rebate rates, executive roles, and calculator models.
 */

export interface RebateTier {
  minAdoption: number; // Inclusive lower bound (e.g. 0, 30, 60)
  maxAdoption: number; // Exclusive upper bound (except 100 which is inclusive)
  rate: number;        // Decimal rate (e.g. 0.015, 0.02, 0.03)
  label: string;       // Formatted label (e.g. "1.5%", "2.0%", "3.0%")
  name: string;        // Tier name (e.g. "Base Tier", "Growth Tier", "Premier Tier")
  description: string;
}

export const REBATE_TIERS: readonly RebateTier[] = [
  {
    minAdoption: 0,
    maxAdoption: 30,
    rate: 0.015,
    label: "1.5%",
    name: "Base Tier",
    description: "Below 30% parent adoption",
  },
  {
    minAdoption: 30,
    maxAdoption: 60,
    rate: 0.02,
    label: "2.0%",
    name: "Growth Tier",
    description: "30% to below 60% parent adoption",
  },
  {
    minAdoption: 60,
    maxAdoption: 100,
    rate: 0.03,
    label: "3.0%",
    name: "Premier Tier",
    description: "60% and above parent adoption",
  },
] as const;

export const SCHOOL_ROLES = [
  "Executive Principal / Head",
  "Deputy Principal",
  "SGB Chairperson",
  "SGB Financial Head / Treasurer",
  "Bursar / Finance",
  "Admissions Director",
  "Procurement / Operations",
  "Grade Head / HOD",
  "School Administrator",
  "Other",
] as const;

export type SchoolRole = (typeof SCHOOL_ROLES)[number];

export const SCHOOL_TYPES = [
  "Primary School",
  "High School",
  "Combined School (Grade R–12)",
  "Independent / Private School",
  "Public / Model C School",
  "Specialised / Other",
] as const;

export type SchoolType = (typeof SCHOOL_TYPES)[number];

export const PREFERRED_CONTACT_METHODS = [
  "Phone call",
  "WhatsApp message",
  "Email",
] as const;

export type PreferredContactMethod = (typeof PREFERRED_CONTACT_METHODS)[number];

export interface CalculatorState {
  totalLearners: number;
  adoptionPercentage: number;
  averageOrderValue: number;
}

export interface CalculatorResult {
  participatingLearners: number;
  estimatedTurnover: number;
  rebateRate: number;
  rebateRatePercent: number;
  estimatedSchoolRebate: number;
  activeTierName: string;
  nextTierHint: string | null;
}

export interface CalculatorPrefill {
  learnerCount: number;
  adoptionRate: number;
  estimatedRebate: number;
  turnover: number;
}
