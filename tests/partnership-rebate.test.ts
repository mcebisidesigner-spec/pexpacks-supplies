import { describe, it, expect } from "vitest";
import {
  getRebateRate,
  calculateRebate,
  formatZAR,
  formatNumber,
} from "@/components/partnership/rebateCalculator";

describe("Partnership Rebate Tier Logic", () => {
  it("returns 1.5% for adoption below 30%", () => {
    expect(getRebateRate(0)).toBe(0.015);
    expect(getRebateRate(15)).toBe(0.015);
    expect(getRebateRate(29.99)).toBe(0.015);
  });

  it("returns 2.0% for adoption from 30% to below 60%", () => {
    expect(getRebateRate(30)).toBe(0.02);
    expect(getRebateRate(45)).toBe(0.02);
    expect(getRebateRate(59.99)).toBe(0.02);
  });

  it("returns 3.0% for adoption at 60% and above", () => {
    expect(getRebateRate(60)).toBe(0.03);
    expect(getRebateRate(75)).toBe(0.03);
    expect(getRebateRate(100)).toBe(0.03);
  });

  it("clamps boundary and malformed adoption rates gracefully", () => {
    expect(getRebateRate(-10)).toBe(0.015);
    expect(getRebateRate(150)).toBe(0.03);
    expect(getRebateRate(Number.NaN)).toBe(0.015);
  });

  it("calculates exact institutional rebate for 800 learners at 60% adoption and R1,450 AOV", () => {
    const result = calculateRebate({
      totalLearners: 800,
      adoptionPercentage: 60,
      averageOrderValue: 1450,
    });

    expect(result.participatingLearners).toBe(480);
    expect(result.estimatedTurnover).toBe(696000);
    expect(result.rebateRate).toBe(0.03);
    expect(result.estimatedSchoolRebate).toBe(20880);
    expect(result.activeTierName).toContain("Premier Tier");
  });

  it("calculates exact institutional rebate for 800 learners at 100% adoption and R1,450 AOV", () => {
    const result = calculateRebate({
      totalLearners: 800,
      adoptionPercentage: 100,
      averageOrderValue: 1450,
    });

    expect(result.participatingLearners).toBe(800);
    expect(result.estimatedTurnover).toBe(1160000);
    expect(result.rebateRate).toBe(0.03);
    expect(result.estimatedSchoolRebate).toBe(34800);
  });

  it("provides correct next tier hints based on thresholds", () => {
    const low = calculateRebate({
      totalLearners: 500,
      adoptionPercentage: 20,
      averageOrderValue: 1200,
    });
    expect(low.nextTierHint).toContain("unlock the 2.0% Growth Tier");

    const mid = calculateRebate({
      totalLearners: 500,
      adoptionPercentage: 45,
      averageOrderValue: 1200,
    });
    expect(mid.nextTierHint).toContain("unlock the 3.0% Premier Tier");

    const top = calculateRebate({
      totalLearners: 500,
      adoptionPercentage: 80,
      averageOrderValue: 1200,
    });
    expect(top.nextTierHint).toContain("Top tier unlocked");
  });

  it("formats ZAR currency properly", () => {
    const formatted = formatZAR(20880);
    expect(formatted).toMatch(/^R20[,.]?880$/);
    expect(formatZAR(0)).toMatch(/^R0$/);
  });

  it("formats numbers properly", () => {
    expect(formatNumber(1250)).toMatch(/^1[\s,.]?250$/);
    expect(formatNumber(0)).toBe("0");
  });
});
