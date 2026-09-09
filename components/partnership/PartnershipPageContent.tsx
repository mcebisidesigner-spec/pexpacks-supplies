"use client";

import React, { useState } from "react";
import { PartnershipBenefits } from "./PartnershipBenefits";
import { RebateSection } from "./RebateSection";
import { DigitalInfrastructure } from "./DigitalInfrastructure";
import { ManagedPartnership } from "./ManagedPartnership";
import { OnboardingSteps } from "./OnboardingSteps";
import { InstitutionalTrust } from "./InstitutionalTrust";
import { PartnershipLeadForm } from "./PartnershipLeadForm";
import type { CalculatorPrefill } from "./types";

export function PartnershipPageContent() {
  const [calculatorPrefill, setCalculatorPrefill] = useState<CalculatorPrefill | null>(null);

  const scrollToEnquiry = () => {
    const el = document.getElementById("partnership-enquiry");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleDiscussEstimate = (prefill: CalculatorPrefill) => {
    setCalculatorPrefill(prefill);
    scrollToEnquiry();
  };

  return (
    <>

      <PartnershipBenefits />

      <RebateSection onDiscussEstimate={handleDiscussEstimate} />

      <OnboardingSteps />

      <DigitalInfrastructure />

      <ManagedPartnership />

      <InstitutionalTrust />

      <PartnershipLeadForm
        initialPrefill={calculatorPrefill}
        onClearPrefill={() => setCalculatorPrefill(null)}
      />
    </>
  );
}
