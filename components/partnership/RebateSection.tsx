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
    <section className="py-12 sm:py-20" id="rebate-calculator" aria-labelledby="rebate-heading">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-[760px] mb-[34px] text-left flex flex-col items-start">
          <p className="mb-3 text-pex-keppel text-sm font-extrabold text-left">Annual partnership rebate</p>
          <h2 id="rebate-heading" className="mb-3 text-pex-navy font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-left">
            Adoption That Gives Back to Your School.
          </h2>
          <p className="max-w-[760px] mb-[34px] text-slate-600 text-lg leading-[1.45] text-left">
            Our institutional rebate returns a direct percentage of completed
            parent stationery orders to your school development fund. The more
            families adopt your official digital list, the higher your rebate tier.
          </p>
        </div>

        <div className="grid grid-cols-1 min-[981px]:grid-cols-[minmax(0,1fr)_minmax(360px,1.15fr)] gap-[clamp(28px,4vw,54px)] items-start">
          {/* Tiers Explanation */}
          <div>
            <h3 style={{ fontSize: "22px", fontWeight: 800, color: "var(--pex-navy)", margin: "0 0 8px" }}>
              Commercial Rebate Tiers
            </h3>
            <p style={{ fontSize: "14.5px", color: "var(--pex-muted)", margin: "0 0 20px", lineHeight: 1.55 }}>
              Transparent, deterministic rebate tiers without ambiguous overlapping ranges.
              Settled annually for verified completed packs.
            </p>

            <div className="flex flex-col gap-4 mt-6" role="table" aria-label="Rebate tier thresholds">
              {REBATE_TIERS.map((tier) => {
                const isActive =
                  calcState.adoptionPercentage >= tier.minAdoption &&
                  (tier.maxAdoption === 100
                    ? calcState.adoptionPercentage <= 100
                    : calcState.adoptionPercentage < tier.maxAdoption);

                return (
                  <div
                    key={tier.name}
                    className={`bg-white border rounded-2xl p-[20px_22px] flex items-center justify-between gap-4 transition-all duration-160 ease-out ${
                      isActive
                        ? "border-[var(--pex-keppel,#1a7a77)] bg-[rgba(26,122,119,0.05)] shadow-[0_6px_20px_rgba(26,122,119,0.12)]"
                        : "border-slate-200/80"
                    }`}
                    role="row"
                  >
                    <div className="flex flex-col gap-1">
                      <p className="text-[15px] font-extrabold text-pex-navy m-0">
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
                      <p className="text-[13px] text-slate-600 m-0">{tier.description}</p>
                    </div>
                    <div
                      className={`text-xl font-extrabold py-1.5 px-3.5 rounded-full shrink-0 ${
                        isActive
                          ? "bg-[var(--pex-keppel,#1a7a77)] text-white"
                          : "text-pex-keppel bg-[rgba(26,122,119,0.1)]"
                      }`}
                      aria-label={`${tier.label} rebate`}
                    >
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
          <div className="bg-white border border-slate-200/80 rounded-2xl p-[clamp(24px,4vw,36px)] shadow-[0_16px_44px_rgba(26,42,64,0.07)]">
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

            <div className="flex flex-col gap-[22px] mb-[30px]">
              {/* Total Learners */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="total-learners-input" className="text-sm font-bold text-pex-navy">
                    Total School Enrollment
                  </label>
                  <span className="text-sm font-extrabold text-pex-keppel bg-[rgba(26,122,119,0.09)] py-0.5 px-2.5 rounded-md">
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
                  className="h-12 px-4 rounded-xl border border-slate-200/80 bg-[var(--pex-bg-soft,#f8f9fa)] text-pex-navy text-base font-semibold w-full box-border transition-all duration-150 focus:border-[var(--pex-keppel,#1a7a77)] focus:ring-3 focus:ring-[rgba(26,122,119,0.15)] focus:bg-white focus:outline-none"
                  aria-label="Total School Enrollment"
                />
              </div>

              {/* Adoption Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="adoption-slider" className="text-sm font-bold text-pex-navy">
                    Estimated Parent Adoption
                  </label>
                  <span className="text-sm font-extrabold text-pex-keppel bg-[rgba(26,122,119,0.09)] py-0.5 px-2.5 rounded-md">
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
                  className="w-full h-2 rounded bg-slate-200 outline-none cursor-pointer accent-[var(--pex-keppel,#1a7a77)]"
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
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="aov-input" className="text-sm font-bold text-pex-navy">
                    Estimated Average Pack Value (ZAR)
                  </label>
                  <span className="text-sm font-extrabold text-pex-keppel bg-[rgba(26,122,119,0.09)] py-0.5 px-2.5 rounded-md">
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
                  className="h-12 px-4 rounded-xl border border-slate-200/80 bg-[var(--pex-bg-soft,#f8f9fa)] text-pex-navy text-base font-semibold w-full box-border transition-all duration-150 focus:border-[var(--pex-keppel,#1a7a77)] focus:ring-3 focus:ring-[rgba(26,122,119,0.15)] focus:bg-white focus:outline-none"
                  aria-label="Estimated Average Pack Value in Rand"
                />
              </div>
            </div>

            {/* Output Panel */}
            <div className="bg-pex-navy rounded-2xl p-6 text-white flex flex-col gap-[18px]">
              <div className="flex flex-col gap-1 border-b border-white/[0.12] pb-4">
                <span className="text-xs uppercase tracking-[0.05em] text-slate-400 font-bold">
                  Estimated Annual School Development Rebate
                </span>
                <strong className="text-[clamp(34px,4.5vw,46px)] font-extrabold text-emerald-400 leading-none">
                  {formatZAR(result.estimatedSchoolRebate)}
                </strong>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11.5px] text-slate-400">Participating Learners</span>
                  <span className="text-[15px] font-bold text-white">
                    {formatNumber(result.participatingLearners)} families
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11.5px] text-slate-400">Estimated Qualifying Turnover</span>
                  <span className="text-[15px] font-bold text-white">
                    {formatZAR(result.estimatedTurnover)}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11.5px] text-slate-400">Applicable Rebate Rate</span>
                  <span className="text-[15px] font-bold text-white" style={{ color: "#34d399" }}>
                    {result.rebateRatePercent.toFixed(1)}% ({result.activeTierName})
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11.5px] text-slate-400">Administrative Cost</span>
                  <span className="text-[15px] font-bold text-white" style={{ color: "#5eead4" }}>
                    R0.00 (Zero Overhead)
                  </span>
                </div>
              </div>

              {result.nextTierHint && (
                <div className="text-[12.5px] text-slate-300 bg-white/[0.07] py-2.5 px-3.5 rounded-lg leading-[1.4]">
                  {result.nextTierHint}
                </div>
              )}

              <Button
                href="#partnership-enquiry"
                variant="primary"
                size="md"
                onClick={handleDiscussClick}
              >
                <span>Discuss This Estimate for Your School</span>
                <ArrowRight size={15} style={{ marginLeft: 6, display: "inline" }} />
              </Button>
            </div>

            <p className="text-[11.5px] text-[var(--pex-muted,#64748b)] leading-[1.5] mt-3.5">
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
