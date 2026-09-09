"use client";

import React, { useState, useMemo } from "react";
import { REBATE_TIERS, type CalculatorPrefill, type CalculatorState } from "./types";
import {
  calculateRebate,
  formatNumber,
  formatZAR,
} from "./rebateCalculator";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Info, Sparkles } from "lucide-react";
import styles from "./Partnership.module.css";

interface RebateSectionProps {
  onDiscussEstimate?: (prefill: CalculatorPrefill) => void;
}

export function RebateSection({ onDiscussEstimate }: RebateSectionProps) {
  const [calcState, setCalcState] = useState<CalculatorState>({
    totalLearners: 800,
    adoptionPercentage: 60,
    averageOrderValue: 1450,
  });

  const result = useMemo(() => calculateRebate(calcState), [calcState]);

  const handleDiscussClick = () => {
    if (onDiscussEstimate) {
      onDiscussEstimate({
        learnerCount: calcState.totalLearners,
        adoptionRate: calcState.adoptionPercentage,
        estimatedRebate: result.estimatedSchoolRebate,
        turnover: result.estimatedTurnover,
      });
    }
  };

  return (
    <section className={styles.section} id="rebate-calculator" aria-labelledby="rebate-heading">
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Annual partnership rebate</p>
          <h2 id="rebate-heading" className={styles.sectionTitle}>
            Adoption That Gives Back to Your School.
          </h2>
          <p className={styles.sectionLead}>
            Our institutional rebate returns a direct percentage of completed
            parent stationery orders to your school development fund. The more
            families adopt your official digital list, the higher your rebate tier.
          </p>
        </div>

        <div className={styles.rebateLayout}>
          {/* Tiers Explanation */}
          <div>
            <h3 style={{ fontSize: "22px", fontWeight: 800, color: "var(--pex-navy)", margin: "0 0 8px" }}>
              Commercial Rebate Tiers
            </h3>
            <p style={{ fontSize: "14.5px", color: "var(--pex-muted)", margin: "0 0 20px", lineHeight: 1.55 }}>
              Transparent, deterministic rebate tiers without ambiguous overlapping ranges.
              Settled annually for verified completed packs.
            </p>

            <div className={styles.tiersList} role="table" aria-label="Rebate tier thresholds">
              {REBATE_TIERS.map((tier) => {
                const isActive =
                  calcState.adoptionPercentage >= tier.minAdoption &&
                  (tier.maxAdoption === 100
                    ? calcState.adoptionPercentage <= 100
                    : calcState.adoptionPercentage < tier.maxAdoption);

                return (
                  <div
                    key={tier.name}
                    className={`${styles.tierCard} ${isActive ? styles.tierCardActive : ""}`}
                    role="row"
                  >
                    <div className={styles.tierInfo}>
                      <p className={styles.tierName}>
                        {tier.name}
                        {isActive && (
                          <span
                            style={{
                              marginLeft: 8,
                              fontSize: 11,
                              fontWeight: 700,
                              color: "var(--pex-keppel)",
                              textTransform: "uppercase",
                              background: "rgba(26, 122, 119, 0.12)",
                              padding: "2px 8px",
                              borderRadius: 4,
                            }}
                          >
                            Active Tier
                          </span>
                        )}
                      </p>
                      <p className={styles.tierRange}>{tier.description}</p>
                    </div>
                    <div className={styles.tierRateBadge} aria-label={`${tier.label} rebate`}>
                      {tier.label}
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                marginTop: 24,
                padding: "16px 18px",
                background: "var(--pex-bg-soft)",
                borderRadius: 14,
                border: "1px solid var(--pex-border)",
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              <Info size={18} style={{ color: "var(--pex-keppel)", flexShrink: 0, marginTop: 2 }} />
              <p style={{ margin: 0, fontSize: 13, color: "var(--pex-muted)", lineHeight: 1.55 }}>
                <strong>Direct Fund Remittance:</strong> Following seasonal back-to-school fulfilment,
                your school bursary receives an itemised settlement statement reflecting all completed
                orders alongside electronic remittance to your official institutional bank account.
              </p>
            </div>
          </div>

          {/* Interactive Calculator */}
          <div className={styles.calculatorCard}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--pex-navy)", margin: 0 }}>
                  Interactive Rebate Estimator
                </h3>
                <span style={{ fontSize: "12.5px", color: "var(--pex-muted)" }}>
                  Adjust parameters to model your school's return
                </span>
              </div>
              <Sparkles size={20} style={{ color: "var(--pex-keppel)" }} />
            </div>

            <div className={styles.calcInputs}>
              {/* Total Learners */}
              <div className={styles.calcField}>
                <div className={styles.calcLabelRow}>
                  <label htmlFor="total-learners-input" className={styles.calcLabel}>
                    Total School Enrollment
                  </label>
                  <span className={styles.calcValueBadge}>
                    {formatNumber(calcState.totalLearners)} Learners
                  </span>
                </div>
                <input
                  id="total-learners-input"
                  type="number"
                  min={10}
                  max={5000}
                  step={10}
                  value={calcState.totalLearners}
                  onChange={(e) =>
                    setCalcState((prev) => ({
                      ...prev,
                      totalLearners: Math.max(1, parseInt(e.target.value, 10) || 0),
                    }))
                  }
                  className={styles.calcInput}
                  aria-label="Total School Enrollment"
                />
              </div>

              {/* Adoption Slider */}
              <div className={styles.calcField}>
                <div className={styles.calcLabelRow}>
                  <label htmlFor="adoption-slider" className={styles.calcLabel}>
                    Estimated Parent Adoption
                  </label>
                  <span className={styles.calcValueBadge}>
                    {calcState.adoptionPercentage}% Adoption
                  </span>
                </div>
                <input
                  id="adoption-slider"
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={calcState.adoptionPercentage}
                  onChange={(e) =>
                    setCalcState((prev) => ({
                      ...prev,
                      adoptionPercentage: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  className={styles.calcSlider}
                  aria-label="Estimated Parent Adoption Percentage"
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--pex-muted)" }}>
                  <span>0% (Initial)</span>
                  <span>30% (Growth)</span>
                  <span>60%+ (Premier)</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Average Order Value */}
              <div className={styles.calcField}>
                <div className={styles.calcLabelRow}>
                  <label htmlFor="aov-input" className={styles.calcLabel}>
                    Estimated Average Pack Value (ZAR)
                  </label>
                  <span className={styles.calcValueBadge}>
                    {formatZAR(calcState.averageOrderValue)}
                  </span>
                </div>
                <input
                  id="aov-input"
                  type="number"
                  min={200}
                  max={10000}
                  step={50}
                  value={calcState.averageOrderValue}
                  onChange={(e) =>
                    setCalcState((prev) => ({
                      ...prev,
                      averageOrderValue: Math.max(0, parseInt(e.target.value, 10) || 0),
                    }))
                  }
                  className={styles.calcInput}
                  aria-label="Estimated Average Pack Value in Rand"
                />
              </div>
            </div>

            {/* Output Panel */}
            <div className={styles.calcResultsBox}>
              <div className={styles.calcMainOutput}>
                <span className={styles.calcOutputLabel}>
                  Estimated Annual School Development Rebate
                </span>
                <strong className={styles.calcRebateAmount}>
                  {formatZAR(result.estimatedSchoolRebate)}
                </strong>
              </div>

              <div className={styles.calcMetricsGrid}>
                <div className={styles.calcMetricItem}>
                  <span className={styles.calcMetricLabel}>Participating Learners</span>
                  <span className={styles.calcMetricVal}>
                    {formatNumber(result.participatingLearners)} families
                  </span>
                </div>
                <div className={styles.calcMetricItem}>
                  <span className={styles.calcMetricLabel}>Estimated Qualifying Turnover</span>
                  <span className={styles.calcMetricVal}>
                    {formatZAR(result.estimatedTurnover)}
                  </span>
                </div>
                <div className={styles.calcMetricItem}>
                  <span className={styles.calcMetricLabel}>Applicable Rebate Rate</span>
                  <span className={styles.calcMetricVal} style={{ color: "#34d399" }}>
                    {result.rebateRatePercent.toFixed(1)}% ({result.activeTierName})
                  </span>
                </div>
                <div className={styles.calcMetricItem}>
                  <span className={styles.calcMetricLabel}>Administrative Cost</span>
                  <span className={styles.calcMetricVal} style={{ color: "#5eead4" }}>
                    R0.00 (Zero Overhead)
                  </span>
                </div>
              </div>

              {result.nextTierHint && (
                <div className={styles.calcHintBox}>
                  {result.nextTierHint}
                </div>
              )}

              <Button
                href="#partnership-enquiry"
                variant="primary"
                size="md"
                onClick={handleDiscussClick}
                className={styles.calcCtaBtn}
              >
                <span>Discuss This Estimate for Your School</span>
                <ArrowRight size={15} style={{ marginLeft: 6, display: "inline" }} />
              </Button>
            </div>

            <p className={styles.calcDisclaimer}>
              * Estimates are illustrative and based on the learner count, adoption rate, and average pack values
              entered above. Actual rebates are calculated from qualifying completed Pexpacks orders under the
              applicable statutory school partnership agreement.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
